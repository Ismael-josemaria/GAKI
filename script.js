document.addEventListener('DOMContentLoaded', () => {
    // Scroll Reveal Animation (Intersection Observer)
    const revealElements = document.querySelectorAll('.reveal-on-scroll');
    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                // Optional: unobserve after revealing if you only want it to happen once
                // scrollObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

    revealElements.forEach(el => scrollObserver.observe(el));

    // Scroll Indicator logic
    const scrollIndicator = document.querySelector('.scroll-indicator');
    if (scrollIndicator) {
        scrollIndicator.addEventListener('click', () => {
            document.getElementById('features').scrollIntoView({ behavior: 'smooth' });
        });
    }

    // Database Logic (LocalStorage pseudo-DB)
    const DB_KEY = 'gaki_database';
    
    const getDB = () => {
        const data = localStorage.getItem(DB_KEY);
        return data ? JSON.parse(data) : { users: [], matches: [] };
    };

    const saveToDB = (data) => {
        localStorage.setItem(DB_KEY, JSON.stringify(data, null, 2));
    };

    const addUser = (userData) => {
        const db = getDB();
        userData.id = Date.now().toString();
        userData.createdAt = new Date().toISOString();
        db.users.push(userData);
        saveToDB(db);
        return userData;
    };

    const addMatch = (profile) => {
        const db = getDB();
        const match = {
            id: Date.now().toString(),
            profile: profile,
            messages: [],
            matchedAt: new Date().toISOString()
        };
        db.matches.push(match);
        saveToDB(db);
        updateMatchesBadge();
        return match;
    };

    const saveMessage = (matchId, message, sender) => {
        const db = getDB();
        const match = db.matches.find(m => m.id === matchId);
        if (match) {
            match.messages.push({
                text: message,
                sender: sender, // 'me' o 'them'
                timestamp: new Date().toISOString()
            });
            saveToDB(db);
        }
    };

    const getMatch = (matchId) => {
        const db = getDB();
        return db.matches.find(m => m.id === matchId);
    };

    // DB UI Tools
    const btnExport = document.getElementById('btn-export-db');
    const btnClear = document.getElementById('btn-clear-db');

    if (btnExport) {
        btnExport.addEventListener('click', () => {
            const db = getDB();
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(db, null, 2));
            const downloadAnchorNode = document.createElement('a');
            downloadAnchorNode.setAttribute("href", dataStr);
            downloadAnchorNode.setAttribute("download", "gaki_database.json");
            document.body.appendChild(downloadAnchorNode);
            downloadAnchorNode.click();
            downloadAnchorNode.remove();
            alert("Base de datos guardada en tu carpeta de descargas como gaki_database.json");
        });
    }

    if (btnClear) {
        btnClear.addEventListener('click', () => {
            if (confirm('¿Estás seguro de que quieres borrar todos los datos locales?')) {
                localStorage.removeItem(DB_KEY);
                alert("Base de datos borrada. Recarga la página para empezar de cero.");
                location.reload();
            }
        });
    }

    // Manejo de etiquetas de selección (tags)
    const setupTags = (containerId) => {
        const container = document.getElementById(containerId);
        if (!container) return;

        const tags = container.querySelectorAll('.tag');

        tags.forEach(tag => {
            tag.addEventListener('click', () => {
                // Alternar la clase 'selected'
                tag.classList.toggle('selected');

                // Micro-animación al hacer click
                tag.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    tag.style.transform = tag.classList.contains('selected') ? 'translateY(-2px)' : '';
                }, 100);
            });
        });
    };

    setupTags('music-tags');
    setupTags('weekend-tags');

    // Manejo del formulario
    const form = document.getElementById('tastes-form');
    const formSection = document.getElementById('form-section');
    const successSection = document.getElementById('success-section');
    const discoverySection = document.getElementById('discovery-section');
    const matchCard = document.querySelector('.match-card');
    const btnPass = document.getElementById('btn-pass');
    const btnLike = document.getElementById('btn-like');
    const fileInput = document.getElementById('photo');
    const fileUploadText = document.querySelector('.file-upload-content span');

    // Cambiar texto cuando se sube un archivo
    if (fileInput && fileUploadText) {
        fileInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files.length > 0) {
                fileUploadText.textContent = e.target.files[0].name;
            } else {
                fileUploadText.textContent = 'Haz clic o arrastra tu foto aquí';
            }
        });
    }

    // Distance slider update
    const distanceSlider = document.getElementById('distance');
    const distanceVal = document.getElementById('distance-val');
    if (distanceSlider && distanceVal) {
        distanceSlider.addEventListener('input', (e) => {
            distanceVal.textContent = e.target.value;
        });
    }

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            // Animación de salida del formulario
            formSection.style.animation = 'fadeInUp 0.5s ease-in reverse both';

            setTimeout(() => {
                formSection.classList.add('hidden');
                successSection.classList.remove('hidden');

                // Recopilar datos
                const name = document.getElementById('name').value;
                const age = document.getElementById('age').value;
                const gender = document.getElementById('gender').value;
                const lookingFor = document.getElementById('looking-for').value;
                const distance = document.getElementById('distance').value;
                const pets = document.getElementById('pets').value;
                const smoke = document.getElementById('smoke').value;
                const musicTags = Array.from(document.getElementById('music-tags').querySelectorAll('.selected')).map(t => t.dataset.value);
                const weekendTags = Array.from(document.getElementById('weekend-tags').querySelectorAll('.selected')).map(t => t.dataset.value);
                const passion = document.getElementById('passion').value;
                const photo = fileInput.files.length > 0 ? fileInput.files[0].name : null;

                const newUser = {
                    name,
                    age,
                    gender,
                    lookingFor,
                    distance,
                    pets,
                    smoke,
                    photo,
                    tastes: {
                        music: musicTags,
                        weekend: weekendTags,
                        passion: passion
                    }
                };

                // Guardar en la base de datos local
                addUser(newUser);
                console.log('Perfil guardado en la base de datos local:', newUser);

                setTimeout(() => {
                    successSection.classList.add('hidden');
                    discoverySection.classList.remove('hidden');
                    document.querySelector('.db-tools').style.display = 'flex'; // Ensure DB tools are visible
                    
                    // Hacer scroll suave hacia la sección de descubrimiento
                    discoverySection.scrollIntoView({ behavior: 'smooth', block: 'start' });

                    if (typeof bottomNav !== 'undefined' && bottomNav) bottomNav.classList.remove('hidden');
                }, 2000);

            }, 500);
        });
    }

    const bottomNav = document.getElementById('bottom-nav');
    const matchOverlay = document.getElementById('match-overlay');
    const btnKeepSwiping = document.getElementById('btn-keep-swiping');
    const badgeLike = document.getElementById('badge-like');
    const badgeNope = document.getElementById('badge-nope');

    // ==========================================
    // LÓGICA DE DUMMY PROFILES & MATCHING
    // ==========================================
    const DUMMY_PROFILES = [
        { name: "Sofía", age: 24, location: "A 5 km de ti", img: "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80", tags: ["Indie", "Museos y arte", "Rock"], bio: "Amante del café de especialidad y la fotografía analógica. Siempre buscando la próxima exposición de arte en la ciudad. ☕📸" },
        { name: "Carlos", age: 27, location: "A 2 km de ti", img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80", tags: ["Electrónica", "Noche de videojuegos", "Salir de fiesta"], bio: "Desarrollador de día, gamer de noche. Me encanta salir a bailar los fines de semana y la música electrónica." },
        { name: "Elena", age: 22, location: "A 10 km de ti", img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80", tags: ["Pop", "Películas en casa", "Naturaleza y senderismo"], bio: "Prefiero un plan tranquilo viendo películas o escapando a la montaña que una discoteca abarrotada. 🌲🍿" },
        { name: "Marcos", age: 26, location: "A 8 km de ti", img: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80", tags: ["Rock", "Probar restaurantes", "Jazz"], bio: "Músico aficionado y foodie profesional. Si conoces un buen sitio de ramen, ya me has ganado. 🍜🎸" }
    ];

    let currentProfileIndex = 0;
    let currentProfile = null;

    const renderNextProfile = () => {
        if (currentProfileIndex >= DUMMY_PROFILES.length) {
            currentProfileIndex = 0; // Loop for demo purposes
        }
        
        currentProfile = DUMMY_PROFILES[currentProfileIndex];
        
        if (!matchCard) return;
        
        // Update DOM with profile data
        const imgEl = matchCard.querySelector('.profile-img');
        const nameEl = matchCard.querySelector('.profile-info h3');
        const locationEl = matchCard.querySelector('.location');
        const bioEl = matchCard.querySelector('.bio');
        const tagsContainer = matchCard.querySelector('.shared-tags');

        imgEl.src = currentProfile.img;
        nameEl.innerHTML = `${currentProfile.name}, ${currentProfile.age} <span class="online-dot"></span>`;
        locationEl.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg> ${currentProfile.location}`;
        bioEl.textContent = currentProfile.bio;
        
        // Render tags
        tagsContainer.innerHTML = '';
        currentProfile.tags.forEach((tag, idx) => {
            const isMatch = idx < 2; // Fake some matched tags
            tagsContainer.innerHTML += `
                <span class="shared-tag ${isMatch ? 'match' : ''}">
                    ${isMatch ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>' : ''}
                    ${tag}
                </span>`;
        });
        
        currentProfileIndex++;
        resetCard();
    };

    const triggerMatch = () => {
        // Save to DB
        addMatch(currentProfile);
        
        // Show overlay
        matchOverlay.querySelector('.match-subtitle').textContent = `Tú y ${currentProfile.name} se gustan y comparten pasiones.`;
        matchOverlay.querySelector('.match-avatar').style.backgroundImage = `url('${currentProfile.img}')`;
        
        setTimeout(() => {
            matchOverlay.classList.remove('hidden');
        }, 300);
    };

    const swipeCard = (direction) => {
        if (!matchCard) return;

        const transformValue = direction === 'left' ? 'translateX(-120%) rotate(-20deg)' : 'translateX(120%) rotate(20deg)';
        matchCard.style.transition = 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.5s ease';
        matchCard.style.transform = transformValue;
        matchCard.style.opacity = '0';

        if (direction === 'right') {
            badgeLike.style.opacity = '1';
            // Alta probabilidad de Match para la demo
            if (Math.random() > 0.3) triggerMatch();
        } else {
            badgeNope.style.opacity = '1';
        }

        setTimeout(() => {
            matchCard.style.transition = 'none';
            matchCard.style.transform = 'scale(0.95)';
            matchCard.style.opacity = '0';
            badgeLike.style.opacity = '0';
            badgeNope.style.opacity = '0';

            renderNextProfile();
        }, 500);
    };

    if (btnPass) btnPass.addEventListener('click', () => swipeCard('left'));
    if (btnLike) btnLike.addEventListener('click', () => swipeCard('right'));

    // Lógica de arrastrar (Drag)
    let isDragging = false;
    let startX = 0;
    let currentX = 0;

    const handleDragStart = (e) => {
        isDragging = true;
        startX = e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
        if (matchCard) matchCard.style.transition = 'none';
    };

    const handleDragMove = (e) => {
        if (!isDragging || !matchCard) return;
        const x = e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
        currentX = x - startX;

        const rotate = currentX * 0.05;
        matchCard.style.transform = `translateX(${currentX}px) rotate(${rotate}deg)`;

        // Mostrar Badges según la dirección
        if (currentX > 20) {
            if (badgeLike) badgeLike.style.opacity = Math.min(currentX / 100, 1);
            if (badgeNope) badgeNope.style.opacity = '0';
        } else if (currentX < -20) {
            if (badgeNope) badgeNope.style.opacity = Math.min(Math.abs(currentX) / 100, 1);
            if (badgeLike) badgeLike.style.opacity = '0';
        }
    };

    const handleDragEnd = () => {
        if (!isDragging) return;
        isDragging = false;

        if (currentX > 100) {
            swipeCard('right');
        } else if (currentX < -100) {
            swipeCard('left');
        } else {
            resetCard();
        }
        currentX = 0;
    };

    if (matchCard) {
        matchCard.addEventListener('mousedown', handleDragStart);
        document.addEventListener('mousemove', handleDragMove);
        document.addEventListener('mouseup', handleDragEnd);

        matchCard.addEventListener('touchstart', handleDragStart);
        document.addEventListener('touchmove', handleDragMove);
        document.addEventListener('touchend', handleDragEnd);
        
        // Inicializar primer perfil
        renderNextProfile();
    }

    // ==========================================
    // NAVEGACIÓN Y VISTAS
    // ==========================================
    const sections = {
        discover: document.getElementById('discovery-section'),
        matches: document.getElementById('matches-section'),
        chat: document.getElementById('chat-section'),
        profile: document.getElementById('form-section') // Volver al form como "perfil"
    };

    const navItems = {
        discover: document.getElementById('nav-discover'),
        matches: document.getElementById('nav-matches'),
        profile: document.getElementById('nav-profile')
    };

    const switchView = (viewName) => {
        // Ocultar todo menos bottomNav
        Object.values(sections).forEach(s => {
            if (s) s.classList.add('hidden');
        });
        // Desactivar items
        Object.values(navItems).forEach(i => {
            if (i) i.classList.remove('active');
        });

        if (sections[viewName]) sections[viewName].classList.remove('hidden');
        if (navItems[viewName]) navItems[viewName].classList.add('active');

        if (viewName === 'matches') {
            renderMatchesList();
        }
    };

    if (navItems.discover) navItems.discover.addEventListener('click', (e) => { e.preventDefault(); switchView('discover'); });
    if (navItems.matches) navItems.matches.addEventListener('click', (e) => { e.preventDefault(); switchView('matches'); });
    if (navItems.profile) navItems.profile.addEventListener('click', (e) => { e.preventDefault(); switchView('profile'); });

    // Cuando hay match y quieres mensajear
    const btnSendMessage = document.getElementById('btn-send-message');
    if (btnSendMessage) {
        btnSendMessage.addEventListener('click', () => {
            matchOverlay.classList.add('hidden');
            switchView('matches');
            // Abrir el último match
            const db = getDB();
            if (db.matches.length > 0) {
                const lastMatch = db.matches[db.matches.length - 1];
                openChat(lastMatch.id);
            }
        });
    }

    // ==========================================
    // LÓGICA DE MATCHES LIST
    // ==========================================
    const matchesListEl = document.getElementById('matches-list');
    const matchesBadge = document.getElementById('matches-badge');

    const updateMatchesBadge = () => {
        if (!matchesBadge) return;
        const db = getDB();
        const num = db.matches.length;
        if (num > 0) {
            matchesBadge.textContent = num;
            matchesBadge.classList.remove('hidden');
        } else {
            matchesBadge.classList.add('hidden');
        }
    };
    
    // Inicializar badge
    updateMatchesBadge();

    const renderMatchesList = () => {
        if (!matchesListEl) return;
        const db = getDB();
        matchesListEl.innerHTML = '';

        if (db.matches.length === 0) {
            matchesListEl.innerHTML = '<p style="text-align:center; color:var(--text-secondary);">Aún no tienes matches. ¡Sigue buscando!</p>';
            return;
        }

        db.matches.forEach(match => {
            const lastMsg = match.messages.length > 0 ? match.messages[match.messages.length - 1].text : '¡Es un GAKI! Envía un mensaje.';
            const matchHtml = `
                <div class="match-item" data-id="${match.id}">
                    <div class="match-item-avatar" style="background-image: url('${match.profile.img}')"></div>
                    <div class="match-item-info">
                        <h4>${match.profile.name}</h4>
                        <p>${lastMsg}</p>
                    </div>
                </div>
            `;
            matchesListEl.innerHTML += matchHtml;
        });

        // Eventos a los items
        document.querySelectorAll('.match-item').forEach(item => {
            item.addEventListener('click', () => {
                openChat(item.getAttribute('data-id'));
            });
        });
    };

    // ==========================================
    // LÓGICA DEL CHAT
    // ==========================================
    let currentActiveChatId = null;
    const chatAvatar = document.getElementById('chat-avatar');
    const chatName = document.getElementById('chat-name');
    const chatMessagesEl = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const btnSendMsg = document.getElementById('btn-send-msg');
    const btnBackMatches = document.getElementById('btn-back-matches');

    const renderMessages = () => {
        if (!currentActiveChatId) return;
        const match = getMatch(currentActiveChatId);
        if (!match) return;

        chatMessagesEl.innerHTML = '';
        match.messages.forEach(msg => {
            const msgClass = msg.sender === 'me' ? 'sent' : 'received';
            chatMessagesEl.innerHTML += `<div class="message ${msgClass}">${msg.text}</div>`;
        });
        chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;
    };

    const openChat = (matchId) => {
        const match = getMatch(matchId);
        if (!match) return;

        currentActiveChatId = matchId;
        chatAvatar.style.backgroundImage = `url('${match.profile.img}')`;
        chatName.textContent = match.profile.name;
        
        sections.matches.classList.add('hidden');
        sections.chat.classList.remove('hidden');
        
        renderMessages();
    };

    if (btnBackMatches) {
        btnBackMatches.addEventListener('click', () => {
            currentActiveChatId = null;
            sections.chat.classList.add('hidden');
            switchView('matches');
        });
    }

    const sendMsg = () => {
        const text = chatInput.value.trim();
        if (!text || !currentActiveChatId) return;

        // Yo envío el mensaje
        saveMessage(currentActiveChatId, text, 'me');
        chatInput.value = '';
        renderMessages();

        // Bot (dummy profile) responde después de 1 segundo
        const botMatchId = currentActiveChatId;
        setTimeout(() => {
            const replies = ["¡Hola!", "¡Qué interesante!", "Jaja, me encanta eso.", "Yo también pienso igual.", "¿Y a ti qué te gusta hacer?"];
            const randomReply = replies[Math.floor(Math.random() * replies.length)];
            saveMessage(botMatchId, randomReply, 'them');
            if (currentActiveChatId === botMatchId) renderMessages();
        }, 1500);
    };

    if (btnSendMsg) btnSendMsg.addEventListener('click', sendMsg);
    if (chatInput) chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMsg();
    });
});
