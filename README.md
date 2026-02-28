# Freelance Management Toolkit 🚀

Un Dashboard complet et intelligent pensé sur-mesure pour les indépendants (EURL / SASU / Micro-entreprise). Suivez votre chiffre d'affaires, gérez vos jours travaillés, et surtout... importez vos reçus avec une extraction automatique de données propulsée par l'Intelligence Artificielle !

## 🌟 Fonctionnalités Principales

- **Dashboard Intelligent :** Suivi automatique du CA, calcul de la trésorerie nette et intégration des prélèvements (TVA, Impôts, Cotisations SSI/URSSAF).
- **Gestion des Jours Travaillés :** Calendrier interactif pour pointer vos jours de travail (TJM) chez vos différents clients.
- **Notes de Frais Automatisées (OCR AI) :** Prenez en photo ou uploadez vos reçus. L'IA de Google (Gemini) extrait automatiquement : Marchand, Montant HT, TVA, Date, et catégorise la dépense.
- **Stockage Cloud Privé :** Les PDFs et Images de vos notes de frais sont sauvegardés secrètement dans votre Bucket Supabase.
- **Synchronisation Temps Réel (PostgreSQL) :** Toutes les données (Clients, Dépenses...) sont stockées dans Supabase. Que vous soyez sur votre Mac ou votre iPhone, la donnée est la même.
- **Application Mobile (PWA) :** Installez l'application sur l'écran d'accueil de votre smartphone. Mode hors ligne toléré et interface optimisée ("Safe Area" iOS).
- **Coffre-fort Sécurisé :** Toute l'interface est protégée derrière un code PIN secret, rendant possible l'hébergement de votre instance sur Internet.

## 🛠️ Stack Technique

- **Frontend :** Next.js 14, React, Tailwind CSS, shadcn/ui.
- **Backend & API :** Next.js Route Handlers (Edge/Node).
- **Intelligence Artificielle :** `@google/generative-ai` (Gemini 2.5 Flash Lite).
- **Base de données & Storage :** Supabase (PostgreSQL & S3 Buckets).
- **Format PWA :** Manifest Web App natif & adaptation des viewports `ios-safari`.

## ⚙️ Installation & Lancement (Local)

1. Clonez ce dépôt :
   ```bash
   git clone https://github.com/votre-compte/freelance-toolkit.git
   cd freelance-toolkit
   ```
2. Installez les dépendances :
   ```bash
   npm install
   ```
3. Créez un fichier `.env.local` à la racine avec vos clefs secrètes :
   ```env
   GEMINI_API_KEY=votre_clef_google_ai_studio
   NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
   SUPABASE_SERVICE_ROLE_KEY=votre_clef_service_supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_clef_anon_supabase
   APP_PIN_CODE=0000
   ```
4. Lancez le serveur de développement :
   ```bash
   npm run dev
   ```
5. Ouvrez `http://localhost:3000` !

## ☁️ Déploiement Vercel

Pour pouvoir utiliser cette app sur votre smartphone tout le temps :
1. Connectez ce dépôt GitHub à un nouveau projet sur **Vercel**.
2. Dans les de paramètres de déploiement (Settings > Environment Variables), n'oubliez pas d'ajouter les 5 variables inscrites ci-dessus !
3. Lancez le déploiement. Profitez ! Dites adieu à Excel.
