import { createContext, useContext, useEffect, useState } from "react";
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    GoogleAuthProvider,
    signInWithPopup
} from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
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

    const login = (email, password) => {
        return signInWithEmailAndPassword(auth, email, password);
    };

    const register = (email, password) => {
        return createUserWithEmailAndPassword(auth, email, password);
    };

    const logout = () => {
        return signOut(auth);
    };

    const loginWithGoogle = () => {
        const provider = new GoogleAuthProvider();
        return signInWithPopup(auth, provider);
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
