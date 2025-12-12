import { useState, useEffect, useCallback } from "react";
import { getDebts } from "../services/dbService";
import { getLatestNews } from "../services/newsService";

export function useNotifications(userId) {
    const [debts, setDebts] = useState([]);
    const [news, setNews] = useState([]);
    const [readInput, setReadInput] = useState(() => {
        const saved = localStorage.getItem("rt_money_read_notifications");
        return saved ? JSON.parse(saved) : [];
    });
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        if (!userId) return;

        try {
            setLoading(true);
            // 1. Fetch Debts
            const fetchedDebts = await getDebts(userId);

            // Process Debts (Overdue/Today/Tomorrow)
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const processedDebts = fetchedDebts
                .filter(d => d.status !== 'paid')
                .map(debt => {
                    const dueDate = new Date(debt.dueDate + 'T00:00:00');
                    const diffTime = dueDate - today;
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                    if (diffDays < 0) return { ...debt, type: 'overdue', days: Math.abs(diffDays) };
                    if (diffDays === 0) return { ...debt, type: 'today', days: 0 };
                    if (diffDays === 1) return { ...debt, type: 'tomorrow', days: 1 };
                    return null;
                })
                .filter(Boolean)
                .sort((a, b) => { // Sort priority
                    if (a.type === 'overdue' && b.type !== 'overdue') return -1;
                    if (a.type !== 'overdue' && b.type === 'overdue') return 1;
                    return new Date(a.dueDate) - new Date(b.dueDate);
                });

            setDebts(processedDebts);

            // 2. Fetch News
            const fetchedNews = await getLatestNews();
            // Assign a stable ID to news if missing (using URL)
            const processedNews = fetchedNews.map(n => ({
                ...n,
                id: n.url || n.title // Fallback ID
            }));
            setNews(processedNews);

        } catch (error) {
            console.error("Error loading notifications:", error);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 60000 * 5); // Refresh every 5 min
        return () => clearInterval(interval);
    }, [fetchData]);

    const markAsRead = (id) => {
        if (!readInput.includes(id)) {
            const newRead = [...readInput, id];
            setReadInput(newRead);
            localStorage.setItem("rt_money_read_notifications", JSON.stringify(newRead));
        }
    };

    const markAllNewsAsRead = () => {
        const newsIds = news.map(n => n.id);
        const newRead = [...new Set([...readInput, ...newsIds])];
        setReadInput(newRead);
        localStorage.setItem("rt_money_read_notifications", JSON.stringify(newRead));
    };

    // Calculate Counts & Status
    const unreadDebts = debts.filter(d => !readInput.includes(d.id));
    const unreadNews = news.filter(n => !readInput.includes(n.id));

    // Total badge count
    const unreadCount = unreadDebts.length + unreadNews.length;

    return {
        debts: debts.map(d => ({ ...d, isRead: readInput.includes(d.id) })),
        news: news.map(n => ({ ...n, isRead: readInput.includes(n.id) })),
        unreadCount,
        markAsRead,
        markAllNewsAsRead,
        loading
    };
}
