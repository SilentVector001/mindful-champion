// ===== DOM Elements =====
const navbar = document.getElementById('navbar');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileMenu = document.getElementById('mobileMenu');
const carouselTrack = document.getElementById('carouselTrack');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const carouselDots = document.getElementById('carouselDots');

// ===== Navbar Scroll Effect =====
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// ===== Mobile Menu Toggle =====
mobileMenuBtn?.addEventListener('click', () => {
    mobileMenu.classList.toggle('active');
    mobileMenuBtn.classList.toggle('active');
});

// Close mobile menu when clicking a link
mobileMenu?.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        mobileMenu.classList.remove('active');
        mobileMenuBtn.classList.remove('active');
    });
});

// ===== Video Carousel =====
const videoCards = carouselTrack?.querySelectorAll('.video-card') || [];
let currentSlide = 0;
const totalSlides = videoCards.length;

// Create dots
if (carouselDots && totalSlides > 0) {
    for (let i = 0; i < totalSlides; i++) {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        if (i === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToSlide(i));
        carouselDots.appendChild(dot);
    }
}

function updateDots() {
    const dots = carouselDots?.querySelectorAll('.dot') || [];
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentSlide);
    });
}

function goToSlide(index) {
    currentSlide = index;
    if (videoCards[index]) {
        videoCards[index].scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
    }
    updateDots();
}

prevBtn?.addEventListener('click', () => {
    currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
    goToSlide(currentSlide);
});

nextBtn?.addEventListener('click', () => {
    currentSlide = (currentSlide + 1) % totalSlides;
    goToSlide(currentSlide);
});

// ===== Scroll Animations =====
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

const animateOnScroll = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

document.querySelectorAll('[data-animate]').forEach(el => {
    animateOnScroll.observe(el);
});

// ===== Animate Progress Bars on Scroll =====
const chartBars = document.querySelectorAll('.chart-bar');
const chartObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const bar = entry.target.querySelector('.bar-fill');
            const value = entry.target.dataset.value;
            if (bar) {
                bar.style.height = value + '%';
            }
        }
    });
}, { threshold: 0.5 });

chartBars.forEach(bar => chartObserver.observe(bar));

// ===== Smooth Scroll for Anchor Links =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href !== '#') {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                const navHeight = navbar?.offsetHeight || 80;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight;
                window.scrollTo({ top: targetPosition, behavior: 'smooth' });
            }
        }
    });
});

// ===== Parallax Effect on Hero =====
window.addEventListener('scroll', () => {
    const heroImg = document.querySelector('.hero-bg-img');
    if (heroImg && window.scrollY < window.innerHeight) {
        const offset = window.scrollY * 0.4;
        heroImg.style.transform = `scale(1.1) translateY(${offset}px)`;
    }
});

console.log('Mindful Champion Landing Page Loaded ✅');