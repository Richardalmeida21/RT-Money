import { Trash2, Edit2, PlusCircle, Target } from "lucide-react";

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

    return (
        <div style={{
            background: "var(--surface)",
            borderRadius: "16px",
            padding: "1.5rem",
            boxShadow: "var(--shadow)",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            position: "relative",
            overflow: "hidden"
        }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
                    <div style={{
                        background: goal.color ? `${goal.color}20` : "#E6FFFA",
                        padding: "10px",
                        borderRadius: "12px",
                        display: "flex", alignItems: "center", justifyContent: "center"
                    }}>
                        <Target size={24} color={goal.color || "#38A169"} />
                    </div>
                    <div>
                        <h3 style={{ fontSize: "1.1rem", fontWeight: "bold", color: "var(--text-primary)", marginBottom: "0.2rem" }}>{goal.title}</h3>
                        {daysRemaining !== null && (
                            <span style={{ fontSize: "0.8rem", color: daysRemaining < 0 ? "#E53E3E" : "var(--text-secondary)" }}>
                                {daysRemaining < 0 ? "Expirou" : `${daysRemaining} dias restantes`}
                            </span>
                        )}
                    </div>
                </div>

                <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button
                        onClick={() => onEdit(goal)}
                        style={{ border: "none", background: "transparent", cursor: "pointer", color: "#999" }}
                    >
                        <Edit2 size={16} />
                    </button>
                    <button
                        onClick={() => onDelete(goal.id)}
                        style={{ border: "none", background: "transparent", cursor: "pointer", color: "#E53E3E" }}
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            {/* Amounts */}
            <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "0.5rem" }}>
                    <span style={{ fontSize: "1.4rem", fontWeight: "bold", color: "var(--text-primary)" }}>
                        R$ {goal.currentAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                    <span style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
                        de R$ {goal.targetAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                </div>

                {/* Progress Bar */}
                <div style={{ width: "100%", height: "8px", background: "var(--background)", borderRadius: "4px", overflow: "hidden" }}>
                    <div style={{
                        width: `${progress}%`,
                        height: "100%",
                        background: goal.color || "#38A169",
                        borderRadius: "4px",
                        transition: "width 0.5s ease"
                    }} />
                </div>
                <div style={{ textAlign: "right", marginTop: "0.3rem" }}>
                    <span style={{ fontSize: "0.8rem", fontWeight: "bold", color: goal.color || "#38A169" }}>{progress.toFixed(0)}%</span>
                </div>
            </div>

            {/* Action */}
            <button
                onClick={() => onAddMoney(goal)}
                style={{
                    marginTop: "auto",
                    width: "100%",
                    padding: "0.8rem",
                    borderRadius: "12px",
                    border: "1px dashed var(--border)",
                    background: "transparent",
                    color: "var(--text-secondary)",
                    fontWeight: "600",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                    transition: "all 0.2s"
                }}
                onMouseOver={(e) => { e.currentTarget.style.background = "#f7fafc"; e.currentTarget.style.borderColor = "#a0aec0"; }}
                onMouseOut={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "#cbd5e0"; }}
            >
                <PlusCircle size={18} />
                Adicionar Valor
            </button>
        </div>
    );
}
