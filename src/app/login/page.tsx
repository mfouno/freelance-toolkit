"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Loader2 } from 'lucide-react';

export default function LoginPage() {
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pin }),
            });

            const data = await res.json();

            if (data.success) {
                // Rediriger vers l'accueil et rafraîchir pour que le middleware lise le cookie
                window.location.href = '/';
            } else {
                setError(data.error || 'Code invalide');
                setPin('');
            }
        } catch (err) {
            setError('Erreur de connexion');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-background px-4">
            <div className="w-full max-w-sm space-y-8 bg-card p-8 rounded-3xl border shadow-sm">
                <div className="flex flex-col items-center justify-center text-center space-y-2">
                    <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                        <Lock className="h-8 w-8 text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">Coffre-fort</h1>
                    <p className="text-sm text-muted-foreground">
                        Entrez votre code secret pour déverrouiller votre comptabilité
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <div className="relative">
                            <input
                                type="password"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                value={pin}
                                onChange={(e) => setPin(e.target.value)}
                                className="flex h-12 w-full rounded-xl border bg-background px-3 py-2 text-center text-2xl tracking-[0.5em] font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder={"\u2022\u2022\u2022\u2022"}
                                required
                                autoFocus
                            />
                        </div>
                        {error && (
                            <p className="text-xs text-red-500 font-medium text-center">{error}</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading || pin.length < 4}
                        className="inline-flex items-center justify-center rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-12 w-full"
                    >
                        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Déverrouiller'}
                    </button>
                </form>
            </div>
        </div>
    );
}
