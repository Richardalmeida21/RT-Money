export const parseOFX = async (content) => {
    const text = typeof content === 'string' ? content : await content.text();
    console.log("Raw OFX content length:", text.length);

    const transactions = [];

    // Valid OFX usually contains inside <BANKTRANLIST> ... </BANKTRANLIST>
    // We split by <STMTTRN> to handle both SGML (no closing tag) and XML (closing tag)
    // The "i" flag isn't directly usable in split with standard strings easily without regex, 
    // but we can use a regex splitter.

    // Normalize newlines to spaces to make regex easier if needed, or just split
    const rawBlocks = text.split(/<STMTTRN>/i);

    // The first chunk is before the first transaction, so we skip it.
    for (let i = 1; i < rawBlocks.length; i++) {
        let block = rawBlocks[i];

        // If there are closing tags STMTTRN or BANKTRANLIST, we might need to trim the end
        // But extracting fields via regex usually ignores trailing garbage if we are careful.

        // Extract fields using regex looking for <TAG>VALUE
        // Supports: <TAG>VALUE (newline) OR <TAG>VALUE<
        const getTag = (tag) => {
            const regex = new RegExp(`<${tag}>(.*?)($|<|\n|\r)`, "i");
            const m = block.match(regex);
            return m ? m[1].trim() : null;
        };

        const typeRaw = getTag("TRNTYPE");
        // Date often appears as <DTPOSTED>20231010120000[0:GMT] or just 20231010
        const dateRaw = getTag("DTPOSTED");
        const amountRaw = getTag("TRNAMT");
        const memo = getTag("MEMO");
        const name = getTag("NAME");

        if (dateRaw && amountRaw) {
            // Clean date
            const cleanDate = dateRaw.split('[')[0]; // Remove timezone part if any
            const year = cleanDate.substring(0, 4);
            const month = cleanDate.substring(4, 6);
            const day = cleanDate.substring(6, 8);
            const formattedDate = `${year}-${month}-${day}`;

            // Clean amount
            const rawAmount = parseFloat(amountRaw.replace(',', '.'));

            // Clean description
            const description = (memo || name || "Sem descrição").trim();

            // Category/Type Logic
            let type = "expense";
            const lowerDesc = description.toLowerCase();

            if (rawAmount > 0) {
                type = "income";
            } else if (lowerDesc.includes("recebido") || lowerDesc.includes("crédito") || lowerDesc.includes("depósito")) {
                type = "income";
            } else {
                type = "expense";
            }

            transactions.push({
                date: formattedDate,
                amount: Math.abs(rawAmount),
                type: type,
                description: description,
                raw: block // Debug purpose
            });
        }
    }

    console.log("Parsed transactions:", transactions.length);
    return transactions;
};
