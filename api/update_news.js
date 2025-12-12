import admin from 'firebase-admin';
import Parser from 'rss-parser';

// --- CONFIGURATION ---
const RSS_URL = 'https://g1.globo.com/rss/g1/economia/';

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

    try {
        console.log(`📰 Fetching RSS Feed from: ${RSS_URL}`);

        const parser = new Parser();
        const feed = await parser.parseURL(RSS_URL);

        if (!feed || !feed.items || feed.items.length === 0) {
            throw new Error("RSS Feed returned no items.");
        }

        console.log(`✅ Found ${feed.items.length} items in RSS.`);

        // Map RSS items to our App's format
        // G1 RSS structure: item.title, item.link, item.contentSnippet (desc), item.pubDate
        const articles = feed.items.slice(0, 5).map(item => {
            // Extract a clean description (RSS often has HTML)
            let desc = item.contentSnippet || item.content || "";
            if (desc.length > 150) desc = desc.substring(0, 150) + "...";

            return {
                source: { name: 'G1 Economia' },
                author: item.creator || "G1",
                title: item.title || "Sem título",
                description: desc || "Clique para ler mais.",
                content: item.content || "",
                url: item.link || "#",
                urlToImage: null, // RSS typically doesn't give clean og:image without scraping. We'll handle UI to show icon.
                publishedAt: item.isoDate || new Date().toISOString()
            };
        });

        console.log(`✅ Processed ${articles.length} articles. Saving to Firestore...`);

        await db.collection('system').doc('news').set({
            articles: articles,
            lastUpdated: admin.firestore.FieldValue.serverTimestamp()
        });

        return res.status(200).json({
            success: true,
            articlesCount: articles.length,
            provider: 'G1 RSS'
        });

    } catch (error) {
        console.error("News Update Error:", error);
        return res.status(500).json({ error: error.message });
    }
}
