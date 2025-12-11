import { Trash2, Edit2, Plus, Target, Calendar } from "lucide-react";

export default function GoalCard({ goal, onAddMoney, onEdit, onDelete }) {
    const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);

    // Calculate days remaining if deadline exists
    const getDaysRemaining = () => {
        if (!goal.deadline) return null;
        const today = new Date();
        const deadline = new Date(goal.deadline);
        const diffTime = deadline - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const daysRemaining = getDaysRemaining();
    const primaryColor = goal.color || "#38A169";

    return (
        <div style={{
            background: "var(--surface)",
            borderRadius: "20px",
            padding: "1.5rem",
            boxShadow: "var(--shadow)",
            display: "flex",
            flexDirection: "column",
            gap: "1.2rem",
            position: "relative",
            overflow: "hidden",
            border: "1px solid var(--border)",
            transition: "transform 0.2s ease, box-shadow 0.2s ease"
        }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 15px 30px rgba(0,0,0,0.1)";
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "var(--shadow)";
            }}
        >
            {/* Header: Icon & Edit/Delete */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{
                    background: `${primaryColor}15`, // very light opacity
                    padding: "12px",
                    borderRadius: "14px",
                    display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                    <Target size={28} color={primaryColor} strokeWidth={2.5} />
                </div>

                <div style={{ display: "flex", gap: "0.2rem" }}>
                    <button
                        onClick={() => onEdit(goal)}
                        style={{ border: "none", background: "transparent", cursor: "pointer", color: "var(--text-secondary)", padding: "6px", borderRadius: "8px", transition: "background 0.2s" }}
                        onMouseEnter={(e) => e.target.style.background = "var(--background)"}
                        onMouseLeave={(e) => e.target.style.background = "transparent"}
                    >
                        <Edit2 size={16} />
                    </button>
                    <button
                        onClick={() => onDelete(goal.id)}
                        style={{ border: "none", background: "transparent", cursor: "pointer", color: "#EF4444", padding: "6px", borderRadius: "8px", transition: "background 0.2s" }}
                        onMouseEnter={(e) => e.target.style.background = "#FEF2F2"}
                        onMouseLeave={(e) => e.target.style.background = "transparent"}
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            {/* Title & Deadline Badge */}
            <div>
                <h3 style={{ fontSize: "1.2rem", fontWeight: "800", color: "var(--text-primary)", marginBottom: "0.5rem", lineHeight: "1.3" }}>
                    {goal.title}
                </h3>
                {daysRemaining !== null && (
                    <div style={{
                        display: "inline-flex", alignItems: "center", gap: "6px",
                        padding: "4px 10px", borderRadius: "20px",
                        background: daysRemaining < 0 ? "#FEF2F2" : "var(--background)",
                        border: daysRemaining < 0 ? "1px solid #FECACA" : "1px solid var(--border)"
                    }}>
                        <Calendar size={12} color={daysRemaining < 0 ? "#EF4444" : "var(--text-secondary)"} />
                        <span style={{ fontSize: "0.75rem", fontWeight: "600", color: daysRemaining < 0 ? "#EF4444" : "var(--text-secondary)" }}>
                            {daysRemaining < 0 ? "Expirou" : `${daysRemaining} dias restantes`}
                        </span>
                    </div>
                )}
            </div>

            {/* Progress Section */}
            <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "0.5rem" }}>
                    <span style={{ fontSize: "1.6rem", fontWeight: "900", color: "var(--text-primary)", letterSpacing: "-0.5px" }}>
                        <span style={{ fontSize: "1rem", color: "var(--text-secondary)", marginRight: "4px", fontWeight: "600" }}>R$</span>
                        {goal.currentAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                    <span style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--text-secondary)" }}>
                        meta: R$ {goal.targetAmount.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                    </span>
                </div>

                <div style={{ width: "100%", height: "12px", background: "var(--background)", borderRadius: "6px", overflow: "hidden", position: "relative" }}>
                    <div style={{
                        width: `${progress}%`,
                        height: "100%",
                        background: primaryColor,
                        borderRadius: "6px",
                        transition: "width 0.8s cubic-bezier(0.4, 0, 0.2, 1)"
                    }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.5rem" }}>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Progresso</span>
                    <span style={{ fontSize: "0.9rem", fontWeight: "bold", color: primaryColor }}>{progress.toFixed(0)}%</span>
                </div>
            </div>

            {/* Action Button */}
            <button
                onClick={() => onAddMoney(goal)}
                style={{
                    marginTop: "auto",
                    width: "100%",
                    padding: "0.9rem",
                    borderRadius: "12px",
                    border: "none",
                    background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}dd 100%)`,
                    color: "white",
                    fontWeight: "700",
                    fontSize: "0.95rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.6rem",
                    boxShadow: `0 4px 12px ${primaryColor}40`,
                    transition: "all 0.2s ease"
                }}
                onMouseDown={(e) => e.currentTarget.style.transform = "scale(0.98)"}
                onMouseUp={(e) => e.currentTarget.style.transform = "scale(1)"}
            >
                <Plus size={20} strokeWidth={3} />
                Adicionar Valor
            </button>
        </div>
    );
}
