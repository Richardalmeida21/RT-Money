import { useState } from "react";
import { Bell, ChevronDown, User, ChevronLeft, ChevronRight, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useFilter } from "../../context/FilterContext";

export default function Header() {
    const { user } = useAuth();
    const { filterParams, setFilterParams } = useFilter();
    const [showPeriodMenu, setShowPeriodMenu] = useState(false);

    const handleMonthChange = (direction) => {
        const [year, month] = filterParams.value.split('-').map(Number);
        const date = new Date(year, month - 1 + direction, 1);
        setFilterParams({ ...filterParams, value: date.toISOString().slice(0, 7) });
    };

    const toggleMsg = () => {
        setFilterParams({ ...filterParams, isValuesVisible: !filterParams.isValuesVisible });
    }

    const monthName = new Date(filterParams.value + "-02").toLocaleString('pt-BR', { month: 'long', year: 'numeric' });

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

                {/* Global Date Filter */}
                <div style={{ position: "relative" }}>
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        background: "white",
                        padding: "0.5rem 1rem",
                        borderRadius: "20px",
                        boxShadow: "var(--shadow)",
                    }}>
                        {/* Period Type Dropdown Trigger */}
                        <div
                            onClick={() => setShowPeriodMenu(!showPeriodMenu)}
                            style={{
                                display: "flex", alignItems: "center", gap: "5px", cursor: "pointer",
                                marginRight: "10px", paddingRight: "10px", borderRight: "1px solid #eee", fontWeight: "bold", fontSize: "0.85rem", color: "#666"
                            }}>
                            {filterParams.type === 'month' ? 'Mensal' : 'Período'} <ChevronDown size={14} />
                        </div>

                        {filterParams.type === 'month' ? (
                            <>
                                <button onClick={() => handleMonthChange(-1)} style={{ border: "none", background: "none", cursor: "pointer", display: "flex" }}>
                                    <ChevronLeft size={16} color="#666" />
                                </button>

                                <span style={{ minWidth: "100px", textAlign: "center", textTransform: "capitalize", fontWeight: "600", fontSize: "0.9rem" }}>
                                    {monthName}
                                </span>

                                <button onClick={() => handleMonthChange(1)} style={{ border: "none", background: "none", cursor: "pointer", display: "flex" }}>
                                    <ChevronRight size={16} color="#666" />
                                </button>
                            </>
                        ) : (
                            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                                <input
                                    type="date"
                                    value={filterParams.startDate}
                                    onChange={(e) => setFilterParams({ ...filterParams, startDate: e.target.value })}
                                    style={{ border: "1px solid #ddd", borderRadius: "5px", padding: "2px 5px", fontSize: "0.8rem", width: "110px" }}
                                />
                                <span style={{ fontSize: "0.8rem", color: "#999" }}>até</span>
                                <input
                                    type="date"
                                    value={filterParams.endDate}
                                    onChange={(e) => setFilterParams({ ...filterParams, endDate: e.target.value })}
                                    style={{ border: "1px solid #ddd", borderRadius: "5px", padding: "2px 5px", fontSize: "0.8rem", width: "110px" }}
                                />
                            </div>
                        )}
                    </div>

                    {showPeriodMenu && (
                        <div style={{
                            position: "absolute",
                            top: "110%",
                            left: 0,
                            background: "white",
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
                                style={{ background: "none", border: "none", padding: "0.5rem", textAlign: "left", cursor: "pointer", fontWeight: filterParams.type === 'month' ? "bold" : "normal", borderRadius: "8px", backgroundColor: filterParams.type === 'month' ? "#f0f0f0" : "transparent" }}>
                                Mensal
                            </button>
                            <button
                                onClick={() => { setFilterParams({ ...filterParams, type: 'custom' }); setShowPeriodMenu(false); }}
                                style={{ background: "none", border: "none", padding: "0.5rem", textAlign: "left", cursor: "pointer", fontWeight: filterParams.type === 'custom' ? "bold" : "normal", borderRadius: "8px", backgroundColor: filterParams.type === 'custom' ? "#f0f0f0" : "transparent" }}>
                                Personalizado
                            </button>
                        </div>
                    )}
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <button
                        onClick={toggleMsg}
                        style={{ background: "var(--surface)", border: "none", padding: "0.5rem", borderRadius: "50%", cursor: "pointer", boxShadow: "var(--shadow)" }}
                        title={filterParams.isValuesVisible ? "Ocultar valores" : "Mostrar valores"}
                    >
                        {filterParams.isValuesVisible ? <Eye size={20} color="var(--text-secondary)" /> : <EyeOff size={20} color="var(--text-secondary)" />}
                    </button>

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
