const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 2999;
const DB_FILE = path.join(__dirname, 'users.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Helper to read users from JSON file
function readUsers() {
    try {
        if (!fs.existsSync(DB_FILE)) {
            fs.writeFileSync(DB_FILE, JSON.stringify([]));
            return [];
        }
        const data = fs.readFileSync(DB_FILE, 'utf8');
        return JSON.parse(data || '[]');
    } catch (err) {
        console.error("Error reading DB file:", err);
        return [];
    }
}

// Helper to write users to JSON file
function writeUsers(users) {
    try {
        fs.writeFileSync(DB_FILE, JSON.stringify(users, null, 2));
    } catch (err) {
        console.error("Error writing to DB file:", err);
    }
}

// 1. GET /api/users - Get list of usernames (without passwords)
app.get('/api/users', (req, res) => {
    const users = readUsers();
    const usernames = users.map(u => u.username);
    res.json(usernames);
});

// 2. POST /api/users/create - Create a new profile
app.post('/api/users/create', (req, res) => {
    const { username, password, hint } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: "Le pseudo et le mot de passe sont requis." });
    }

    const trimmedUsername = username.trim();
    if (trimmedUsername.length < 3) {
        return res.status(400).json({ error: "Le pseudo doit faire au moins 3 caractères." });
    }

    const users = readUsers();
    const exists = users.some(u => u.username.toLowerCase() === trimmedUsername.toLowerCase());
    if (exists) {
        return res.status(400).json({ error: "Ce pseudo existe déjà. Choisis-en un autre !" });
    }

    const newUser = {
        username: trimmedUsername,
        password: password,
        hint: hint ? hint.trim() : ""
    };

    users.push(newUser);
    writeUsers(users);

    res.json({ success: true, message: "Profil créé avec succès !" });
});

// 3. GET /api/users/:username/info - Get guess clues for a user
app.get('/api/users/:username/info', (req, res) => {
    const { username } = req.params;
    const users = readUsers();
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());

    if (!user) {
        return res.status(404).json({ error: "Utilisateur non trouvé." });
    }

    // Return length, first letter, hint, and space indices
    const passwordLength = user.password.length;
    const firstLetter = passwordLength > 0 ? user.password.charAt(0) : "";
    const spaceIndices = [];
    for (let i = 0; i < user.password.length; i++) {
        if (user.password.charAt(i) === ' ') {
            spaceIndices.push(i);
        }
    }

    res.json({
        username: user.username,
        length: passwordLength,
        firstLetter: firstLetter,
        hint: user.hint || null,
        spaceIndices: spaceIndices
    });
});

// 4. POST /api/users/guess - Guess a password
app.post('/api/users/guess', (req, res) => {
    const { username, guess } = req.body;

    if (!username || guess === undefined) {
        return res.status(400).json({ error: "Paramètres manquants." });
    }

    const users = readUsers();
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());

    if (!user) {
        return res.status(404).json({ error: "Utilisateur non trouvé." });
    }

    const isMatch = user.password.toLowerCase() === guess.toLowerCase();

    if (isMatch) {
        res.json({
            success: true,
            password: user.password,
            message: "Félicitations ! Tu as gagné ! Le mot de passe était bien trouvé."
        });
    } else {
        res.json({
            success: false,
            message: "Faux ! Essaie encore."
        });
    }
});

// 5. GET /api/users/:username/full - Get full profile details (for editing)
app.get('/api/users/:username/full', (req, res) => {
    const { username } = req.params;
    const users = readUsers();
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());

    if (!user) {
        return res.status(404).json({ error: "Utilisateur non trouvé." });
    }

    res.json({
        username: user.username,
        password: user.password,
        hint: user.hint || ""
    });
});

// 6. POST /api/users/update - Update a profile
app.post('/api/users/update', (req, res) => {
    const { oldUsername, newUsername, newPassword, newHint } = req.body;

    if (!oldUsername || !newUsername || !newPassword) {
        return res.status(400).json({ error: "Champs obligatoires manquants." });
    }

    const trimmedNewUsername = newUsername.trim();
    if (trimmedNewUsername.length < 3) {
        return res.status(400).json({ error: "Le pseudo doit faire au moins 3 caractères." });
    }

    const users = readUsers();
    const userIndex = users.findIndex(u => u.username.toLowerCase() === oldUsername.toLowerCase());

    if (userIndex === -1) {
        return res.status(404).json({ error: "Profil à modifier introuvable." });
    }

    // If username is changing, check if the new one already exists
    if (trimmedNewUsername.toLowerCase() !== oldUsername.toLowerCase()) {
        const exists = users.some(u => u.username.toLowerCase() === trimmedNewUsername.toLowerCase());
        if (exists) {
            return res.status(400).json({ error: "Le nouveau pseudo existe déjà !" });
        }
    }

    // Update the values
    users[userIndex] = {
        username: trimmedNewUsername,
        password: newPassword,
        hint: newHint ? newHint.trim() : ""
    };

    writeUsers(users);

    res.json({ 
        success: true, 
        message: "Profil mis à jour avec succès !", 
        username: trimmedNewUsername 
    });
});

// 7. POST /api/users/delete - Delete a profile
app.post('/api/users/delete', (req, res) => {
    const { username } = req.body;

    if (!username) {
        return res.status(400).json({ error: "Pseudo manquant." });
    }

    let users = readUsers();
    const userExists = users.some(u => u.username.toLowerCase() === username.toLowerCase());

    if (!userExists) {
        return res.status(404).json({ error: "Profil à supprimer introuvable." });
    }

    // Filter out the user
    users = users.filter(u => u.username.toLowerCase() !== username.toLowerCase());
    writeUsers(users);

    res.json({ success: true, message: "Profil supprimé avec succès !" });
});

// Start server
app.listen(PORT, () => {
    console.log(`=== Serveur du Jeu démarré sur http://localhost:${PORT} ===`);
});
