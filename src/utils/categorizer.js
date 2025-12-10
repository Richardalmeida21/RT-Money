export const CATEGORIES = {
    ALIMENTACAO: "Alimentação",
    TRANSPORTE: "Transporte",
    MORADIA: "Moradia",
    SAUDE: "Saúde",
    LAZER: "Lazer",
    SALARIO: "Salário",
    INVESTIMENTOS: "Investimentos",
    COMPRAS: "Compras",
    SERVICOS: "Serviços",
    TAXAS: "Taxas e Impostos",
    EDUCACAO: "Educação",
    GERAL: "Geral"
};

const KEYWORDS = {
    [CATEGORIES.ALIMENTACAO]: ["ifood", "uber eats", "restaurante", "padaria", "mercado", "supermercado", "burger", "pizza", "mcdonalds", "outback", "starbucks", "fome", "sorvete", "açai", "lanchonete", "delivery"],
    [CATEGORIES.TRANSPORTE]: ["uber", "99", "posto", "combustivel", "gasolina", "estacionamento", "pedagio", "sem parar", "veloe", "abastecimento", "ipva", "transporte"],
    [CATEGORIES.MORADIA]: ["aluguel", "condominio", "luz", "energia", "agua", "internet", "claro", "vivo", "tim", "oi", "gás", "iptu", "net"],
    [CATEGORIES.SAUDE]: ["farmacia", "drogasil", "pague menos", "medico", "hospital", "dentista", "exame", "laboratorio", "drogaria", "psicologo"],
    [CATEGORIES.LAZER]: ["netflix", "spotify", "cinema", "prime video", "steam", "playstation", "xbox", "hotel", "airbnb", "bar", "ingresso", "game", "jogos", "hbomax", "disney"],
    [CATEGORIES.COMPRAS]: ["amazon", "mercadolivre", "shopee", "shein", "zara", "renner", "magalu", "loja", "pay", "pagseguro", "magazine", "vestuario", "roupa"],
    [CATEGORIES.TAXAS]: ["iof", "tarifa", "anuidade", "manut", "taxa", "banco", "juros", "encargos", "pacote servicos"],
    [CATEGORIES.EDUCACAO]: ["escola", "faculdade", "curso", "udemy", "alura", "livraria", "papelaria", "ensino"],
    [CATEGORIES.SERVICOS]: ["assinatura", "mensalidade", "seguro", "plano"],
    [CATEGORIES.SALARIO]: ["salario", "pagamento", "ted recebida", "pix recebido", "proventos", "remuneracao"],
    [CATEGORIES.INVESTIMENTOS]: ["corretora", "xp", "nuinvest", "rico", "b3", "tesouro", "cdb", "aplicacao"]
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
