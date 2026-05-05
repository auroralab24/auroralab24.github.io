document.addEventListener("DOMContentLoaded", () => {
    
    // 0. Stars & Aurora now handled by aurora-engine.js (Canvas)
    
    // 1. Initialize Smooth Scroll (Lenis)
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smooth: true,
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Sync GSAP ScrollTrigger with Lenis
    if (typeof ScrollTrigger !== 'undefined') {
        lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.add((time)=>{
            lenis.raf(time * 1000);
        });
        gsap.ticker.lagSmoothing(0);
    }

    // 2. Custom Cursor & Magnetic Buttons
    const cursor = document.getElementById("cursor");
    
    // QuickTo for butter-smooth cursor tracking
    const cursorX = gsap.quickTo(cursor, "left", {duration: 0.4, ease: "power3"});
    const cursorY = gsap.quickTo(cursor, "top", {duration: 0.4, ease: "power3"});

    window.addEventListener("mousemove", (e) => {
        cursorX(e.clientX);
        cursorY(e.clientY);
        // Aurora perspective handled by aurora-engine.js canvas
    });

    const magneticBtns = document.querySelectorAll(".magnetic-btn, .project-card");

    // 3. Spotlight Border Feature (TradingView CSS Variable Tracker)
    const spotlights = document.querySelectorAll(".spotlight-card");
    window.addEventListener("mousemove", (e) => {
        spotlights.forEach(card => {
            const rect = card.getBoundingClientRect();
            // Calculate mouse position relative to the card's box
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Set CSS variables only if mouse is relatively nearby to save performance
            if(e.clientX >= rect.left - 200 && e.clientX <= rect.right + 200 &&
               e.clientY >= rect.top - 200 && e.clientY <= rect.bottom + 200) {
                card.style.setProperty('--mouse-x', `${x}px`);
                card.style.setProperty('--mouse-y', `${y}px`);
            }
        });
    });

    // 4. Removed deprecated project data modal logic.

    // 5. Elite GSAP Animations (Hidden Mask Reveal & Character Split)
    
    // Auto SplitText replacement (without premium GSAP plugin)
    const splitTexts = document.querySelectorAll(".split-text");
    splitTexts.forEach(el => {
        const text = el.innerText;
        el.innerHTML = "";
        text.split("").forEach(char => {
            const span = document.createElement("span");
            span.innerHTML = char === " " ? "&nbsp;" : char;
            span.style.display = "inline-block";
            span.style.transform = "translateY(110%)"; // initial state
            span.style.opacity = "0";
            el.appendChild(span);
        });
    });

    // Main Hero Reveal
    gsap.to(".hero-section .split-text span", {
        y: 0,
        opacity: 1,
        duration: 1.2,
        stagger: 0.04,
        ease: "power4.out",
        delay: 0.8 // delayed slightly to let aurora form
    });
    
    // 5. Volumetric 3D Logo Logic (Enhanced LAB Depth)
    const logoStack = document.getElementById("logoStack");
    if (logoStack) {
        const layers = 10; 
        const imageSrc = "images/logo_3d.png";
        logoStack.innerHTML = "";
        
        for (let i = 0; i < layers; i++) {
            const img = document.createElement("img");
            img.src = imageSrc;
            img.className = "logo-layer";
            const z = -i * 2.5; 
            const b = 1.0 - (i * 0.005);
            const a = 0.7 - (i * 0.02); // Reduced opacity back to 70%
            img.style.filter = `brightness(${Math.max(0.95, b)})`;
            img.style.opacity = Math.max(0.45, a);
            img.style.transform = `translateZ(${z}px)`;
            logoStack.appendChild(img);
        }
        
        // Entrance animation
        gsap.fromTo(logoStack, 
            { opacity: 0, scale: 0.98 },
            { opacity: 1, scale: 1, duration: 0.5, ease: "power2.out" }
        );

        // 6. Interactive 3D Tilt
        window.addEventListener('mousemove', (e) => {
            const mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
            const mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
            
            // Increased multipliers for better "up and down" motion visibility
            const targetTiltX = -mouseY * 15; 
            const targetTiltY = mouseX * 18; 
            
            gsap.to(logoStack, {
                rotateX: targetTiltX,
                rotateY: targetTiltY,
                duration: 1.5,
                ease: "power2.out",
                overwrite: "auto"
            });
        });
    }
    

    // Aurora creation animation now handled by canvas engine

    // Mask text reveals on scroll
    const textMasks = document.querySelectorAll("section:not(.hero-section) .text-mask > *");
    textMasks.forEach(text => {
        gsap.to(text, {
            scrollTrigger: {
                trigger: text.parentElement,
                start: "top 85%",
            },
            y: 0,
            duration: 1.2,
            ease: "power4.out"
        });
    });

    // Number Counters (Hero section) — 화려한 카운트업
    const counters = document.querySelectorAll('.counter');
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'));
        
        gsap.fromTo(counter, 
            { innerHTML: 0 },
            {
                scrollTrigger: {
                    trigger: ".hero-metrics",
                    start: "top 90%"
                },
                innerHTML: target,
                duration: 2.5,
                snap: { innerHTML: 1 },
                ease: "power2.out"
            }
        );
    });

    // Step cards stagger
    const pSteps = document.querySelectorAll('.p-step');
    if (pSteps.length > 0) {
        gsap.from(pSteps, {
            scrollTrigger: {
                trigger: ".process-grid",
                start: "top 80%"
            },
            y: 50,
            opacity: 0,
            duration: 0.8,
            stagger: 0.2,
            ease: "power3.out"
        });
    }

    // FAQ Accordion
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const q = item.querySelector('.faq-q');
        q.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            faqItems.forEach(i => i.classList.remove('active')); // close others
            if (!isActive) item.classList.add('active'); // toggle current
        });
    });

    // Portfolio Tab Filtering
    const pfTabs = document.querySelectorAll('.pf-tab');
    const pfCards = document.querySelectorAll('.pf-card');
    pfTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            pfTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const cat = tab.getAttribute('data-cat');
            pfCards.forEach(card => {
                if (cat === 'all' || card.getAttribute('data-cat') === cat) {
                    card.classList.remove('hidden');
                    gsap.fromTo(card, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" });
                } else {
                    card.classList.add('hidden');
                }
            });
        });
    });

    // Pain Point Items stagger reveal
    const painItems = document.querySelectorAll('.pain-item');
    if (painItems.length > 0) {
        gsap.from(painItems, {
            scrollTrigger: {
                trigger: ".pain-grid",
                start: "top 95%" // Trigger slightly later
            },
            y: 30,
            opacity: 1,
            scale: 0.98,
            duration: 0.8,
            stagger: 0.1,
            ease: "power2.out",
            clearProps: "all" // Important: Clear inline styles after animation
        });
    }

    // Solution cards stagger reveal
    const solCards = document.querySelectorAll('.sol-card');
    if (solCards.length > 0) {
        gsap.from(solCards, {
            scrollTrigger: {
                trigger: ".solution-grid",
                start: "top 95%"
            },
            y: 30,
            opacity: 1, // Start from visible state
            scale: 0.98,
            duration: 0.8,
            stagger: 0.2,
            ease: "power2.out",
            clearProps: "all"
        });
    }

    // Portfolio cards stagger reveal
    if (pfCards.length > 0) {
        gsap.from(pfCards, {
            scrollTrigger: {
                trigger: ".pf-grid",
                start: "top 95%" // Trigger earlier
            },
            y: 30,
            opacity: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: "power2.out",
            onComplete: () => {
                gsap.set(pfCards, { clearProps: "all" });
            }
        });
    }

    // Pain answer text fade in
    const painAnswer = document.querySelector('.pain-answer');
    if (painAnswer) {
        gsap.from(painAnswer, {
            scrollTrigger: {
                trigger: painAnswer,
                start: "top 90%"
            },
            y: 30,
            opacity: 0,
            duration: 1,
            ease: "power3.out"
        });
    }

    // Parallax aurora now handled by canvas engine

    // ── Spotlight Interaction (Pain Points) ──
    // ── Video Lazy Loading (Intersection Observer) ──
    const videoObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const video = entry.target;
                const src = video.getAttribute('data-src');
                if (src) {
                    video.src = src;
                    video.load();
                    video.removeAttribute('data-src'); // Avoid re-loading
                }
                observer.unobserve(video);
            }
        });
    }, {
        rootMargin: '200px' // Load 200px before reaching viewport
    });

    document.querySelectorAll('video[data-src]').forEach(v => videoObserver.observe(v));

    // ── Card Expansion Logic (Full Screen Zoom) ──
    pfCards.forEach(card => {
        card.addEventListener('click', () => {
            if (card.classList.contains('expanded')) {
                // Shrink back
                const state = card.getAttribute('data-flip-state');
                const startRect = JSON.parse(state);
                
                // Remove backdrop
                const backdrop = document.querySelector('.pf-backdrop');
                if (backdrop) {
                    gsap.to(backdrop, { opacity: 0, duration: 0.4, onComplete: () => backdrop.remove() });
                }

                // Remove Nav
                const nav = document.querySelector('.pf-exp-nav');
                if (nav) {
                    gsap.to(nav, { opacity: 0, duration: 0.3, onComplete: () => nav.remove() });
                }

                gsap.to(card, {
                    top: startRect.top,
                    left: startRect.left,
                    width: startRect.width,
                    height: startRect.height,
                    borderRadius: "16px",
                    duration: 0.6,
                    ease: "expo.inOut",
                    onComplete: () => {
                        card.classList.remove('expanded');
                        card.style.cssText = ""; // Reset
                    }
                });
            } else {
                // Expand to fit viewport height (preserving 4:5)
                const rect = card.getBoundingClientRect();
                card.setAttribute('data-flip-state', JSON.stringify({
                    top: rect.top,
                    left: rect.left,
                    width: rect.width,
                    height: rect.height
                }));

                const vh = window.innerHeight;
                const vw = window.innerWidth;
                const targetH = vh * 0.9;
                const targetW = targetH * (4/5);
                const targetT = (vh - targetH) / 2;
                const targetL = (vw - targetW) / 2;

                // Create backdrop
                const backdrop = document.createElement('div');
                backdrop.className = 'pf-backdrop';
                document.body.appendChild(backdrop);
                gsap.to(backdrop, { opacity: 1, duration: 0.5 });

                // Create Navigation Arrows
                const navContainer = document.createElement('div');
                navContainer.className = 'pf-exp-nav';
                navContainer.innerHTML = `
                    <div class="pf-nav-btn prev"><span><</span></div>
                    <div class="pf-nav-btn next"><span>></span></div>
                `;
                document.body.appendChild(navContainer);

                // Set initial fixed styles
                card.style.position = 'fixed';
                card.style.top = rect.top + 'px';
                card.style.left = rect.left + 'px';
                card.style.width = rect.width + 'px';
                card.style.height = rect.height + 'px';
                card.style.zIndex = '9999';
                card.classList.add('expanded');

                gsap.to(card, {
                    top: targetT,
                    left: targetL,
                    width: targetW,
                    height: targetH,
                    borderRadius: "24px",
                    duration: 0.8,
                    ease: "expo.out",
                    onComplete: () => {
                        gsap.to(navContainer, { opacity: 1, duration: 0.4 });
                    }
                });

                // Slider Logic
                let currentIndex = 0;
                const wrapper = card.querySelector('.video-slider-wrapper');
                const videos = wrapper.querySelectorAll('video');
                const videoCount = videos.length;

                const updateSlider = () => {
                    gsap.to(wrapper, { x: `-${currentIndex * (100 / videoCount)}%`, duration: 0.6, ease: "power2.inOut" });
                    // Ensure the video is loaded and playing
                    const targetVideo = videos[currentIndex];
                    if (targetVideo.getAttribute('data-src')) {
                        targetVideo.src = targetVideo.getAttribute('data-src');
                        targetVideo.load();
                        targetVideo.removeAttribute('data-src');
                    }
                };

                navContainer.querySelector('.next').addEventListener('click', (e) => {
                    e.stopPropagation();
                    currentIndex = (currentIndex + 1) % videoCount;
                    updateSlider();
                });

                navContainer.querySelector('.prev').addEventListener('click', (e) => {
                    e.stopPropagation();
                    currentIndex = (currentIndex - 1 + videoCount) % videoCount;
                    updateSlider();
                });

                // Close on backdrop click
                backdrop.addEventListener('click', () => {
                    gsap.to(navContainer, { opacity: 0, duration: 0.3, onComplete: () => navContainer.remove() });
                    card.click();
                });
            }
        });
    });

});
