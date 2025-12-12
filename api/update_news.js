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

        const articles = data.articles.slice(0, 5).map(article => ({
            source: article.source,
            author: article.author,
            title: article.title,
            description: article.description,
            content: article.content,
            url: article.url,
            urlToImage: article.urlToImage,
            publishedAt: article.publishedAt
        }));

        console.log(`✅ Fetched ${articles.length} articles. Saving to Firestore...`);

        // Save to existing 'system' collection, 'news' document
        // We use set() to overwrite/update the latest news cache.
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
