import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useFilter } from "../context/FilterContext";
import { getTransactions, deleteTransaction } from "../services/dbService";
import Layout from "../components/Layout/Layout";
import ImportTransactions from "../components/Transactions/ImportTransactions";
import AddTransactionModal from "../components/Transactions/AddTransactionModal";
import { Search, Filter, Trash2, UploadCloud, ChevronLeft, ChevronRight, Plus, ArrowUpCircle, ArrowDownCircle, CheckSquare, Square } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export default function TransactionsPage() {
    const { user } = useAuth();
    const { filterParams } = useFilter(); // Use global filter
    const { t, language } = useLanguage();
    const [transactions, setTransactions] = useState([]);
    const [filteredTransactions, setFilteredTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showImport, setShowImport] = useState(false);
    const [showAdd, setShowAdd] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState("all");
    const [selectedIds, setSelectedIds] = useState([]);

    useEffect(() => {
        fetchTransactions();
    }, [user]);

    useEffect(() => {
        filterData();
    }, [transactions, searchTerm, filterType, filterParams]);

    const fetchTransactions = async () => {
        if (user) {
            try {
                const data = await getTransactions(user.uid);
                // Safe sort handling missing dates
                data.sort((a, b) => {
                    const dateA = a.date ? new Date(a.date) : new Date(0);
                    const dateB = b.date ? new Date(b.date) : new Date(0);
                    return dateB - dateA;
                });
                setTransactions(data);
            } catch (error) {
                console.error("Failed to fetch transactions", error);
            } finally {
                setLoading(false);
            }
        }
    };

    const filterData = () => {
        if (!filterParams) return; // Prevention against context issues

        let filtered = transactions;

        if (filterType !== 'all') {
            filtered = filtered.filter(t => t.type === filterType);
        }

        if (filterParams.type === 'month') {
            filtered = filtered.filter(t => t.date && t.date.startsWith(filterParams.value));
        } else if (filterParams.type === 'custom') {
            if (filterParams.startDate) {
                filtered = filtered.filter(t => t.date >= filterParams.startDate);
            }
            if (filterParams.endDate) {
                filtered = filtered.filter(t => t.date <= filterParams.endDate);
            }
        }

        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            filtered = filtered.filter(t =>
                (t.description?.toLowerCase() || "").includes(lowerTerm) ||
                (t.category?.toLowerCase() || "").includes(lowerTerm) ||
                (t.amount?.toString() || "").includes(lowerTerm)
            );
        }

        setFilteredTransactions(filtered);
    };

    const handleDelete = async (id) => {
        if (confirm(t('deleteTransactionConfirm'))) {
            await deleteTransaction(user.uid, id);
            fetchTransactions();
        }
    };

    const handleBulkDelete = async () => {
        if (confirm(`${t('deleteBulkConfirm')} ${selectedIds.length} ${t('transactions').toLowerCase()}?`)) {
            // Simple loop for now, can be optimized with batch later
            for (const id of selectedIds) {
                await deleteTransaction(user.uid, id);
            }
            setSelectedIds([]);
            fetchTransactions();
        }
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === filteredTransactions.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredTransactions.map(t => t.id));
        }
    };

    const toggleSelect = (id) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(sid => sid !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    return (
        <Layout>
            <div style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h1 style={{ fontSize: "1.8rem", fontWeight: "bold" }}>{t('transactions')}</h1>
                <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                    <div style={{ color: "#666", marginRight: "1rem" }}>
                        {t('total')}: <strong>{filteredTransactions.length}</strong>
                    </div>
                    <button
                        onClick={() => setShowAdd(true)}
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
                        {t('addTransaction')}
                    </button>
                    <button
                        onClick={() => setShowImport(true)}
                        style={{
                            display: "flex", alignItems: "center", gap: "0.5rem",
                            padding: "0.8rem 1.2rem",
                            background: "white",
                            color: "#6200EE",
                            border: "1px solid #6200EE",
                            borderRadius: "12px",
                            cursor: "pointer",
                            fontWeight: "bold",
                            fontSize: "0.9rem"
                        }}
                    >
                        <UploadCloud size={18} />
                        {t('import')}
                    </button>
                </div>
            </div>

            {/* Filters Bar */}
            <div style={{ background: "var(--surface)", padding: "1rem", borderRadius: "12px", boxShadow: "var(--shadow)", marginBottom: "1.5rem", display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>

                {selectedIds.length > 0 ? (
                    <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "1rem", background: "#FFF5F5", padding: "0.8rem", borderRadius: "8px", border: "1px solid #FED7D7" }}>
                        <span style={{ fontWeight: "bold", color: "#E53E3E" }}>{selectedIds.length} {t('selected')}</span>
                        <button
                            onClick={handleBulkDelete}
                            style={{ background: "#E53E3E", color: "white", border: "none", padding: "0.5rem 1rem", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", marginLeft: "auto" }}
                        >
                            {t('deleteSelected')}
                        </button>
                    </div>
                ) : (
                    <>
                        <div style={{ flex: 1, display: "flex", alignItems: "center", background: "var(--background)", borderRadius: "8px", padding: "0 1rem" }}>
                            <Search size={20} color="var(--text-secondary)" />
                            <input
                                type="text"
                                placeholder={t('searchPlaceholder')}
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                style={{ border: "none", background: "transparent", padding: "0.8rem", width: "100%", outline: "none", color: "var(--text-primary)" }}
                            />
                        </div>



                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <Filter size={20} color="var(--text-secondary)" />
                            <select
                                value={filterType}
                                onChange={e => setFilterType(e.target.value)}
                                style={{ padding: "0.8rem", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--surface)", cursor: "pointer", color: "var(--text-primary)" }}
                            >
                                <option value="all">{t('all')}</option>
                                <option value="income">{t('income')}</option>
                                <option value="expense">{t('expenses')}</option>
                            </select>
                        </div>
                    </>
                )}

            </div>

            {/* Header with Select All */}
            <div style={{ display: "flex", alignItems: "center", padding: "0 1.5rem 1rem", borderBottom: "1px solid #eee", marginBottom: "0.5rem" }}>
                <div onClick={toggleSelectAll} style={{ cursor: "pointer", marginRight: "1rem", display: "flex", alignItems: "center" }}>
                    {selectedIds.length > 0 && selectedIds.length === filteredTransactions.length ? (
                        <CheckSquare size={20} color="var(--primary)" />
                    ) : (
                        <Square size={20} color="#ccc" />
                    )}
                </div>
                <span style={{ fontSize: "0.9rem", color: "#666", fontWeight: "600" }}>{t('selectAll')}</span>
            </div>

            {/* Transactions List */}
            <div style={{ background: "var(--surface)", borderRadius: "16px", boxShadow: "var(--shadow)", overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-secondary)" }}>{t('loading')}</div>
                ) : (
                    <>
                        {filteredTransactions.map((transaction, index) => (
                            <div key={transaction.id} style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                padding: "1.5rem",
                                borderBottom: index !== filteredTransactions.length - 1 ? "1px solid var(--border)" : "none",
                                transition: "background 0.2s",
                                backgroundColor: selectedIds.includes(transaction.id) ? "#F3E8FF" : "var(--surface)"
                            }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>

                                    <div onClick={() => toggleSelect(transaction.id)} style={{ cursor: "pointer" }}>
                                        {selectedIds.includes(transaction.id) ? (
                                            <CheckSquare size={20} color="var(--primary)" />
                                        ) : (
                                            <Square size={20} color="#ccc" />
                                        )}
                                    </div>

                                    <div style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        width: "60px",
                                        height: "60px",
                                        background: "var(--background)",
                                        borderRadius: "12px",
                                        color: "var(--text-secondary)",
                                        fontWeight: "bold"
                                    }}>
                                        <span style={{ fontSize: "0.9rem" }}>{transaction.date ? transaction.date.split('-')[2] : '--'}</span>
                                        <span style={{ fontSize: "0.7rem", textTransform: "uppercase" }}>
                                            {/* Use a safe way to get month name without timezone shift */}
                                            {transaction.date ? new Date(transaction.date + "T12:00:00").toLocaleString(language === 'en' ? 'en-US' : 'pt-BR', { month: 'short' }).replace('.', '') : ''}
                                        </span>
                                    </div>

                                    <div>
                                        <h3 style={{ fontSize: "1rem", marginBottom: "0.2rem", color: "var(--text-primary)" }}>{transaction.description}</h3>
                                        <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                                            {transaction.category === 'Geral' || transaction.category === 'Uncategorized' ? t('uncategorized') : transaction.category} • {transaction.type === 'income' ? t('credit') : t('debit')}
                                        </p>
                                    </div>
                                </div>

                                <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
                                    <span style={{
                                        fontSize: "1.1rem",
                                        fontWeight: "bold",
                                        color: transaction.type === 'income' ? '#38A169' : '#E53E3E'
                                    }}>
                                        {transaction.type === 'income' ? '+ ' : '- '}
                                        R$ {Math.abs(transaction.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </span>

                                    <button
                                        onClick={() => handleDelete(transaction.id)}
                                        style={{
                                            padding: "0.5rem",
                                            background: "#FFF5F5",
                                            border: "1px solid #FED7D7",
                                            borderRadius: "8px",
                                            color: "#E53E3E",
                                            cursor: "pointer",
                                            display: "flex"
                                        }}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}

                        {filteredTransactions.length === 0 && (
                            <div style={{ padding: "3rem", textAlign: "center", color: "var(--text-secondary)" }}>
                                {t('noTransactions')}
                            </div>
                        )}
                    </>
                )}
            </div>

            {showImport && (
                <ImportTransactions
                    onClose={() => setShowImport(false)}
                    onImportComplete={fetchTransactions}
                />
            )}

            {showAdd && (
                <AddTransactionModal
                    onClose={() => setShowAdd(false)}
                    onSave={fetchTransactions}
                />
            )}

        </Layout>
    );
}
