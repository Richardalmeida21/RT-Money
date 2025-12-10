export const CATEGORIES = {
    ALIMENTACAO: "Alimentação",
    TRANSPORTE: "Transporte",
    MORADIA: "Moradia",
    SAUDE: "Saúde",
    LAZER: "Lazer",
    SALARIO: "Salário",
    INVESTIMENTOS: "Investimentos",
    COMPRAS: "Compras",
    GERAL: "Geral"
};

const KEYWORDS = {
    [CATEGORIES.ALIMENTACAO]: ["ifood", "uber eats", "restaurante", "padaria", "mercado", "supermercado", "burger", "pizza", "mcdonalds", "outback", "starbucks", "fome"],
    [CATEGORIES.TRANSPORTE]: ["uber", "99", "posto", "combustivel", "gasolina", "estacionamento", "pedagio", "sem parar", "veloe"],
    [CATEGORIES.MORADIA]: ["aluguel", "condominio", "luz", "energia", "agua", "internet", "claro", "vivo", "tim", "oi", "gás"],
    [CATEGORIES.SAUDE]: ["farmacia", "drogasil", "pague menos", "medico", "hospital", "dentista", "exame", "laboratorio"],
    [CATEGORIES.LAZER]: ["netflix", "spotify", "cinema", "prime video", "steam", "playstation", "xbox", "hotel", "airbnb", "bar"],
    [CATEGORIES.COMPRAS]: ["amazon", "mercadolivre", "shopee", "shein", "zara", "renner", "magalu", "loja"],
    [CATEGORIES.SALARIO]: ["salario", "pagamento", "ted recebida", "pix recebido", "proventos"],
    [CATEGORIES.INVESTIMENTOS]: ["corretora", "xp", "nuinvest", "rico", "b3", "tesouro"]
};

export function categorizeTransaction(description) {
    const normalizedDesc = description.toLowerCase();

    for (const [category, terms] of Object.entries(KEYWORDS)) {
        if (terms.some(term => normalizedDesc.includes(term))) {
            return category;
        }
    }

    return CATEGORIES.GERAL;
}
