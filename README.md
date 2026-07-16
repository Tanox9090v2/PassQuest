# PassQuest - Le Jeu du Mot de Passe / The Password Game

Ce projet est une application web interactive de devinette de mot de passe ("social hacking") développée en Node.js et JavaScript Vanilla. Les utilisateurs peuvent créer des profils contenant un mot de passe et un indice, et tenter de deviner (pirater) les mots de passe des autres profils créés.

This project is an interactive password guessing ("social hacking") web application built with Node.js and Vanilla JavaScript. Users can create profiles containing a password and a hint, and attempt to guess (hack) the passwords of other created profiles.

---

## Sommaire / Table of Contents

- [Français](#version-française)
  - [Fonctionnalités](#fonctionnalités)
  - [Structure du Projet](#structure-du-projet)
  - [Architecture Technique](#architecture-technique)
  - [API Backend](#api-backend)
  - [Installation et Démarrage](#installation-et-démarrage)
- [English](#english-version)
  - [Features](#features)
  - [Project Structure](#project-structure)
  - [Technical Stack](#technical-stack)
  - [Backend API](#backend-api)
  - [Installation and Setup](#installation-and-setup)

---

## Version Française

PassQuest propose une interface soignée et interactive simulant une console de piratage informatique. Le but est de créer des énigmes de mots de passe pour ses amis et de tenter de résoudre les leurs.

### Fonctionnalités

- Création de profil : Enregistrement d'un pseudonyme unique, d'un mot de passe secret à faire deviner, et d'un indice facultatif. Les profils sont sauvegardés localement.
- Résolution de défi : Sélection d'une cible parmi les profils enregistrés pour tenter de deviner son mot de passe.
- Système d'indices dynamiques :
  - Longueur exacte du mot de passe représentée par des indicateurs visuels.
  - Révélation interactive de la première lettre.
  - Affichage de l'emplacement des espaces si le mot de passe en contient.
  - Affichage de l'indice textuel fourni par le créateur du profil.
- Simulation de terminal hacker : Animation de décryptage lors de la validation d'une tentative de mot de passe.
- Gestion des défis : Possibilité de modifier (pseudonyme, mot de passe, indice) ou de supprimer un profil existant via des modales de confirmation.
- Effets visuels : Pluie de confettis en cas de succès et retours visuels animés.

### Structure du Projet

Le projet est organisé de la manière suivante :

- [package.json](file:///c:/Users/Dylan/Desktop/jeux/Site%20web%20jeux/package.json) : Fichier de configuration npm contenant les dépendances et les scripts de démarrage.
- [server.js](file:///c:/Users/Dylan/Desktop/jeux/Site%20web%20jeux/server.js) : Serveur Express.js gérant la base de données locale JSON et les routes API REST.
- [public/](file:///c:/Users/Dylan/Desktop/jeux/Site%20web%20jeux/public) : Dossier contenant les ressources du client web :
  - [index.html](file:///c:/Users/Dylan/Desktop/jeux/Site%20web%20jeux/public/index.html) : Structure HTML5 sémantique de l'application.
  - [style.css](file:///c:/Users/Dylan/Desktop/jeux/Site%20web%20jeux/public/style.css) : Conception visuelle responsive, thématique sombre moderne et animations.
  - [app.js](file:///c:/Users/Dylan/Desktop/jeux/Site%20web%20jeux/public/app.js) : Logique applicative côté client (appels API, gestion du DOM et animations).

### Architecture Technique

- Backend :
  - Node.js avec Express.js pour le serveur web.
  - Persistance des données effectuée dans un fichier local `users.json` via le module `fs` (File System) natif.
- Frontend :
  - HTML5 sémantique et Vanilla CSS (sans framework CSS externe pour conserver des performances optimales).
  - JavaScript Vanilla pour la gestion des interactions et de l'état local.
  - Polices chargées via Google Fonts (Outfit, JetBrains Mono).
  - Icônes intégrées avec FontAwesome.
  - Effets de victoire générés par la bibliothèque externe Canvas Confetti.

### API Backend

Le serveur Express propose les points de terminaison suivants :

- GET `/api/users` : Récupère la liste de tous les pseudonymes enregistrés.
- POST `/api/users/create` : Crée un nouveau profil. Requiert `username`, `password` et éventuellement `hint` dans le corps de la requête.
- GET `/api/users/:username/info` : Récupère les indices publics d'un joueur (longueur du mot de passe, première lettre, indices d'espaces et texte d'indice). Le mot de passe complet n'est pas envoyé par cette route pour des raisons évidentes de jeu.
- POST `/api/users/guess` : Vérifie une tentative de mot de passe. Compare la tentative reçue avec la valeur stockée (comparaison insensible à la casse).
- GET `/api/users/:username/full` : Récupère toutes les données d'un profil (y compris le mot de passe en clair), utilisé uniquement pour l'édition de profil.
- POST `/api/users/update` : Modifie les informations d'un profil existant.
- POST `/api/users/delete` : Supprime définitivement un profil de la liste.

### Installation et Démarrage

1. Installez les dépendances nécessaires au projet (Express.js) :
   ```bash
   npm install
   ```

2. Lancez le serveur Node.js :
   ```bash
   npm start
   ```
   ou en mode développement :
   ```bash
   npm run dev
   ```

3. Ouvrez votre navigateur internet et accédez à l'adresse suivante :
   ```
   http://localhost:2999
   ```

---

## English Version

PassQuest features a polished and interactive interface simulating a hacking terminal. The goal is to create password challenges for your friends and try to crack theirs.

### Features

- Profile Creation: Register a unique username, a secret password to be guessed, and an optional hint. Profiles are saved locally.
- Challenge Selection: Select a target from the list of registered profiles to attempt to crack their password.
- Dynamic Hint System:
  - Exact password length represented by visual placeholders.
  - Interactive reveal of the first letter.
  - Visual layout showing space locations if the password contains spaces.
  - Text hint display set by the profile creator.
- Hacker Terminal Simulator: Decryption animation shown when validating a password attempt.
- Challenge Management: Edit (username, password, hint) or delete an existing profile via confirmation modals.
- Visual Effects: Confetti rain upon success and animated UI feedbacks.

### Project Structure

The project is structured as follows:

- [package.json](file:///c:/Users/Dylan/Desktop/jeux/Site%20web%20jeux/package.json): NPM configuration file containing dependencies and execution scripts.
- [server.js](file:///c:/Users/Dylan/Desktop/jeux/Site%20web%20jeux/server.js): Express.js server managing the local JSON database and REST API endpoints.
- [public/](file:///c:/Users/Dylan/Desktop/jeux/Site%20web%20jeux/public): Directory hosting the web client resources:
  - [index.html](file:///c:/Users/Dylan/Desktop/jeux/Site%20web%20jeux/public/index.html): Semantic HTML5 structure of the app.
  - [style.css](file:///c:/Users/Dylan/Desktop/jeux/Site%20web%20jeux/public/style.css): Responsive visual design, modern dark theme, and styling.
  - [app.js](file:///c:/Users/Dylan/Desktop/jeux/Site%20web%20jeux/public/app.js): Client-side application logic (API consumption, DOM actions, and UI effects).

### Technical Stack

- Backend:
  - Node.js running Express.js for the web server.
  - Data storage managed in a local `users.json` database file using the built-in `fs` (File System) module.
- Frontend:
  - Semantic HTML5 and Vanilla CSS (no CSS frameworks to maintain speed and control).
  - Vanilla JavaScript for managing states and view logic.
  - Fonts loaded from Google Fonts (Outfit, JetBrains Mono).
  - Icons provided by FontAwesome.
  - Celebration animations driven by Canvas Confetti.

### Backend API

The Express server exposes the following endpoints:

- GET `/api/users`: Retrieves all registered usernames.
- POST `/api/users/create`: Creates a new profile. Requires `username`, `password`, and optionally `hint` in the request body.
- GET `/api/users/:username/info`: Retrieves public hints for a specific player (password length, first letter, space indices, and text hint). The actual password is omitted for gaming integrity.
- POST `/api/users/guess`: Verifies a password guess attempt against the stored profile (case-insensitive comparison).
- GET `/api/users/:username/full`: Retrieves all profile data (including password in plain text), used only for editing profiles.
- POST `/api/users/update`: Modifies an existing profile.
- POST `/api/users/delete`: Permanently deletes a profile.

### Installation and Setup

1. Install the required dependencies:
   ```bash
   npm install
   ```

2. Start the Node.js server:
   ```bash
   npm start
   ```
   or run it in development mode:
   ```bash
   npm run dev
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:2999
   ```
