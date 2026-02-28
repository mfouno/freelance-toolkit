import { create } from 'zustand';
import { AppState, Client, Expense } from './types';

// Helper pour muter la DB Supabase avec Next.js
const mutateDB = async (table: string, action: 'upsert' | 'delete', payload: any) => {
    try {
        await fetch('/api/db/mutate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ table, action, payload })
        });
    } catch (e) {
        console.error('Failed to mutate DB:', table, e);
    }
};

export const useAppStore = create<AppState>()(
    (set, get) => ({
        clients: [],
        workDays: {},
        expenses: [],
        settings: {
            socialContributionRate: 45, // 45% par défaut (SSI)
            incomeTaxRate: 11, // Prélèvement libératoire ou TMI moyen
        },
        salaries: {},
        paidRevenues: {},

        initStore: async () => {
            try {
                const res = await fetch('/api/db/sync');
                if (res.ok) {
                    const data = await res.json();
                    set({
                        clients: data.clients || [],
                        workDays: data.workDays || {},
                        expenses: data.expenses || [],
                        settings: data.settings || { socialContributionRate: 45, incomeTaxRate: 11 },
                        salaries: data.salaries || {},
                        paidRevenues: data.paidRevenues || {}
                    });
                }
            } catch (error) {
                console.error("Failed to init store from Supabase:", error);
            }
        },

        addClient: (client) => {
            mutateDB('clients', 'upsert', { id: client.id, name: client.name, default_tjm: client.defaultTjm });
            set((state) => ({ clients: [...state.clients, client] }));
        },

        updateClient: (id: string, updatedClient: Partial<Client>) => {
            const client = get().clients.find(c => c.id === id);
            if (client) {
                const merged = { ...client, ...updatedClient };
                mutateDB('clients', 'upsert', { id: merged.id, name: merged.name, default_tjm: merged.defaultTjm });
            }
            set((state) => ({
                clients: state.clients.map((c) =>
                    c.id === id ? { ...c, ...updatedClient } : c
                ),
            }));
        },

        deleteClient: (id: string) => {
            mutateDB('clients', 'delete', { id });
            set((state) => ({
                clients: state.clients.filter((c) => c.id !== id),
            }));
        },

        setWorkDay: (date, workDay) => {
            mutateDB('work_days', 'upsert', { date, client_id: workDay.clientId || null, tjm: workDay.tjm });
            set((state) => ({
                workDays: { ...state.workDays, [date]: workDay },
            }));
        },

        removeWorkDay: (date) => {
            mutateDB('work_days', 'delete', { date });
            set((state) => {
                const newWorkDays = { ...state.workDays };
                delete newWorkDays[date];
                return { workDays: newWorkDays };
            });
        },

        addExpense: (expense) => {
            mutateDB('expenses', 'upsert', {
                id: expense.id, date: expense.date, description: expense.description,
                amount_ht: expense.amountHt, tva: expense.tva, category: expense.category,
                client_name: expense.clientName || null, receipt_url: expense.receiptUrl || null
            });
            set((state) => ({ expenses: [...state.expenses, expense] }));
        },

        deleteExpense: (id: string) => {
            mutateDB('expenses', 'delete', { id });
            set((state) => ({
                expenses: state.expenses.filter((e) => e.id !== id),
            }));
        },

        updateExpense: (id: string, updatedExpense: Partial<Expense>) => {
            const expense = get().expenses.find(e => e.id === id);
            if (expense) {
                const merged = { ...expense, ...updatedExpense };
                mutateDB('expenses', 'upsert', {
                    id: merged.id, date: merged.date, description: merged.description,
                    amount_ht: merged.amountHt, tva: merged.tva, category: merged.category,
                    client_name: merged.clientName || null, receipt_url: merged.receiptUrl || null
                });
            }
            set((state) => ({
                expenses: state.expenses.map((e) =>
                    e.id === id ? { ...e, ...updatedExpense } : e
                ),
            }));
        },

        // SETTINGS
        updateSettings: (newSettings) => {
            const merged = { ...get().settings, ...newSettings };
            mutateDB('settings', 'upsert', { id: 1, social_contribution_rate: merged.socialContributionRate, income_tax_rate: merged.incomeTaxRate });
            set((state) => ({
                settings: merged,
            }));
        },

        // SALARIES
        setSalary: (monthStr, amount) => {
            mutateDB('salaries', 'upsert', { month_str: monthStr, amount });
            set((state) => ({
                salaries: {
                    ...state.salaries,
                    [monthStr]: amount,
                }
            }));
        },

        // PAID REVENUES
        setPaidRevenue: (monthStr, amount) => {
            mutateDB('paid_revenues', 'upsert', { month_str: monthStr, amount });
            set((state) => ({
                paidRevenues: {
                    ...state.paidRevenues,
                    [monthStr]: amount,
                }
            }));
        },
    })
);
