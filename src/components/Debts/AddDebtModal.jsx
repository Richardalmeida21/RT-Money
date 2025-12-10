import { useState, useEffect } from "react";
import { X, Bell } from "lucide-react";

export default function AddDebtModal({ onClose, onSave, editingDebt }) {
    const [title, setTitle] = useState("");
    const [amount, setAmount] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [notificationMethod, setNotificationMethod] = useState("none"); // none, email, sms, both
    const [contactInfo, setContactInfo] = useState(""); // email or phone
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (editingDebt) {
            setTitle(editingDebt.title);
            setAmount(editingDebt.amount);
            setDueDate(editingDebt.dueDate);
            setNotificationMethod(editingDebt.notificationMethod || "none");
            setContactInfo(editingDebt.contactInfo || "");
        }
    }, [editingDebt]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSave({
                title,
                amount: parseFloat(amount),
                dueDate,
                notificationMethod,
                contactInfo,
                status: editingDebt ? editingDebt.status : 'pending'
            });
            onClose();
        } catch (error) {
            console.error("Error saving debt", error);
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
                boxShadow: "0 10px 25px rgba(0,0,0,0.2)", maxHeight: "90vh", overflowY: "auto"
            }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                    <h2 style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{editingDebt ? "Editar Conta" : "Nova Conta a Pagar"}</h2>
                    <button onClick={onClose} style={{ border: "none", background: "none", cursor: "pointer" }}><X size={24} /></button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <div>
                        <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "#4A5568" }}>Descrição</label>
                        <input
                            type="text"
                            required
                            placeholder="Ex: Fatura do Cartão"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            style={{ width: "100%", padding: "0.8rem", borderRadius: "8px", border: "1px solid #CBD5E0" }}
                        />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                        <div>
                            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "#4A5568" }}>Valor (R$)</label>
                            <input
                                type="number"
                                required
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                style={{ width: "100%", padding: "0.8rem", borderRadius: "8px", border: "1px solid #CBD5E0" }}
                            />
                        </div>
                        <div>
                            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "#4A5568" }}>Vencimento</label>
                            <input
                                type="date"
                                required
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                style={{ width: "100%", padding: "0.8rem", borderRadius: "8px", border: "1px solid #CBD5E0" }}
                            />
                        </div>
                    </div>

                    {/* Notification Section */}
                    <div style={{ background: "#F7FAFC", padding: "1rem", borderRadius: "8px", border: "1px dashed #CBD5E0" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.8rem", color: "#805AD5", fontWeight: "bold" }}>
                            <Bell size={18} />
                            <span>Agendar Lembrete</span>
                        </div>

                        <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", color: "#4A5568" }}>Enviar aviso 1 dia antes por Email:</label>
                        <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
                            <label style={{ display: "flex", alignItems: "center", gap: "0.3rem", cursor: "pointer" }}>
                                <input type="radio" name="notif" value="none" checked={notificationMethod === 'none'} onChange={(e) => setNotificationMethod(e.target.value)} />
                                Não enviar
                            </label>
                            <label style={{ display: "flex", alignItems: "center", gap: "0.3rem", cursor: "pointer" }}>
                                <input type="radio" name="notif" value="email" checked={notificationMethod === 'email'} onChange={(e) => setNotificationMethod(e.target.value)} />
                                Sim, enviar Email
                            </label>
                        </div>

                        {notificationMethod === 'email' && (
                            <div>
                                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "#4A5568" }}>
                                    Email para aviso
                                </label>
                                <input
                                    type="email"
                                    required
                                    placeholder="seu@email.com"
                                    value={contactInfo}
                                    onChange={(e) => setContactInfo(e.target.value)}
                                    style={{ width: "100%", padding: "0.8rem", borderRadius: "8px", border: "1px solid #CBD5E0" }}
                                />
                            </div>
                        )}
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
                        {loading ? "Salvando..." : (editingDebt ? "Salvar Alterações" : "Criar Agendamento")}
                    </button>
                </form>
            </div>
        </div>
    );
}
