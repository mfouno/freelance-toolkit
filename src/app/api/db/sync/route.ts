import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const [
            clientsRes,
            workDaysRes,
            expensesRes,
            settingsRes,
            salariesRes,
            paidRevenuesRes,
            oneOffRevenuesRes,
            annualChargesRes
        ] = await Promise.all([
            supabaseAdmin.from('clients').select('*'),
            supabaseAdmin.from('work_days').select('*'),
            supabaseAdmin.from('expenses').select('*'),
            supabaseAdmin.from('settings').select('*').eq('id', 1).maybeSingle(),
            supabaseAdmin.from('salaries').select('*'),
            supabaseAdmin.from('paid_revenues').select('*'),
            supabaseAdmin.from('one_off_revenues').select('*'),
            supabaseAdmin.from('annual_charges').select('*')
        ]);

        const workDays = workDaysRes.data?.reduce((acc, wd) => {
            acc[wd.date] = { date: wd.date, clientId: wd.client_id, tjm: wd.tjm };
            return acc;
        }, {} as Record<string, any>) || {};

        const salaries = salariesRes.data?.reduce((acc, s) => {
            acc[s.month_str] = s.amount;
            return acc;
        }, {} as Record<string, any>) || {};

        const paidRevenues = paidRevenuesRes.data?.reduce((acc, pr) => {
            acc[pr.month_str] = pr.amount;
            return acc;
        }, {} as Record<string, any>) || {};

        const oneOffRevenues = oneOffRevenuesRes.data?.reduce((acc, or) => {
            acc[or.month_str] = or.amount;
            return acc;
        }, {} as Record<string, any>) || {};

        const clients = clientsRes.data?.map(c => ({
            id: c.id, name: c.name, defaultTjm: c.default_tjm
        })) || [];

        const expenses = expensesRes.data?.map(e => ({
            id: e.id, date: e.date, description: e.description,
            amountHt: e.amount_ht, tva: e.tva, category: e.category,
            clientName: e.client_name, receiptUrl: e.receipt_url
        })) || [];

        const settings = {
            socialContributionRate: settingsRes.data?.social_contribution_rate || 45,
            incomeTaxRate: settingsRes.data?.income_tax_rate || 11
        };

        const annualCharges = annualChargesRes.data?.map(c => ({
            id: c.id, label: c.label, amountHt: c.amount_ht, year: c.year, documentUrl: c.document_url
        })) || [];

        return NextResponse.json({
            clients, workDays, expenses, settings, salaries, paidRevenues, oneOffRevenues, annualCharges
        });
    } catch (error) {
        console.error("Erreur sync:", error);
        return NextResponse.json({ error: 'Erreur serveur fetch' }, { status: 500 });
    }
}
