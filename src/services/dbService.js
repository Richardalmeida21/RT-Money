import {
    collection,
    addDoc,
    query,
    getDocs,
    doc,
    deleteDoc,
    updateDoc,
    serverTimestamp,
    orderBy
} from "firebase/firestore";
import { db } from "./firebase";

export const addTransaction = async (userId, transaction) => {
    try {
        const docRef = await addDoc(collection(db, "users", userId, "transactions"), {
            ...transaction,
            amount: parseFloat(transaction.amount), // Ensure number
            createdAt: serverTimestamp()
        });
        return { id: docRef.id, ...transaction };
    } catch (e) {
        console.error("Error adding transaction: ", e);
        throw e;
    }
};

export const getTransactions = async (userId) => {
    try {
        const q = query(
            collection(db, "users", userId, "transactions"),
            orderBy("date", "desc")
        );

        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error("Error fetching transactions:", error);
        throw error;
    }
};

export const deleteTransaction = async (userId, transactionId) => {
    await deleteDoc(doc(db, "users", userId, "transactions", transactionId));
};

export const updateTransaction = async (userId, transactionId, updates) => {
    const transactionRef = doc(db, "users", userId, "transactions", transactionId);
    await updateDoc(transactionRef, {
        ...updates,
        amount: parseFloat(updates.amount)
    });
};

// --- Goals Operations ---

export const addGoal = async (userId, goal) => {
    try {
        const docRef = await addDoc(collection(db, "users", userId, "goals"), {
            ...goal,
            targetAmount: parseFloat(goal.targetAmount),
            currentAmount: parseFloat(goal.currentAmount || 0),
            createdAt: serverTimestamp()
        });
        return { id: docRef.id, ...goal };
    } catch (e) {
        console.error("Error adding goal: ", e);
        throw e;
    }
};

export const getGoals = async (userId) => {
    try {
        const q = query(
            collection(db, "users", userId, "goals"),
            orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error("Error fetching goals:", error);
        throw error;
    }
};

export const updateGoal = async (userId, goalId, updates) => {
    const goalRef = doc(db, "users", userId, "goals", goalId);
    await updateDoc(goalRef, updates);
};

export const deleteGoal = async (userId, goalId) => {
    await deleteDoc(doc(db, "users", userId, "goals", goalId));
};

// --- Debts Operations ---

export const addDebt = async (userId, debt) => {
    try {
        const docRef = await addDoc(collection(db, "users", userId, "debts"), {
            ...debt,
            amount: parseFloat(debt.amount),
            dueDate: debt.dueDate, // String YYYY-MM-DD
            status: 'pending', // pending, paid
            createdAt: serverTimestamp()
        });
        return { id: docRef.id, ...debt };
    } catch (e) {
        console.error("Error adding debt: ", e);
        throw e;
    }
};

export const getDebts = async (userId) => {
    try {
        const q = query(
            collection(db, "users", userId, "debts"),
            orderBy("dueDate", "asc")
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error("Error fetching debts:", error);
        throw error;
    }
};

export const updateDebt = async (userId, debtId, updates) => {
    const debtRef = doc(db, "users", userId, "debts", debtId);
    await updateDoc(debtRef, updates);
};

export const deleteDebt = async (userId, debtId) => {
    await deleteDoc(doc(db, "users", userId, "debts", debtId));
};
