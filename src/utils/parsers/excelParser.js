import * as XLSX from 'xlsx';

export const parseExcel = async (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

                const transactions = [];

                // --- Advanced Column Detection (Dual or Single Amount) ---

                let dateIdx = -1;
                let descIdx = -1;
                let creditIdx = -1;
                let debitIdx = -1;
                let singleAmountIdx = -1;

                // 1. Try to find headers first (Best for "Crédito"/"Débito" separation)
                for (let i = 0; i < Math.min(jsonData.length, 15); i++) {
                    const row = jsonData[i].map(c => String(c).toLowerCase().trim());

                    if (dateIdx === -1) dateIdx = row.findIndex(c => ['data', 'dt.', 'posted date'].some(k => c === k || c.startsWith('data ')));
                    if (descIdx === -1) descIdx = row.findIndex(c => ['descrição', 'historico', 'lançamento', 'memo', 'description'].some(k => c.includes(k)));

                    if (creditIdx === -1) creditIdx = row.findIndex(c => c.includes('crédito') || c.includes('entradas') || c.includes('credit'));
                    if (debitIdx === -1) debitIdx = row.findIndex(c => c.includes('débito') || c.includes('saídas') || c.includes('debit'));

                    // Fallback to single amount if no dual columns found
                    if (singleAmountIdx === -1 && creditIdx === -1 && debitIdx === -1) {
                        singleAmountIdx = row.findIndex(c => ['valor', 'amount'].some(k => c === k));
                    }

                    // If we found the main ones, stop
                    if (dateIdx !== -1 && descIdx !== -1 && ((creditIdx !== -1 && debitIdx !== -1) || singleAmountIdx !== -1)) {
                        break;
                    }
                }

                // 2. Fallback: Smart Scan if headers failed
                if (dateIdx === -1 || (singleAmountIdx === -1 && creditIdx === -1)) {
                    const columnStats = {};
                    const sampleRows = jsonData.slice(0, 25);

                    sampleRows.forEach((row) => {
                        row.forEach((cell, cIdx) => {
                            if (!columnStats[cIdx]) columnStats[cIdx] = { dates: 0, moneys: 0, strings: 0 };
                            const valStr = String(cell).trim();
                            if (!valStr) return;

                            if (valStr.match(/^(0?[1-9]|[12][0-9]|3[01])[\/-](0?[1-9]|1[012])[\/-]\d{4}/)) columnStats[cIdx].dates++;
                            if (typeof cell === 'number' && cell > 20000 && cell < 60000) columnStats[cIdx].dates++;

                            if (typeof cell === 'number' || valStr.match(/^-?[R$\s]*\d+[,.]\d{2}$/)) columnStats[cIdx].moneys++;
                            if (valStr.length > 5) columnStats[cIdx].strings++;
                        });
                    });

                    if (dateIdx === -1) {
                        let max = 0;
                        Object.keys(columnStats).forEach(k => { if (columnStats[k].dates > max) { max = columnStats[k].dates; dateIdx = parseInt(k); } });
                    }
                    if (descIdx === -1) {
                        let max = 0;
                        Object.keys(columnStats).forEach(k => { if (columnStats[k].strings > max && parseInt(k) !== dateIdx) { max = columnStats[k].strings; descIdx = parseInt(k); } });
                    }
                    if (singleAmountIdx === -1 && creditIdx === -1) {
                        let max = 0;
                        Object.keys(columnStats).forEach(k => { if (columnStats[k].moneys > max && parseInt(k) !== dateIdx) { max = columnStats[k].moneys; singleAmountIdx = parseInt(k); } });
                    }
                }

                // 3. Iterate Rows
                for (let i = 0; i < jsonData.length; i++) {
                    const row = jsonData[i];
                    if (!row || row.length < 2) continue;

                    let rawDate = row[dateIdx];
                    let rawDesc = row[descIdx];

                    if (rawDate === undefined || rawDesc === undefined) continue;

                    // Amount Logic
                    let amount = 0;
                    let type = 'expense'; // default

                    if (creditIdx !== -1 && debitIdx !== -1) {
                        // Dual Strategy
                        const creditVal = row[creditIdx];
                        const debitVal = row[debitIdx];

                        // Helper to parse currency string or number
                        const parseVal = (v) => {
                            if (typeof v === 'number') return v;
                            if (!v) return 0;
                            // Remove R$, spaces, convert 1.000,00 to 1000.00
                            return parseFloat(String(v).replace(/[R$\s]/g, '').replace(/\./g, '').replace(',', '.'));
                        };

                        const c = parseVal(creditVal);
                        const d = parseVal(debitVal);

                        if (c > 0) {
                            amount = c;
                            type = 'income';
                        } else if (Math.abs(d) > 0) { // debit can be negative or positive
                            amount = Math.abs(d);
                            type = 'expense';
                        } else {
                            continue; // No value in this row
                        }

                    } else {
                        // Single Strategy
                        let rawAmount = row[singleAmountIdx];
                        if (rawAmount === undefined) continue;

                        if (typeof rawAmount === 'number') {
                            amount = rawAmount;
                        } else {
                            let cleanAmt = String(rawAmount).replace(/[R$\s]/g, '').replace(/\./g, '').replace(',', '.');
                            amount = parseFloat(cleanAmt);
                        }

                        // Strict NaN check for single column
                        if (isNaN(amount)) continue;

                        type = amount < 0 ? 'expense' : 'income';
                        amount = Math.abs(amount);
                    }

                    // SKIP Filters
                    if (String(rawDesc).toUpperCase().includes("SALDO ANTERIOR")) continue;
                    if (String(rawDesc).toUpperCase().includes("SDO DO DIA")) continue;
                    if (String(rawDesc).toUpperCase().includes("TOTAL")) continue;

                    // Date Formatting
                    let formattedDate;
                    try {
                        if (typeof rawDate === 'number') {
                            const dateObj = new Date(Math.round((rawDate - 25569) * 86400 * 1000));
                            if (!isNaN(dateObj.getTime())) {
                                formattedDate = dateObj.toISOString().split('T')[0];
                            }
                        } else {
                            const dateStr = String(rawDate).trim();
                            const parts = dateStr.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/);
                            if (parts) {
                                formattedDate = `${parts[3]}-${parts[2].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
                            } else {
                                const nativeDate = new Date(dateStr);
                                if (!isNaN(nativeDate.getTime())) {
                                    formattedDate = nativeDate.toISOString().split('T')[0];
                                }
                            }
                        }
                    } catch (e) {
                        // ignore
                    }

                    if (!formattedDate) continue; // Skip if no valid date

                    transactions.push({
                        date: formattedDate,
                        description: String(rawDesc).trim(),
                        amount: Math.abs(amount),
                        type: type,
                        raw: JSON.stringify(row)
                    });
                }

                resolve(transactions);
            } catch (error) {
                console.error("Excel parse error", error);
                reject(error);
            }
        };

        reader.readAsArrayBuffer(file);
    });
};
