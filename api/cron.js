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
                        // Format date to DD/MM/YYYY
                        const [year, month, day] = debt.dueDate.split('-');
                        const formattedDate = `${day}/${month}/${year}`;

                        // Get user name or default
                        const userName = userDoc.data().displayName || "Usuário";

                        const htmlContent = `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0;">
                            <div style="background-color: #6B46C1; padding: 20px; text-align: center;">
                                <h1 style="color: #ffffff; margin: 0; font-size: 24px;">RT Money</h1>
                            </div>
                            <div style="padding: 30px; color: #334155;">
                                <h2 style="color: #1e293b; margin-top: 0;">Olá, ${userName}! 👋</h2>
                                <p style="font-size: 16px; line-height: 1.6;">
                                    Você tem uma conta vencendo amanhã. Não esqueça de se organizar!
                                </p>
                                
                                <div style="background-color: #F3F4F6; padding: 20px; border-radius: 12px; margin: 20px 0;">
                                    <h3 style="margin: 0 0 10px 0; color: #6B46C1; font-size: 18px;">${debt.title}</h3>
                                    <p style="margin: 5px 0; font-size: 16px;"><strong>Valor:</strong> R$ ${debt.amount}</p>
                                    <p style="margin: 5px 0; font-size: 16px;"><strong>Vencimento:</strong> ${formattedDate}</p>
                                </div>

                                <div style="text-align: center; margin-top: 30px;">
                                    <a href="https://rt-money.vercel.app" style="background-color: #6B46C1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                                        Marcar como Pago
                                    </a>
                                </div>
                            </div>
                            <div style="background-color: #f8fafc; padding: 15px; text-align: center; font-size: 12px; color: #94a3b8;">
                                <p>Este é um aviso automático do RT Money 🚀</p>
                                <p style="margin-top: 5px;">Por favor, não responda este email.</p>
                            </div>
                        </div>
                        `;

                        await transporter.sendMail({
                            from: '"RT Money" <no-reply@rt-money.app>',
                            to: debt.contactInfo,
                            subject: `🔔 Lembrete: ${debt.title} vence amanhã!`,
                            text: `Olá ${userName}, sua conta ${debt.title} de R$ ${debt.amount} vence em ${formattedDate}. Acesse o app para pagar.`,
                            html: htmlContent
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
