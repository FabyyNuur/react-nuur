#  Nuur GYM - Frontend Client

Interface utilisateur moderne et réactive pour la gestion de la salle de sport **Nuur GYM**. Développée avec React 19, Vite, Tailwind CSS et TypeScript.

---

##  Installation & Développement

###  Lancement Rapide
1.  **Installation des dépendances** :
    ```bash
    npm install
    ```
2.  **Démarrage du mode développement** :
    ```bash
    npm run dev
    ```
    L'application sera accessible sur `http://localhost:5173`.

---

##  Stack Technique
-   **React 19** : Pour la structure de l'interface.
-   **Vite** : Pour un environnement de développement ultra-rapide.
-   **Tailwind CSS 4** : Pour un design moderne, réactif et optimisé.
-   **TypeScript** : Pour un code robuste et typé.
-   **Lucide React** : Pour une iconographie élégante et cohérente.
-   **Chart.js** : Pour la visualisation des données sur le dashboard.
-   **Axios** : Pour les appels API avec intercepteurs JWT.

---

##  Structure du Projet
-   `src/pages/` : Contient les différentes vues de l'application (Dashboard, Clients, Activités, etc.).
-   `src/routes/` : Configuration du routage dynamique avec `react-router-dom`.
-   `src/context/` : Gestion de l'état global (ex: Authentification).
-   `src/services/` : Configuration d'Axios pour la communication avec le backend.
-   `src/styles/` : Fichiers CSS et configuration Tailwind.

---

##  Connexion avec le Backend
L'application est configurée pour communiquer avec le backend sur `http://localhost:4000/api`. Cette configuration peut être modifiée dans le fichier `src/services/api.ts`.

