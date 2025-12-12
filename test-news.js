
// Script de teste para simular a busca de notícias
// Para rodar: node test-news.js

// NOTA: Em produção, você precisará de uma API Key gratuita da NewsAPI.org
// Como não temos uma aqui, vou simular EXATAMENTE o que a API devolve para você ver o formato.
// A NewsAPI devolve um JSON com 'articles'.

const mockNewsResponse = {
    "status": "ok",
    "totalResults": 3,
    "articles": [
        {
            "source": { "id": "globo", "name": "G1 - Economia" },
            "author": "G1",
            "title": "Dólar opera em queda com foco em pacote de corte de gastos; bolsa sobe",
            "description": "Mercado financeiro reage positivamente às novas medidas fiscais anunciadas pelo governo. Ibovespa supera os 130 mil pontos.",
            "url": "https://g1.globo.com/economia/noticia/...",
            "publishedAt": "2025-12-12T10:00:00Z"
        },
        {
            "source": { "id": null, "name": "InfoMoney" },
            "author": "Redação",
            "title": "Banco Central indica possível corte na Selic na próxima reunião",
            "description": "Ata do Copom revela que diretores veem inflação controlada e espaço para redução de juros no curto prazo.",
            "url": "https://www.infomoney.com.br/mercados/...",
            "publishedAt": "2025-12-12T11:30:00Z"
        },
        {
            "source": { "id": null, "name": "CNN Brasil" },
            "author": "CNN Business",
            "title": "Setor de serviços cresce 1,2% em outubro e supera expectativas",
            "description": "Desempenho foi puxado pelo segmento de tecnologia e transportes, segundo dados do IBGE divulgados hoje.",
            "url": "https://www.cnnbrasil.com.br/business/...",
            "publishedAt": "2025-12-12T09:15:00Z"
        }
    ]
};

async function fetchNews() {
    console.log("🔍 Buscando últimas notícias de Economia (Brasil)...\n");

    // Em produção seria: 
    // const res = await fetch('https://newsapi.org/v2/top-headlines?country=br&category=business&apiKey=SUA_KEY');
    // const data = await res.json();

    const data = mockNewsResponse; // Simulando a resposta real

    if (data.articles && data.articles.length > 0) {
        console.log("📅 Resumo Econômico de Hoje:\n");

        data.articles.forEach((article, index) => {
            console.log(`------------------------------------------------`);
            console.log(`📰 ${index + 1}. ${article.title}`);
            console.log(`   Fonte: ${article.source.name}`);
            console.log(`   Resumo: ${article.description}`);
            console.log(`   🔗 Link: ${article.url}`);
        });
        console.log(`------------------------------------------------`);
    } else {
        console.log("Nenhuma notícia encontrada no momento.");
    }
}

fetchNews();
