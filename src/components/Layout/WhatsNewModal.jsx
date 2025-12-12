import { useEffect, useState } from "react";
import { X, Newspaper, Repeat, Bell, Smartphone } from "lucide-react";

const CURRENT_VERSION = "2.2.8"; // Increment this to show modal again

export default function WhatsNewModal() {
    const [show, setShow] = useState(false);

    useEffect(() => {
        const lastVersion = localStorage.getItem("rt_money_version");
        if (lastVersion !== CURRENT_VERSION) {
            // Delay slightly to not clash with other startup animations
            setTimeout(() => setShow(true), 1500);
        }
    }, []);

    const handleClose = () => {
        localStorage.setItem("rt_money_version", CURRENT_VERSION);
        setShow(false);
    };

    if (!show) return null;

    return (
        <div style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
            display: "flex", justifyContent: "center", alignItems: "center", zIndex: 9999
        }}>
            <div style={{
                background: "var(--surface)", width: "90%", maxWidth: "500px",
                borderRadius: "20px", boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
                overflow: "hidden", animation: "slideUp 0.4s ease-out",
                display: "flex", flexDirection: "column", maxHeight: "90vh"
            }}>
                {/* Header */}
                <div style={{
                    background: "linear-gradient(135deg, #6B46C1 0%, #805AD5 100%)",
                    padding: "1.5rem", color: "white", position: "relative",
                    flexShrink: 0
                }}>
                    <button
                        onClick={handleClose}
                        style={{
                            position: "absolute", top: "1rem", right: "1rem",
                            background: "rgba(255,255,255,0.2)", border: "none",
                            borderRadius: "50%", width: "32px", height: "32px",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            cursor: "pointer", color: "white"
                        }}
                    >
                        <X size={18} />
                    </button>
                    <h2 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "0.2rem" }}>🎉 Novidades!</h2>
                    <p style={{ opacity: 0.9, fontSize: "0.9rem" }}>Versão {CURRENT_VERSION} disponível</p>
                </div>

                {/* Content */}
                <div style={{
                    padding: "1.5rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "2rem",
                    overflowY: "auto",
                    flex: 1
                }}>

                    {/* Welcome Message */}
                    <div style={{
                        background: "var(--background)",
                        padding: "1rem",
                        borderRadius: "12px",
                        borderLeft: "4px solid var(--primary)"
                    }}>
                        <p style={{ fontSize: "0.95rem", color: "var(--text-primary)", lineHeight: "1.5" }}>
                            Antes de tudo, nosso muito obrigado aos <strong>+ de 30 novos usuários</strong> que chegaram recentemente! Sejam todos muito bem-vindos. 🚀
                        </p>
                    </div>

                    <FeatureItem
                        icon={<Newspaper color="#3182CE" />}
                        title="Notícias Econômicas"
                        desc="Agora você tem um ticker de notícias em tempo real no topo da tela! Fique por dentro do dólar, bitcoin e mercado financeiro. (Atualizado 3x ao dia!)"
                        image="/img/header-news.png?v=2"
                    />

                    <FeatureItem
                        icon={<Repeat color="#38A169" />}
                        title="Contas Recorrentes"
                        desc="Facilitamos sua vida! Na hora de adicionar uma conta, marque a opção 'Repetir Mensalmente'. O sistema criará a despesa do mês seguinte automaticamente para você."
                        image="/img/recurring-debt.png?v=2"
                    />

                    {/* Closing Message */}
                    <div style={{
                        textAlign: "center",
                        marginTop: "0.5rem"
                    }}>
                        <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", fontStyle: "italic" }}>
                            Espero que essas melhorias ajudem ainda mais no seu controle financeiro. <br />
                            <strong>Att, Dev Richard</strong>
                        </p>
                    </div>

                    <button
                        onClick={handleClose}
                        style={{
                            width: "100%", padding: "1rem",
                            background: "var(--primary)", color: "white",
                            border: "none", borderRadius: "12px",
                            fontWeight: "bold", fontSize: "1rem",
                            cursor: "pointer", boxShadow: "0 4px 6px rgba(107, 70, 193, 0.3)",
                            marginTop: "auto"
                        }}
                    >
                        Entendi, vamos lá!
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(50px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                /* Custom scrollbar for webkit */
                ::-webkit-scrollbar { width: 6px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.2); borderRadius: 3px; }
            `}</style>
        </div>
    );
}

function FeatureItem({ icon, title, desc, image }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
            <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                <div style={{
                    background: "var(--background)", padding: "0.8rem",
                    borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center",
                    minWidth: "48px", height: "48px", flexShrink: 0
                }}>
                    {icon}
                </div>
                <div>
                    <h3 style={{ fontSize: "1.1rem", fontWeight: "bold", color: "var(--text-primary)", marginBottom: "0.3rem" }}>{title}</h3>
                    <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: "1.4" }}>{desc}</p>
                </div>
            </div>
            {image && (
                <div style={{
                    border: "4px solid var(--background)",
                    borderRadius: "12px", overflow: "hidden",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    marginLeft: "0.5rem", marginRight: "0.5rem"
                }}>
                    <img
                        src={image}
                        alt={title}
                        style={{
                            width: "100%", height: "auto", display: "block"
                        }}
                    />
                </div>
            )}
        </div>
    );
}
