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
        type: "Tipo",
        // Debts
        scheduleDebt: "Agendar Conta",
        noDebtsScheduled: "Nenhuma conta agendada",
        debtsDescription: "Fique tranquilo! Agende suas contas e receba lembretes para nunca mais pagar juros por atraso.",
        openDebts: "Em Aberto",
        paidHistory: "Histórico de Pagos",
        noPendingDebts: "Nenhuma conta pendente. Parabéns!",
        markAsPaidConfirm: "Confirmar pagamento de",
        deleteDebtConfirm: "Tem certeza que deseja excluir esta conta?",
        loadingDebts: "Carregando contas...",
        // Goals
        newGoal: "Nova Meta",
        noGoalsCreated: "Nenhuma meta criada ainda",
        goalsDescription: "Defina objetivos financeiros e acompanhe seu progresso. Que tal começar criando uma meta para sua reserva de emergência?",
        createFirstGoal: "Criar Minha Primeira Meta",
        deleteGoalConfirm: "Tem certeza que deseja excluir esta meta?",
        addMoneyPrompt: "Quanto deseja adicionar à meta",
        loadingGoals: "Carregando metas...",
        // Transactions
        import: "Importar",
        total: "Total",
        searchPlaceholder: "Buscar por descrição, valor...",
        all: "Todas",
        credit: "Crédito",
        debit: "Débito",
        uncategorized: "Sem Categoria",
        selected: "selecionados",
        deleteSelected: "Excluir Selecionados",
        selectAll: "Selecionar Todos",
        deleteTransactionConfirm: "Tem certeza que deseja excluir esta transação permanentemente?",
        deleteBulkConfirm: "Tem certeza que deseja excluir",
        loading: "Carregando...",
        // Settings
        personalInfo: "Informações Pessoais",
        preferences: "Preferências",
        displayName: "Nome de Exibição",
        changePassword: "Alterar Senha",
        currentPassword: "Senha Atual",
        newPassword: "Nova Senha",
        confirmNewPassword: "Confirmar Nova Senha",
        saveChanges: "Salvar Alterações",
        theme: "Tema",
        light: "Claro",
        dark: "Escuro",
        language: "Idioma",
        // Messages
        photoSaved: "Foto salva!",
        photoError: "Erro ao salvar foto.",
        profileUpdated: "Perfil atualizado!",
        passwordChanged: "Senha alterada!",
        errorUpdating: "Erro ao atualizar.",
        currentPasswordRequired: "Senha atual necessária.",
        passwordsDoNotMatch: "Senhas não conferem.",
        passwordTooShort: "Senha muito curta.",
        // Header
        monthly: "Mensal",
        period: "Período",
        custom: "Personalizado",
        to: "até",
        userRole: "Usuário",
        // Dashboard
        monthlyBalance: "Balanço Mensal",
        expensesByCategory: "Despesas por Categoria",
        // Categories (matching DB values)
        "Alimentação": "Alimentação",
        "Compras": "Compras",
        "Geral": "Geral",
        "Lazer": "Lazer",
        "Transporte": "Transporte",
        "Taxas e Impostos": "Taxas e Impostos",
        "Saúde": "Saúde",
        "Educação": "Educação",
        "Moradia": "Moradia",
        "Salário": "Salário",
        "Investimentos": "Investimentos"
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
        type: "Type",
        // Debts
        scheduleDebt: "Schedule Bill",
        noDebtsScheduled: "No bills scheduled",
        debtsDescription: "Relax! Schedule your bills and get reminders to never pay late fees again.",
        openDebts: "Open",
        paidHistory: "Payment History",
        noPendingDebts: "No pending bills. Congratulations!",
        markAsPaidConfirm: "Confirm payment of",
        deleteDebtConfirm: "Are you sure you want to delete this bill?",
        loadingDebts: "Loading bills...",
        // Goals
        newGoal: "New Goal",
        noGoalsCreated: "No goals created yet",
        goalsDescription: "Set financial goals and track your progress. How about starting by creating a goal for your emergency fund?",
        createFirstGoal: "Create My First Goal",
        deleteGoalConfirm: "Are you sure you want to delete this goal?",
        addMoneyPrompt: "How much do you want to add to goal",
        loadingGoals: "Loading goals...",
        // Transactions
        import: "Import",
        total: "Total",
        searchPlaceholder: "Search by description, amount...",
        all: "All",
        credit: "Credit",
        debit: "Debit",
        uncategorized: "Uncategorized",
        selected: "selected",
        deleteSelected: "Delete Selected",
        selectAll: "Select All",
        deleteTransactionConfirm: "Are you sure you want to permanently delete this transaction?",
        deleteBulkConfirm: "Are you sure you want to delete",
        loading: "Loading...",
        // Settings
        personalInfo: "Personal Information",
        preferences: "Preferences",
        displayName: "Display Name",
        changePassword: "Change Password",
        currentPassword: "Current Password",
        newPassword: "New Password",
        confirmNewPassword: "Confirm New Password",
        saveChanges: "Save Changes",
        theme: "Theme",
        light: "Light",
        dark: "Dark",
        language: "Language",
        // Messages
        photoSaved: "Photo saved!",
        photoError: "Error saving photo.",
        profileUpdated: "Profile updated!",
        passwordChanged: "Password changed!",
        errorUpdating: "Error updating.",
        currentPasswordRequired: "Current password required.",
        passwordsDoNotMatch: "Passwords do not match.",
        passwordTooShort: "Password too short.",
        // Header
        monthly: "Monthly",
        period: "Period",
        custom: "Custom",
        to: "to",
        userRole: "User",
        // Dashboard
        monthlyBalance: "Monthly Balance",
        expensesByCategory: "Expenses by Category",
        // Categories
        "Alimentação": "Food",
        "Compras": "Shopping",
        "Geral": "General",
        "Lazer": "Leisure",
        "Transporte": "Transport",
        "Taxas e Impostos": "Taxes & Fees",
        "Saúde": "Health",
        "Educação": "Education",
        "Moradia": "Housing",
        "Salário": "Salary",
        "Investimentos": "Investments"
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
