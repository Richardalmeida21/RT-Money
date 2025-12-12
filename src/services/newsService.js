import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";

export const getLatestNews = async () => {
    try {
        const docRef = doc(db, "system", "news");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            return data.articles || [];
        } else {
            console.log("No news cache found in Firestore.");
            return [];
        }
    } catch (error) {
        console.error("Error fetching news:", error);
        return [];
    }
};
