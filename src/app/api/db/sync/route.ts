import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { unstable_noStore as noStore } from 'next/cache';

export const dynamic = 'force-dynamic';

export async function GET() {
    noStore();
    try {
        const sb = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            { auth: { autoRefreshToken: false, persistSession: false } }
        );

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
            sb.from('clients').select('*'),
            sb.from('work_days').select('*'),
            sb.from('expenses').select('*'),
            sb.from('settings').select('*').eq('id', 1).maybeSingle(),
            sb.from('salaries').select('*'),
            sb.from('paid_revenues').select('*'),
            sb.from('one_off_revenues').select('*'),
            sb.from('annual_charges').select('*')
        ]);

        const workDays = workDaysRes.data?.reduce((acc: any, wd: any) => {
            acc[wd.date] = { date: wd.date, clientId: wd.client_id, tjm: wd.tjm };
            return acc;
        }, {} as Record<string, any>) || {};

        const salaries = salariesRes.data?.reduce((acc: any, s: any) => {
            acc[s.month_str] = s.amount;
            return acc;
        }, {} as Record<string, any>) || {};

        const paidRevenues = paidRevenuesRes.data?.reduce((acc: any, pr: any) => {
            acc[pr.month_str] = pr.amount;
            return acc;
        }, {} as Record<string, any>) || {};

        const oneOffRevenues = oneOffRevenuesRes.data?.reduce((acc: any, or: any) => {
            acc[or.month_str] = or.amount;
            return acc;
        }, {} as Record<string, any>) || {};

        const clients = clientsRes.data?.map((c: any) => ({
            id: c.id, name: c.name, defaultTjm: c.default_tjm
        })) || [];

        const expenses = expensesRes.data?.map((e: any) => ({
            id: e.id, date: e.date, description: e.description,
            amountHt: e.amount_ht, tva: e.tva, category: e.category,
            clientName: e.client_name, receiptUrl: e.receipt_url
        })) || [];

        const settings = {
            socialContributionRate: settingsRes.data?.social_contribution_rate || 45,
            incomeTaxRate: settingsRes.data?.income_tax_rate || 11
        };

        const annualCharges = annualChargesRes.data?.map((c: any) => ({
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
