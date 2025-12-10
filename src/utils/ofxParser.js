export const parseOFX = async (file) => {
    const text = await file.text();

    // Simple regex parser for OFX/SGML content
    // Note: This is a basic implementation. Production apps might need a robust XML parser.

    const transactions = [];

    // Extract transaction blocks
    const transactionRegex = /<STMTTRN>([\s\S]*?)<\/STMTTRN>/g;
    let match;

    while ((match = transactionRegex.exec(text)) !== null) {
        const block = match[1];

        const typeMatch = block.match(/<TRNTYPE>(.*)/);
        const dateMatch = block.match(/<DTPOSTED>(\d{8})/);
        const amountMatch = block.match(/<TRNAMT>(.*)/);
        const memoMatch = block.match(/<MEMO>(.*)/);

        if (dateMatch && amountMatch) {
            const rawDate = dateMatch[1];
            // Format YYYYMMDD to YYYY-MM-DD
            const formattedDate = `${rawDate.substring(0, 4)}-${rawDate.substring(4, 6)}-${rawDate.substring(6, 8)}`;

            const amount = parseFloat(amountMatch[1]);
            const description = memoMatch ? memoMatch[1].trim() : "Untitled Transaction";

            // Map OFX types to our app types
            const type = amount < 0 ? "expense" : "income";

            transactions.push({
                date: formattedDate,
                amount: Math.abs(amount), // We store magnitude, type decides sign
                type: type,
                description: description,
                raw: block
            });
        }
    }

    return transactions;
};
