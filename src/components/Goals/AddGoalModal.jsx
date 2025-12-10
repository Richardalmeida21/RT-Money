import { useState, useEffect } from "react";
import { X } from "lucide-react";

const COLORS = [
    "#38A169", // Green
    "#3182CE", // Blue
    "#805AD5", // Purple
    "#D69E2E", // Yellow
    "#E53E3E", // Red
    "#D53F8C", // Pink
    "#00B5D8", // Cyan
];

export default function AddGoalModal({ onClose, onSave, editingGoal }) {
    const [title, setTitle] = useState("");
    const [targetAmount, setTargetAmount] = useState("");
    const [currentAmount, setCurrentAmount] = useState("");
    const [deadline, setDeadline] = useState("");
    const [color, setColor] = useState(COLORS[0]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (editingGoal) {
            setTitle(editingGoal.title);
            setTargetAmount(editingGoal.targetAmount);
            setCurrentAmount(editingGoal.currentAmount);
            setDeadline(editingGoal.deadline || "");
            setColor(editingGoal.color || COLORS[0]);
        }
    }, [editingGoal]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSave({
                title,
                targetAmount: parseFloat(targetAmount),
                currentAmount: parseFloat(currentAmount || 0),
                deadline,
                color
            });
            onClose();
        } catch (error) {
            console.error("Error saving goal", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000
        }}>
            <div style={{
                background: "white", padding: "2rem", borderRadius: "16px", width: "90%", maxWidth: "500px",
                boxShadow: "0 10px 25px rgba(0,0,0,0.2)"
            }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                    <h2 style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{editingGoal ? "Editar Meta" : "Nova Meta"}</h2>
                    <button onClick={onClose} style={{ border: "none", background: "none", cursor: "pointer" }}><X size={24} /></button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <div>
                        <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "#4A5568" }}>Nome da Meta</label>
                        <input
                            type="text"
                            required
                            placeholder="Ex: Viagem para Disney"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            style={{ width: "100%", padding: "0.8rem", borderRadius: "8px", border: "1px solid #CBD5E0" }}
                        />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                        <div>
                            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "#4A5568" }}>Valor Alvo (R$)</label>
                            <input
                                type="number"
                                required
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                                value={targetAmount}
                                onChange={(e) => setTargetAmount(e.target.value)}
                                style={{ width: "100%", padding: "0.8rem", borderRadius: "8px", border: "1px solid #CBD5E0" }}
                            />
                        </div>
                        <div>
                            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "#4A5568" }}>Guardado (R$)</label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                                value={currentAmount}
                                onChange={(e) => setCurrentAmount(e.target.value)}
                                style={{ width: "100%", padding: "0.8rem", borderRadius: "8px", border: "1px solid #CBD5E0" }}
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "#4A5568" }}>Prazo (Opcional)</label>
                        <input
                            type="date"
                            value={deadline}
                            onChange={(e) => setDeadline(e.target.value)}
                            style={{ width: "100%", padding: "0.8rem", borderRadius: "8px", border: "1px solid #CBD5E0" }}
                        />
                    </div>

                    <div>
                        <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "#4A5568" }}>Cor</label>
                        <div style={{ display: "flex", gap: "0.8rem" }}>
                            {COLORS.map(c => (
                                <div
                                    key={c}
                                    onClick={() => setColor(c)}
                                    style={{
                                        width: "30px", height: "30px", borderRadius: "50%", background: c, cursor: "pointer",
                                        border: color === c ? "3px solid #1A202C" : "2px solid white",
                                        boxShadow: "0 2px 5px rgba(0,0,0,0.1)"
                                    }}
                                />
                            ))}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            marginTop: "1rem",
                            padding: "1rem",
                            background: "var(--primary)",
                            color: "white",
                            border: "none",
                            borderRadius: "12px",
                            fontWeight: "bold",
                            fontSize: "1rem",
                            cursor: loading ? "not-allowed" : "pointer",
                            opacity: loading ? 0.7 : 1
                        }}
                    >
                        {loading ? "Salvando..." : (editingGoal ? "Salvar Alterações" : "Criar Meta")}
                    </button>
                </form>
            </div>
        </div>
    );
}
