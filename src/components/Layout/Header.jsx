import { Bell, ChevronDown, User } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function Header() {
    const { user } = useAuth();

    return (
        <header style={{
            height: "80px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 2rem",
            backgroundColor: "transparent"
        }}>
            <div>
                <h1 style={{ fontSize: "1.5rem", fontWeight: "bold" }}>Visão Geral</h1>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
                {/* Month Selector Placeholder */}
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    background: "var(--surface)",
                    padding: "0.5rem 1rem",
                    borderRadius: "20px",
                    boxShadow: "var(--shadow)",
                    cursor: "pointer"
                }}>
                    <span>Dezembro</span>
                    <ChevronDown size={16} />
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <button style={{ background: "var(--surface)", border: "none", padding: "0.5rem", borderRadius: "50%", cursor: "pointer", boxShadow: "var(--shadow)" }}>
                        <Bell size={20} color="var(--text-secondary)" />
                    </button>

                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <div style={{ width: "40px", height: "40px", backgroundColor: "#ddd", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                            {/* Placeholder Avatar */}
                            <User size={24} color="#666" />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                            <span style={{ fontSize: "0.9rem", fontWeight: "600" }}>{user?.email?.split('@')[0]}</span>
                            <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Usuário</span>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
