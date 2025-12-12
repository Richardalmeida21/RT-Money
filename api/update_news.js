import admin from 'firebase-admin';


// --- CONFIGURATION ---
// NEWS_API_KEY must be set in Vercel Env Vars

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

    // Secure the endpoint (Optional: basic auth or secret query param)
    // For now, we assume it's publicly triggered by Vercel Cron but we can check a secret if needed.
    // if (req.query.key !== process.env.CRON_SECRET) return res.status(401).end();

    try {
        const apiKey = process.env.NEWS_API_KEY;
        if (!apiKey) {
            throw new Error("NEWS_API_KEY is not defined in environment variables.");
        }

        console.log("📰 Fetching latest news...");

        // Fetch specific categories: Business, Economics in Brazil
        const response = await fetch(
            `https://newsapi.org/v2/top-headlines?country=br&category=business&apiKey=${apiKey}`
        );

        let data = await response.json();

        if (data.status === 'ok' && data.totalResults === 0) {
            console.log("⚠️ No business news found. Fetching general headlines...");
            const fallbackResponse = await fetch(
                `https://newsapi.org/v2/top-headlines?country=br&apiKey=${apiKey}`
            );
            data = await fallbackResponse.json();
        }

        if (data.status !== 'ok') {
            throw new Error(`NewsAPI Error: ${data.message}`);
        }

        // --- HARD FALLBACK (MOCK) ---
        // If even the general headlines are empty (API Limit/Block), use static helpful tips
        let articlesList = data.articles || [];

        if (data.totalResults === 0 || articlesList.length === 0) {
            console.log("⚠️ API returned 0 results again. Using hardcoded fallback.");
            articlesList = [
                {
                    title: "Dicas de Economia: Como organizar seu orçamento mensal",
                    description: "Aprenda a regra 50/30/20 para dividir seus gastos e garantir que sobre dinheiro no fim do mês.",
                    url: "https://rt-money.vercel.app",
                    source: { name: "RT Money Dicas" }
                },
                {
                    title: "Reserva de Emergência: Por que você precisa de uma?",
                    description: "Especialistas recomendam ter pelo menos 6 meses de custo de vida guardados para imprevistos.",
                    url: "https://rt-money.vercel.app",
                    source: { name: "RT Money Dicas" }
                },
                {
                    title: "Mercado Financeiro: Acompanhe seus investimentos",
                    description: "Mantenha o hábito de revisar suas metas financeiras e investimentos periodicamente.",
                    url: "https://rt-money.vercel.app",
                    source: { name: "RT Money Dicas" }
                }
            ];
        }

        const articles = articlesList.slice(0, 5).map(article => ({
            source: article.source || { name: 'Desconhecido' },
            author: article.author || "RT Money",
            title: article.title || "Sem título",
            description: article.description || "",
            content: article.content || "",
            url: article.url || "#",
            urlToImage: article.urlToImage || null,
            publishedAt: article.publishedAt || new Date().toISOString()
        }));

        console.log(`✅ Fetched ${articles.length} articles. Saving to Firestore...`);

        // Save to existing 'system' collection, 'news' document
        // We enable ignoreUndefinedProperties just in case, or rely on our sanitization above.
        // Actually, best to just sanitize.
        await db.collection('system').doc('news').set({
            articles: articles,
            lastUpdated: admin.firestore.FieldValue.serverTimestamp()
        });

        return res.status(200).json({
            success: true,
            articlesCount: articles.length,
            debug: {
                totalResults: data.totalResults,
                status: data.status,
                rawFirstArticle: data.articles[0] ? 'Exists' : 'None',
                // Returning full data might be too big, but let's check basic metadata
                msg: data.message || 'No message'
            }
        });

    } catch (error) {
        console.error("News Update Error:", error);
        return res.status(500).json({ error: error.message });
    }
}
