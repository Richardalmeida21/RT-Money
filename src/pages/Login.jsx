import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isRegistering, setIsRegistering] = useState(false);
    const [error, setError] = useState("");
    const { login, register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        try {
            if (isRegistering) {
                await register(email, password);
                alert("Account created successfully!");
            } else {
                await login(email, password);
                // alert("Login successful!");
            }
            navigate("/");
        } catch (err) {
            setError("Failed to " + (isRegistering ? "register" : "log in") + ": " + err.message);
        }
    };

    return (
        <div style={{ padding: "2rem", maxWidth: "400px", margin: "0 auto" }}>
            <h2>{isRegistering ? "Create Account" : "Login"}</h2>
            {error && <p style={{ color: "red" }}>{error}</p>}
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{ padding: "0.5rem" }}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{ padding: "0.5rem" }}
                />
                <button type="submit" style={{ padding: "0.5rem", cursor: "pointer" }}>
                    {isRegistering ? "Sign Up" : "Log In"}
                </button>
            </form>
            <p style={{ marginTop: "1rem" }}>
                {isRegistering ? "Already have an account?" : "Don't have an account?"}{" "}
                <button
                    onClick={() => setIsRegistering(!isRegistering)}
                    style={{ background: "none", border: "none", color: "blue", cursor: "pointer", textDecoration: "underline" }}
                >
                    {isRegistering ? "Log In" : "Sign Up"}
                </button>
            </p>
        </div>
    );
}
