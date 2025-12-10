import { useState } from "react";
import { X, Check, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { addTransaction } from "../../services/dbService";
import { useAuth } from "../../context/AuthContext";
import { CATEGORIES } from "../../utils/categorizer";

export default function AddTransactionModal({ onClose, onSave }) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        description: "",
        amount: "",
        type: "expense",
        category: CATEGORIES.GERAL,
        date: new Date().toISOString().split('T')[0]
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.description || !formData.amount) return;

        setLoading(true);
        try {
            await addTransaction(user.uid, {
                ...formData,
                amount: parseFloat(formData.amount),
                source: 'manual' // Tag for future filtering
            });
            onSave();
            onClose();
        } catch (error) {
            console.error(error);
            alert("Erro ao salvar transação");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
        }}>
            <div style={{ background: "var(--surface)", padding: "2rem", borderRadius: "24px", width: "450px", boxShadow: "var(--shadow)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                    <h2 style={{ fontSize: "1.4rem", fontWeight: "bold" }}>Nova Transação</h2>
                    <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={24} color="#666" /></button>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Type Selector */}
                    <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
                        <div
                            onClick={() => setFormData({ ...formData, type: 'income' })}
                            style={{
                                flex: 1, padding: "1rem", borderRadius: "12px", cursor: "pointer",
                                border: formData.type === 'income' ? "2px solid #38A169" : "1px solid var(--border)",
                                background: formData.type === 'income' ? "#F0FFF4" : "var(--background)",
                                display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem"
                            }}
                        >
                            <ArrowUpCircle color="#38A169" />
                            <span style={{ fontWeight: "600", color: "#38A169" }}>Entrada</span>
                        </div>
                        <div
                            onClick={() => setFormData({ ...formData, type: 'expense' })}
                            style={{
                                flex: 1, padding: "1rem", borderRadius: "12px", cursor: "pointer",
                                border: formData.type === 'expense' ? "2px solid #E53E3E" : "1px solid var(--border)",
                                background: formData.type === 'expense' ? "#FFF5F5" : "var(--background)",
                                display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem"
                            }}
                        >
                            <ArrowDownCircle color="#E53E3E" />
                            <span style={{ fontWeight: "600", color: "#E53E3E" }}>Saída</span>
                        </div>
                    </div>

                    {/* Inputs */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        <div>
                            <label style={{ display: "block", fontSize: "0.9rem", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>Valor (R$)</label>
                            <input
                                type="number"
                                step="0.01"
                                placeholder="0,00"
                                value={formData.amount}
                                onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                style={{ width: "100%", padding: "0.8rem", borderRadius: "8px", border: "1px solid var(--border)", fontSize: "1.2rem", fontWeight: "bold", background: "var(--background)", color: "var(--text-primary)" }}
                                autoFocus
                            />
                        </div>

                        <div>
                            <label style={{ display: "block", fontSize: "0.9rem", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>Descrição</label>
                            <input
                                type="text"
                                placeholder="Ex: Salário, Mercado..."
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                style={{ width: "100%", padding: "0.8rem", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--background)", color: "var(--text-primary)" }}
                            />
                        </div>

                        <div style={{ display: "flex", gap: "1rem" }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: "block", fontSize: "0.9rem", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>Categoria</label>
                                <select
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    style={{ width: "100%", padding: "0.8rem", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--background)", color: "var(--text-primary)" }}
                                >
                                    {Object.values(CATEGORIES).map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: "block", fontSize: "0.9rem", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>Data</label>
                                <input
                                    type="date"
                                    value={formData.date}
                                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                                    style={{ width: "100%", padding: "0.8rem", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--background)", color: "var(--text-primary)" }}
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: "100%",
                            marginTop: "2rem",
                            padding: "1rem",
                            background: "var(--primary)",
                            color: "white",
                            border: "none",
                            borderRadius: "12px",
                            fontWeight: "bold",
                            fontSize: "1rem",
                            cursor: loading ? "not-allowed" : "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem"
                        }}
                    >
                        {loading ? "Salvando..." : <><Check size={20} /> Salvar Transação</>}
                    </button>
                </form>
            </div>
        </div>
    );
}
