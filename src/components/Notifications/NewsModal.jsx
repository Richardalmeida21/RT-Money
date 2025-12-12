import { X, Calendar, ArrowRight, ExternalLink } from "lucide-react";

export default function NewsModal({ news, onClose }) {
    if (!news) return null;

    return (
        <div style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100,
            backdropFilter: "blur(4px)",
            animation: "fadeIn 0.2s ease-out"
        }} onClick={onClose}>
            <div style={{
                background: "var(--surface)",
                width: "600px",
                maxWidth: "90vw",
                maxHeight: "85vh",
                borderRadius: "24px",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                position: "relative",
                border: "1px solid var(--border)"
            }} onClick={e => e.stopPropagation()}>

                {/* Header Image (Simulated if real API doesn't provide, but NewsAPI usually does) */}
                <div style={{ height: "200px", background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)", position: "relative" }}>
                    {news.urlToImage ? (
                        <img src={news.urlToImage} alt={news.title} style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.8 }} />
                    ) : (
                        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "3rem", opacity: 0.3 }}>
                            📰
                        </div>
                    )}
                    <button
                        onClick={onClose}
                        style={{
                            position: "absolute", top: "1rem", right: "1rem",
                            background: "rgba(0,0,0,0.3)", border: "none", borderRadius: "50%",
                            padding: "8px", cursor: "pointer", color: "white",
                            backdropFilter: "blur(4px)"
                        }}
                    >
                        <X size={20} />
                    </button>
                    <div style={{
                        position: "absolute", bottom: "1rem", left: "1.5rem",
                        background: "var(--primary)", color: "white",
                        padding: "4px 12px", borderRadius: "20px",
                        fontSize: "0.75rem", fontWeight: "bold", boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
                    }}>
                        {news.source?.name || "Notícia"}
                    </div>
                </div>

                {/* Content */}
                <div style={{ padding: "2rem", overflowY: "auto", flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem", color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                        <Calendar size={14} />
                        <span>{new Date(news.publishedAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{new Date(news.publishedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    <h2 style={{ fontSize: "1.5rem", fontWeight: "800", color: "var(--text-primary)", marginBottom: "1rem", lineHeight: "1.3" }}>
                        {news.title}
                    </h2>

                    <div style={{ fontSize: "1rem", lineHeight: "1.6", color: "var(--text-secondary)", marginBottom: "2rem" }}>
                        {/* Display full content if available, utilizing paragraphs */}
                        {(news.content || news.description || "").split('\n').map((paragraph, idx) => (
                            <p key={idx} style={{ marginBottom: "1rem" }}>{paragraph}</p>
                        ))}
                        {!news.content && !news.description && <p>Conteúdo indisponível.</p>}
                    </div>

                    <div style={{ display: "flex", justifyContent: "center" }}>
                        <a
                            href={news.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                display: "inline-flex", alignItems: "center", gap: "0.5rem",
                                padding: "0.8rem 2rem",
                                background: "var(--surface)",
                                border: "1px solid var(--primary)",
                                color: "var(--primary)",
                                textDecoration: "none", borderRadius: "12px",
                                fontWeight: "600", transition: "all 0.2s",
                                cursor: "pointer"
                            }}
                            onMouseOver={(e) => { e.currentTarget.style.background = "var(--primary)"; e.currentTarget.style.color = "white"; }}
                            onMouseOut={(e) => { e.currentTarget.style.background = "var(--surface)"; e.currentTarget.style.color = "var(--primary)"; }}
                        >
                            Conferir fonte
                            <ExternalLink size={16} />
                        </a>
                    </div>
                </div>
            </div>
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                /* Custom Scrollbar */
                ::-webkit-scrollbar {
                    width: 8px;
                }
                ::-webkit-scrollbar-track {
                    background: transparent;
                }
                ::-webkit-scrollbar-thumb {
                    background: var(--border);
                    border-radius: 4px;
                }
                ::-webkit-scrollbar-thumb:hover {
                    background: var(--text-secondary);
                }
            `}</style>
        </div>
    );
}
