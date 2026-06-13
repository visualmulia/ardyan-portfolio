// Main entry point for website interactive features (Dribbble Redesign)

document.addEventListener('DOMContentLoaded', () => {
    // 1. Mobile Menu Toggle
    const menuToggle = document.getElementById('menu-toggle');
    const navLinks = document.getElementById('nav-links');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            menuToggle.classList.toggle('active');
        });

        // Close menu on link click
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                menuToggle.classList.remove('active');
            });
        });
    }

    // 2. Cursor Glow Effect
    const cursorGlow = document.getElementById('custom-cursor-glow');
    if (cursorGlow) {
        document.addEventListener('mousemove', (e) => {
            cursorGlow.style.left = `${e.clientX}px`;
            cursorGlow.style.top = `${e.clientY}px`;
        });
    }

    // 3. Header Scroll & Section Color Tracking (Dynamic Light/Dark Header)
    const header = document.getElementById('main-header');
    
    // Add glassmorphic background on scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 40) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Intersection Observer to detect when header overlaps dark sections
    const darkSections = document.querySelectorAll('.section-dark');
    const headerObserverOptions = {
        root: null,
        // Trigger when the section is at the very top of the viewport (matching header height)
        rootMargin: "-80px 0px 0px 0px",
        threshold: 0
    };

    const headerObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            // If a dark section is intersecting the top area, set body class
            if (entry.isIntersecting) {
                document.body.classList.add('dark-header');
            } else {
                // Check if any other dark section is still intersecting before removing
                const activeDarkSections = Array.from(darkSections).some(sec => {
                    const rect = sec.getBoundingClientRect();
                    return rect.top <= 80 && rect.bottom >= 0;
                });
                if (!activeDarkSections) {
                    document.body.classList.remove('dark-header');
                }
            }
        });
    }, headerObserverOptions);

    darkSections.forEach(section => headerObserver.observe(section));


    // 4. Interactive FAQ Accordion Logic
    const faqCards = document.querySelectorAll('.faq-card');
    
    faqCards.forEach(card => {
        const headerEl = card.querySelector('.faq-header');
        const bodyEl = card.querySelector('.faq-body');
        const iconEl = card.querySelector('.faq-toggle-icon i');

        headerEl.addEventListener('click', () => {
            const isActive = card.classList.contains('active');

            // Collapse all other FAQ cards
            faqCards.forEach(otherCard => {
                if (otherCard !== card) {
                    otherCard.classList.remove('active');
                    otherCard.querySelector('.faq-body').style.maxHeight = null;
                    otherCard.querySelector('.faq-toggle-icon i').className = 'fas fa-plus';
                }
            });

            // Toggle current card
            if (isActive) {
                card.classList.remove('active');
                bodyEl.style.maxHeight = null;
                iconEl.className = 'fas fa-plus';
            } else {
                card.classList.add('active');
                bodyEl.style.maxHeight = bodyEl.scrollHeight + 'px';
                iconEl.className = 'fas fa-plus'; // Rotated in CSS via container class
            }
        });
    });


    // 5. Portfolio Dynamic Filtering and Card Renderer
    const projectsGrid = document.getElementById('projects-grid');
    const filterButtons = document.querySelectorAll('.filter-btn');
    let projectsList = [];

    async function loadProjects() {
        try {
            const response = await fetch('data/projects.json');
            const data = await response.json();
            projectsList = data.items || [];
            renderProjects();
        } catch (error) {
            console.error("Failed to load projects data:", error);
        }
    }

    function renderProjects(filter = 'all') {
        if (!projectsGrid) return;
        projectsGrid.innerHTML = '';

        // Filter projects
        const filteredProjects = projectsList.filter(p => filter === 'all' || p.category === filter);

        filteredProjects.forEach((proj, idx) => {
            const card = document.createElement('div');
            card.className = 'project-card-wrapper';
            card.setAttribute('data-id', proj.id);
            card.setAttribute('data-tilt', ''); // Setup vanilla-tilt
            card.style.animationDelay = `${idx * 0.1}s`;

            // Prepare metrics HTML
            let metricsHtml = '';
            if (proj.metrics) {
                if (proj.metrics.m1_key && proj.metrics.m1_val) {
                    metricsHtml += `
                        <div class="metric-item">
                            <span class="metric-val">${proj.metrics.m1_val}</span>
                            <span class="metric-label">${proj.metrics.m1_key}</span>
                        </div>
                    `;
                }
                if (proj.metrics.m2_key && proj.metrics.m2_val) {
                    metricsHtml += `
                        <div class="metric-item">
                            <span class="metric-val">${proj.metrics.m2_val}</span>
                            <span class="metric-label">${proj.metrics.m2_key}</span>
                        </div>
                    `;
                }
            }

            card.innerHTML = `
                <div class="project-card">
                    <div class="project-card-image" style="background-image: url('${proj.image}')">
                        <div class="project-card-category">${proj.categoryLabel}</div>
                    </div>
                    <div class="project-card-content">
                        <div>
                            <h3>${proj.title}</h3>
                            <p>${proj.shortDescription}</p>
                        </div>
                        <div class="project-card-metrics">
                            ${metricsHtml}
                        </div>
                    </div>
                </div>
            `;

            card.addEventListener('click', () => openProjectModal(proj));
            projectsGrid.appendChild(card);
        });

        // Initialize VanillaTilt if available
        if (window.VanillaTilt) {
            VanillaTilt.init(document.querySelectorAll("[data-tilt]"), {
                max: 10,
                speed: 400,
                glare: true,
                "max-glare": 0.1,
            });
        }
    }

    // Modal Details Control
    const modal = document.getElementById('project-modal');
    const modalClose = document.getElementById('modal-close');

    function openProjectModal(proj) {
        if (!modal) return;

        document.getElementById('modal-title').textContent = proj.title;
        document.getElementById('modal-cat-label').textContent = proj.categoryLabel;
        document.getElementById('modal-desc').textContent = proj.description;
        
        const modalImg = document.getElementById('modal-img');
        if (modalImg) modalImg.style.backgroundImage = `url('${proj.image}')`;

        // Populate Tech Tags
        const techContainer = document.getElementById('modal-tech');
        if (techContainer) {
            techContainer.innerHTML = '';
            proj.techStack.forEach(t => {
                const tag = document.createElement('span');
                tag.className = 'tech-tag';
                tag.textContent = t;
                techContainer.appendChild(tag);
            });
        }

        // Populate Metrics
        const metricsContainer = document.getElementById('modal-metrics-detail');
        if (metricsContainer) {
            metricsContainer.innerHTML = '';
            if (proj.metrics) {
                const mKeys = ['m1', 'm2', 'm3'];
                mKeys.forEach(prefix => {
                    const label = proj.metrics[`${prefix}_key`];
                    const val = proj.metrics[`${prefix}_val`];
                    if (label && val) {
                        const mCard = document.createElement('div');
                        mCard.className = 'modal-metric-card';
                        mCard.innerHTML = `
                            <div class="modal-metric-lbl">${label}</div>
                            <div class="modal-metric-val">${val}</div>
                        `;
                        metricsContainer.appendChild(mCard);
                    }
                });
            }
        }

        // Setup live preview links
        const liveBtn = document.getElementById('modal-live-link');
        const gitBtn = document.getElementById('modal-git-link');
        if (liveBtn) liveBtn.href = proj.liveUrl || '#';
        if (gitBtn) gitBtn.href = proj.githubUrl || '#';

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    if (modalClose) {
        modalClose.addEventListener('click', () => {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        });
    }

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }

    // Filter Buttons binding
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderProjects(btn.getAttribute('data-filter'));
        });
    });

    // Initial load run
    loadProjects();


    // 6. Conversational Form Submissions
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = document.getElementById('contact-name').value;
            const email = document.getElementById('contact-email').value;
            const service = document.getElementById('contact-service').value;
            const message = document.getElementById('contact-message').value;

            if (!name || !email || !message) {
                alert('Please fill in all required fields.');
                return;
            }

            // Fire confetti particles
            if (window.confetti) {
                confetti({
                    particleCount: 100,
                    spread: 75,
                    origin: { y: 0.6 },
                    colors: ['#c5ff00', '#ffffff', '#080c14']
                });
            }

            // Construct Whatsapp message API URL
            const whatsappNumber = "6281289653355"; // Ardyan WhatsApp Link
            let text = `*New Lead from Ardyan.dev*\n\n`;
            text += `*Name:* ${name}\n`;
            text += `*Email:* ${email}\n`;
            text += `*Requested Service:* ${service}\n\n`;
            text += `*Message Details:*\n${message}`;

            const encodedText = encodeURIComponent(text);
            const waUrl = `https://wa.me/${whatsappNumber}?text=${encodedText}`;

            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Submitting...`;

            setTimeout(() => {
                submitBtn.innerHTML = `<i class="fas fa-check"></i> Redirecting...`;
                window.open(waUrl, '_blank');

                contactForm.reset();
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }, 1000);
        });
    }

    // 7. Scroll Reveal Observer animations
    const revealElements = document.querySelectorAll('.reveal');
    const observerOptions = {
        threshold: 0.12,
        rootMargin: "0px 0px -40px 0px"
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    revealElements.forEach(el => revealObserver.observe(el));
});
