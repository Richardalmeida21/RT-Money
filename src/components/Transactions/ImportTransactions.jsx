import { useState } from "react";
import { Upload, X, Check } from "lucide-react";
import { parseOFX } from "../../utils/ofxParser";
import { categorizeTransaction } from "../../utils/categorizer";
import { addTransaction } from "../../services/dbService";
import { useAuth } from "../../context/AuthContext";

export default function ImportTransactions({ onClose, onImportComplete }) {
    const { user } = useAuth();
    const [file, setFile] = useState(null);
    const [previewData, setPreviewData] = useState([]);
    const [importing, setImporting] = useState(false);

    const handleFileChange = async (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            try {
                const parsed = await parseOFX(selectedFile);

                // Apply "Provisional AI" Categorization
                const enriched = parsed.map(t => ({
                    ...t,
                    category: categorizeTransaction(t.description)
                }));

                setPreviewData(enriched);
            } catch (error) {
                alert("Erro ao ler arquivo. Verifique se é um OFX válido.");
            }
        }
    };

    const handleConfirmImport = async () => {
        setImporting(true);
        let count = 0;

        for (const t of previewData) {
            try {
                await addTransaction(user.uid, {
                    description: t.description,
                    amount: t.amount,
                    type: t.type,
                    category: t.category, // Already localized by categorizer
                    date: t.date
                });
                count++;
            } catch (e) {
                console.error("Falha ao importar", t, e);
            }
        }

        setImporting(false);
        alert(`${count} transações importadas com sucesso!`);
        onImportComplete();
        onClose();
    };

    return (
        <div style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
        }}>
            <div style={{ background: "white", padding: "2rem", borderRadius: "16px", width: "600px", maxHeight: "80vh", overflowY: "auto" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.5rem" }}>
                    <h2>Importar Extrato Bancário</h2>
                    <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}><X /></button>
                </div>

                {!previewData.length ? (
                    <div style={{ border: "2px dashed #ccc", padding: "3rem", borderRadius: "12px", textAlign: "center" }}>
                        <Upload size={48} color="#ccc" />
                        <p style={{ marginTop: "1rem" }}>Arraste seu arquivo OFX aqui ou clique para selecionar</p>
                        <input
                            type="file"
                            accept=".ofx,.xml"
                            onChange={handleFileChange}
                            style={{ marginTop: "1rem" }}
                        />
                    </div>
                ) : (
                    <div>
                        <div style={{ marginBottom: "1rem", maxHeight: "300px", overflowY: "auto", border: "1px solid #eee", borderRadius: "8px" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                <thead>
                                    <tr style={{ background: "#f5f5f5", textAlign: "left" }}>
                                        <th style={{ padding: "0.5rem" }}>Data</th>
                                        <th style={{ padding: "0.5rem" }}>Descrição</th>
                                        <th style={{ padding: "0.5rem" }}>Categoria (Auto)</th>
                                        <th style={{ padding: "0.5rem" }}>Valor</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {previewData.map((t, i) => (
                                        <tr key={i} style={{ borderBottom: "1px solid #eee" }}>
                                            <td style={{ padding: "0.5rem" }}>{new Date(t.date).toLocaleDateString('pt-BR')}</td>
                                            <td style={{ padding: "0.5rem" }}>{t.description}</td>
                                            <td style={{ padding: "0.5rem" }}>
                                                <span style={{ background: "#E8F0FE", color: "#1967D2", padding: "2px 8px", borderRadius: "12px", fontSize: "0.8rem" }}>
                                                    {t.category}
                                                </span>
                                            </td>
                                            <td style={{ padding: "0.5rem", color: t.type === 'income' ? 'green' : 'red' }}>
                                                {t.amount.toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem" }}>
                            <button onClick={() => setPreviewData([])} style={{ padding: "0.5rem 1rem", border: "1px solid #ddd", borderRadius: "8px", background: "white", cursor: "pointer" }}>
                                Voltar
                            </button>
                            <button
                                onClick={handleConfirmImport}
                                disabled={importing}
                                style={{ padding: "0.5rem 1rem", background: "var(--primary)", color: "white", borderRadius: "8px", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem" }}
                            >
                                {importing ? "Importando..." : <><Check size={18} /> Confirmar Importação</>}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
