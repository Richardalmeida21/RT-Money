import { useState, useEffect } from "react";
import { Bell, ChevronDown, ChevronLeft, ChevronRight, Eye, EyeOff, User, Menu } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useFilter } from "../../context/FilterContext";
import { useLanguage } from "../../context/LanguageContext";
import NotificationDropdown from "../Notifications/NotificationDropdown";
import NewsModal from "../Notifications/NewsModal";
import { useNotifications } from "../../hooks/useNotifications"; // Import new hook
import { useLocation } from "react-router-dom";

export default function Header({ isMobile, toggleSidebar }) {
    const { user } = useAuth();
    const { filterParams, setFilterParams, isValuesVisible, setIsValuesVisible } = useFilter();
    const { t, language } = useLanguage();
    const [showPeriodMenu, setShowPeriodMenu] = useState(false);
    const location = useLocation();

    // Use Hook
    const {
        debts,
        news,
        unreadCount,
        markAsRead,
        markAllNewsAsRead,
        loading: loadingNotif
    } = useNotifications(user?.uid);

    const [showNotifications, setShowNotifications] = useState(false);
    const [selectedNews, setSelectedNews] = useState(null);
    const [imgError, setImgError] = useState(false);

    // Reset error if user photo changes
    useEffect(() => {
        setImgError(false);
    }, [user?.photoURL]);

    const handleMonthChange = (direction) => {
        const [year, month] = filterParams.value.split('-').map(Number);
        const date = new Date(year, month - 1 + direction, 1);
        setFilterParams({ ...filterParams, value: date.toISOString().slice(0, 7) });
    };

    const toggleMsg = () => {
        setIsValuesVisible(!isValuesVisible);
    };

    const monthName = new Date(filterParams.value + "-02").toLocaleString(language === 'en' ? 'en-US' : 'pt-BR', { month: 'long', year: 'numeric' });

    return (
        <header style={{
            height: "80px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: isMobile ? "0 1rem" : "0 2rem",
            backgroundColor: "transparent",
            gap: isMobile ? "0.5rem" : "1rem"
        }}>
            <div style={{ display: "flex", alignItems: "center", gap: isMobile ? "0.5rem" : "1rem" }}>
                {isMobile && (
                    <button onClick={toggleSidebar} style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}>
                        <Menu size={24} color="var(--text-primary)" />
                    </button>
                )}
                {location.pathname === '/' && !isMobile && <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", whiteSpace: "nowrap" }}>{t('dashboard')}</h1>}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: isMobile ? "0.5rem" : "2rem", flex: 1, justifyContent: "flex-end" }}>

                {/* Global Date Filter */}
                <div style={{ position: "relative" }}>
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        background: "var(--surface)",
                        padding: isMobile ? "0.4rem 0.6rem" : "0.5rem 1rem",
                        borderRadius: "20px",
                        boxShadow: "var(--shadow)",
                    }}>
                        {/* Period Type Dropdown Trigger */}
                        <div
                            onClick={() => setShowPeriodMenu(!showPeriodMenu)}
                            style={{
                                display: "flex", alignItems: "center", gap: "2px", cursor: "pointer",
                                marginRight: "5px", paddingRight: "5px", borderRight: "1px solid var(--border)", fontWeight: "bold", fontSize: "0.85rem", color: "var(--text-secondary)"
                            }}>
                            {isMobile ? <ChevronDown size={14} /> : <>{filterParams.type === 'month' ? t('monthly') : t('period')} <ChevronDown size={14} /></>}
                        </div>

                        {filterParams.type === 'month' ? (
                            <>
                                <button onClick={() => handleMonthChange(-1)} style={{ border: "none", background: "none", cursor: "pointer", display: "flex", padding: 0 }}>
                                    <ChevronLeft size={16} color="var(--text-secondary)" />
                                </button>

                                <span style={{ minWidth: isMobile ? "auto" : "100px", textAlign: "center", textTransform: "capitalize", fontWeight: "600", fontSize: "0.9rem", color: "var(--text-primary)" }}>
                                    {isMobile ? monthName.split(' ')[0].slice(0, 3) + (monthName.split(' ')[1] ? '/' + monthName.split(' ')[1].slice(2) : '') : monthName}
                                </span>

                                <button onClick={() => handleMonthChange(1)} style={{ border: "none", background: "none", cursor: "pointer", display: "flex", padding: 0 }}>
                                    <ChevronRight size={16} color="var(--text-secondary)" />
                                </button>
                            </>
                        ) : (
                            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                                <input
                                    type="date"
                                    value={filterParams.startDate}
                                    onChange={(e) => setFilterParams({ ...filterParams, startDate: e.target.value })}
                                    style={{ border: "1px solid var(--border)", borderRadius: "5px", padding: "2px", fontSize: "0.7rem", width: isMobile ? "85px" : "110px", background: "var(--background)", color: "var(--text-primary)" }}
                                />
                                {!isMobile && <span style={{ fontSize: "0.8rem", color: "#999" }}>{t('to')}</span>}
                                <input
                                    type="date"
                                    value={filterParams.endDate}
                                    onChange={(e) => setFilterParams({ ...filterParams, endDate: e.target.value })}
                                    style={{ border: "1px solid var(--border)", borderRadius: "5px", padding: "2px", fontSize: "0.7rem", width: isMobile ? "85px" : "110px", background: "var(--background)", color: "var(--text-primary)" }}
                                />
                            </div>
                        )}
                    </div>

                    {showPeriodMenu && (
                        <div style={{
                            position: "absolute",
                            top: "110%",
                            right: 0,
                            background: "var(--surface)",
                            boxShadow: "var(--shadow)",
                            borderRadius: "12px",
                            padding: "0.5rem",
                            display: "flex",
                            flexDirection: "column",
                            gap: "0.2rem",
                            zIndex: 100,
                            minWidth: "120px"
                        }}>
                            <button
                                onClick={() => { setFilterParams({ ...filterParams, type: 'month' }); setShowPeriodMenu(false); }}
                                style={{ background: "none", border: "none", padding: "0.5rem", textAlign: "left", cursor: "pointer", fontWeight: filterParams.type === 'month' ? "bold" : "normal", borderRadius: "8px", backgroundColor: filterParams.type === 'month' ? "var(--background)" : "transparent", color: "var(--text-primary)" }}>
                                {t('monthly')}
                            </button>
                            <button
                                onClick={() => { setFilterParams({ ...filterParams, type: 'custom' }); setShowPeriodMenu(false); }}
                                style={{ background: "none", border: "none", padding: "0.5rem", textAlign: "left", cursor: "pointer", fontWeight: filterParams.type === 'custom' ? "bold" : "normal", borderRadius: "8px", backgroundColor: filterParams.type === 'custom' ? "var(--background)" : "transparent", color: "var(--text-primary)" }}>
                                {t('custom')}
                            </button>
                        </div>
                    )}
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: isMobile ? "0.5rem" : "1rem" }}>
                    <button
                        onClick={toggleMsg}
                        style={{ background: "var(--surface)", border: "none", padding: "0.5rem", borderRadius: "50%", cursor: "pointer", boxShadow: "var(--shadow)", display: "flex" }}
                        title={isValuesVisible ? "Ocultar valores" : "Mostrar valores"}
                    >
                        {isValuesVisible ? <Eye size={18} color="var(--text-secondary)" /> : <EyeOff size={18} color="var(--text-secondary)" />}
                    </button>

                    {!isMobile && (
                        <div style={{ position: "relative" }}>
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                style={{
                                    background: "var(--surface)", border: "none", padding: "0.5rem", borderRadius: "50%",
                                    cursor: "pointer", boxShadow: "var(--shadow)", display: "flex", position: "relative",
                                    animation: unreadCount > 0 ? "bell-shake 3s infinite" : "none",
                                    transformOrigin: "top center"
                                }}
                            >
                                <Bell size={20} color={unreadCount > 0 ? "var(--primary)" : "var(--text-secondary)"} />
                                {unreadCount > 0 && (
                                    <span style={{
                                        position: "absolute", top: "-2px", right: "-2px",
                                        background: "#EF4444", color: "white",
                                        fontSize: "0.6rem", fontWeight: "bold",
                                        width: "16px", height: "16px", borderRadius: "50%",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        border: "2px solid var(--surface)",
                                        boxShadow: "0 0 0 2px rgba(239, 68, 68, 0.4)",
                                        animation: "pulse 2s infinite"
                                    }}>
                                        {unreadCount}
                                    </span>
                                )}
                            </button>
                            <style>{`
                                @keyframes bell-shake {
                                    0% { transform: rotate(0); }
                                    5% { transform: rotate(15deg); }
                                    10% { transform: rotate(-15deg); }
                                    15% { transform: rotate(10deg); }
                                    20% { transform: rotate(-10deg); }
                                    25% { transform: rotate(5deg); }
                                    30% { transform: rotate(-5deg); }
                                    35% { transform: rotate(0); }
                                    100% { transform: rotate(0); }
                                }
                                @keyframes pulse {
                                    0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
                                    70% { box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); }
                                    100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
                                }
                            `}</style>
                            {showNotifications && (
                                <NotificationDropdown
                                    onClose={() => setShowNotifications(false)}
                                    debts={debts}
                                    news={news}
                                    markAsRead={markAsRead}
                                    markAllNewsAsRead={markAllNewsAsRead}
                                    onSelectNews={(newsItem) => {
                                        setShowNotifications(false);
                                        markAsRead(newsItem.id);
                                        setSelectedNews(newsItem);
                                    }}
                                />
                            )}
                        </div>
                    )}

                    {selectedNews && (
                        <NewsModal news={selectedNews} onClose={() => setSelectedNews(null)} />
                    )}

                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <div style={{ width: "35px", height: "35px", backgroundColor: "#ddd", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
                            {user?.photoURL && !imgError ? (
                                <img
                                    src={user.photoURL}
                                    alt="User"
                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                    onError={() => setImgError(true)}
                                />
                            ) : (
                                <User size={20} color="#666" />
                            )}
                        </div>
                        {!isMobile && (
                            <div style={{ display: "flex", flexDirection: "column" }}>
                                <span style={{ fontSize: "0.9rem", fontWeight: "600" }}>{user?.displayName || user?.email?.split('@')[0]}</span>
                                <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{t('userRole')}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
