import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useFilter } from "../context/FilterContext";
import { addDebt, getDebts, updateDebt, deleteDebt } from "../services/dbService";
import Layout from "../components/Layout/Layout";
import DebtCard from "../components/Debts/DebtCard";
import AddDebtModal from "../components/Debts/AddDebtModal";
import { Plus, BellRing } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export default function DebtsPage() {
    const { user } = useAuth();
    const { t } = useLanguage();
    const [debts, setDebts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingDebt, setEditingDebt] = useState(null);

    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

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
        if (confirm(t('deleteDebtConfirm'))) {
            await deleteDebt(user.uid, id);
            fetchDebts();
        }
    };

    const handleMarkAsPaid = async (debt) => {
        if (confirm(`${t('markAsPaidConfirm')} "${debt.title}"?`)) {
            await updateDebt(user.uid, debt.id, { status: 'paid' });
            fetchDebts();
        }
    };

    const [filteredDebts, setFilteredDebts] = useState([]);
    const { filterParams } = useFilter();

    useEffect(() => {
        if (debts.length > 0) {
            const filtered = debts.filter(debt => {
                if (!debt.dueDate) return false;

                if (filterParams.type === 'month') {
                    // Filter by YYYY-MM
                    return debt.dueDate.startsWith(filterParams.value);
                } else if (filterParams.type === 'custom') {
                    // Filter by range
                    if (!filterParams.startDate || !filterParams.endDate) return true;
                    return debt.dueDate >= filterParams.startDate && debt.dueDate <= filterParams.endDate;
                }
                return true;
            });
            setFilteredDebts(filtered);
        } else {
            setFilteredDebts([]);
        }
    }, [debts, filterParams]);

    const pendingDebts = filteredDebts.filter(d => d.status !== 'paid');
    const paidDebts = filteredDebts.filter(d => d.status === 'paid');

    const totalPending = pendingDebts.reduce((sum, d) => sum + parseFloat(d.amount), 0);
    const totalPaid = paidDebts.reduce((sum, d) => sum + parseFloat(d.amount), 0);
    const totalDebts = totalPending + totalPaid;

    return (
        <Layout>
            <div style={{ marginBottom: "2rem", display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", alignItems: isMobile ? "flex-start" : "center", gap: isMobile ? "1rem" : "0" }}>
                <h1 style={{ fontSize: isMobile ? "1.5rem" : "1.8rem", fontWeight: "bold" }}>{t('debts')}</h1>
                <button
                    onClick={() => { setEditingDebt(null); setShowModal(true); }}
                    style={{
                        display: "flex", alignItems: "center", gap: "0.5rem", justifyContent: "center",
                        padding: "0.8rem 1.2rem",
                        background: "var(--primary)",
                        color: "white",
                        border: "none",
                        borderRadius: "12px",
                        cursor: "pointer",
                        fontWeight: "bold",
                        fontSize: "0.9rem",
                        width: isMobile ? "100%" : "auto"
                    }}
                >
                    <Plus size={18} />
                    {t('scheduleDebt')}
                </button>
            </div>

            {/* Debt Summary Panel */}
            {!loading && debts.length > 0 && (
                <section style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
                    <div style={{ background: "var(--surface)", padding: "1.5rem", borderRadius: "16px", boxShadow: "var(--shadow)", borderLeft: "5px solid #F6AD55" }}>
                        <span style={{ color: "var(--text-secondary)", display: "block", marginBottom: "0.5rem" }}>Total Pendente</span>
                        <h2 style={{ fontSize: "1.8rem", color: "#DD6B20" }}>R$ {totalPending.toFixed(2)}</h2>
                    </div>
                    <div style={{ background: "var(--surface)", padding: "1.5rem", borderRadius: "16px", boxShadow: "var(--shadow)", borderLeft: "5px solid #68D391" }}>
                        <span style={{ color: "var(--text-secondary)", display: "block", marginBottom: "0.5rem" }}>Total Pago</span>
                        <h2 style={{ fontSize: "1.8rem", color: "#38A169" }}>R$ {totalPaid.toFixed(2)}</h2>
                    </div>
                    <div style={{ background: "var(--surface)", padding: "1.5rem", borderRadius: "16px", boxShadow: "var(--shadow)", borderLeft: "5px solid var(--primary)" }}>
                        <span style={{ color: "var(--text-secondary)", display: "block", marginBottom: "0.5rem" }}>Total Geral (Contas)</span>
                        <h2 style={{ fontSize: "1.8rem", color: "var(--text-primary)" }}>R$ {totalDebts.toFixed(2)}</h2>
                    </div>
                </section>
            )}

            {loading ? (
                <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-secondary)" }}>{t('loadingDebts')}</div>
            ) : (
                <>
                    {debts.length === 0 ? (
                        <div style={{
                            textAlign: "center",
                            padding: "4rem 2rem",
                            background: "var(--surface)",
                            borderRadius: "16px",
                            boxShadow: "var(--shadow)",
                            display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem"
                        }}>
                            <div style={{ background: "#F3E8FF", padding: "1.5rem", borderRadius: "50%" }}>
                                <BellRing size={48} color="#805AD5" />
                            </div>
                            <h3 style={{ fontSize: "1.2rem", color: "var(--text-primary)" }}>{t('noDebtsScheduled')}</h3>
                            <p style={{ color: "var(--text-secondary)", maxWidth: "400px" }}>
                                {t('debtsDescription')}
                            </p>
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>

                            {/* Pending Debts */}
                            <div>
                                <h2 style={{ fontSize: "1.2rem", color: "var(--text-primary)", marginBottom: "1rem", borderLeft: "4px solid #F6AD55", paddingLeft: "0.5rem" }}>
                                    {t('openDebts')} ({pendingDebts.length})
                                </h2>
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.5rem" }}>
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
                                {pendingDebts.length === 0 && <p style={{ color: "var(--text-secondary)", fontStyle: "italic" }}>{t('noPendingDebts')}</p>}
                            </div>

                            {/* Paid Debts History */}
                            {paidDebts.length > 0 && (
                                <div style={{ opacity: 0.8 }}>
                                    <h2 style={{ fontSize: "1.2rem", color: "var(--text-primary)", marginBottom: "1rem", borderLeft: "4px solid #68D391", paddingLeft: "0.5rem" }}>
                                        {t('paidHistory')}
                                    </h2>
                                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.5rem" }}>
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
