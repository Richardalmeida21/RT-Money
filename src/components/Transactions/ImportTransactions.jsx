import { useState } from "react";
// import { Upload, X, Check } from "lucide-react"; // REMOVED: Check was unused in the providedsnippet but let's keep imports consistent if needed.
import { Upload, X, Check } from "lucide-react";
import { parseFile } from "../../utils/parsers/index";
import { categorizeTransaction } from "../../utils/categorizer";
import { addTransaction } from "../../services/dbService";
import { useAuth } from "../../context/AuthContext";

export default function ImportTransactions({ onClose, onImportComplete }) {
    const { user } = useAuth();
    const [file, setFile] = useState(null);
    const [previewData, setPreviewData] = useState([]);
    const [importing, setImporting] = useState(false);

    const [debugInfo, setDebugInfo] = useState("");
    const [processing, setProcessing] = useState(false);

    // New state for Text Import
    const [importMethod, setImportMethod] = useState('file'); // 'file' or 'text'
    const [pastedText, setPastedText] = useState("");

    const handleTextParse = () => {
        if (!pastedText.trim()) return;

        const lines = pastedText.split('\n').map(l => l.trim()).filter(l => l);
        const parsed = [];

        // Alelo often has blocks of 3 lines: Description, Date, Amount
        // Or sometimes 2 lines if date is missing/merged? Let's assume the user format:
        // MERCH NAME
        // YYYY-MM-DD
        // - R$ XX,XX

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            // Heuristic start: Look for a date in the NEXT line or current line to anchor?
            // The user paste format: 
            // Name
            // Date
            // Amount

            // Let's try to find triplets
            if (i + 2 < lines.length) {
                const desc = lines[i];
                const dateCandidate = lines[i + 1];
                const amountCandidate = lines[i + 2];

                // Regex for Date YYYY-MM-DD
                const dateMatch = dateCandidate.match(/^\d{4}-\d{2}-\d{2}$/);

                // Regex for Amount (R$ ...)
                // Support "- R$ 16,99", "R$ 667,00", "R$667,00"
                const amountMatch = amountCandidate.match(/(-?)\s*R\$\s*([\d\.]+,\d{2})/);

                if (dateMatch && amountMatch) {
                    const isExpense = amountCandidate.includes('-'); // or checks the group
                    const valStr = amountMatch[2].replace('.', '').replace(',', '.');
                    let val = parseFloat(valStr);

                    // The text uses "- R$" for expenses.
                    if (isExpense) val = -Math.abs(val);
                    else val = Math.abs(val);

                    parsed.push({
                        date: dateCandidate,
                        description: desc,
                        amount: val,
                        type: val < 0 ? 'expense' : 'income',
                        category: categorizeTransaction(desc)
                    });

                    i += 2; // Skip processed lines
                }
            }
        }

        if (parsed.length > 0) {
            setPreviewData(parsed);
        } else {
            alert("Não identifiquei transações no formato padrão (Nome / Data / Valor). Tente ajustar o texto.");
        }
    };

    const handleFileChange = async (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setProcessing(true);
            setFile(selectedFile);
            setDebugInfo("");
            try {
                let textDebug = "";
                if (selectedFile.name.toLowerCase().endsWith('.ofx') || selectedFile.name.toLowerCase().endsWith('.xml')) {
                    textDebug = await selectedFile.text();
                }

                const parsed = await parseFile(selectedFile); // Use factory

                if (parsed.length === 0) {
                    if (textDebug) setDebugInfo(textDebug.substring(0, 600));
                    alert("Nenhuma transação encontrada. O formato do arquivo pode não ser compatível.");
                    setProcessing(false);
                    return;
                }

                // Apply "Provisional AI" Categorization
                const enriched = parsed.map(t => ({
                    ...t,
                    category: categorizeTransaction(t.description)
                }));

                setPreviewData(enriched);
            } catch (error) {
                console.error(error);
                setDebugInfo(`Erro Técnico: ${error.message}\n\nStack: ${error.stack}`);
                alert("Erro ao ler arquivo. Veja os detalhes abaixo.");
            } finally {
                setProcessing(false);
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

        if (previewData.length > 0) {
            const dates = previewData.map(t => t.date).sort();
            const minDate = dates[0].split('-').reverse().join('/');
            const maxDate = dates[dates.length - 1].split('-').reverse().join('/');

            alert(`${count} transações importadas com sucesso!\n\nPeríodo: ${minDate} a ${maxDate}\n\nVerifique se o filtro de datas inclui este período para visualizá-las.`);
        } else {
            alert(`${count} transações importadas com sucesso!`);
        }

        setImporting(false);
        onImportComplete();
        onClose();
    };

    return (
        <div style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
        }}>
            <div style={{ background: "var(--surface)", padding: "2rem", borderRadius: "16px", width: "600px", maxHeight: "80vh", overflowY: "auto", boxShadow: "var(--shadow)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.5rem" }}>
                    <h2 style={{ color: "var(--text-primary)" }}>Importar Extrato Bancário</h2>
                    <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)" }}><X /></button>
                </div>

                <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
                    <button
                        onClick={() => setImportMethod('file')}
                        style={{
                            flex: 1, padding: "0.8rem", borderRadius: "8px", border: "1px solid var(--border)",
                            background: importMethod === 'file' ? "var(--primary)" : "var(--background)",
                            color: importMethod === 'file' ? "white" : "var(--text-secondary)", cursor: "pointer", fontWeight: "600"
                        }}
                    >
                        Upload Arquivo
                    </button>
                    <button
                        onClick={() => setImportMethod('text')}
                        style={{
                            flex: 1, padding: "0.8rem", borderRadius: "8px", border: "1px solid var(--border)",
                            background: importMethod === 'text' ? "var(--primary)" : "var(--background)",
                            color: importMethod === 'text' ? "white" : "var(--text-secondary)", cursor: "pointer", fontWeight: "600"
                        }}
                    >
                        Colar Texto (Alelo/PDF)
                    </button>
                </div>

                {!previewData.length ? (
                    importMethod === 'file' ? (
                        <div style={{ border: "2px dashed var(--border)", padding: "3rem", borderRadius: "12px", textAlign: "center", background: "var(--background)" }}>
                            <Upload size={48} color="var(--text-secondary)" />
                            <p style={{ marginTop: "1rem", color: "var(--text-primary)" }}>Arraste seu arquivo OFX aqui ou clique para selecionar</p>
                            {processing ? (
                                <p style={{ marginTop: "1rem", color: "var(--primary)", fontWeight: "bold" }}>Lendo arquivo...</p>
                            ) : (
                                <input
                                    type="file"
                                    accept=".ofx,.xml,.xlsx,.xls,.csv,.pdf"
                                    onChange={handleFileChange}
                                    style={{ marginTop: "1rem", color: "var(--text-primary)" }}
                                />
                            )}
                            {/* Debug info if needed */}
                        </div>
                    ) : (
                        <div style={{ border: "1px solid var(--border)", padding: "1rem", borderRadius: "12px", background: "var(--background)" }}>
                            <textarea
                                placeholder="Cole aqui o texto do seu extrato (Ex: Alelo)..."
                                value={pastedText}
                                onChange={(e) => setPastedText(e.target.value)}
                                style={{
                                    width: "100%", height: "200px", padding: "1rem", borderRadius: "8px",
                                    border: "1px solid var(--border)", background: "var(--surface)",
                                    color: "var(--text-primary)", fontFamily: "monospace"
                                }}
                            />
                            <button
                                onClick={handleTextParse}
                                style={{
                                    marginTop: "1rem", width: "100%", padding: "1rem",
                                    background: "var(--primary)", color: "white", border: "none", borderRadius: "8px",
                                    fontWeight: "bold", cursor: "pointer"
                                }}
                            >
                                Processar Texto
                            </button>
                        </div>
                    )
                ) : (
                    <div>
                        <div style={{ marginBottom: "1rem", maxHeight: "300px", overflowY: "auto", border: "1px solid var(--border)", borderRadius: "8px" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                <thead>
                                    <tr style={{ background: "var(--background)", textAlign: "left", color: "var(--text-secondary)" }}>
                                        <th style={{ padding: "0.5rem" }}>Data</th>
                                        <th style={{ padding: "0.5rem" }}>Descrição</th>
                                        <th style={{ padding: "0.5rem" }}>Categoria (Auto)</th>
                                        <th style={{ padding: "0.5rem" }}>Valor</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {previewData.map((t, i) => (
                                        <tr key={i} style={{ borderBottom: "1px solid var(--border)", color: "var(--text-primary)" }}>
                                            <td style={{ padding: "0.5rem" }}>{t.date.split('-').reverse().join('/')}</td>
                                            <td style={{ padding: "0.5rem" }}>{t.description}</td>
                                            <td style={{ padding: "0.5rem" }}>
                                                <span style={{ background: "rgba(37, 99, 235, 0.1)", color: "#3B82F6", padding: "2px 8px", borderRadius: "12px", fontSize: "0.8rem" }}>
                                                    {t.category}
                                                </span>
                                            </td>
                                            <td style={{ padding: "0.5rem", color: t.type === 'income' ? '#10B981' : '#EF4444', fontWeight: "bold" }}>
                                                {t.amount.toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem" }}>
                            <button onClick={() => setPreviewData([])} style={{ padding: "0.5rem 1rem", border: "1px solid var(--border)", borderRadius: "8px", background: "var(--surface)", color: "var(--text-primary)", cursor: "pointer" }}>
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
