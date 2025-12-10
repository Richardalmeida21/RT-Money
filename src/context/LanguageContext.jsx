import { createContext, useState, useContext, useEffect } from "react";

const LanguageContext = createContext();

const translations = {
    pt: {
        dashboard: "Visão Geral",
        transactions: "Transações",
        goals: "Metas",
        debts: "Contas a Pagar",
        settings: "Configurações",
        logout: "Sair",
        welcome: "Bem-vindo",
        currentBalance: "Saldo Total",
        periodBalance: "Saldo do Período",
        expenses: "Despesas",
        income: "Receitas",
        recentTransactions: "Últimas Transações",
        noTransactions: "Nenhuma transação encontrada.",
        addTransaction: "Nova Transação",
        save: "Salvar",
        cancel: "Cancelar",
        delete: "Excluir",
        edit: "Editar",
        date: "Data",
        description: "Descrição",
        amount: "Valor",
        category: "Categoria",
        type: "Tipo"
    },
    en: {
        dashboard: "Overview",
        transactions: "Transactions",
        goals: "Goals",
        debts: "Accounts Payable",
        settings: "Settings",
        logout: "Logout",
        welcome: "Welcome",
        currentBalance: "Total Balance",
        periodBalance: "Period Balance",
        expenses: "Expenses",
        income: "Income",
        recentTransactions: "Recent Transactions",
        noTransactions: "No transactions found.",
        addTransaction: "New Transaction",
        save: "Save",
        cancel: "Cancel",
        delete: "Delete",
        edit: "Edit",
        date: "Date",
        description: "Description",
        amount: "Amount",
        category: "Category",
        type: "Type"
    }
};

export function LanguageProvider({ children }) {
    const [language, setLanguage] = useState(() => {
        return localStorage.getItem("appLanguage") || "pt";
    });

    useEffect(() => {
        localStorage.setItem("appLanguage", language);
    }, [language]);

    const t = (key) => {
        return translations[language][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export const useLanguage = () => useContext(LanguageContext);
