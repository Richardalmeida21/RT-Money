import { Home, LayoutDashboard, Target, PieChart, Settings, LogOut, CalendarClock, X, Download } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { useTheme } from "../../context/ThemeContext";


export default function Sidebar({ isMobile, isOpen, onClose }) {
    const { pathname } = useLocation();
    const { logout } = useAuth();
    const { t } = useLanguage();
    const { theme } = useTheme();

    const links = [
        { icon: <LayoutDashboard size={20} />, label: t('dashboard'), path: "/" },
        { icon: <PieChart size={20} />, label: t('transactions'), path: "/transactions" },
        { icon: <Target size={20} />, label: t('goals'), path: "/goals" },
        { icon: <CalendarClock size={20} />, label: t('debts'), path: "/debts" },
        { icon: <Settings size={20} />, label: t('settings'), path: "/settings" },
    ];





    if (isMobile) {
        return (
            <>
                {/* Overlay */}
                {isOpen && (
                    <div
                        onClick={onClose}
                        style={{
                            position: "fixed",
                            top: 0,
                            left: 0,
                            width: "100vw",
                            height: "100vh",
                            backgroundColor: "rgba(0,0,0,0.5)",
                            zIndex: 40,
                            backdropFilter: "blur(2px)"
                        }}
                    />
                )}

                {/* Sidebar Drawer */}
                <aside style={{
                    position: "fixed",
                    top: 0,
                    left: isOpen ? 0 : "-280px",
                    width: "280px",
                    height: "100vh",
                    backgroundColor: "var(--surface)",
                    borderRight: "1px solid var(--border)",
                    zIndex: 50,
                    transition: "left 0.3s ease",
                    display: "flex",
                    flexDirection: "column",
                    padding: "2rem",
                    boxShadow: isOpen ? "4px 0 24px rgba(0,0,0,0.1)" : "none"
                }}>
                    <div style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <img src={theme === 'dark' ? "/logo-light.png" : "/logo-dark.png"} alt="RT Money Logo" style={{ width: "100px", height: "auto", objectFit: "contain" }} />
                        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: "0.5rem" }}>
                            <X size={24} color="var(--text-primary)" />
                        </button>
                    </div>

                    <nav style={{ display: "flex", flexDirection: "column", gap: "0.5rem", flex: 1 }}>
                        {links.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                onClick={onClose} // Close on click
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "1rem",
                                    padding: "1rem",
                                    borderRadius: "12px",
                                    color: pathname === link.path ? "var(--primary)" : "var(--text-secondary)",
                                    backgroundColor: pathname === link.path ? "rgba(98, 0, 238, 0.1)" : "transparent",
                                    fontWeight: pathname === link.path ? "600" : "400",
                                    transition: "all 0.2s"
                                }}
                            >
                                <div style={{ minWidth: "20px" }}>{link.icon}</div>
                                <span style={{ fontSize: "1rem" }}>{link.label}</span>
                            </Link>
                        ))}
                    </nav>

                    <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "0.5rem" }}>

                        <button
                            onClick={logout}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "1rem",
                                padding: "1rem",
                                borderRadius: "12px",
                                color: "var(--error)",
                                background: "transparent",
                                border: "none",
                                cursor: "pointer",
                                fontSize: "1rem"
                            }}
                        >
                            <LogOut size={20} />
                            {t('logout')}
                        </button>
                    </div>
                </aside>
            </>
        );
    }

    // Desktop Implementation (unchanged mostly)
    return (
        <aside style={{
            width: "250px",
            height: "100vh",
            backgroundColor: "var(--surface)",
            borderRight: "1px solid var(--border)",
            display: "flex",
            flexDirection: "column",
            padding: "2rem",
            position: "fixed",
            left: 0,
            top: 0,
            zIndex: 10
        }}>
            <div style={{ marginBottom: "3rem", display: "flex", justifyContent: "center", alignItems: "center", width: "100%" }}>
                <img src={theme === 'dark' ? "/logo-light.png" : "/logo-dark.png"} alt="RT Money Logo" style={{ width: "120px", height: "auto", objectFit: "contain" }} />
            </div>

            <nav style={{ display: "flex", flexDirection: "column", gap: "0.5rem", flex: 1 }}>
                {links.map((link) => (
                    <Link
                        key={link.path}
                        to={link.path}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "1rem",
                            padding: "1rem",
                            borderRadius: "12px",
                            color: pathname === link.path ? "var(--primary)" : "var(--text-secondary)",
                            backgroundColor: pathname === link.path ? "rgba(98, 0, 238, 0.1)" : "transparent",
                            fontWeight: pathname === link.path ? "600" : "400",
                            transition: "all 0.2s",
                            whiteSpace: "nowrap",
                        }}
                    >
                        <div style={{ minWidth: "20px" }}>{link.icon}</div>
                        <span style={{ fontSize: "0.95rem" }}>{link.label}</span>
                    </Link>
                ))}
            </nav>

            <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "0.5rem" }}>

                <button
                    onClick={logout}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                        padding: "1rem",
                        borderRadius: "12px",
                        color: "var(--error)",
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "1rem"
                    }}
                >
                    <LogOut size={20} />
                    {t('logout')}
                </button>
            </div>
        </aside>
    );
}
