import { Bell, Calendar, AlertCircle, CheckCircle2, TrendingUp, ChevronRight, Check } from "lucide-react";

export default function NotificationDropdown({ onClose, onSelectNews, debts = [], news = [], markAllNewsAsRead }) {

    const hasAnyContent = debts.length > 0 || news.length > 0;
    const unreadNewsCount = news.filter(n => !n.isRead).length;

    return (
        <div style={{
            position: "absolute", top: "120%", right: "-10px",
            width: "350px", background: "var(--surface)",
            borderRadius: "16px", boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
            zIndex: 1000, overflow: "hidden", border: "1px solid var(--border)"
        }}>
            <div style={{ padding: "1rem", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ fontSize: "1rem", fontWeight: "bold", color: "var(--text-primary)" }}>Notificações</h3>
                <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                    {debts.length} contas • {unreadNewsCount} notícias novas
                </span>
            </div>

            <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                {!hasAnyContent ? (
                    <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-secondary)", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
                        <CheckCircle2 size={32} color="#10B981" opacity={0.5} />
                        <p style={{ fontSize: "0.9rem" }}>Tudo em dia! ✨</p>
                    </div>
                ) : (
                    <>
                        {/* Debts Section */}
                        {debts.length > 0 && (
                            <div style={{ borderBottom: "1px solid var(--border)" }}>
                                <h4 style={{ padding: "0.8rem 1rem", fontSize: "0.8rem", textTransform: "uppercase", color: "var(--text-secondary)", letterSpacing: "1px", background: "var(--background)" }}>
                                    Contas Pendentes
                                </h4>
                                {debts.map(notif => (
                                    <div key={notif.id} style={{
                                        padding: "1rem", borderBottom: "1px solid var(--border)",
                                        display: "flex", gap: "0.8rem", alignItems: "flex-start",
                                        background: notif.type === 'overdue' ? "rgba(239, 68, 68, 0.05)" : "transparent"
                                    }}>
                                        <div style={{
                                            background: notif.type === 'overdue' ? "#EF4444" : "#F59E0B",
                                            borderRadius: "50%", padding: "6px", display: "flex", alignItems: "center", justifyContent: "center", minWidth: "28px"
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
                                ))}
                            </div>
                        )}

                        {/* News Section */}
                        {news.length > 0 && (
                            <div>
                                <div style={{
                                    padding: "0.8rem 1rem", background: "var(--background)",
                                    display: "flex", justifyContent: "space-between", alignItems: "center"
                                }}>
                                    <h4 style={{ fontSize: "0.8rem", textTransform: "uppercase", color: "var(--text-secondary)", letterSpacing: "1px", margin: 0 }}>
                                        Economia Hoje
                                    </h4>
                                    {unreadNewsCount > 0 && (
                                        <button
                                            onClick={markAllNewsAsRead}
                                            style={{
                                                border: "none", background: "transparent", color: "var(--primary)",
                                                fontSize: "0.75rem", cursor: "pointer", fontWeight: "600",
                                                display: "flex", alignItems: "center", gap: "4px"
                                            }}
                                        >
                                            <Check size={12} />
                                            Marcar lidas
                                        </button>
                                    )}
                                </div>

                                {news.map((newsItem, i) => (
                                    <div key={i} style={{
                                        padding: "1rem", borderBottom: "1px solid var(--border)",
                                        display: "flex", gap: "0.8rem", alignItems: "flex-start",
                                        transition: "background 0.2s",
                                        opacity: newsItem.isRead ? 0.6 : 1, // Dim read items
                                    }}>
                                        <div style={{ position: "relative" }}>
                                            <div style={{
                                                background: newsItem.isRead ? "var(--border)" : "#E8F0FE",
                                                borderRadius: "50%", padding: "6px", display: "flex", alignItems: "center", justifyContent: "center", minWidth: "28px"
                                            }}>
                                                <TrendingUp size={16} color={newsItem.isRead ? "var(--text-secondary)" : "#1D4ED8"} />
                                            </div>
                                            {!newsItem.isRead && (
                                                <div style={{
                                                    position: "absolute", top: "-2px", right: "-2px",
                                                    width: "8px", height: "8px", background: "#EF4444", borderRadius: "50%",
                                                    border: "1px solid var(--surface)"
                                                }} />
                                            )}
                                        </div>

                                        <div style={{ flex: 1 }}>
                                            <p style={{ fontWeight: newsItem.isRead ? "400" : "600", fontSize: "0.9rem", color: "var(--text-primary)", lineHeight: "1.4", marginBottom: "0.3rem" }}>
                                                {newsItem.title}
                                            </p>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>{newsItem.source?.name}</span>
                                                <button
                                                    onClick={() => onSelectNews(newsItem)}
                                                    style={{
                                                        background: "transparent", border: "none", color: "var(--primary)",
                                                        fontSize: "0.8rem", fontWeight: "600", cursor: "pointer",
                                                        display: "flex", alignItems: "center", gap: "2px"
                                                    }}
                                                >
                                                    Ler completa <ChevronRight size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>

            {(debts.length > 0 || news.length > 0) && (
                <div style={{ padding: "0.8rem", textAlign: "center", borderTop: "1px solid var(--border)", background: "var(--background)" }}>
                    <a href="/debts" style={{ fontSize: "0.85rem", color: "var(--primary)", fontWeight: "600", textDecoration: "none" }}>Ver todas as contas</a>
                </div>
            )}
        </div>
    );
}
