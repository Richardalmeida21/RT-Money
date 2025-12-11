import { useEffect, useState } from "react";
import { getDebts } from "../../services/dbService";
import { Bell, Calendar, AlertCircle, CheckCircle2 } from "lucide-react";

export default function NotificationDropdown({ userId, onClose }) {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNotifications = async () => {
            if (!userId) return;
            try {
                const debts = await getDebts(userId);

                const today = new Date();
                today.setHours(0, 0, 0, 0);

                const pendingDebts = debts.filter(debt => debt.status !== 'paid');

                const alerts = pendingDebts.map(debt => {
                    const dueDate = new Date(debt.dueDate + 'T00:00:00'); // Fix timezone offset
                    const diffTime = dueDate - today;
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                    if (diffDays < 0) return { ...debt, type: 'overdue', days: Math.abs(diffDays) };
                    if (diffDays === 0) return { ...debt, type: 'today', days: 0 };
                    if (diffDays === 1) return { ...debt, type: 'tomorrow', days: 1 };

                    return null;
                }).filter(Boolean); // Remove nulls (future debts > 1 day)

                // Sort: Overdue first, then today, then tomorrow
                alerts.sort((a, b) => {
                    if (a.type === 'overdue' && b.type !== 'overdue') return -1;
                    if (a.type !== 'overdue' && b.type === 'overdue') return 1;
                    return new Date(a.dueDate) - new Date(b.dueDate);
                });

                setNotifications(alerts);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, [userId]);

    return (
        <div style={{
            position: "absolute", top: "120%", right: "-10px",
            width: "320px", background: "var(--surface)",
            borderRadius: "16px", boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
            zIndex: 1000, overflow: "hidden", border: "1px solid var(--border)"
        }}>
            <div style={{ padding: "1rem", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ fontSize: "1rem", fontWeight: "bold" }}>Notificações</h3>
                <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{notifications.length} pendentes</span>
            </div>

            <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                {loading ? (
                    <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-secondary)" }}>Carregando...</div>
                ) : notifications.length === 0 ? (
                    <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-secondary)", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
                        <CheckCircle2 size={32} color="#10B981" opacity={0.5} />
                        <p style={{ fontSize: "0.9rem" }}>Tudo em dia! ✨</p>
                    </div>
                ) : (
                    notifications.map(notif => (
                        <div key={notif.id} style={{
                            padding: "1rem", borderBottom: "1px solid var(--border)",
                            display: "flex", gap: "0.8rem", alignItems: "flex-start",
                            background: notif.type === 'overdue' ? "rgba(239, 68, 68, 0.05)" : "transparent"
                        }}>
                            <div style={{
                                background: notif.type === 'overdue' ? "#EF4444" : "#F59E0B",
                                borderRadius: "50%", padding: "6px", display: "flex", alignItems: "center", justifyContent: "center"
                            }}>
                                <AlertCircle size={16} color="white" />
                            </div>
                            <div>
                                <p style={{ fontWeight: "600", fontSize: "0.9rem", color: "var(--text-primary)" }}>{notif.title}</p>
                                <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "2px" }}>
                                    {notif.type === 'overdue' && `Venceu há ${notif.days} dias`}
                                    {notif.type === 'today' && `Vence Hoje!`}
                                    {notif.type === 'tomorrow' && `Vence Amanhã`}
                                </p>
                                <p style={{ fontSize: "0.9rem", fontWeight: "bold", marginTop: "4px", color: notif.type === 'overdue' ? "#EF4444" : "var(--text-primary)" }}>
                                    R$ {notif.amount.toFixed(2)}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {notifications.length > 0 && (
                <div style={{ padding: "0.8rem", textAlign: "center", borderTop: "1px solid var(--border)", background: "var(--background)" }}>
                    <a href="/debts" style={{ fontSize: "0.85rem", color: "var(--primary)", fontWeight: "600", textDecoration: "none" }}>Ver todas as contas</a>
                </div>
            )}
        </div>
    );
}
