document.addEventListener('DOMContentLoaded', () => {
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

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            // Animación de salida del formulario
            formSection.style.animation = 'fadeInUp 0.5s ease-in reverse both';

            setTimeout(() => {
                formSection.classList.add('hidden');
                successSection.classList.remove('hidden');

                // Recopilar datos (simulado para demostración)
                const name = document.getElementById('name').value;
                const gender = document.getElementById('gender').value;
                const lookingFor = document.getElementById('looking-for').value;
                const musicTags = Array.from(document.getElementById('music-tags').querySelectorAll('.selected')).map(t => t.dataset.value);
                const weekendTags = Array.from(document.getElementById('weekend-tags').querySelectorAll('.selected')).map(t => t.dataset.value);
                const passion = document.getElementById('passion').value;
                const photo = fileInput.files.length > 0 ? fileInput.files[0].name : null;

                console.log('Perfil GAKI creado:', {
                    name,
                    gender,
                    lookingFor,
                    photo,
                    tastes: {
                        music: musicTags,
                        weekend: weekendTags,
                        passion: passion
                    }
                });

                setTimeout(() => {
                    successSection.classList.add('hidden');
                    discoverySection.classList.remove('hidden');
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

    if (btnKeepSwiping) {
        btnKeepSwiping.addEventListener('click', () => {
            matchOverlay.classList.add('hidden');
        });
    }

    const resetCard = () => {
        matchCard.style.transition = 'transform 0.4s ease, opacity 0.4s ease';
        matchCard.style.transform = 'translateX(0) rotate(0)';
        matchCard.style.opacity = '1';
        badgeLike.style.opacity = '0';
        badgeNope.style.opacity = '0';
    };

    const triggerMatch = () => {
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
            // 50% de probabilidad de hacer Match para la demo
            if (Math.random() > 0.5) triggerMatch();
        } else {
            badgeNope.style.opacity = '1';
        }

        setTimeout(() => {
            matchCard.style.transition = 'none';
            matchCard.style.transform = 'scale(0.95)';
            matchCard.style.opacity = '0';
            badgeLike.style.opacity = '0';
            badgeNope.style.opacity = '0';

            setTimeout(resetCard, 100);
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
    }
});
