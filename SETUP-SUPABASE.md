

# Connecter Golden Boy à Supabase

## 1. Créer le projet Supabase
1. Va sur [supabase.com](https://supabase.com) → crée un compte → **New project**.
2. Choisis un nom, un mot de passe de base de données (à garder de côté), une région proche (ex: Europe).
3. Attends 1-2 min que le projet soit prêt.

## 2. Récupérer les clés API
Dans le dashboard du projet → **Project Settings** (icône engrenage) → **API** :
- Copie **Project URL** → colle-le dans `.env` sous `VITE_SUPABASE_URL`
- Copie **anon public key** → colle-le dans `.env` sous `VITE_SUPABASE_ANON_KEY`

Renomme `.env.example` en `.env` (ou crée `.env` et colle son contenu) avant de lancer le projet.

## 3. Créer les tables
Dashboard → **SQL Editor** → **New query** → colle tout le contenu de `supabase/schema.sql` → **Run**.

Ça crée :
- `site_content` (photo hero)
- `results` (photos des résultats élèves)
- `analytics_events` (vues + clics)
- les règles de sécurité (qui peut lire/écrire quoi)

## 4. Créer le bucket de stockage (pour les photos)
Dashboard → **Storage** → **New bucket** :
- Nom : `photos` (exactement ce nom, en minuscules)
- Coche **Public bucket** (sinon les images ne s'afficheront pas sur le site)
- Create bucket

## 5. Créer ton compte admin
Dashboard → **Authentication** → **Users** → **Add user** → **Create new user** :
- Renseigne ton email et un mot de passe
- Décoche/laisse "Auto Confirm User" coché (pour pouvoir te connecter tout de suite sans email de confirmation)

C'est cet email + mot de passe que tu utiliseras pour te connecter sur `tonsite.com/#admin` (plus de mot de passe unique codé en dur — c'est un vrai compte).

## 6. Lancer le projet
```sh
npm i
npm run dev
```

## Ce que ça change concrètement
- Les photos que tu ajoutes depuis `/#admin` sont stockées sur Supabase et visibles **par tous les visiteurs**, immédiatement (mise à jour en temps réel, pas besoin de recharger).
- Les statistiques (vues, clics) sont enregistrées pour **chaque visiteur réel du site déployé**, pas juste ton propre navigateur.
- Seul un compte connecté (créé à l'étape 5) peut modifier le contenu ou voir les stats — les visiteurs normaux ne peuvent que déclencher des événements (vue de page, clic), jamais les lire.

## Déploiement
Quand tu déploies (Vercel, Netlify, etc.), pense à renseigner `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` dans les variables d'environnement de la plateforme d'hébergement — pas seulement dans ton `.env` local.
