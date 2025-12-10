import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { addDebt, getDebts, updateDebt, deleteDebt } from "../services/dbService";
import Layout from "../components/Layout/Layout";
import DebtCard from "../components/Debts/DebtCard";
import AddDebtModal from "../components/Debts/AddDebtModal";
import { Plus, BellRing } from "lucide-react";

export default function DebtsPage() {
    const { user } = useAuth();
    const [debts, setDebts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingDebt, setEditingDebt] = useState(null);

    useEffect(() => {
        fetchDebts();
    }, [user]);

    const fetchDebts = async () => {
        if (user) {
            try {
                const data = await getDebts(user.uid);
                setDebts(data);
            } catch (error) {
                console.error("Failed to fetch debts", error);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleSaveDebt = async (debtData) => {
        if (editingDebt) {
            await updateDebt(user.uid, editingDebt.id, debtData);
        } else {
            await addDebt(user.uid, debtData);
        }
        fetchDebts();
        setEditingDebt(null);
    };

    const handleDeleteDebt = async (id) => {
        if (confirm("Tem certeza que deseja excluir esta conta?")) {
            await deleteDebt(user.uid, id);
            fetchDebts();
        }
    };

    const handleMarkAsPaid = async (debt) => {
        if (confirm(`Confirmar pagamento de "${debt.title}"?`)) {
            await updateDebt(user.uid, debt.id, { status: 'paid' });
            fetchDebts();
        }
    };

    const pendingDebts = debts.filter(d => d.status !== 'paid');
    const paidDebts = debts.filter(d => d.status === 'paid');

    return (
        <Layout>
            <div style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h1 style={{ fontSize: "1.8rem", fontWeight: "bold" }}>Contas a Pagar</h1>
                <button
                    onClick={() => { setEditingDebt(null); setShowModal(true); }}
                    style={{
                        display: "flex", alignItems: "center", gap: "0.5rem",
                        padding: "0.8rem 1.2rem",
                        background: "var(--primary)",
                        color: "white",
                        border: "none",
                        borderRadius: "12px",
                        cursor: "pointer",
                        fontWeight: "bold",
                        fontSize: "0.9rem"
                    }}
                >
                    <Plus size={18} />
                    Agendar Conta
                </button>
            </div>

            {loading ? (
                <div style={{ padding: "2rem", textAlign: "center", color: "#666" }}>Carregando contas...</div>
            ) : (
                <>
                    {debts.length === 0 ? (
                        <div style={{
                            textAlign: "center",
                            padding: "4rem 2rem",
                            background: "white",
                            borderRadius: "16px",
                            boxShadow: "var(--shadow)",
                            display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem"
                        }}>
                            <div style={{ background: "#F3E8FF", padding: "1.5rem", borderRadius: "50%" }}>
                                <BellRing size={48} color="#805AD5" />
                            </div>
                            <h3 style={{ fontSize: "1.2rem", color: "#4A5568" }}>Nenhuma conta agendada</h3>
                            <p style={{ color: "#718096", maxWidth: "400px" }}>
                                Fique tranquilo! Agende suas contas e receba lembretes para nunca mais pagar juros por atraso.
                            </p>
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>

                            {/* Pending Debts */}
                            <div>
                                <h2 style={{ fontSize: "1.2rem", color: "#4A5568", marginBottom: "1rem", borderLeft: "4px solid #F6AD55", paddingLeft: "0.5rem" }}>
                                    Em Aberto ({pendingDebts.length})
                                </h2>
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem" }}>
                                    {pendingDebts.map(debt => (
                                        <DebtCard
                                            key={debt.id}
                                            debt={debt}
                                            onPay={handleMarkAsPaid}
                                            onEdit={(d) => { setEditingDebt(d); setShowModal(true); }}
                                            onDelete={handleDeleteDebt}
                                        />
                                    ))}
                                </div>
                                {pendingDebts.length === 0 && <p style={{ color: "#999", fontStyle: "italic" }}>Nenhuma conta pendente. Parabéns!</p>}
                            </div>

                            {/* Paid Debts History */}
                            {paidDebts.length > 0 && (
                                <div style={{ opacity: 0.8 }}>
                                    <h2 style={{ fontSize: "1.2rem", color: "#4A5568", marginBottom: "1rem", borderLeft: "4px solid #68D391", paddingLeft: "0.5rem" }}>
                                        Histórico de Pagos
                                    </h2>
                                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem" }}>
                                        {paidDebts.map(debt => (
                                            <DebtCard
                                                key={debt.id}
                                                debt={debt}
                                                onPay={handleMarkAsPaid}
                                                onEdit={(d) => { setEditingDebt(d); setShowModal(true); }}
                                                onDelete={handleDeleteDebt}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}

            {showModal && (
                <AddDebtModal
                    onClose={() => { setShowModal(false); setEditingDebt(null); }}
                    onSave={handleSaveDebt}
                    editingDebt={editingDebt}
                />
            )}
        </Layout>
    );
}
