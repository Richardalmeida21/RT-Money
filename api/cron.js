import admin from 'firebase-admin';
import nodemailer from 'nodemailer';

// --- CONFIGURATION (Environment Variables from Vercel) ---
// Note: In Vercel, you add these in Settings -> Environment Variables

// Helper to handle Service Account (which handles newlines in env vars correctly)
const getServiceAccount = () => {
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
        return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    }
    return null;
};

// Initialize Firebase Admin (Singleton check)
if (!admin.apps.length) {
    const serviceAccount = getServiceAccount();
    if (serviceAccount) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    } else {
        console.error("FIREBASE_SERVICE_ACCOUNT_KEY missing!");
    }
}

const db = admin.apps.length ? admin.firestore() : null;

export default async function handler(req, res) {
    if (!db) {
        return res.status(500).json({ error: 'Firebase not initialized. Check Env Vars.' });
    }

    console.log("⏰ Vercel Cron: Checking for debts due tomorrow...");
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0]; // YYYY-MM-DD

    let emailsSent = 0;

    try {
        // Configure Transports inside the request
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const usersSnapshot = await db.collection("users").get();

        for (const userDoc of usersSnapshot.docs) {
            const debtsRef = userDoc.ref.collection("debts");
            const snapshot = await debtsRef
                .where("dueDate", "==", tomorrowStr)
                .where("status", "==", "pending")
                .get();

            if (snapshot.empty) continue;

            for (const doc of snapshot.docs) {
                const debt = doc.data();
                console.log(`🔔 Found debt: ${debt.title} for user ${userDoc.id}`);

                if (debt.notificationMethod === 'email') {
                    try {
                        await transporter.sendMail({
                            from: '"Financeiro App" <no-reply@financeiro.com>',
                            to: debt.contactInfo,
                            subject: `Lembrete: Pagamento de ${debt.title} vence amanhã!`,
                            text: `Olá! Não esqueça de pagar sua conta "${debt.title}" no valor de R$ ${debt.amount} que vence amanhã (${debt.dueDate}).`
                        });
                        emailsSent++;
                    } catch (e) { console.error("Email error:", e); }
                }
            }
        }

        return res.status(200).json({ success: true, emailsSent });

    } catch (error) {
        console.error("Critical Worker Error:", error);
        return res.status(500).json({ error: error.message });
    }
}
