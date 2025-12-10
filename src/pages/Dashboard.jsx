import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useFilter } from "../context/FilterContext";
import { addTransaction, getTransactions, deleteTransaction } from "../services/dbService";
import Layout from "../components/Layout/Layout";
import ImportTransactions from "../components/Transactions/ImportTransactions";
import { Plus, Wallet, ArrowUpCircle, ArrowDownCircle, CreditCard, UploadCloud, Trash2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from "recharts";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function Dashboard() {
    const { user } = useAuth();
    const { filterParams } = useFilter();
    const [allTransactions, setAllTransactions] = useState([]);
    const [transactions, setTransactions] = useState([]); // Displayed transactions
    const [loading, setLoading] = useState(true);
    const [showImport, setShowImport] = useState(false);

    useEffect(() => {
        fetchTransactions();
    }, [user]);

    // Filter whenever params or data changes
    useEffect(() => {
        if (!allTransactions.length) {
            setTransactions([]);
            return;
        }

        let filtered = allTransactions.filter(t => t.date); // Exclude invalid dates

        if (filterParams.type === 'month') {
            filtered = filtered.filter(t => t.date.startsWith(filterParams.value));
        } else if (filterParams.type === 'custom') {
            if (filterParams.startDate) {
                filtered = filtered.filter(t => t.date >= filterParams.startDate);
            }
            if (filterParams.endDate) {
                filtered = filtered.filter(t => t.date <= filterParams.endDate);
            }
        }

        setTransactions(filtered);
    }, [filterParams, allTransactions]);

    const fetchTransactions = async () => {
        if (user) {
            try {
                const data = await getTransactions(user.uid);
                data.sort((a, b) => new Date(b.date) - new Date(a.date));
                setAllTransactions(data);
                // Initial filter will trigger via effect
            } catch (error) {
                console.error("Failed to fetch transactions", error);
            } finally {
                setLoading(false);
            }
        }
    };



    const handleDelete = async (id) => {
        if (confirm("Tem certeza que deseja excluir esta transação?")) {
            await deleteTransaction(user.uid, id);
            fetchTransactions();
        }
    };

    // Logic to determine type if it's ambiguous, but now we rely on the 'type' field which is set correctly by Import or Manual Add
    const calculateBalance = () => {
        return allTransactions.reduce((acc, curr) => {
            const amount = parseFloat(curr.amount) || 0;
            return curr.type === "income" ? acc + amount : acc - amount;
        }, 0);
    };

    const income = transactions.filter(t => t.type === "income").reduce((acc, t) => acc + t.amount, 0);
    const expense = transactions.filter(t => t.type === "expense").reduce((acc, t) => acc + t.amount, 0);

    // Prepare data for charts
    const categoryData = transactions
        .filter(t => t.type === 'expense')
        .reduce((acc, curr) => {
            // Use category if available, otherwise "Geral"
            const catName = curr.category || "Geral";
            const found = acc.find(item => item.name === catName);
            if (found) {
                found.value += curr.amount;
            } else {
                acc.push({ name: catName, value: curr.amount });
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
                    <h2 style={{ fontSize: "1.8rem" }}>{filterParams.isValuesVisible ? `R$ ${calculateBalance().toFixed(2)}` : "----"}</h2>
                </div>

                <div style={{ background: "white", padding: "1.5rem", borderRadius: "16px", boxShadow: "var(--shadow)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
                        <span style={{ color: "#666" }}>Entradas</span>
                        <div style={{ background: "#E6FFFA", padding: "8px", borderRadius: "50%" }}>
                            <ArrowUpCircle size={20} color="#38A169" />
                        </div>
                    </div>
                    <h2 style={{ fontSize: "1.8rem", color: "#38A169" }}>{filterParams.isValuesVisible ? `R$ ${income.toFixed(2)}` : "----"}</h2>
                </div>

                <div style={{ background: "white", padding: "1.5rem", borderRadius: "16px", boxShadow: "var(--shadow)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
                        <span style={{ color: "#666" }}>Saídas</span>
                        <div style={{ background: "#FFF5F5", padding: "8px", borderRadius: "50%" }}>
                            <ArrowDownCircle size={20} color="#E53E3E" />
                        </div>
                    </div>
                    <h2 style={{ fontSize: "1.8rem", color: "#E53E3E" }}>{filterParams.isValuesVisible ? `R$ ${expense.toFixed(2)}` : "----"}</h2>
                </div>

                {/* Import Button */}
                <div style={{ background: "white", padding: "1.5rem", borderRadius: "16px", boxShadow: "var(--shadow)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
                        <span style={{ color: "#666" }}>Balanço do Período</span>
                        <div style={{ background: "#F3E8FF", padding: "8px", borderRadius: "50%" }}>
                            <Wallet size={20} color="#805AD5" />
                        </div>
                    </div>
                    <h2 style={{ fontSize: "1.8rem", color: (income - expense) >= 0 ? "#38A169" : "#E53E3E" }}>
                        {filterParams.isValuesVisible ? `R$ ${(income - expense).toFixed(2)}` : "----"}
                    </h2>
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

            {/* Recent Transactions List (Mini) */}
            <section>
                <div style={{ background: "white", padding: "1.5rem", borderRadius: "16px", boxShadow: "var(--shadow)" }}>
                    <h3 style={{ marginBottom: "1rem" }}>Últimas Transações</h3>
                    {loading ? <p>Carregando...</p> : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxHeight: "300px", overflowY: "auto" }}>
                            {transactions.slice(0, 5).map(t => (
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
                                            <p style={{ fontSize: "0.8rem", color: "#666" }}>{t.date ? new Date(t.date).toLocaleDateString('pt-BR') : 'Data inválida'}</p>
                                        </div>
                                    </div>

                                    <span style={{ fontWeight: "bold", color: t.type === "income" ? "#38A169" : "#E53E3E" }}>
                                        {t.type === "income" ? "+" : "-"} R$ {Math.abs(t.amount).toFixed(2)}
                                    </span>
                                </div>
                            ))}
                            {transactions.length === 0 && <p style={{ color: "#999" }}>Nenhuma transação.</p>}
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
