import { useState, useEffect } from "react";
import { X, Check, DollarSign } from "lucide-react";

export default function GoalContributionModal({ goal, onClose, onConfirm }) {
    const [amount, setAmount] = useState("");

    // Focus input on mount
    useEffect(() => {
        const input = document.getElementById("contribution-amount");
        if (input) input.focus();
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        const numericAmount = parseFloat(amount.replace(',', '.'));
        if (!isNaN(numericAmount) && numericAmount > 0) {
            onConfirm(numericAmount);
        }
    };

    return (
        <div style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
            backdropFilter: "blur(4px)"
        }}>
            <div style={{
                background: "var(--surface)",
                padding: "2rem",
                borderRadius: "24px",
                width: "400px",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                border: "1px solid var(--border)",
                animation: "fadeIn 0.2s ease-out"
            }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.5rem" }}>
                    <h2 style={{ fontSize: "1.2rem", fontWeight: "bold", color: "var(--text-primary)" }}>Adicionar Valor</h2>
                    <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)" }}>
                        <X size={24} />
                    </button>
                </div>

                <div style={{ marginBottom: "1.5rem" }}>
                    <p style={{ color: "var(--text-secondary)", marginBottom: "0.5rem", fontSize: "0.9rem" }}>
                        Adicionando à meta: <span style={{ fontWeight: "bold", color: "var(--text-primary)" }}>{goal.title}</span>
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ position: "relative", marginBottom: "2rem" }}>
                        <DollarSign
                            size={20}
                            color="var(--text-secondary)"
                            style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }}
                        />
                        <input
                            id="contribution-amount"
                            type="number"
                            step="0.01"
                            placeholder="0,00"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            style={{
                                width: "100%",
                                padding: "1rem 1rem 1rem 2.5rem",
                                fontSize: "1.5rem",
                                borderRadius: "12px",
                                border: "1px solid var(--border)",
                                background: "var(--background)",
                                color: "var(--text-primary)",
                                outline: "none",
                                fontWeight: "bold"
                            }}
                        />
                    </div>

                    <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                padding: "0.8rem 1.5rem",
                                borderRadius: "12px",
                                border: "1px solid var(--border)",
                                background: "transparent",
                                color: "var(--text-primary)",
                                cursor: "pointer",
                                fontWeight: "600"
                            }}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={!amount}
                            style={{
                                padding: "0.8rem 1.5rem",
                                borderRadius: "12px",
                                border: "none",
                                background: "var(--primary)",
                                color: "white",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem",
                                fontWeight: "600",
                                opacity: !amount ? 0.7 : 1
                            }}
                        >
                            <Check size={18} />
                            Confirmar
                        </button>
                    </div>
                </form>
            </div>
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
            `}</style>
        </div>
    );
}
