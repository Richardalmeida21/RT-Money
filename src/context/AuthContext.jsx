import { createContext, useContext, useEffect, useState } from "react";
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    GoogleAuthProvider,
    signInWithPopup
} from "firebase/auth";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { auth, db } from "../services/firebase";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let unsubscribeFirestore = null;

        const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                // Subscribe to additional user data in Firestore
                const userRef = doc(db, "users", currentUser.uid);
                unsubscribeFirestore = onSnapshot(userRef, (docSnap) => {
                    const userData = docSnap.exists() ? docSnap.data() : {};

                    // Merge Auth user with Firestore data
                    // Firestore photoBase64 takes precedence over Auth photoURL
                    setUser({
                        ...currentUser,
                        ...userData,
                        photoURL: userData.photoBase64 || currentUser.photoURL
                    });
                    setLoading(false);
                }, (error) => {
                    console.error("Error fetching user profile:", error);
                    setUser(currentUser); // Fallback to basic auth user
                    setLoading(false);
                });
            } else {
                if (unsubscribeFirestore) unsubscribeFirestore();
                setUser(null);
                setLoading(false);
            }
        });

        return () => {
            unsubscribeAuth();
            if (unsubscribeFirestore) unsubscribeFirestore();
        };
    }, []);

    const login = async (email, password) => {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        // Ensure official user document exists (self-healing for legacy users)
        await setDoc(doc(db, "users", userCredential.user.uid), {
            email: email,
            lastLogin: new Date().toISOString()
        }, { merge: true });
        return userCredential;
    };

    const register = async (email, password) => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // Create official user document to prevent ghost users for cron jobs
        await setDoc(doc(db, "users", userCredential.user.uid), {
            email: email,
            createdAt: new Date().toISOString()
        }, { merge: true });
        return userCredential;
    };

    const logout = () => {
        return signOut(auth);
    };

    const loginWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        const userCredential = await signInWithPopup(auth, provider);
        // Ensure official user document exists
        await setDoc(doc(db, "users", userCredential.user.uid), {
            email: userCredential.user.email,
            lastLogin: new Date().toISOString()
        }, { merge: true });
        return userCredential;
    };

    const value = {
        user,
        loading,
        login,
        register,
        logout,
        loginWithGoogle
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
