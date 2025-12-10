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
            orderBy("date", "desc"),
            orderBy("createdAt", "desc")
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
