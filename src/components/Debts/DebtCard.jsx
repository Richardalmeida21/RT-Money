import { Trash2, Edit2, CheckCircle, Clock, AlertTriangle, Bell } from "lucide-react";

export default function DebtCard({ debt, onPay, onEdit, onDelete }) {
    const isPaid = debt.status === 'paid';

    const getStatusInfo = () => {
        if (isPaid) return { label: "Pago", color: "#38A169", icon: <CheckCircle size={16} /> };

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const due = new Date(debt.dueDate + "T00:00:00");

        const diffTime = due - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return { label: "Atrasado", color: "#E53E3E", icon: <AlertTriangle size={16} /> };
        if (diffDays === 0) return { label: "Vence Hoje", color: "#D69E2E", icon: <Clock size={16} /> };
        return { label: `Vence em ${diffDays} dias`, color: "#3182CE", icon: <Clock size={16} /> };
    };

    const statusInfo = getStatusInfo();

    return (
        <div style={{
            background: "white",
            borderRadius: "16px",
            padding: "1.5rem",
            boxShadow: "var(--shadow)",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            borderLeft: `5px solid ${statusInfo.color}`,
            opacity: isPaid ? 0.7 : 1
        }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                    <h3 style={{ fontSize: "1.1rem", fontWeight: "bold", color: "#333", marginBottom: "0.2rem" }}>{debt.title}</h3>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: statusInfo.color, fontSize: "0.85rem", fontWeight: "600" }}>
                        {statusInfo.icon}
                        <span>{statusInfo.label}</span>
                    </div>
                </div>

                <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button
                        onClick={() => onEdit(debt)}
                        style={{ border: "none", background: "transparent", cursor: "pointer", color: "#999" }}
                    >
                        <Edit2 size={16} />
                    </button>
                    <button
                        onClick={() => onDelete(debt.id)}
                        style={{ border: "none", background: "transparent", cursor: "pointer", color: "#E53E3E" }}
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            {/* Amount */}
            <div style={{ marginTop: "0.5rem" }}>
                <span style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#333" }}>
                    R$ {parseFloat(debt.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
                <div style={{ fontSize: "0.9rem", color: "#666" }}>
                    Vencimento: {new Date(debt.dueDate + "T00:00:00").toLocaleDateString('pt-BR')}
                </div>
            </div>

            {/* Footer with Notification Info */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.5rem", paddingTop: "0.5rem", borderTop: "1px solid #eee" }}>
                {debt.notificationMethod !== 'none' && (
                    <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.8rem", color: "#805AD5" }} title={`Notificar via ${debt.notificationMethod}`}>
                        <Bell size={14} />
                        <span style={{ textTransform: 'capitalize' }}>{debt.notificationMethod}</span>
                    </div>
                )}

                {!isPaid && (
                    <button
                        onClick={() => onPay(debt)}
                        style={{
                            marginLeft: "auto",
                            padding: "6px 12px",
                            background: "#E6FFFA",
                            color: "#38A169",
                            border: "1px solid #38A169",
                            borderRadius: "8px",
                            fontWeight: "bold",
                            fontSize: "0.8rem",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "5px"
                        }}
                    >
                        <CheckCircle size={14} />
                        Marcar como Pago
                    </button>
                )}
            </div>
        </div>
    );
}
