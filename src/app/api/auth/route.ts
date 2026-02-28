import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { pin } = body;

        const correctPin = process.env.APP_PIN_CODE;

        if (!correctPin) {
            console.error("APP_PIN_CODE n'est pas configuré dans les variables d'environnement.");
            return NextResponse.json({ success: false, error: 'Configuration serveur manquante' }, { status: 500 });
        }

        if (pin === correctPin) {
            // Créer une réponse de succès
            const response = NextResponse.json({ success: true });

            // Définir le cookie d'authentification (valable 1 an)
            response.cookies.set({
                name: 'freelance-auth-token',
                value: 'authenticated',
                httpOnly: true, // Sécurisé, non accessible via JavaScript côté client
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 60 * 60 * 24 * 365, // 1 an
                path: '/',
            });

            return response;
        } else {
            return NextResponse.json({ success: false, error: 'Code PIN incorrect' }, { status: 401 });
        }
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 });
    }
}
