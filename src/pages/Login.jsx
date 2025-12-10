import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { LogIn, UserPlus, Mail, Lock, ArrowRight, CheckCircle2 } from "lucide-react";

export default function Login() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { user, login, register, loginWithGoogle } = useAuth();
    const navigate = useNavigate();

    // Animation Loop State
    const [activeStep, setActiveStep] = useState(0);

    useEffect(() => {
        let timer;

        const runCycle = () => {
            // Step 0: First item green
            // Step 1: Second item green
            // Step 2: Third item green
            // Step 3: Confetti!
            // Step -1: Reset

            if (activeStep < 3) {
                timer = setTimeout(() => {
                    setActiveStep(prev => prev + 1);
                }, 1500); // Wait 1.5s between steps
            } else if (activeStep === 3) {
                // Confetti shows for a bit, then reset
                timer = setTimeout(() => {
                    setActiveStep(-1); // Reset to empty
                }, 2000);
            } else {
                // From -1 to 0 (restart)
                timer = setTimeout(() => {
                    setActiveStep(0);
                }, 500);
            }
        };

        runCycle();

        return () => clearTimeout(timer);
    }, [activeStep]);

    useEffect(() => {
        if (user) {
            navigate("/");
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            if (isLogin) {
                await login(email, password);
            } else {
                await register(email, password);
            }
            // Navigation handled by useEffect
        } catch (err) {
            setError(err.message.replace("Firebase:", "").trim());
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setError("");
        try {
            await loginWithGoogle();
            // Navigation handled by useEffect
        } catch (err) {
            setError(err.message.replace("Firebase:", "").trim());
        }
    };

    return (
        <div style={{
            display: "flex",
            height: "100vh",
            width: "100vw",
            backgroundColor: "#F8FAFC", // Clean light slate background
            fontFamily: "'Inter', sans-serif",
            color: "#1E293B",
            overflow: "hidden"
        }}>
            {/* Left Side - Visual / Branding */}
            <div style={{
                flex: "1",
                background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                color: "white",
                padding: "4rem",
                position: "relative",
                // overflow: "hidden" // Removed to allow confetti to show
            }}>
                {/* Decorative Circles - Kept inside but might overflow now, which is fine or we can move them */}
                <div style={{ position: "absolute", top: "-10%", left: "-10%", width: "400px", height: "400px", background: "rgba(255,255,255,0.1)", borderRadius: "50%" }} />
                <div style={{ position: "absolute", bottom: "-5%", right: "-5%", width: "300px", height: "300px", background: "rgba(255,255,255,0.05)", borderRadius: "50%" }} />

                <div style={{ zIndex: 1, textAlign: "center" }}>
                    <img src="/logo-light.png" alt="RT Money" style={{ width: "300px", marginBottom: "1rem" }} />
                    <h2 style={{ fontSize: "1.8rem", fontWeight: "bold", marginBottom: "0.5rem", maxWidth: "800px", lineHeight: "1.2" }}>
                        Assuma o controle total da sua vida financeira.
                    </h2>
                    <p style={{ fontSize: "1.5rem", opacity: 0.9, marginBottom: "3rem", fontWeight: "500" }}>
                        Simples, rápido e fácil.
                    </p>

                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "100%", maxWidth: "380px", margin: "0 auto" }}>
                        {[
                            "Gestão de Receitas e Despesas",
                            "Metas Financeiras",
                            "Controle de Dívidas"
                        ].map((text, index) => {
                            const isActive = activeStep >= index;

                            return (
                                <div key={index} style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "1rem",
                                    background: isActive ? "rgba(16, 185, 129, 0.2)" : "rgba(255, 255, 255, 0.1)", // Green tint when active
                                    borderColor: isActive ? "rgba(16, 185, 129, 0.4)" : "rgba(255, 255, 255, 0.15)",
                                    backdropFilter: "blur(10px)",
                                    padding: "1rem 1.5rem",
                                    borderRadius: "16px",
                                    borderWidth: "1px",
                                    borderStyle: "solid",
                                    boxShadow: isActive ? "0 4px 12px rgba(16, 185, 129, 0.1)" : "0 4px 6px rgba(0, 0, 0, 0.05)",
                                    transition: "all 0.5s ease",
                                    transform: isActive ? "scale(1.02)" : "scale(1)",
                                    position: "relative", // Ensure confetti is relative to this card
                                    zIndex: isActive ? 10 : 1 // Ensure active card is on top
                                }}>
                                    <div style={{
                                        background: isActive ? "#10B981" : "rgba(255, 255, 255, 0.2)",
                                        borderRadius: "50%",
                                        width: "32px",
                                        height: "32px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        position: "relative",
                                        transition: "background 0.3s ease"
                                    }}>
                                        {isActive && (
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path
                                                    d="M20 6L9 17L4 12"
                                                    stroke="white"
                                                    strokeWidth="3"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    style={{
                                                        strokeDasharray: 24,
                                                        strokeDashoffset: 24,
                                                        animation: "drawCheck 0.8s ease forwards"
                                                    }}
                                                />
                                            </svg>
                                        )}
                                    </div>
                                    <span style={{ fontSize: "1.05rem", fontWeight: "500", color: isActive ? "#ecfdf5" : "white", transition: "color 0.3s" }}>{text}</span>

                                    {/* Confetti Effect for the last item */}
                                    {index === 2 && activeStep === 3 && (
                                        <div style={{ position: "absolute", bottom: "-10px", left: "50%", transform: "translateX(-50%)" }}>
                                            <div className="confetti" style={{ "--tx": "0px", "--ty": "-60px", "--c": "#10B981" }}></div>
                                            <div className="confetti" style={{ "--tx": "50px", "--ty": "-30px", "--c": "#34D399" }}></div>
                                            <div className="confetti" style={{ "--tx": "-50px", "--ty": "-30px", "--c": "#6EE7B7" }}></div>
                                            <div className="confetti" style={{ "--tx": "30px", "--ty": "40px", "--c": "#F472B6" }}></div>
                                            <div className="confetti" style={{ "--tx": "-30px", "--ty": "40px", "--c": "#60A5FA" }}></div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes drawCheck {
                    to {
                        stroke-dashoffset: 0;
                    }
                }
                .confetti {
                    position: absolute;
                    width: 8px;
                    height: 8px;
                    background: var(--c);
                    border-radius: 50%;
                    animation: pop 0.8s ease-out forwards;
                }
                @keyframes pop {
                    0% { transform: translate(0, 0) scale(0); opacity: 0; }
                    50% { opacity: 1; }
                    100% { transform: translate(var(--tx), var(--ty)) scale(0); opacity: 0; }
                }
            `}</style>


            {/* Right Side - Form */}
            <div style={{
                flex: "1",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                padding: "2rem",
                position: "relative"
            }}>
                <div style={{ width: "100%", maxWidth: "440px" }}>
                    <div style={{ marginBottom: "2.5rem", textAlign: "center" }}>
                        <h2 style={{ fontSize: "2rem", fontWeight: "700", color: "#1E293B", marginBottom: "0.5rem" }}>
                            {isLogin ? "Bem-vindo de volta" : "Criar conta"}
                        </h2>
                        <p style={{ color: "#64748B" }}>
                            {isLogin ? "Digite seus dados para entrar" : "Comece sua jornada financeira hoje"}
                        </p>
                    </div>

                    {error && (
                        <div style={{
                            backgroundColor: "#FEF2F2",
                            color: "#991B1B",
                            padding: "1rem",
                            borderRadius: "12px",
                            marginBottom: "1.5rem",
                            border: "1px solid #FECACA",
                            fontSize: "0.9rem",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem"
                        }}>
                            <span style={{ fontWeight: "bold" }}>Erro:</span> {error}
                        </div>
                    )}

                    {/* Google Login Button */}
                    <button
                        onClick={handleGoogleLogin}
                        style={{
                            width: "100%",
                            padding: "0.8rem",
                            backgroundColor: "white",
                            border: "1px solid #E2E8F0",
                            borderRadius: "12px",
                            fontSize: "1rem",
                            fontWeight: "500",
                            color: "#334155",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "0.8rem",
                            marginBottom: "1.5rem",
                            transition: "all 0.2s",
                            boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)"
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#F8FAFC"}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = "white"}
                    >
                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: "20px", height: "20px" }} />
                        Entrar com Google
                    </button>

                    <div style={{ display: "flex", alignItems: "center", margin: "1.5rem 0" }}>
                        <div style={{ flex: 1, height: "1px", backgroundColor: "#E2E8F0" }}></div>
                        <span style={{ padding: "0 1rem", color: "#94A3B8", fontSize: "0.9rem" }}>ou continuar com email</span>
                        <div style={{ flex: 1, height: "1px", backgroundColor: "#E2E8F0" }}></div>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
                        <div style={{ position: "relative" }}>
                            <Mail size={20} color="#94A3B8" style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)" }} />
                            <input
                                type="email"
                                placeholder="Seu email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                style={{
                                    width: "100%",
                                    padding: "1rem 1rem 1rem 3rem",
                                    borderRadius: "12px",
                                    border: "1px solid #E2E8F0",
                                    backgroundColor: "white",
                                    fontSize: "1rem",
                                    color: "#1E293B",
                                    outline: "none",
                                    transition: "border-color 0.2s",
                                }}
                                onFocus={(e) => e.target.style.borderColor = "#6366F1"}
                                onBlur={(e) => e.target.style.borderColor = "#E2E8F0"}
                                required
                            />
                        </div>

                        <div style={{ position: "relative" }}>
                            <Lock size={20} color="#94A3B8" style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)" }} />
                            <input
                                type="password"
                                placeholder="Sua senha"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={{
                                    width: "100%",
                                    padding: "1rem 1rem 1rem 3rem",
                                    borderRadius: "12px",
                                    border: "1px solid #E2E8F0",
                                    backgroundColor: "white",
                                    fontSize: "1rem",
                                    color: "#1E293B",
                                    outline: "none",
                                    transition: "border-color 0.2s",
                                }}
                                onFocus={(e) => e.target.style.borderColor = "#6366F1"}
                                onBlur={(e) => e.target.style.borderColor = "#E2E8F0"}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                marginTop: "1rem",
                                width: "100%",
                                padding: "1rem",
                                backgroundColor: "#4F46E5",
                                color: "white",
                                border: "none",
                                borderRadius: "12px",
                                fontSize: "1rem",
                                fontWeight: "600",
                                cursor: loading ? "not-allowed" : "pointer",
                                opacity: loading ? 0.7 : 1,
                                transition: "background-color 0.2s",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "0.5rem"
                            }}
                            onMouseOver={(e) => !loading && (e.currentTarget.style.backgroundColor = "#4338CA")}
                            onMouseOut={(e) => !loading && (e.currentTarget.style.backgroundColor = "#4F46E5")}
                        >
                            {loading ? "Processando..." : (isLogin ? "Entrar na Conta" : "Criar Conta")}
                            {!loading && <ArrowRight size={20} />}
                        </button>
                    </form>

                    <div style={{ marginTop: "2rem", textAlign: "center" }}>
                        <p style={{ color: "#64748B", fontSize: "0.95rem" }}>
                            {isLogin ? "Não tem uma conta?" : "Já tem uma conta?"}
                            <button
                                onClick={() => setIsLogin(!isLogin)}
                                style={{
                                    background: "none",
                                    border: "none",
                                    color: "#4F46E5",
                                    fontWeight: "600",
                                    cursor: "pointer",
                                    marginLeft: "0.5rem",
                                    fontSize: "0.95rem"
                                }}
                            >
                                {isLogin ? "Registre-se agora" : "Fazer Login"}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
