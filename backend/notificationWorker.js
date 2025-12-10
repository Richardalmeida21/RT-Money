const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
const twilio = require("twilio");
const cron = require("node-cron");

// --- CONFIGURATION ---
// IMPORTANT: You must download your Service Account Key from Firebase Console
// Project Settings -> Service Accounts -> Generate New Private Key
// Save it as "serviceAccountKey.json" in this folder.
const serviceAccount = require("./serviceAccountKey.json");

// Configure Email (Gmail Example - App Password required)
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "YOUR_EMAIL@gmail.com",
        pass: "YOUR_APP_PASSWORD"
    }
});

// Configure Twilio (Get from Twilio Console)
const twilioClient = new twilio("YOUR_ACCOUNT_SID", "YOUR_AUTH_TOKEN");
const TWILIO_PHONE = "YOUR_TWILIO_PHONE";

// Initialize Firebase
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

console.log("🚀 Notification Worker Started! Waiting for 09:00 AM...");

// Schedule: Everyday at 09:00 AM
cron.schedule("0 9 * * *", async () => {
    console.log("⏰ Checking for debts due tomorrow...");
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0]; // YYYY-MM-DD

    try {
        // Warning: This queries ALL users. ideally batches in production.
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
                console.log(`🔔 Found debt due tomorrow: ${debt.title} for user ${userDoc.id}`);

                if (debt.notificationMethod === 'email' || debt.notificationMethod === 'both') {
                    await sendEmail(debt.contactInfo, debt);
                }

                if (debt.notificationMethod === 'sms' || debt.notificationMethod === 'both') {
                    await sendSMS(debt.contactInfo, debt);
                }
            }
        }
    } catch (error) {
        console.error("Error in worker job:", error);
    }
});

async function sendEmail(to, debt) {
    try {
        await transporter.sendMail({
            from: '"Financeiro App" <no-reply@financeiro.com>',
            to: to,
            subject: `Lembrete: Pagamento de ${debt.title} vence amanhã!`,
            text: `Olá! Não esqueça de pagar sua conta "${debt.title}" no valor de R$ ${debt.amount} que vence amanhã (${debt.dueDate}).`
        });
        console.log(`✅ Email sent to ${to}`);
    } catch (e) {
        console.error(`❌ Failed to send email to ${to}:`, e.message);
    }
}

async function sendSMS(to, debt) {
    try {
        await twilioClient.messages.create({
            body: `Lembrete: Conta "${debt.title}" (R$ ${debt.amount}) vence amanha!`,
            from: TWILIO_PHONE,
            to: to
        });
        console.log(`✅ SMS sent to ${to}`);
    } catch (e) {
        console.error(`❌ Failed to send SMS to ${to}:`, e.message);
    }
}
