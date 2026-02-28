import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // Si l'utilisateur essaie d'accéder à la page de login, on le laisse passer
    if (request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/api/auth')) {
        return NextResponse.next();
    }

    // Vérifier la présence du cookie d'authentification
    const authToken = request.cookies.get('freelance-auth-token');

    // S'il n'y a pas de cookie, on le redirige vers la page de login
    if (!authToken || authToken.value !== 'authenticated') {
        const loginUrl = new URL('/login', request.url);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    // Appliquer le middleware à toutes les routes SAUF les fichiers statiques, images, et _next
    matcher: ['/((?!_next/static|_next/image|favicon.ico|manifest.json|icon-*|apple-icon|images/).*)'],
};
