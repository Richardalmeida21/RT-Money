import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { addGoal, getGoals, updateGoal, deleteGoal } from "../services/dbService";
import Layout from "../components/Layout/Layout";
import GoalCard from "../components/Goals/GoalCard";
import AddGoalModal from "../components/Goals/AddGoalModal";
import { Plus, Target } from "lucide-react";

export default function GoalsPage() {
    const { user } = useAuth();
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingGoal, setEditingGoal] = useState(null);

    useEffect(() => {
        fetchGoals();
    }, [user]);

    const fetchGoals = async () => {
        if (user) {
            try {
                const data = await getGoals(user.uid);
                setGoals(data);
            } catch (error) {
                console.error("Failed to fetch goals", error);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleSaveGoal = async (goalData) => {
        if (editingGoal) {
            await updateGoal(user.uid, editingGoal.id, goalData);
        } else {
            await addGoal(user.uid, goalData);
        }
        fetchGoals();
        setEditingGoal(null);
    };

    const handleDeleteGoal = async (id) => {
        if (confirm("Tem certeza que deseja excluir esta meta?")) {
            await deleteGoal(user.uid, id);
            fetchGoals();
        }
    };

    const handleAddMoney = async (goal) => {
        const amountStr = prompt(`Quanto deseja adicionar à meta "${goal.title}"?`, "0.00");
        if (amountStr) {
            const amount = parseFloat(amountStr.replace(',', '.'));
            if (!isNaN(amount) && amount > 0) {
                await updateGoal(user.uid, goal.id, {
                    currentAmount: (goal.currentAmount || 0) + amount
                });
                fetchGoals();
            }
        }
    };

    return (
        <Layout>
            <div style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h1 style={{ fontSize: "1.8rem", fontWeight: "bold" }}>Metas Financeiras</h1>
                <button
                    onClick={() => { setEditingGoal(null); setShowModal(true); }}
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
                    Nova Meta
                </button>
            </div>

            {loading ? (
                <div style={{ padding: "2rem", textAlign: "center", color: "#666" }}>Carregando metas...</div>
            ) : (
                <>
                    {goals.length === 0 ? (
                        <div style={{
                            textAlign: "center",
                            padding: "4rem 2rem",
                            background: "white",
                            borderRadius: "16px",
                            boxShadow: "var(--shadow)",
                            display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem"
                        }}>
                            <div style={{ background: "#EDF2F7", padding: "1.5rem", borderRadius: "50%" }}>
                                <Target size={48} color="#A0AEC0" />
                            </div>
                            <h3 style={{ fontSize: "1.2rem", color: "#4A5568" }}>Nenhuma meta criada ainda</h3>
                            <p style={{ color: "#718096", maxWidth: "400px" }}>
                                Defina objetivos financeiros e acompanhe seu progresso. Que tal começar criando uma meta para sua reserva de emergência?
                            </p>
                            <button
                                onClick={() => setShowModal(true)}
                                style={{
                                    marginTop: "1rem",
                                    padding: "0.8rem 1.5rem",
                                    background: "var(--surface)",
                                    border: "1px solid #CBD5E0",
                                    borderRadius: "8px",
                                    fontWeight: "600",
                                    cursor: "pointer",
                                    color: "#4A5568"
                                }}
                            >
                                Criar Minha Primeira Meta
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem" }}>
                            {goals.map(goal => (
                                <GoalCard
                                    key={goal.id}
                                    goal={goal}
                                    onAddMoney={handleAddMoney}
                                    onEdit={(g) => { setEditingGoal(g); setShowModal(true); }}
                                    onDelete={handleDeleteGoal}
                                />
                            ))}
                        </div>
                    )}
                </>
            )}

            {showModal && (
                <AddGoalModal
                    onClose={() => { setShowModal(false); setEditingGoal(null); }}
                    onSave={handleSaveGoal}
                    editingGoal={editingGoal}
                />
            )}
        </Layout>
    );
}
