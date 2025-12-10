import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { addTransaction, getTransactions, deleteTransaction } from "../services/dbService";
import Layout from "../components/Layout/Layout";
import ImportTransactions from "../components/Transactions/ImportTransactions";
import { Plus, Wallet, ArrowUpCircle, ArrowDownCircle, CreditCard, UploadCloud, Trash2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from "recharts";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function Dashboard() {
    const { user } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showImport, setShowImport] = useState(false);
    const [newTransaction, setNewTransaction] = useState({
        description: "",
        amount: "",
        type: "expense",
        category: "Alimentação", // Default category in PT
        date: new Date().toISOString().split("T")[0]
    });

    useEffect(() => {
        fetchTransactions();
    }, [user]);

    const fetchTransactions = async () => {
        if (user) {
            try {
                const data = await getTransactions(user.uid);
                // Sort by date (newest first)
                data.sort((a, b) => new Date(b.date) - new Date(a.date));
                setTransactions(data);
            } catch (error) {
                console.error("Failed to fetch transactions", error);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleAddTransaction = async (e) => {
        e.preventDefault();
        if (!newTransaction.description || !newTransaction.amount) return;

        try {
            await addTransaction(user.uid, newTransaction);
            setNewTransaction({ ...newTransaction, description: "", amount: "" });
            fetchTransactions();
        } catch (error) {
            alert("Erro ao adicionar transação");
        }
    };

    const handleDelete = async (id) => {
        if (confirm("Tem certeza que deseja excluir esta transação?")) {
            await deleteTransaction(user.uid, id);
            fetchTransactions();
        }
    };

    const calculateBalance = () => {
        return transactions.reduce((acc, curr) => {
            return curr.type === "income" ? acc + curr.amount : acc - curr.amount;
        }, 0);
    };

    const income = transactions.filter(t => t.type === "income").reduce((acc, t) => acc + t.amount, 0);
    const expense = transactions.filter(t => t.type === "expense").reduce((acc, t) => acc + t.amount, 0);

    // Prepare data for charts
    const categoryData = transactions
        .filter(t => t.type === 'expense')
        .reduce((acc, curr) => {
            const found = acc.find(item => item.name === curr.category);
            if (found) {
                found.value += curr.amount;
            } else {
                acc.push({ name: curr.category, value: curr.amount });
            }
            return acc;
        }, []);

    const monthlyData = [
        { name: 'Entradas', value: income },
        { name: 'Saídas', value: expense }
    ];

    return (
        <Layout>
            {/* Summary Cards */}
            <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>

                <div style={{ background: "white", padding: "1.5rem", borderRadius: "16px", boxShadow: "var(--shadow)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
                        <span style={{ color: "#666" }}>Saldo Atual</span>
                        <div style={{ background: "#E8F0FE", padding: "8px", borderRadius: "50%" }}>
                            <Wallet size={20} color="#1967D2" />
                        </div>
                    </div>
                    <h2 style={{ fontSize: "1.8rem" }}>R$ {calculateBalance().toFixed(2)}</h2>
                </div>

                <div style={{ background: "white", padding: "1.5rem", borderRadius: "16px", boxShadow: "var(--shadow)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
                        <span style={{ color: "#666" }}>Entradas</span>
                        <div style={{ background: "#E6FFFA", padding: "8px", borderRadius: "50%" }}>
                            <ArrowUpCircle size={20} color="#38A169" />
                        </div>
                    </div>
                    <h2 style={{ fontSize: "1.8rem", color: "#38A169" }}>R$ {income.toFixed(2)}</h2>
                </div>

                <div style={{ background: "white", padding: "1.5rem", borderRadius: "16px", boxShadow: "var(--shadow)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
                        <span style={{ color: "#666" }}>Saídas</span>
                        <div style={{ background: "#FFF5F5", padding: "8px", borderRadius: "50%" }}>
                            <ArrowDownCircle size={20} color="#E53E3E" />
                        </div>
                    </div>
                    <h2 style={{ fontSize: "1.8rem", color: "#E53E3E" }}>R$ {expense.toFixed(2)}</h2>
                </div>

                {/* Import Button */}
                <div
                    onClick={() => setShowImport(true)}
                    style={{
                        background: "white",
                        padding: "1.5rem",
                        borderRadius: "16px",
                        boxShadow: "var(--shadow)",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        cursor: "pointer",
                        border: "2px dashed var(--primary-light)",
                        transition: "all 0.2s"
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#F5F6FA"}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = "white"}
                >
                    <div style={{ background: "#F3E8FF", padding: "1rem", borderRadius: "50%", marginBottom: "0.5rem" }}>
                        <UploadCloud size={24} color="#6200EE" />
                    </div>
                    <h3 style={{ color: "#6200EE", fontSize: "1rem" }}>Importar Extrato</h3>
                </div>

            </section>

            {/* Charts Section */}
            <section style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1.5rem", marginBottom: "2rem" }}>
                {/* Monthly Balance Chart */}
                <div style={{ background: "white", padding: "1.5rem", borderRadius: "16px", boxShadow: "var(--shadow)", minHeight: "300px" }}>
                    <h3 style={{ marginBottom: "1.5rem" }}>Balanço Mensal</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={monthlyData}>
                            <XAxis dataKey="name" />
                            <Tooltip cursor={{ fill: 'transparent' }} />
                            <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                                {monthlyData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.name === 'Entradas' ? '#38A169' : '#E53E3E'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Categories Pie Chart */}
                <div style={{ background: "white", padding: "1.5rem", borderRadius: "16px", boxShadow: "var(--shadow)", minHeight: "300px" }}>
                    <h3 style={{ marginBottom: "1.5rem" }}>Despesas por Categoria</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                {categoryData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                    {categoryData.length === 0 && <p style={{ textAlign: 'center', color: '#999' }}>Sem dados de despesas</p>}
                </div>
            </section>

            {/* Main Content Split: Form and List */}
            <section style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "1.5rem" }}>

                {/* Add Transaction Form */}
                <div style={{ background: "white", padding: "1.5rem", borderRadius: "16px", boxShadow: "var(--shadow)", height: "fit-content" }}>
                    <h3 style={{ marginBottom: "1rem" }}>Nova Transação</h3>
                    <form onSubmit={handleAddTransaction} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        <input
                            type="text"
                            placeholder="Descrição"
                            value={newTransaction.description}
                            onChange={e => setNewTransaction({ ...newTransaction, description: e.target.value })}
                            required
                            style={{ padding: "0.8rem", borderRadius: "8px", border: "1px solid #ddd" }}
                        />
                        <input
                            type="number"
                            placeholder="Valor (R$)"
                            step="0.01"
                            value={newTransaction.amount}
                            onChange={e => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                            required
                            style={{ padding: "0.8rem", borderRadius: "8px", border: "1px solid #ddd" }}
                        />
                        <select
                            value={newTransaction.type}
                            onChange={e => setNewTransaction({ ...newTransaction, type: e.target.value })}
                            style={{ padding: "0.8rem", borderRadius: "8px", border: "1px solid #ddd" }}
                        >
                            <option value="expense">Despesa</option>
                            <option value="income">Receita</option>
                        </select>
                        <select
                            value={newTransaction.category}
                            onChange={e => setNewTransaction({ ...newTransaction, category: e.target.value })}
                            style={{ padding: "0.8rem", borderRadius: "8px", border: "1px solid #ddd" }}
                        >
                            <option value="Alimentação">Alimentação</option>
                            <option value="Transporte">Transporte</option>
                            <option value="Moradia">Moradia</option>
                            <option value="Saúde">Saúde</option>
                            <option value="Lazer">Lazer</option>
                            <option value="Salário">Salário</option>
                            <option value="Investimentos">Investimentos</option>
                            <option value="Compras">Compras</option>
                            <option value="Geral">Geral</option>
                        </select>
                        <input
                            type="date"
                            value={newTransaction.date}
                            onChange={e => setNewTransaction({ ...newTransaction, date: e.target.value })}
                            required
                            style={{ padding: "0.8rem", borderRadius: "8px", border: "1px solid #ddd" }}
                        />
                        <button type="submit" style={{ padding: "0.8rem", background: "var(--primary)", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                            <Plus size={20} /> Adicionar
                        </button>
                    </form>
                </div>

                {/* Transaction List */}
                <div style={{ background: "white", padding: "1.5rem", borderRadius: "16px", boxShadow: "var(--shadow)" }}>
                    <h3 style={{ marginBottom: "1rem" }}>Transações Recentes</h3>
                    {loading ? <p>Carregando...</p> : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxHeight: "500px", overflowY: "auto" }}>
                            {transactions.length === 0 && <p style={{ color: "#999" }}>Nenhuma transação encontrada.</p>}
                            {transactions.map(t => (
                                <div key={t.id} style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    padding: "1rem",
                                    borderRadius: "12px",
                                    border: "1px solid #eee",
                                    backgroundColor: "white"
                                }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                        <div style={{
                                            background: t.type === "income" ? "#E6FFFA" : "#FFF5F5",
                                            padding: "10px",
                                            borderRadius: "50%",
                                            display: "flex", alignItems: "center", justifyContent: "center"
                                        }}>
                                            {t.type === "income" ? <ArrowUpCircle size={20} color="#38A169" /> : <ArrowDownCircle size={20} color="#E53E3E" />}
                                        </div>
                                        <div>
                                            <p style={{ fontWeight: "600", marginBottom: "2px" }}>{t.description}</p>
                                            <p style={{ fontSize: "0.8rem", color: "#666" }}>{t.category} • {new Date(t.date).toLocaleDateString('pt-BR')}</p>
                                        </div>
                                    </div>

                                    <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                                        <span style={{ fontWeight: "bold", color: t.type === "income" ? "#38A169" : "#E53E3E" }}>
                                            {t.type === "income" ? "+" : "-"} R$ {Math.abs(t.amount).toFixed(2)}
                                        </span>
                                        <button onClick={() => handleDelete(t.id)} title="Excluir" style={{ background: "none", border: "none", cursor: "pointer", color: "#ccc" }}>
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </section>

            {showImport && (
                <ImportTransactions
                    onClose={() => setShowImport(false)}
                    onImportComplete={fetchTransactions}
                />
            )}
        </Layout>
    );
}
