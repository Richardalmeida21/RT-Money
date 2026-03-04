import { useState, useEffect } from "react";
import { X, Bell, CreditCard } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function AddDebtModal({ onClose, onSave, editingDebt }) {
    const { user } = useAuth();
    const [title, setTitle] = useState("");
    const [amount, setAmount] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [notificationMethod, setNotificationMethod] = useState("none");
    const [contactInfo, setContactInfo] = useState("");
    const [isRecurring, setIsRecurring] = useState(false);
    const [isInstallment, setIsInstallment] = useState(false);
    const [installments, setInstallments] = useState(2);
    const [loading, setLoading] = useState(false);

    // Toggle for custom email
    const [useCustomEmail, setUseCustomEmail] = useState(false);

    useEffect(() => {
        if (editingDebt) {
            setTitle(editingDebt.title);
            setAmount(editingDebt.amount);
            setDueDate(editingDebt.dueDate);
            setNotificationMethod(editingDebt.notificationMethod || "none");

            const savedEmail = editingDebt.contactInfo || "";
            setContactInfo(savedEmail);

            if (savedEmail && user?.email && savedEmail !== user.email) {
                setUseCustomEmail(true);
            } else {
                setUseCustomEmail(false);
            }
        } else {
            if (user?.email) {
                setContactInfo(user.email);
            }
            setUseCustomEmail(false);
        }
    }, [editingDebt, user]);

    const handleToggleInstallment = (checked) => {
        setIsInstallment(checked);
        if (checked) setIsRecurring(false);
    };

    const handleToggleRecurring = (checked) => {
        setIsRecurring(checked);
        if (checked) setIsInstallment(false);
    };

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
                isRecurring,
                isInstallment,
                installments: isInstallment ? parseInt(installments) : 1,
                status: editingDebt ? editingDebt.status : 'pending'
            });
            onClose();
        } catch (error) {
            console.error("Error saving debt", error);
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = {
        width: "100%",
        padding: "0.8rem",
        borderRadius: "8px",
        border: "1px solid var(--border)",
        background: "var(--background)",
        color: "var(--text-primary)"
    };

    return (
        <div style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000
        }}>
            <div style={{
                background: "var(--surface)", padding: "2rem", borderRadius: "16px", width: "90%", maxWidth: "500px",
                boxShadow: "0 10px 25px rgba(0,0,0,0.2)", maxHeight: "90vh", overflowY: "auto"
            }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                    <h2 style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{editingDebt ? "Editar Conta" : "Nova Conta a Pagar"}</h2>
                    <button onClick={onClose} style={{ border: "none", background: "none", cursor: "pointer" }}><X size={24} /></button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <div>
                        <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "var(--text-secondary)" }}>Descrição</label>
                        <input
                            type="text"
                            required
                            placeholder="Ex: Fatura do Cartão"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            style={inputStyle}
                        />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                        <div>
                            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "var(--text-secondary)" }}>
                                {isInstallment ? "Valor da Parcela (R$)" : "Valor (R$)"}
                            </label>
                            <input
                                type="number"
                                required
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                style={inputStyle}
                            />
                        </div>
                        <div>
                            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "var(--text-secondary)" }}>
                                {isInstallment ? "Vencimento (1ª parcela)" : "Vencimento"}
                            </label>
                            <input
                                type="date"
                                required
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                style={inputStyle}
                            />
                        </div>
                    </div>

                    {/* Installment Section */}
                    <div style={{
                        background: isInstallment ? "linear-gradient(135deg, #E9D8FD 0%, #F3E8FF 100%)" : "var(--background)",
                        padding: "1rem",
                        borderRadius: "8px",
                        border: isInstallment ? "1px solid #805AD5" : "1px dashed var(--border)",
                        transition: "all 0.2s ease"
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem", color: "#805AD5", fontWeight: "bold" }}>
                            <CreditCard size={18} />
                            <span>Compra Parcelada?</span>
                        </div>
                        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.9rem", color: "var(--text-secondary)", cursor: "pointer" }}>
                            <input
                                type="checkbox"
                                checked={isInstallment}
                                onChange={(e) => handleToggleInstallment(e.target.checked)}
                                style={{ transform: "scale(1.2)", cursor: "pointer" }}
                            />
                            Sim, é uma compra parcelada
                        </label>

                        {isInstallment && (
                            <div style={{ marginTop: "1rem" }}>
                                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "#553C9A", fontSize: "0.9rem" }}>
                                    Número de parcelas
                                </label>
                                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                    <input
                                        type="range"
                                        min="2"
                                        max="60"
                                        value={installments}
                                        onChange={(e) => setInstallments(parseInt(e.target.value))}
                                        style={{ flex: 1, accentColor: "#805AD5" }}
                                    />
                                    <div style={{
                                        background: "#805AD5",
                                        color: "white",
                                        padding: "0.4rem 0.9rem",
                                        borderRadius: "20px",
                                        fontWeight: "bold",
                                        fontSize: "0.95rem",
                                        minWidth: "50px",
                                        textAlign: "center"
                                    }}>
                                        {installments}x
                                    </div>
                                </div>
                                <div style={{ marginTop: "0.6rem", display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                                    {[2, 3, 6, 10, 12, 18, 24, 36, 48].map(n => (
                                        <button
                                            key={n}
                                            type="button"
                                            onClick={() => setInstallments(n)}
                                            style={{
                                                padding: "3px 10px",
                                                borderRadius: "20px",
                                                border: "1px solid #805AD5",
                                                background: installments === n ? "#805AD5" : "transparent",
                                                color: installments === n ? "white" : "#805AD5",
                                                fontSize: "0.8rem",
                                                fontWeight: "bold",
                                                cursor: "pointer",
                                                transition: "all 0.15s"
                                            }}
                                        >{n}x</button>
                                    ))}
                                </div>

                                {amount && (
                                    <div style={{
                                        marginTop: "0.8rem",
                                        background: "rgba(128, 90, 213, 0.1)",
                                        borderRadius: "8px",
                                        padding: "0.6rem 0.8rem",
                                        fontSize: "0.85rem",
                                        color: "#553C9A"
                                    }}>
                                        💡 Total da compra: <strong>R$ {(parseFloat(amount) * installments).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                                        {" "}({installments}x de <strong>R$ {parseFloat(amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>)
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Recurrence Section */}
                    <div style={{
                        background: "var(--background)",
                        padding: "1rem",
                        borderRadius: "8px",
                        border: "1px dashed var(--border)",
                        opacity: isInstallment ? 0.5 : 1,
                        pointerEvents: isInstallment ? "none" : "auto"
                    }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem", color: "var(--primary)", fontWeight: "bold" }}>
                            <span style={{ fontSize: "1.2rem" }}>🔁</span>
                            <span>Repetir Mensalmente?</span>
                        </div>
                        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.9rem", color: "var(--text-secondary)", cursor: isInstallment ? "not-allowed" : "pointer" }}>
                            <input
                                type="checkbox"
                                checked={isRecurring}
                                onChange={(e) => handleToggleRecurring(e.target.checked)}
                                disabled={isInstallment}
                                style={{ transform: "scale(1.2)", cursor: isInstallment ? "not-allowed" : "pointer" }}
                            />
                            Sim, essa é uma conta fixa (Cria automaticamente todo mês)
                        </label>
                    </div>

                    {/* Notification Section */}
                    <div style={{ background: "var(--background)", padding: "1rem", borderRadius: "8px", border: "1px dashed var(--border)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.8rem", color: "#805AD5", fontWeight: "bold" }}>
                            <Bell size={18} />
                            <span>Agendar Lembrete</span>
                        </div>

                        <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", color: "var(--text-secondary)" }}>Enviar aviso 1 dia antes por Email:</label>
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
                                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600", color: "var(--text-secondary)" }}>
                                    Email para aviso
                                </label>
                                <input
                                    type="email"
                                    required
                                    placeholder="seu@email.com"
                                    value={contactInfo}
                                    onChange={(e) => setContactInfo(e.target.value)}
                                    readOnly={!useCustomEmail}
                                    style={{
                                        width: "100%", padding: "0.8rem", borderRadius: "8px",
                                        border: "1px solid var(--border)",
                                        background: useCustomEmail ? "var(--background)" : "var(--surface)",
                                        color: useCustomEmail ? "var(--text-primary)" : "var(--text-secondary)",
                                        cursor: useCustomEmail ? "text" : "not-allowed",
                                        opacity: useCustomEmail ? 1 : 0.8
                                    }}
                                />
                                <div style={{ marginTop: "0.8rem" }}>
                                    <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", color: "var(--text-secondary)", cursor: "pointer" }}>
                                        <input
                                            type="checkbox"
                                            checked={useCustomEmail}
                                            onChange={(e) => {
                                                const isChecked = e.target.checked;
                                                setUseCustomEmail(isChecked);
                                                if (!isChecked && user?.email) {
                                                    setContactInfo(user.email);
                                                }
                                            }}
                                            style={{ cursor: "pointer" }}
                                        />
                                        Usar outro e-mail
                                    </label>
                                </div>
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            marginTop: "1rem",
                            padding: "1rem",
                            background: isInstallment
                                ? "linear-gradient(135deg, #805AD5, #553C9A)"
                                : "var(--primary)",
                            color: "white",
                            border: "none",
                            borderRadius: "12px",
                            fontWeight: "bold",
                            fontSize: "1rem",
                            cursor: loading ? "not-allowed" : "pointer",
                            opacity: loading ? 0.7 : 1,
                            transition: "background 0.3s"
                        }}
                    >
                        {loading
                            ? "Salvando..."
                            : editingDebt
                                ? "Salvar Alterações"
                                : isInstallment
                                    ? `Criar ${installments} Parcelas 💳`
                                    : "Criar Agendamento"
                        }
                    </button>
                </form>
            </div>
        </div>
    );
}
