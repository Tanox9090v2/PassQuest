document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const createForm = document.getElementById('create-form');
    const guessForm = document.getElementById('guess-form');
    const targetUserSelect = document.getElementById('target-user-select');
    const playWorkspace = document.getElementById('play-workspace');
    
    // Control Buttons
    const targetControls = document.getElementById('target-controls');
    const ctrlEditBtn = document.getElementById('ctrl-edit-btn');
    const ctrlDeleteBtn = document.getElementById('ctrl-delete-btn');
    
    // Modals
    const editModal = document.getElementById('edit-modal');
    const editModalClose = document.getElementById('edit-modal-close');
    const editCancelBtn = document.getElementById('edit-cancel-btn');
    const editForm = document.getElementById('edit-form');
    const editOldUsername = document.getElementById('edit-old-username');
    const editUsername = document.getElementById('edit-username');
    const editPassword = document.getElementById('edit-password');
    const editHint = document.getElementById('edit-hint');
    
    const deleteModal = document.getElementById('delete-modal');
    const deleteModalClose = document.getElementById('delete-modal-close');
    const deleteCancelBtn = document.getElementById('delete-cancel-btn');
    const deleteConfirmBtn = document.getElementById('delete-confirm-btn');
    const deleteTargetName = document.getElementById('delete-target-name');

    // Terminal
    const terminalOverlay = document.getElementById('terminal-overlay');
    const terminalBody = document.getElementById('terminal-body');

    // Create form inputs
    const createUsernameInput = document.getElementById('create-username');
    const createPasswordInput = document.getElementById('create-password');
    const createHintInput = document.getElementById('create-hint');
    
    // Play workspace inputs & clues
    const clueLengthVal = document.getElementById('clue-length-val');
    const clueLetterPlaceholder = document.getElementById('clue-letter-placeholder');
    const clueLetterVal = document.getElementById('clue-letter-val');
    const letterRevealCard = document.getElementById('letter-reveal-card');
    const hintBoxContainer = document.getElementById('hint-box-container');
    const clueHintText = document.getElementById('clue-hint-text');
    const passwordDotsContainer = document.getElementById('password-dots-container');
    const guessInput = document.getElementById('guess-input');
    const guessCharCounter = document.getElementById('guess-char-counter');
    const resultMessage = document.getElementById('result-message');
    
    // Password toggles
    const togglePasswordButtons = document.querySelectorAll('.toggle-password');

    // State
    let activeTargetInfo = null;
    let isLetterRevealed = false;

    /* ==========================================
       1. TABS MANAGEMENT
       ========================================== */
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.getAttribute('data-tab');
            
            // Update active buttons
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Update active content
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === `tab-${tabName}`) {
                    content.classList.add('active');
                }
            });

            // If switching to Play Tab, reload target list
            if (tabName === 'play') {
                loadPseudos();
            }
        });
    });

    /* ==========================================
       2. PASSWORD VISIBILITY TOGGLE
       ========================================== */
    togglePasswordButtons.forEach(button => {
        button.addEventListener('click', () => {
            const wrapper = button.closest('.input-wrapper');
            const input = wrapper.querySelector('input');
            const icon = button.querySelector('i');
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    });

    /* ==========================================
       3. PROFILE CREATION
       ========================================== */
    createForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = createUsernameInput.value;
        const password = createPasswordInput.value;
        const hint = createHintInput.value;

        try {
            const response = await fetch('/api/users/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password, hint })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // Success feedback
                showNotification(data.message, 'success');
                createForm.reset();
                
                // Fancy success mini-confetti
                confetti({
                    particleCount: 50,
                    spread: 60,
                    origin: { y: 0.8 }
                });

                // Auto redirect to Play tab
                setTimeout(() => {
                    document.getElementById('tab-play-btn').click();
                    // Select the newly created user in select box
                    setTimeout(() => {
                        targetUserSelect.value = username;
                        targetUserSelect.dispatchEvent(new Event('change'));
                    }, 300);
                }, 1200);

            } else {
                showNotification(data.error || 'Erreur lors de la création.', 'error');
                shakeElement(createForm);
            }
        } catch (error) {
            console.error('Error creating profile:', error);
            showNotification('Erreur réseau. Est-ce que le serveur tourne ?', 'error');
        }
    });

    /* ==========================================
       4. TARGETS LISTING (PLAY TAB)
       ========================================== */
    async function loadPseudos() {
        try {
            const currentSelected = targetUserSelect.value;
            const response = await fetch('/api/users');
            const pseudos = await response.json();
            
            // Re-populate select dropdown
            targetUserSelect.innerHTML = '<option value="" disabled selected>-- Choisis un joueur à pirater --</option>';
            
            pseudos.forEach(pseudo => {
                const option = document.createElement('option');
                option.value = pseudo;
                option.textContent = pseudo;
                targetUserSelect.appendChild(option);
            });

            // Keep selected user if they still exist
            if (currentSelected && pseudos.includes(currentSelected)) {
                targetUserSelect.value = currentSelected;
                targetControls.classList.remove('hidden');
            } else {
                targetControls.classList.add('hidden');
                playWorkspace.classList.add('hidden');
            }
        } catch (error) {
            console.error('Error loading pseudos:', error);
            showNotification('Impossible de récupérer la liste des joueurs.', 'error');
        }
    }

    /* ==========================================
       5. GAME BOARD INITIALIZATION
       ========================================== */
    targetUserSelect.addEventListener('change', async () => {
        const username = targetUserSelect.value;
        if (!username) {
            targetControls.classList.add('hidden');
            return;
        }

        // Show edit/delete controls when username selected
        targetControls.classList.remove('hidden');

        try {
            const response = await fetch(`/api/users/${encodeURIComponent(username)}/info`);
            if (!response.ok) {
                throw new Error("Impossible d'obtenir les infos de la cible");
            }
            
            const info = await response.json();
            activeTargetInfo = info;
            
            // Reset clue cards state
            isLetterRevealed = false;
            letterRevealCard.classList.remove('revealed');
            clueLetterPlaceholder.classList.remove('hidden');
            clueLetterVal.classList.add('hidden');
            clueLetterVal.textContent = '?';

            // Populate clues
            clueLengthVal.textContent = `${info.length} caractères`;
            
            // Handle optional Hint box
            if (info.hint) {
                hintBoxContainer.classList.remove('hidden');
                clueHintText.textContent = `"${info.hint}"`;
            } else {
                hintBoxContainer.classList.add('hidden');
                clueHintText.textContent = "";
            }

            // Setup Guess Input Attributes
            guessInput.value = '';
            guessInput.maxLength = info.length;
            guessInput.disabled = false;
            document.getElementById('btn-guess-submit').disabled = false;
            updateCharCounter(0, info.length);
            
            // Build interactive visual password representation (dots)
            buildPasswordDots(info.length, info.spaceIndices);
            
            // Clear message
            resultMessage.classList.add('hidden');
            resultMessage.className = 'result-message-container hidden';
            resultMessage.innerHTML = '';
            
            // Show Workspace
            playWorkspace.classList.remove('hidden');

        } catch (error) {
            console.error('Error starting game:', error);
            showNotification('Erreur lors du chargement des indices.', 'error');
        }
    });

    // Helper to render empty boxes for password length
    function buildPasswordDots(length, spaceIndices = []) {
        passwordDotsContainer.innerHTML = '';
        for (let i = 0; i < length; i++) {
            const dot = document.createElement('div');
            dot.classList.add('pwd-dot');
            dot.setAttribute('data-index', i);
            if (spaceIndices && spaceIndices.includes(i)) {
                dot.classList.add('space-dot');
                dot.textContent = ' ';
            } else {
                dot.textContent = ''; // starts empty
            }
            passwordDotsContainer.appendChild(dot);
        }
    }

    /* ==========================================
       6. INTERACTIVE REVEAL MECHANISM
       ========================================== */
    letterRevealCard.addEventListener('click', () => {
        if (isLetterRevealed || !activeTargetInfo) return;
        
        isLetterRevealed = true;
        letterRevealCard.classList.add('revealed');
        
        // Hide placeholder, show letter
        clueLetterPlaceholder.classList.add('hidden');
        clueLetterVal.classList.remove('hidden');
        clueLetterVal.textContent = activeTargetInfo.firstLetter;

        // Visual feedback: fill first box with the revealed letter
        const firstDot = passwordDotsContainer.querySelector('.pwd-dot[data-index="0"]');
        if (firstDot && guessInput.value.length === 0) {
            firstDot.textContent = activeTargetInfo.firstLetter;
            firstDot.classList.add('revealed-first');
        }
    });

    /* ==========================================
       7. TYPING REFLECTION IN VISUAL DOTS
       ========================================== */
    guessInput.addEventListener('input', () => {
        if (!activeTargetInfo) return;

        const val = guessInput.value;
        const totalLen = activeTargetInfo.length;
        
        updateCharCounter(val.length, totalLen);

        // Update dots state
        const dots = passwordDotsContainer.querySelectorAll('.pwd-dot');
        dots.forEach((dot, idx) => {
            // Remove special classes first
            dot.classList.remove('active', 'revealed-first');
            
            if (idx < val.length) {
                // User has typed up to this index
                dot.textContent = val.charAt(idx);
                dot.classList.add('active');
            } else {
                // Not typed yet
                if (idx === 0 && isLetterRevealed && val.length === 0) {
                    // Show the revealed first letter if they haven't typed anything
                    dot.textContent = activeTargetInfo.firstLetter;
                    dot.classList.add('revealed-first');
                } else if (activeTargetInfo.spaceIndices && activeTargetInfo.spaceIndices.includes(idx)) {
                    dot.textContent = ' ';
                } else {
                    dot.textContent = '';
                }
            }
        });
    });

    function updateCharCounter(current, max) {
        guessCharCounter.textContent = `${current} / ${max}`;
    }

    /* ==========================================
       8. SUBMIT GUESS & HACKING ANIMATION
       ========================================== */
    guessForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!activeTargetInfo) return;

        const guess = guessInput.value;
        const username = activeTargetInfo.username;

        try {
            const response = await fetch('/api/users/guess', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, guess })
            });

            const data = await response.json();

            if (data.success) {
                // Trigger Hacker Terminal Animation before winning!
                guessInput.disabled = true;
                document.getElementById('btn-guess-submit').disabled = true;
                
                await runHackerTerminalAnimation(username, data.password);

                // Reveal win panel
                resultMessage.classList.remove('hidden');
                resultMessage.className = 'result-message-container result-success';
                resultMessage.innerHTML = `
                    <h3><i class="fa-solid fa-trophy"></i> Accès Autorisé !</h3>
                    <p class="win-text">${data.message}</p>
                    <div class="revealed-passcode">${data.password}</div>
                `;

                // Beautiful full-screen victory confetti!
                triggerVictoryConfetti();

            } else {
                // LOSS/ERROR STATE
                resultMessage.classList.remove('hidden');
                resultMessage.className = 'result-message-container result-error';
                resultMessage.innerHTML = `
                    <h3><i class="fa-solid fa-triangle-exclamation"></i> Accès Refusé</h3>
                    <p>${data.message}</p>
                `;

                // Shake the card & play workspace
                shakeElement(playWorkspace);
            }

        } catch (error) {
            console.error('Error checking guess:', error);
            showNotification('Erreur réseau lors de la tentative.', 'error');
        }
    });

    /* ==========================================
       9. RETRO HACKER TERMINAL ANIMATION
       ========================================== */
    function runHackerTerminalAnimation(username, correctPassword) {
        return new Promise(async (resolve) => {
            // Show terminal
            terminalOverlay.classList.remove('hidden');
            terminalBody.innerHTML = '';
            
            // Helper to write lines
            const writeLine = (text, delay, isSuccess = false) => {
                return new Promise(res => {
                    setTimeout(() => {
                        const line = document.createElement('div');
                        line.className = 'terminal-line' + (isSuccess ? ' success' : '');
                        line.textContent = text;
                        terminalBody.appendChild(line);
                        // Auto scroll to bottom
                        terminalBody.scrollTop = terminalBody.scrollHeight;
                        res();
                    }, delay);
                });
            };

            // Sequence
            await writeLine("PASSQUEST CRACKER [Version 1.4]", 100);
            await writeLine("(c) 2026 PassQuest Security Group. All rights reserved.", 100);
            await writeLine("--------------------------------------------------", 50);
            await writeLine(`[i] Target acquired: ${username}`, 200);
            await writeLine("[i] Initializing decryption sequence...", 150);
            await writeLine("[+] Bypassing firewall defense layers... OK", 300);
            await writeLine("[+] Injecting brute-force algorithms...", 200);
            await writeLine("[+] Analyzing hashing patterns... (SHA-256)", 250);
            
            // Progress bars
            await writeLine("Cracking progress: 12% [###.......................]", 100);
            await writeLine("Cracking progress: 45% [###########...............]", 80);
            await writeLine("Cracking progress: 78% [####################......]", 80);
            await writeLine("Cracking progress: 95% [########################..]", 80);
            await writeLine("Cracking progress: 100% [##########################]", 150);
            await writeLine("[+] Match found in local rainbow tables !", 200);
            await writeLine("[!] Commencing key decapsulation...", 100);

            // Glitching reveal effect for password
            const decryptedLine = document.createElement('div');
            decryptedLine.className = 'terminal-line';
            decryptedLine.innerHTML = 'Decrypted Password: <span id="glitch-pass" style="color: #ffffff; font-weight: bold;"></span><span class="terminal-cursor"></span>';
            terminalBody.appendChild(decryptedLine);
            terminalBody.scrollTop = terminalBody.scrollHeight;

            const glitchSpan = document.getElementById('glitch-pass');
            const passLen = correctPassword.length;
            const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";
            
            let currentIterations = 0;
            const maxIterations = 20; // how many cycles to lock in all letters
            
            const glitchInterval = setInterval(() => {
                let currentStr = "";
                
                // Determine how many letters are locked in based on iteration progress
                const lockedCount = Math.floor((currentIterations / maxIterations) * passLen);
                
                for (let i = 0; i < passLen; i++) {
                    if (i < lockedCount) {
                        currentStr += correctPassword[i];
                    } else {
                        // random glitching letter
                        const randomChar = alphabet.charAt(Math.floor(Math.random() * alphabet.length));
                        currentStr += randomChar;
                    }
                }
                
                glitchSpan.textContent = currentStr;
                currentIterations++;
                
                if (currentIterations > maxIterations) {
                    clearInterval(glitchInterval);
                    glitchSpan.textContent = correctPassword;
                    // Remove temporary cursor from glitch span
                    decryptedLine.querySelector('.terminal-cursor').remove();
                    
                    // Final Success Message
                    setTimeout(async () => {
                        await writeLine("[ACCÈS AUTORISÉ]", 100, true);
                        await writeLine("Closing decryptor terminal...", 800);
                        
                        // Close terminal after a small delay
                        setTimeout(() => {
                            terminalOverlay.classList.add('hidden');
                            resolve();
                        }, 500);
                    }, 200);
                }
            }, 60);
        });
    }

    /* ==========================================
       10. PROFILE EDIT MODAL ACTIONS
       ========================================== */
    ctrlEditBtn.addEventListener('click', async () => {
        const username = targetUserSelect.value;
        if (!username) return;

        try {
            const response = await fetch(`/api/users/${encodeURIComponent(username)}/full`);
            if (!response.ok) {
                throw new Error("Impossible d'obtenir les informations complètes.");
            }
            const data = await response.json();
            
            // Populate modal fields
            editOldUsername.value = data.username;
            editUsername.value = data.username;
            editPassword.value = data.password;
            editHint.value = data.hint;
            
            // Show modal
            editModal.classList.remove('hidden');

        } catch (error) {
            console.error('Error opening edit modal:', error);
            showNotification("Erreur lors de la récupération des détails.", 'error');
        }
    });

    const closeEditModal = () => {
        editModal.classList.add('hidden');
        editForm.reset();
    };

    editModalClose.addEventListener('click', closeEditModal);
    editCancelBtn.addEventListener('click', closeEditModal);

    editForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const oldUsername = editOldUsername.value;
        const newUsername = editUsername.value;
        const newPassword = editPassword.value;
        const newHint = editHint.value;

        try {
            const response = await fetch('/api/users/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ oldUsername, newUsername, newPassword, newHint })
            });

            const data = await response.json();

            if (response.ok) {
                showNotification(data.message, 'success');
                closeEditModal();
                
                // Reload the select box and pre-select the new username
                await loadPseudos();
                targetUserSelect.value = data.username;
                targetUserSelect.dispatchEvent(new Event('change'));
            } else {
                showNotification(data.error || 'Erreur lors de la mise à jour.', 'error');
                shakeElement(editModal.querySelector('.modal-card'));
            }
        } catch (error) {
            console.error('Error updating challenge:', error);
            showNotification('Erreur réseau. Impossible de mettre à jour.', 'error');
        }
    });

    /* ==========================================
       11. PROFILE DELETE MODAL ACTIONS
       ========================================== */
    ctrlDeleteBtn.addEventListener('click', () => {
        const username = targetUserSelect.value;
        if (!username) return;

        deleteTargetName.textContent = username;
        deleteModal.classList.remove('hidden');
    });

    const closeDeleteModal = () => {
        deleteModal.classList.add('hidden');
    };

    deleteModalClose.addEventListener('click', closeDeleteModal);
    deleteCancelBtn.addEventListener('click', closeDeleteModal);

    deleteConfirmBtn.addEventListener('click', async () => {
        const username = targetUserSelect.value;
        if (!username) return;

        try {
            const response = await fetch('/api/users/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username })
            });

            const data = await response.json();

            if (response.ok) {
                showNotification(data.message, 'success');
                closeDeleteModal();
                
                // Reset select dropdown
                targetUserSelect.value = '';
                targetControls.classList.add('hidden');
                playWorkspace.classList.add('hidden');
                
                // Reload list
                await loadPseudos();
            } else {
                showNotification(data.error || 'Erreur lors de la suppression.', 'error');
                shakeElement(deleteModal.querySelector('.modal-card'));
            }
        } catch (error) {
            console.error('Error deleting profile:', error);
            showNotification('Erreur réseau. Impossible de supprimer.', 'error');
        }
    });

    /* ==========================================
       UI UTILITIES & ANIMATIONS
       ========================================== */
    function shakeElement(element) {
        element.classList.add('shake-element');
        setTimeout(() => {
            element.classList.remove('shake-element');
        }, 500);
    }

    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification-toast toast-${type}`;
        
        const icon = type === 'success' ? 'fa-circle-check' : 'fa-circle-xmark';
        notification.innerHTML = `
            <i class="fa-solid ${icon}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('visible');
        }, 10);

        setTimeout(() => {
            notification.classList.remove('visible');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    function triggerVictoryConfetti() {
        const duration = 3.5 * 1000;
        const end = Date.now() + duration;

        (function frame() {
            confetti({
                particleCount: 5,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: ['#8b5cf6', '#06b6d4', '#10b981']
            });
            confetti({
                particleCount: 5,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: ['#8b5cf6', '#06b6d4', '#10b981']
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        }());
    }
});
