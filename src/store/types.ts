export interface Client {
    id: string;
    name: string;
    defaultTjm: number;
}

export interface WorkDay {
    date: string; // ISO string YYYY-MM-DD
    clientId?: string;
    tjm: number;
}

export type ExpenseCategory =
    | "Restaurant / Repas"
    | "Transport (Train, Avion, Taxi)"
    | "Hébergement (Hôtel)"
    | "Logiciels & Licences"
    | "Matériel & Fournitures"
    | "Téléphone & Internet"
    | "Frais Bancaires"
    | "Autre";

export interface Expense {
    id: string;
    date: string; // ISO string YYYY-MM-DD
    description: string;
    amountHt: number;
    tva: number;
    category?: ExpenseCategory;
    clientName?: string; // Optional client name this expense is linked to
    receiptUrl?: string; // base64 or local path
}

export interface EurlSettings {
    socialContributionRate: number; // ex: 45 (%)
    incomeTaxRate: number; // ex: 11 (%)
}

export interface AnnualCharge {
    id: string;
    label: string; // ex: "Loyer", "Électricité"
    amountHt: number; // Montant annuel HT
    year: number; // ex: 2025
    documentUrl?: string; // URL du justificatif PDF
}

export interface AppState {
    clients: Client[];
    workDays: Record<string, WorkDay>; // Clé = "YYYY-MM-DD"
    expenses: Expense[];
    settings: EurlSettings;
    salaries: Record<string, number>; // Clé = "YYYY-MM" (ex: "2024-03"), Valeur = montant net versé
    paidRevenues: Record<string, number>; // Clé = "YYYY-MM", Valeur = CA encaissé HT
    oneOffRevenues: Record<string, number>; // Clé = "YYYY-MM", Valeur = CA facturé ponctuel HT

    // Actions Clients
    addClient: (client: Client) => void;
    updateClient: (id: string, client: Partial<Client>) => void;
    deleteClient: (id: string) => void;

    // Actions WorkDays
    setWorkDay: (date: string, workDay: WorkDay) => void;
    removeWorkDay: (date: string) => void;

    // Actions Expenses
    addExpense: (expense: Expense) => void;
    updateExpense: (id: string, expense: Partial<Expense>) => void;
    deleteExpense: (id: string) => void;

    // Actions Settings
    updateSettings: (settings: Partial<EurlSettings>) => void;

    // Actions Salaries
    setSalary: (monthStr: string, amount: number) => void;

    // Actions Paid Revenues
    setPaidRevenue: (monthStr: string, amount: number) => void;

    // Actions One-off Revenues
    setOneOffRevenue: (monthStr: string, amount: number) => void;

    // Annual Charges
    annualCharges: AnnualCharge[];
    addAnnualCharge: (charge: AnnualCharge) => void;
    deleteAnnualCharge: (id: string) => void;

    // Supabase Sync
    initStore: () => Promise<void>;
}
