import * as pdfjsLib from 'pdfjs-dist';

// Setting worker logic is tricky in Vite. 
// We will try to use the CDN worker for simplicity in this environment, 
// or hope the build handles it. Ideally, we import the worker file.
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;

export const parsePDF = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const transactions = [];

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const items = textContent.items;

        // Simple strategy: Sort items by Y (lines), then X (columns).
        // Since PDF js returns items in reading order properly most of the time, we check individual strings.
        // A common bank statement line might be scattered across items.
        // Strategy: Reconstruct lines based on 'transform[5]' (Y position).

        const lines = {};

        items.forEach(item => {
            const y = Math.round(item.transform[5]); // Group by Y coordinate (row)
            if (!lines[y]) lines[y] = [];
            lines[y].push(item.str);
        });

        // Convert grouped lines to text strings
        const textLines = Object.keys(lines)
            .sort((a, b) => b - a) // Top to bottom (PDF Y origin is bottom-left usually, so higher Y is top)
            .map(y => lines[y].join(' '));

        // Parse lines
        // Heuristic: valid line has a Date (DD/MM) and a Money Amount (X,XX)
        const dateRegex = /(\d{2})\/(\d{2})(\/\d{4})?/; // DD/MM or DD/MM/YYYY
        const moneyRegex = /(-?\d{1,3}(\.\d{3})*,\d{2})/; // Brazilian format: 1.000,00 or -50,00

        textLines.forEach(line => {
            const dateMatch = line.match(dateRegex);
            const moneyMatch = line.match(moneyRegex);

            if (dateMatch && moneyMatch) {
                // It's a candidate for a transaction line
                const rawDate = dateMatch[0];
                const rawAmount = moneyMatch[0];

                // Remove date and amount from line to get description
                // This is fuzzy, but might work for simple statements
                const description = line
                    .replace(rawDate, '')
                    .replace(rawAmount, '')
                    .trim()
                    .replace(/  +/g, ' '); // remove extra spaces

                // Date Formatting
                const parts = rawDate.split('/');
                const day = parts[0];
                const month = parts[1];
                const year = parts[2] ? parts[2] : new Date().getFullYear(); // Default to current year if missing
                const formattedDate = `${year}-${month}-${day}`;

                // Amount Formatting
                let amountVal = parseFloat(rawAmount.replace(/\./g, '').replace(',', '.'));

                let type = amountVal < 0 ? 'expense' : 'income';

                // Description keywords override
                if (line.toLowerCase().includes('crédito') || line.toLowerCase().includes('depósito')) type = 'income';

                transactions.push({
                    date: formattedDate,
                    description: description || "Transação PDF",
                    amount: Math.abs(amountVal),
                    type: type,
                    raw: line
                });
            }
        });
    }

    return transactions;
};
