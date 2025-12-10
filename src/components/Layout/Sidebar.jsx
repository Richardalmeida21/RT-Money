import { Home, LayoutDashboard, Target, PieChart, Settings, LogOut, CalendarClock } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";

export default function Sidebar() {
    const { pathname } = useLocation();
    const { logout } = useAuth();
    const { t } = useLanguage();

    const links = [
        { icon: <LayoutDashboard size={20} />, label: t('dashboard'), path: "/" },
        { icon: <PieChart size={20} />, label: t('transactions'), path: "/transactions" },
        { icon: <Target size={20} />, label: t('goals'), path: "/goals" },
        { icon: <CalendarClock size={20} />, label: t('debts'), path: "/debts" },
        { icon: <Settings size={20} />, label: t('settings'), path: "/settings" },
    ];

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
            top: 0
        }}>
            <div style={{ marginBottom: "3rem", display: "flex", justifyContent: "center", alignItems: "center", width: "100%" }}>
                <img src="/logo.png" alt="RT Money Logo" style={{ width: "120px", height: "auto", objectFit: "contain" }} />
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
                            transition: "all 0.2s"
                        }}
                    >
                        {link.icon}
                        {link.label}
                    </Link>
                ))}
            </nav>

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
                    marginTop: "auto",
                    fontSize: "1rem"
                }}
            >
                <LogOut size={20} />
                {t('logout')}
            </button>
        </aside>
    );
}
