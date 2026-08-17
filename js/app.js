/* ========================================
   Yağmur'S GALAXY: LOVE STORY EDITION v8.0
   Düzeltilmiş - İki Aşamalı Sistem
   ======================================== */

// Global değişkenler
let currentStar = 1;
let isModalOpen = false;
let canvas, ctx;
let stars = [];
let meteors = [];
let sparkles = [];
let musicStarted = false;
let isMobile = window.innerWidth <= 768;
let animationFrameId = null;
let lastFrameTime = 0;
const TARGET_FPS = isMobile ? 30 : 60;
const FRAME_INTERVAL = 1000 / TARGET_FPS;
const DRAGDROP_TARGET = 'Yağmur';
const whisperLines = [
    'Sen gulumseyince, evren biraz daha aydinlaniyor…',
    'Kalbimin en sakin yeri, hep senin adina cikiyor…',
    'Bu gece gokyuzunde ne varsa, hepsi sana benziyor…',
    'Bazi insanlar guzel olur, sen ise huzur oluyorsun…',
    'En guzel tesadufum: her seyin sonunda yine sen…'
];

// Ses nesneleri
const bgMusic = document.getElementById('love-story');

// Sayfa yüklendiğinde
window.onload = function() {
    initCanvas();
    animateCanvas();
    initLoveWhisper();
    
    // İlk kullanıcı etkileşiminde müziği başlat.
    // iOS'ta ilk jest için touchend daha güvenilir tetiklenir.
    const startMusic = () => {
        if (!musicStarted && bgMusic) {
            bgMusic.volume = 0.25;
            bgMusic.play().catch(() => {});
            musicStarted = true;
        }
        document.removeEventListener('click', startMusic);
        document.removeEventListener('touchend', startMusic);
    };
    document.addEventListener('click', startMusic);
    document.addEventListener('touchend', startMusic);
};

function initLoveWhisper() {
    const whisperEl = document.getElementById('love-whisper');
    if (!whisperEl) return;

    let index = 0;
    setInterval(() => {
        // Hero gizliyken boşuna çalışma
        const hero = document.getElementById('hero');
        if (hero && hero.style.display === 'none') return;

        whisperEl.classList.add('fade-out');
        setTimeout(() => {
            index = (index + 1) % whisperLines.length;
            whisperEl.textContent = whisperLines[index];
            whisperEl.classList.remove('fade-out');
        }, 480);
    }, 4600);
}

// ========================================
// 🎵 MÜZİK KONTROL
// ========================================
function toggleMusic() {
    const btn = document.getElementById('music-btn');
    if (!bgMusic) return;

    bgMusic.muted = !bgMusic.muted;
    if (btn) btn.classList.toggle('muted', bgMusic.muted);
}

// ========================================
// 💥 SÜPERNOVA ANİMASYONU
// ========================================
function playSupernova(x, y) {
    const sound = new Audio('sounds/supernova.mp3');
    sound.volume = 0.3;
    sound.play().catch(e => {});
    
    const nova = document.createElement('div');
    nova.className = 'mini-supernova';
    nova.style.left = x + 'px';
    nova.style.top = y + 'px';
    document.body.appendChild(nova);
    
    for (let i = 0; i < 12; i++) {
        const particle = document.createElement('div');
        particle.className = 'nova-particle';
        particle.style.setProperty('--angle', (i * 30) + 'deg');
        particle.style.setProperty('--color', ['#fbbf24', '#9333ea', '#ffffff'][i % 3]);
        nova.appendChild(particle);
    }
    
    setTimeout(() => nova.remove(), 800);
}

// ========================================
// 🌌 CANVAS ARKAPLAN
// ========================================
function initCanvas() {
    canvas = document.getElementById('star-canvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');


    // Canvas optimizasyonu
    ctx.imageSmoothingEnabled = false;
    
    resizeCanvas();
    window.addEventListener('resize', () => {
        isMobile = window.innerWidth <= 768;
        resizeCanvas();
    }, { passive: true });
    
    // Mobil'de daha az yıldız performans için
    const starCount = isMobile ? 80 : 150;
    const meteorCount = isMobile ? 2 : 3;
    const sparkleCount = isMobile ? 10 : 20;
    
    for (let i = 0; i < starCount; i++) stars.push(new Star());
    for (let i = 0; i < meteorCount; i++) meteors.push(new Meteor());
    for (let i = 0; i < sparkleCount; i++) sparkles.push(new Sparkle());
}

function resizeCanvas() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    // Canvas boyutu değişince context ayarları sıfırlanır
    if (ctx) ctx.imageSmoothingEnabled = false;
}

// Renkli yıldız sınıfı
class Star {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2.5 + 0.5; // 0 olursa gradient yarıçapı 0 olur
        this.speed = Math.random() * 0.3 + 0.1;
        this.brightness = Math.random();
        this.color = this.getRandomColor();
        this.twinkleSpeed = Math.random() * 0.02 + 0.01;
        this.twinklePhase = Math.random() * Math.PI * 2;
    }
    
    getRandomColor() {
        const colors = [
            [255, 255, 255], // Beyaz
            [192, 132, 252], // Mor
            [255, 215, 0],   // Altın
            [255, 182, 193], // Pembe
            [147, 51, 234],  // Koyu mor
            [255, 255, 224]  // Açık sarı
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    update() {
        this.y += this.speed;
        // Birikmeli toplama yerine faz kullan; aksi halde parlaklık
        // sınıra dayanıp sabitleniyor ve yıldızlar parlamayı bırakıyor
        this.twinklePhase += this.twinkleSpeed;
        this.brightness = 0.6 + Math.sin(this.twinklePhase) * 0.4;
        if (this.y > canvas.height) {
            this.y = 0;
            this.x = Math.random() * canvas.width;
        }
    }
    draw() {
        const alpha = this.brightness;
        const [r, g, b] = this.color;
        
        // Dış parıltı
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 4);
        gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${alpha})`);
        gradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${alpha * 0.3})`);
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 4, 0, Math.PI * 2);
        ctx.fill();
        
        // Merkez parıltı
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 0.8, 0, Math.PI * 2);
        ctx.fill();
    }
}

// ✨ Renkli parıltı sınıfı
class Sparkle {
    constructor() {
        this.reset();
    }
    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1;
        this.life = 0;
        this.maxLife = Math.random() * 100 + 50;
        this.color = [
            [255, 215, 0],   // Altın
            [192, 132, 252], // Mor
            [255, 255, 255], // Beyaz
            [255, 105, 180]  // Pembe
        ][Math.floor(Math.random() * 4)];
    }
    update() {
        this.life++;
        if (this.life > this.maxLife) this.reset();
    }
    draw() {
        const progress = this.life / this.maxLife;
        const alpha = Math.sin(progress * Math.PI);
        const [r, g, b] = this.color;
        
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        ctx.beginPath();
        
        // Yıldız şekli
        for (let i = 0; i < 5; i++) {
            const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
            const x = this.x + Math.cos(angle) * this.size;
            const y = this.y + Math.sin(angle) * this.size;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        
        // Parıltı
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha * 0.5})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 2, 0, Math.PI * 2);
        ctx.fill();
    }
}

class Meteor {
    constructor() {
        this.reset();
    }
    reset() {
        this.x = Math.random() * canvas.width;
        this.y = -100;
        this.speed = Math.random() * 4 + 3;
        this.angle = Math.random() * Math.PI / 4 + Math.PI / 4;
        this.active = false;
        this.color = [
            [255, 255, 255], // Beyaz
            [192, 132, 252], // Mor
            [255, 215, 0],   // Altın
            [255, 182, 193]  // Pembe
        ][Math.floor(Math.random() * 4)];
        this.length = Math.random() * 80 + 60;
    }
    update() {
        if (!this.active && Math.random() < 0.002) this.active = true;
        if (this.active) {
            this.x += Math.cos(this.angle) * this.speed;
            this.y += Math.sin(this.angle) * this.speed;
            if (this.y > canvas.height || this.x > canvas.width) this.reset();
        }
    }
    draw() {
        if (!this.active) return;
        const [r, g, b] = this.color;
        const gradient = ctx.createLinearGradient(
            this.x, this.y, 
            this.x - Math.cos(this.angle) * this.length, 
            this.y - Math.sin(this.angle) * this.length
        );
        gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 1)`);
        gradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, 0.5)`);
        gradient.addColorStop(1, 'transparent');
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x - Math.cos(this.angle) * this.length, this.y - Math.sin(this.angle) * this.length);
        ctx.stroke();
        
        // Meteor başlığı parıltı
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 1)`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
        ctx.fill();
    }
}

function animateCanvas(currentTime) {
    animationFrameId = requestAnimationFrame(animateCanvas);

    if (!ctx || !canvas) return;

    // İlk çağrı elle yapıldığında currentTime undefined gelir -> NaN
    if (typeof currentTime !== 'number') return;

    // Frame rate kontrolü
    const deltaTime = currentTime - lastFrameTime;
    if (deltaTime < FRAME_INTERVAL) return;
    lastFrameTime = currentTime - (deltaTime % FRAME_INTERVAL);
    
    // Sadece görünür alanı temizle (optimizasyon)
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Yıldızları çiz
    for (let i = 0; i < stars.length; i++) {
        stars[i].update();
        stars[i].draw();
    }
    
    // Parıltıları çiz
    for (let i = 0; i < sparkles.length; i++) {
        sparkles[i].update();
        sparkles[i].draw();
    }
    
    // Meteorları çiz
    for (let i = 0; i < meteors.length; i++) {
        meteors[i].update();
        meteors[i].draw();
    }
}

// ========================================
// 🎮 GALAKSİ BAŞLAT
// ========================================
function startGalaxy() {
    const hero = document.getElementById('hero');
    const galaxy = document.getElementById('galaxy-map');
    if (!hero || !galaxy) return;

    hero.classList.add('hero-fade-out');
    setTimeout(() => {
        hero.style.display = 'none';
        galaxy.style.display = 'block';
        renderStars();
        initRomanticEffects();
    }, 650);
}

// ========================================
// 💕 ROMANTİK EFEKTLERİ BAŞLAT
// ========================================
let romanticEffectsStarted = false;

function initRomanticEffects() {
    // İki kez çalışırsa tüm arka plan elemanları ve interval'lar kopyalanır
    if (romanticEffectsStarted) return;
    romanticEffectsStarted = true;

    // Mobil'de bazı efektleri atla performans için

    // Sürekli arka plan kalp yağmuru (her cihazda)
    startFloatingHearts();
    
    // Mouse parıltı efekti (sadece desktop)
    if (!isMobile) initCursorTrail();
    
    // Galaksi ambiyans ışığı (her cihazda)
    createGalaxyGlow();
    
    // Işık huzmeleri (sadece desktop)
    if (!isMobile) createLightRays();
    
    // Bokeh efekti (daha az mobil'de)
    createBokehEffects();
    
    // Nebula efekti (her cihazda)
    createNebula();
    
    // Yaprak düşüşü (daha seyrek mobil'de)
    startFallingPetals();
    
    // Müzik notaları (sadece desktop)
    if (!isMobile) startMusicNotes();
    
    // Animasyonlu arka plan (her cihazda)
    createAnimatedBackground();
}

// 🌈 Animasyonlu Arka Plan
function createAnimatedBackground() {
    const bg = document.createElement('div');
    bg.className = 'animated-bg';
    document.body.insertBefore(bg, document.body.firstChild);
}

// 🌟 Işık Huzmeleri
function createLightRays() {
    for (let i = 0; i < 5; i++) {
        const ray = document.createElement('div');
        ray.className = 'light-ray';
        ray.style.left = (20 + i * 15) + '%';
        ray.style.animationDelay = (i * 4) + 's';
        ray.style.animationDuration = (20 + i * 5) + 's';
        document.body.appendChild(ray);
    }
}

// 🔮 Bokeh Efekti
function createBokehEffects() {
    const colors = ['rgba(147, 51, 234, 0.4)', 'rgba(192, 132, 252, 0.3)', 'rgba(255, 255, 255, 0.3)', 'rgba(255, 182, 193, 0.3)'];
    const count = isMobile ? 4 : 8; // Mobil'de daha az
    
    for (let i = 0; i < count; i++) {
        const bokeh = document.createElement('div');
        bokeh.className = 'bokeh';
        bokeh.style.width = (Math.random() * 100 + 50) + 'px';
        bokeh.style.height = bokeh.style.width;
        bokeh.style.left = Math.random() * 100 + '%';
        bokeh.style.top = Math.random() * 100 + '%';
        bokeh.style.background = colors[Math.floor(Math.random() * colors.length)];
        bokeh.style.animationDelay = (Math.random() * 10) + 's';
        bokeh.style.animationDuration = (15 + Math.random() * 10) + 's';
        document.body.appendChild(bokeh);
    }
}

// 💫 Nebula Efekti
function createNebula() {
    for (let i = 0; i < 3; i++) {
        const nebula = document.createElement('div');
        nebula.className = 'nebula';
        nebula.style.left = (Math.random() * 60 + 20) + '%';
        nebula.style.top = (Math.random() * 60 + 20) + '%';
        nebula.style.animationDelay = (i * 7) + 's';
        document.body.appendChild(nebula);
    }
}

// Galaksi haritası görünür mü? (efekt döngüleri boşuna çalışmasın)
function isGalaxyVisible() {
    const map = document.getElementById('galaxy-map');
    return !!map && map.style.display !== 'none';
}

// 🌸 Yaprak Düşüşü
function startFallingPetals() {
    const petals = ['🌸', '🌺', '🌹', '🌷', '🌼'];
    const interval = isMobile ? 6000 : 3500; // Mobil'de daha seyrek
    
    setInterval(() => {
        if (!isGalaxyVisible()) return;
        
        const petal = document.createElement('div');
        petal.className = 'falling-petal';
        petal.textContent = petals[Math.floor(Math.random() * petals.length)];
        petal.style.left = Math.random() * 100 + '%';
        petal.style.animationDuration = (Math.random() * 3 + 4) + 's';
        petal.style.fontSize = (Math.random() * 10 + 15) + 'px';
        document.body.appendChild(petal);
        
        setTimeout(() => petal.remove(), 7000);
    }, interval);
}

// 🎵 Müzik Notaları
function startMusicNotes() {
    const notes = ['♪', '♫', '♬', '♩'];
    
    setInterval(() => {
        if (!isGalaxyVisible()) return;
        
        const note = document.createElement('div');
        note.className = 'floating-note';
        note.textContent = notes[Math.floor(Math.random() * notes.length)];
        note.style.left = Math.random() * 80 + 10 + '%';
        note.style.bottom = '10%';
        note.style.color = ['#c084fc', '#fbbf24', '#ffffff'][Math.floor(Math.random() * 3)];
        note.style.animationDuration = (Math.random() * 2 + 3) + 's';
        document.body.appendChild(note);
        
        setTimeout(() => note.remove(), 5000);
    }, 4000);
}

// 🌸 Sürekli Arka Plan Kalp Yağmuru
function startFloatingHearts() {
    const interval = isMobile ? 3500 : 2000; // Mobil'de daha seyrek
    
    setInterval(() => {
        if (!isGalaxyVisible()) return;
        
        const heart = document.createElement('div');
        heart.className = 'floating-heart';
        heart.textContent = ['🤍', '💜', '✨', '💫'][Math.floor(Math.random() * 4)];
        heart.style.left = Math.random() * 100 + '%';
        heart.style.animationDuration = (Math.random() * 4 + 6) + 's';
        heart.style.fontSize = (Math.random() * 15 + 15) + 'px';
        document.body.appendChild(heart);
        
        setTimeout(() => heart.remove(), 10000);
    }, interval);
}

// 💫 Mouse Parıltı Efekti
function initCursorTrail() {
    let lastX = 0, lastY = 0;
    let throttle = false;
    
    document.addEventListener('mousemove', (e) => {
        if (throttle) return;
        
        const dist = Math.hypot(e.clientX - lastX, e.clientY - lastY);
        if (dist > 30) {
            throttle = true;
            createCursorTrail(e.clientX, e.clientY);
            lastX = e.clientX;
            lastY = e.clientY;
            setTimeout(() => throttle = false, 50);
        }
    }, { passive: true });
}

function createCursorTrail(x, y) {
    const trail = document.createElement('div');
    trail.className = 'cursor-trail';
    trail.style.left = x + 'px';
    trail.style.top = y + 'px';
    document.body.appendChild(trail);
    
    setTimeout(() => trail.remove(), 1000);
}

// 🌙 Galaksi Ambiyans Işıltısı
function createGalaxyGlow() {
    const glow = document.createElement('div');
    glow.className = 'galaxy-glow';
    glow.style.left = '50%';
    glow.style.top = '50%';
    glow.style.transform = 'translate(-50%, -50%)';
    document.body.appendChild(glow);
}

// ========================================
// ⭐ YILDIZLARI RENDER ET
// ========================================
function renderStars() {
    const container = document.getElementById('stars-container');
    if (!container) return;
    container.innerHTML = '';
    
    starsData.forEach((star, index) => {
        const starEl = document.createElement('div');
        const starNum = index + 1;
        
        let classes = 'star-point';
        if (starNum === currentStar) classes += ' active';
        else if (starNum < currentStar) classes += ' completed';
        else classes += ' locked';
        
        if (star.isSpecial) classes += ' love-star';
        if (star.isGolden) classes += ' golden-star';
        if (star.isFinal) classes += ' future-star';
        
        starEl.className = classes;
        // Açılan yıldızlara ✦ sembolü, diğerlerine numara
        if (starNum < currentStar) {
            starEl.innerHTML = '✦';
        } else {
            starEl.innerHTML = starNum;
        }
        starEl.style.top = star.position.top;
        starEl.style.left = star.position.left;
        
        // Hover efektleri (dokunmatik cihazlarda gereksiz)
        if (!isMobile) {
            starEl.addEventListener('mouseenter', () => {
                createHoverSparkles(starEl);
                if (starNum === currentStar) {
                    createClickRipple(starEl);
                }
            });
        }
        
        if (starNum === currentStar) {
            starEl.onclick = (e) => {
                // Yıldız parlama efekti
                starEl.classList.add('star-opening');
                setTimeout(() => starEl.classList.remove('star-opening'), 800);
                
                const rect = starEl.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                
                playSupernova(centerX, centerY);
                createHeartBurst(centerX, centerY);
                createSuperSparkle(centerX, centerY);
                createClickRippleEffect(centerX, centerY);
                
                const chime = new Audio('sounds/unlock-chime.mp3');
                chime.volume = 0.5;
                chime.play().catch(e => {});
                
                setTimeout(() => openStar(star), 200);
            };
            
            // Aktif yıldıza dönen halka ekle
            addStarRing(starEl);
            
            // Kalp atışı efekti
            starEl.classList.add('heartbeat');
        }
        
        // Açık yıldızlara parçacık efekti ekle
        if (starNum < currentStar) {
            addStarParticles(starEl);
            // Açık yıldızlara süper parıltı ekle
            addSuperSparkleToCompleted(starEl);
        }
        
        container.appendChild(starEl);
    });
}

// 💫 Yıldız Etrafına Dönen Halka Ekle
function addStarRing(starEl) {
    const ring = document.createElement('div');
    ring.className = 'star-ring';
    ring.style.width = '80px';
    ring.style.height = '80px';
    ring.style.top = '50%';
    ring.style.left = '50%';
    starEl.appendChild(ring);
}

// ✨ Yıldız Etrafına Parçacık Ekle
function addStarParticles(starEl) {
    const particleContainer = document.createElement('div');
    particleContainer.className = 'star-particles';
    
    for (let i = 0; i < 4; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        const angle = (i / 4) * Math.PI * 2;
        const distance = 25;
        particle.style.left = '50%';
        particle.style.top = '50%';
        particle.style.setProperty('--moveX', Math.cos(angle) * distance + 'px');
        particle.style.setProperty('--moveY', Math.sin(angle) * distance + 'px');
        particle.style.animationDelay = (i * 0.5) + 's';
        particleContainer.appendChild(particle);
    }
    
    starEl.appendChild(particleContainer);
}

// 💕 Kalp Patlama Efekti
function createHeartBurst(x, y) {
    const hearts = ['🤍', '💜', '✨', '💫', '⭐'];
    const count = 8;
    
    for (let i = 0; i < count; i++) {
        const heart = document.createElement('div');
        heart.className = 'heart-burst';
        heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
        heart.style.left = x + 'px';
        heart.style.top = y + 'px';
        
        const angle = (i / count) * Math.PI * 2;
        const distance = 50 + Math.random() * 50;
        heart.style.setProperty('--tx', Math.cos(angle) * distance + 'px');
        heart.style.setProperty('--ty', Math.sin(angle) * distance + 'px');
        heart.style.animationDelay = (Math.random() * 0.2) + 's';
        
        document.body.appendChild(heart);
        setTimeout(() => heart.remove(), 1500);
    }
}

// ✨ Hover Parıltıları
function createHoverSparkles(starEl) {
    const rect = starEl.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    for (let i = 0; i < 6; i++) {
        setTimeout(() => {
            const sparkle = document.createElement('div');
            sparkle.style.cssText = `
                position: fixed;
                width: 4px;
                height: 4px;
                background: radial-gradient(circle, #ffffff, #c084fc);
                border-radius: 50%;
                left: ${centerX}px;
                top: ${centerY}px;
                pointer-events: none;
                z-index: 100;
                animation: hoverSparkle 1s ease-out forwards;
            `;
            
            const angle = (i / 6) * Math.PI * 2;
            const distance = 40;
            sparkle.style.setProperty('--endX', Math.cos(angle) * distance + 'px');
            sparkle.style.setProperty('--endY', Math.sin(angle) * distance + 'px');
            
            document.body.appendChild(sparkle);
            setTimeout(() => sparkle.remove(), 1000);
        }, i * 50);
    }
}

// CSS animation için style ekle
const hoverSparkleStyle = document.createElement('style');
hoverSparkleStyle.textContent = `
    @keyframes hoverSparkle {
        0% { transform: translate(0, 0) scale(1); opacity: 1; }
        100% { transform: translate(var(--endX), var(--endY)) scale(0); opacity: 0; }
    }
`;
document.head.appendChild(hoverSparkleStyle);

// 💫 Click Dalga Efekti (Hover)
function createClickRipple(starEl) {
    const ripple = document.createElement('div');
    ripple.className = 'click-ripple';
    ripple.style.width = '60px';
    ripple.style.height = '60px';
    ripple.style.left = '50%';
    ripple.style.top = '50%';
    ripple.style.transform = 'translate(-50%, -50%)';
    ripple.style.borderColor = 'rgba(192, 132, 252, 0.6)';
    starEl.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 1000);
}

// ⭐ Süper Parıltı Efekti (Tıklama)
function createSuperSparkle(x, y) {
    const sparkle = document.createElement('div');
    sparkle.className = 'super-sparkle';
    sparkle.style.cssText = `
        position: fixed;
        width: 100px;
        height: 100px;
        left: ${x - 50}px;
        top: ${y - 50}px;
        z-index: 999;
        pointer-events: none;
    `;
    document.body.appendChild(sparkle);
    
    setTimeout(() => sparkle.remove(), 2000);
}

// 🎯 Tıklama Dalga Efekti
function createClickRippleEffect(x, y) {
    for (let i = 0; i < 3; i++) {
        setTimeout(() => {
            const ripple = document.createElement('div');
            ripple.className = 'click-ripple';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.style.transform = 'translate(-50%, -50%)';
            ripple.style.borderColor = `rgba(255, 255, 255, ${0.8 - i * 0.2})`;
            document.body.appendChild(ripple);
            
            setTimeout(() => ripple.remove(), 1000);
        }, i * 200);
    }
}

// ✨ Açık Yıldıza Süper Parıltı Ekle
function addSuperSparkleToCompleted(starEl) {
    const sparkle = document.createElement('div');
    sparkle.className = 'super-sparkle';
    sparkle.style.cssText = `
        position: absolute;
        width: 80px;
        height: 80px;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        pointer-events: none;
        opacity: 0.6;
    `;
    starEl.appendChild(sparkle);
}

// ========================================
// 🖼️ YILDIZ MODALINI AÇ (GÖREV AŞAMASI)
// ========================================
function openStar(star) {
    if (isModalOpen) return;
    isModalOpen = true;

    // 12. yildizda ozel final modal akisini kullan.
    if (star.id === 12) {
        isModalOpen = false;
        openFinalStar();
        setTimeout(() => {
            startFinalHeartRain();
            createFinalSparkles();
        }, 300);
        return;
    }
    
    const modal = document.getElementById('star-modal');
    const title = document.getElementById('modal-title');
    const body = document.getElementById('modal-body');
    if (!modal || !title || !body) {
        isModalOpen = false;
        return;
    }

    title.textContent = star.title;

    body.innerHTML = getTaskHTML(star) || '';
    initTask(star);

    modal.style.display = 'flex';
}

function closeModal() {
    isModalOpen = false;
    const modal = document.getElementById('star-modal');
    if (modal) modal.style.display = 'none';

    // Final modal açıkken body kilidini bozma (o kendi kilidini yönetiyor)
    const finalModal = document.getElementById('final-star-modal');
    if (finalModal && finalModal.style.display === 'block') return;

    // Body scroll'u geri aç
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    document.body.style.height = '';
}

// ========================================
// 🎯 GÖREV HTML'LERİ (AŞAMA 1: GÖREV)
// ========================================
function getTaskHTML(star) {
    switch(star.task) {
        case 'click':
            return `
                <div class="task-area">
                    <p style="color: #e9d5ff; margin-bottom: 20px;">Bu yıldızı açmak için butona tıkla!</p>
                    <button class="complete-btn" onclick="completeTask(${star.id})">✨ Yıldızı Aç ✨</button>
                </div>
            `;
            
        case 'input':
            return `
                <div class="task-area" id="task-area-${star.id}">
                    <p style="font-size: 18px; margin-bottom: 20px; color: #e9d5ff;">${star.question}</p>
                    <input type="text" id="answer-input" class="task-input" placeholder="Cevabını yaz..." autocomplete="off">
                    <p class="hint">💡 ${star.hint}</p>
                    <button class="check-btn" onclick="checkInput(${star.id})">Kontrol Et</button>
                </div>
            `;
            
        case 'password':
            return `
                <div class="task-area" id="task-area-${star.id}">
                    <p class="hint">🔐 ${star.hint}</p>
                    <input type="text" id="password-input" class="task-input" placeholder="Şifreyi gir..." autocomplete="off">
                    <button class="check-btn" onclick="checkPassword(${star.id})">Aç</button>
                </div>
            `;
            
        case 'caesar':
            return `
                <div class="task-area" id="task-area-${star.id}">
                    <p style="font-size: 18px; margin-bottom: 15px; color: #e9d5ff;">Şifreli mesaj: <strong style="color: #fbbf24; font-size: 24px;">${star.encrypted}</strong></p>
                    <p class="hint">💡 ${star.hint}</p>
                    <input type="text" id="caesar-input" class="task-input" placeholder="Çözümü yaz..." autocomplete="off">
                    <button class="check-btn" onclick="checkCaesar(${star.id})">Çöz</button>
                </div>
            `;
            
        case 'date':
            return `
                <div class="task-area" id="task-area-${star.id}">
                    <p style="font-size: 18px; margin-bottom: 20px; color: #e9d5ff;">Prensesimin doğum günü ne zaman? 📅</p>
                    <input type="date" id="date-input" class="task-input">
                    <br><br>
                    <button class="check-btn" onclick="checkDate(${star.id})">Onayla</button>
                </div>
            `;
            
        case 'hold':
            return `
                <div class="task-area" id="task-area-${star.id}">
                    <img src="${star.image}" class="star-photo" alt="${star.title}">
                    <p style="font-size: 18px; margin-bottom: 25px; color: #e9d5ff;">Butona <strong>3 saniye</strong> basılı tut!</p>
                    <div class="hold-container" style="display: flex; flex-direction: column; align-items: center; gap: 20px;">
                        <button class="hold-btn"
                            onmousedown="startHold(${star.id})"
                            onmouseup="cancelHold()"
                            onmouseleave="cancelHold()"
                            ontouchstart="event.preventDefault(); startHold(${star.id})"
                            ontouchend="event.preventDefault(); cancelHold()"
                            ontouchcancel="cancelHold()">
                            BASILI TUT
                        </button>
                        <div class="progress-bar"><div class="progress" id="hold-progress"></div></div>
                    </div>
                </div>
            `;
            
        case 'xox':
            return `
                <div class="task-area" id="task-area-${star.id}">
                    <img src="${star.image}" class="star-photo" alt="${star.title}">
                    <p style="font-size: 18px; margin-bottom: 15px; color: #e9d5ff;">Bilgisayara karşı kazan! 🎮</p>
                    <div class="xox-grid" id="xox-grid"></div>
                    <p class="game-status" id="game-status">Senin sıran: X</p>
                </div>
            `;
            
        case 'memory':
            return `
                <div class="task-area" id="task-area-${star.id}">
                    <img src="${star.image}" class="star-photo" alt="${star.title}">
                    <p style="font-size: 18px; margin-bottom: 15px; color: #e9d5ff;">Eşleşen çiftleri bul! 🧠</p>
                    <div class="memory-grid" id="memory-grid"></div>
                </div>
            `;
            
        case 'dragdrop':
            return `
                <div class="task-area" id="task-area-${star.id}">
                    <img src="${star.image}" class="star-photo" alt="${star.title}">
                    <p style="font-size: 18px; margin-bottom: 15px; color: #e9d5ff;">Harfleri sürükle ve "Yağmur" oluştur! 🎯</p>
                    <div class="drop-zone" id="drop-zone"></div>
                    <div class="letters-pool" id="letters-pool"></div>
                </div>
            `;
            
        case 'final':
            // 12. Yıldız - Artık openStar içinde yönetiliyor
            return `<div class="task-area"><p>Yükleniyor...</p></div>`;

        default:
            // Bilinmeyen görev tipi: modal boş kalmasın
            return `
                <div class="task-area">
                    <p style="color: #e9d5ff; margin-bottom: 20px;">Bu yıldızı açmak için butona tıkla!</p>
                    <button class="complete-btn" onclick="completeTask(${star.id})">✨ Yıldızı Aç ✨</button>
                </div>
            `;
    }
}

// ========================================
// ✨ BAŞARI EKRANI (AŞAMA 2: FOTOĞRAF + MESAJ)
// ========================================
function showSuccessScreen(star) {
    const body = document.getElementById('modal-body');
    if (!body || !star) return;

    // Success sesi
    const sound = new Audio('sounds/success.mp3');
    sound.volume = 0.5;
    sound.play().catch(e => {});
    
    // Diğer yıldızlar için normal yapı (12. yıldız ayrı modal kullanıyor)
    body.innerHTML = `
        <div class="success-area" style="animation: fadeIn 0.5s;">
            <img src="${star.image}" class="star-photo-large" alt="${star.title}">
            <div class="message-box">
                <p class="romantic-message">${star.message}</p>
            </div>
            <button class="next-btn" onclick="goToNextStar()">Sonraki Yıldız ➜</button>
        </div>
    `;
}

function goToNextStar() {
    closeModal();
    if (currentStar < starsData.length) {
        currentStar++;
        renderStars();
    }
}

// ========================================
// 💕 12. YILDIZ FİNAL EFEKTLERİ
// ========================================

// Mobil cihazlarda efekt sayısını düşürmek için
const IS_MOBILE = window.matchMedia('(max-width: 768px)').matches;

// Çalışan efekt zamanlayıcıları - modal kapanınca temizlenir
let finalEffectTimers = [];

function trackTimer(id) {
    finalEffectTimers.push(id);
    return id;
}

function clearFinalEffects() {
    finalEffectTimers.forEach(clearTimeout);
    finalEffectTimers.forEach(clearInterval);
    finalEffectTimers = [];
    document.querySelectorAll('.final-heart-rain, .star-sparkle').forEach(el => el.remove());
}

// 🌸 Final Kalp Yağmuru
function startFinalHeartRain() {
    const hearts = ['🤍', '💜', '💖', '💝', '💗', '✨', '💫', '⭐'];
    const spawnDelay = IS_MOBILE ? 400 : 200;   // mobilde yarı yoğunluk
    const bigHeartCount = IS_MOBILE ? 5 : 10;

    // Yoğun kalp yağmuru
    const interval = trackTimer(setInterval(() => {
        const heart = document.createElement('div');
        heart.className = 'final-heart-rain';
        heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
        heart.style.left = Math.random() * 100 + '%';
        heart.style.animationDuration = (Math.random() * 2 + 2) + 's';
        heart.style.fontSize = (Math.random() * 20 + 25) + 'px';
        document.body.appendChild(heart);

        trackTimer(setTimeout(() => heart.remove(), 4000));
    }, spawnDelay));

    // 5 saniye sonra durdur
    trackTimer(setTimeout(() => clearInterval(interval), 5000));

    // Ekstra büyük kalpler
    trackTimer(setTimeout(() => {
        for (let i = 0; i < bigHeartCount; i++) {
            trackTimer(setTimeout(() => {
                const bigHeart = document.createElement('div');
                bigHeart.className = 'final-heart-rain';
                bigHeart.textContent = '🤍';
                bigHeart.style.left = (Math.random() * 80 + 10) + '%';
                bigHeart.style.animationDuration = '3s';
                bigHeart.style.fontSize = '50px';
                // drop-shadow mobilde pahalı, sadece masaüstünde
                if (!IS_MOBILE) {
                    bigHeart.style.filter = 'drop-shadow(0 0 20px rgba(255, 255, 255, 0.8))';
                }
                document.body.appendChild(bigHeart);
                trackTimer(setTimeout(() => bigHeart.remove(), 3000));
            }, i * 300));
        }
    }, 1000));
}

// ✨ Final Parıltı Efekti
function createFinalSparkles() {
    // 12. yıldız kendi modal'ını kullanıyor; star-modal o sırada kapalı.
    const modal = document.getElementById('final-star-modal')
        || document.getElementById('star-modal');
    if (!modal) return;

    for (let i = 0; i < 20; i++) {
        setTimeout(() => {
            const sparkle = document.createElement('div');
            sparkle.className = 'star-sparkle';
            sparkle.style.left = Math.random() * 100 + '%';
            sparkle.style.top = Math.random() * 100 + '%';
            sparkle.style.width = (Math.random() * 6 + 4) + 'px';
            sparkle.style.height = sparkle.style.width;
            sparkle.style.animationDelay = (Math.random() * 2) + 's';
            modal.appendChild(sparkle);
            
            setTimeout(() => sparkle.remove(), 4000);
        }, i * 100);
    }
}

// ========================================
// 🎮 GÖREV BAŞLATMA
// ========================================
function initTask(star) {
    switch(star.task) {
        case 'xox':
            initXOX(star.id);
            break;
        case 'memory':
            initMemory(star.id);
            break;
        case 'dragdrop':
            initDragDrop(star.id);
            break;
    }
}

// ========================================
// ✓ GÖREV KONTROLLERİ
// ========================================
function normalizeInput(input) {
    // Türkçe'ye özgü büyük/küçük harf kuralları (I→ı, İ→i) için locale'li dönüşüm.
    // Aksi halde "YAĞMUR" yazan kullanıcı "yagmur" ile eşleşemez.
    return (input || '')
        .trim()
        .toLocaleLowerCase('tr-TR')
        .replace(/\s+/g, '');
}

function checkInput(starId) {
    const star = starsData.find(s => s.id === starId);
    const input = document.getElementById('answer-input');
    if (!star || !input) return;

    if (normalizeInput(input.value) === normalizeInput(star.answer)) {
        showSuccessScreen(star);
    } else {
        showError('Yanlış cevap prensesim, tekrar dene! 🤍');
    }
}

function checkPassword(starId) {
    const star = starsData.find(s => s.id === starId);
    const input = document.getElementById('password-input');
    if (!star || !input) return;

    if (normalizeInput(input.value) === normalizeInput(star.password)) {
        if (star.flashEffect) triggerGoldenFlash();
        showSuccessScreen(star);
    } else {
        alert('Yanlış şifre! İpucunu tekrar oku... 💜');
    }
}

function checkCaesar(starId) {
    const star = starsData.find(s => s.id === starId);
    const input = document.getElementById('caesar-input');
    if (!star || !input) return;
    // Sabit değerle değil, göreve ait cevapla karşılaştır
    if (normalizeInput(input.value) === normalizeInput(star.answer)) {
        showSuccessScreen(star);
    } else {
        alert('Sezar şifresini çözemedin! Alfabede 3 geri git... 💜');
    }
}

function checkDate(starId) {
    const star = starsData.find(s => s.id === starId);
    const input = document.getElementById('date-input');
    if (!star || !input) return;
    const userDate = input.value;

    if (!userDate) {
        alert('Önce bir tarih seç prensesim... 💝');
        return;
    }

    if (userDate === star.targetDate) {
        showSuccessScreen(star);
    } else {
        alert('O tarih değil... Biraz daha düşün! 💝');
    }
}

function completeTask(starId) {
    showSuccessScreen(starsData.find(s => s.id === starId));
}

function showError(msg) {
    alert(msg);
}

// ========================================
// 🤚 HOLD MEKANIĞI
// ========================================
let holdTimer;
let holdProgress = 0;

function startHold(starId) {
    const progressBar = document.getElementById('hold-progress');
    if (!progressBar) return;

    // Zaten sayıyorsa yeniden başlatma (mobilde touchstart + mousedown
    // birlikte tetiklenip iki interval açabiliyordu)
    if (holdTimer) return;

    const star = starsData.find(s => s.id === starId);
    const duration = star?.duration || 3000;
    const stepMs = 50;
    const stepPct = 100 / (duration / stepMs);

    holdProgress = 0;

    holdTimer = setInterval(() => {
        holdProgress = Math.min(100, holdProgress + stepPct);
        progressBar.style.width = holdProgress + '%';

        if (holdProgress >= 100) {
            clearInterval(holdTimer);
            holdTimer = null;
            showSuccessScreen(star);
        }
    }, stepMs);
}

function cancelHold() {
    clearInterval(holdTimer);
    holdTimer = null;
    holdProgress = 0;
    const progressBar = document.getElementById('hold-progress');
    if (progressBar) progressBar.style.width = '0%';
}

// ========================================
// ⭕ XOX OYUNU
// ========================================
let xoxBoard = [];
let xoxCurrentPlayer = 'X';
let xoxGameActive = false;

function initXOX(starId) {
    xoxBoard = Array(9).fill('');
    xoxCurrentPlayer = 'X';
    xoxGameActive = true;
    
    const grid = document.getElementById('xox-grid');
    grid.innerHTML = '';
    
    for (let i = 0; i < 9; i++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.onclick = () => makeMove(i, starId);
        grid.appendChild(cell);
    }
}

function makeMove(index, starId) {
    if (!xoxGameActive || xoxBoard[index] !== '' || xoxCurrentPlayer !== 'X') return;

    const grid = document.getElementById('xox-grid');
    if (!grid) return;

    xoxBoard[index] = 'X';
    const cells = grid.querySelectorAll('.cell');
    cells[index].textContent = 'X';
    cells[index].classList.add('x-mark');
    
    if (checkXOXWinner('X')) {
        xoxGameActive = false;
        setTimeout(() => showSuccessScreen(starsData.find(s => s.id === starId)), 500);
        return;
    }
    
    if (xoxBoard.every(c => c !== '')) {
        xoxGameActive = false;
        setTimeout(() => showSuccessScreen(starsData.find(s => s.id === starId)), 500);
        return;
    }
    
    xoxCurrentPlayer = 'O';
    const status = document.getElementById('game-status');
    if (status) status.textContent = 'Bilgisayar düşünüyor...';

    setTimeout(() => computerMove(starId), 600);
}

function computerMove(starId) {
    if (!xoxGameActive) return;

    const grid = document.getElementById('xox-grid');
    const status = document.getElementById('game-status');
    if (!grid) return;

    const emptyCells = xoxBoard.map((c, i) => c === '' ? i : null).filter(i => i !== null);
    if (emptyCells.length === 0) return;

    const move = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    xoxBoard[move] = 'O';

    const cells = grid.querySelectorAll('.cell');
    cells[move].textContent = 'O';
    cells[move].classList.add('o-mark');

    if (checkXOXWinner('O')) {
        xoxGameActive = false;
        if (status) status.textContent = 'Bilgisayar kazandı! Ama sen yine de kazandın kalbimde! 💜';
        setTimeout(() => showSuccessScreen(starsData.find(s => s.id === starId)), 1000);
        return;
    }

    // Bilgisayarın hamlesinden sonra tahta dolduysa berabere
    if (xoxBoard.every(c => c !== '')) {
        xoxGameActive = false;
        if (status) status.textContent = 'Berabere! 💜';
        setTimeout(() => showSuccessScreen(starsData.find(s => s.id === starId)), 800);
        return;
    }

    xoxCurrentPlayer = 'X';
    if (status) status.textContent = 'Senin sıran: X';
}

function checkXOXWinner(player) {
    const wins = [[0,1,2], [3,4,5], [6,7,8], [0,3,6], [1,4,7], [2,5,8], [0,4,8], [2,4,6]];
    return wins.some(combo => combo.every(i => xoxBoard[i] === player));
}

// ========================================
// 🧠 MEMORY OYUNU
// ========================================
let memoryCards = [];
let memoryFlipped = [];
let memoryMatched = 0;

function initMemory(starId) {
    const emojis = ['🌸', '💜', '🤍', '✨'];
    memoryCards = [...emojis, ...emojis];
    memoryFlipped = [];
    memoryMatched = 0;
    
    memoryCards.sort(() => Math.random() - 0.5);
    
    const grid = document.getElementById('memory-grid');
    grid.innerHTML = '';
    
    memoryCards.forEach((emoji, index) => {
        const card = document.createElement('div');
        card.className = 'memory-card';
        card.dataset.index = index;
        card.dataset.emoji = emoji;
        card.onclick = () => flipCard(card, starId);
        grid.appendChild(card);
    });
}

function flipCard(card, starId) {
    if (card.classList.contains('flipped') ||
        card.classList.contains('matched') ||
        memoryFlipped.includes(card) ||   // aynı karta iki kez tıklamayı engelle
        memoryFlipped.length >= 2) return;

    card.textContent = card.dataset.emoji;
    card.classList.add('flipped');
    memoryFlipped.push(card);
    
    if (memoryFlipped.length === 2) {
        setTimeout(() => checkMatch(starId), 800);
    }
}

function checkMatch(starId) {
    const [card1, card2] = memoryFlipped;
    
    if (card1.dataset.emoji === card2.dataset.emoji) {
        card1.classList.add('matched');
        card2.classList.add('matched');
        memoryMatched++;
        memoryFlipped = [];
        
        if (memoryMatched === 4) {
            setTimeout(() => showSuccessScreen(starsData.find(s => s.id === starId)), 500);
        }
    } else {
        card1.textContent = '';
        card2.textContent = '';
        card1.classList.remove('flipped');
        card2.classList.remove('flipped');
        memoryFlipped = [];
    }
}

// ========================================
// 🎯 DRAG DROP (YAĞMUR)
// ========================================
let draggedLetter = null;
let currentWord = '';
let usedLetters = [];

// Harfler büyük harf olarak gösteriliyor, hedef kelime ise değil.
// Karşılaştırmayı Türkçe kurallarıyla (I/İ, i/ı) tek biçime indirgeyerek yapıyoruz.
function normalizeWord(word) {
    return (word || '').toLocaleUpperCase('tr-TR');
}

function getDragDropTarget(starId) {
    const star = starsData.find(s => s.id === starId);
    return Array.isArray(star?.letters) ? star.letters.join('') : DRAGDROP_TARGET;
}

function initDragDrop(starId) {
    currentWord = '';
    usedLetters = [];
    const star = starsData.find(s => s.id === starId);
    const letters = Array.isArray(star?.letters) ? [...star.letters] : ['Y', 'A', 'Ğ', 'M', 'U', 'R'];
    
    const pool = document.getElementById('letters-pool');
    const dropZone = document.getElementById('drop-zone');
    
    pool.innerHTML = '';
    dropZone.innerHTML = '';
    dropZone.textContent = '';
    
    const shuffled = [...letters].sort(() => Math.random() - 0.5);
    
    shuffled.forEach((letter, index) => {
        const div = document.createElement('div');
        div.className = 'letter';
        div.textContent = letter;
        div.dataset.letter = letter;
        div.dataset.index = index;
        div.draggable = true;
        
        // Desktop: Sürükle-bırak
        div.ondragstart = (e) => {
            draggedLetter = letter;
            div.style.opacity = '0.5';
            e.dataTransfer.effectAllowed = 'move';
        };
        
        div.ondragend = (e) => {
            div.style.opacity = '1';
        };
        
        // Mobil: Dokunmatik
        let touchStartX = 0;
        let touchStartY = 0;
        let isDragging = false;

        div.ontouchstart = (e) => {
            if (div.classList.contains('used')) return;
            const touch = e.touches[0];
            touchStartX = touch.clientX;
            touchStartY = touch.clientY;
            isDragging = false;
            draggedLetter = letter;
            div.style.transform = 'scale(1.1)';
            div.style.opacity = '0.7';
        };

        div.ontouchmove = (e) => {
            if (div.classList.contains('used')) return;
            const touch = e.touches[0];

            // Parmak birkaç px'den fazla kaydıysa sürükleme sayılır.
            // Böylece basit dokunuş "tap" olarak kalır ve sayfa scroll'u bozulmaz.
            if (!isDragging) {
                const moved = Math.hypot(touch.clientX - touchStartX, touch.clientY - touchStartY);
                if (moved < 10) return;
                isDragging = true;
                div.style.position = 'fixed';
                div.style.zIndex = '9999';
                // Sürüklenen harf parmağın altında kalırsa elementFromPoint
                // hep kendisini bulur; bu yüzden isabet almasın.
                div.style.pointerEvents = 'none';
            }

            e.preventDefault();
            const rect = div.getBoundingClientRect();
            div.style.left = (touch.clientX - rect.width / 2) + 'px';
            div.style.top = (touch.clientY - rect.height / 2) + 'px';
        };

        div.ontouchend = (e) => {
            if (div.classList.contains('used')) return;
            const touch = e.changedTouches[0];
            const wasDragging = isDragging;

            // Stilleri resetle (elementFromPoint'ten ÖNCE değil, sonra sırası önemli
            // değil çünkü pointer-events zaten kapalı)
            div.style.position = '';
            div.style.left = '';
            div.style.top = '';
            div.style.zIndex = '';
            div.style.transform = '';
            div.style.opacity = '1';
            div.style.pointerEvents = '';
            isDragging = false;

            if (!wasDragging) {
                // Basit dokunuş: doğrudan ekle (mobilde en kolay yöntem)
                e.preventDefault();
                addLetterToDrop(letter, div, starId);
                return;
            }

            e.preventDefault();
            const elem = document.elementFromPoint(touch.clientX, touch.clientY);
            if (elem && (elem.id === 'drop-zone' || elem.closest('#drop-zone'))) {
                addLetterToDrop(letter, div, starId);
            }
        };

        // Masaüstü: tıklama ile ekleme (mobilde touchend hallediyor)
        div.onclick = (e) => {
            if (e.detail === 0) return; // klavye/sentetik tıklamaları yoksay
            if (!div.classList.contains('used')) {
                addLetterToDrop(letter, div, starId);
            }
        };

        pool.appendChild(div);
    });
    
    dropZone.ondragover = (e) => {
        e.preventDefault();
        dropZone.style.background = 'rgba(147, 51, 234, 0.2)';
    };
    
    dropZone.ondragleave = (e) => {
        dropZone.style.background = '';
    };
    
    dropZone.ondrop = (e) => {
        e.preventDefault();
        dropZone.style.background = '';
        if (draggedLetter) {
            // Sürüklenen elementi bul
            const pool = document.getElementById('letters-pool');
            const draggingElem = Array.from(pool.children).find(el => 
                el.dataset.letter === draggedLetter && !el.classList.contains('used')
            );
            if (draggingElem) {
                addLetterToDrop(draggedLetter, draggingElem, starId);
            }
            draggedLetter = null;
        }
    };
}

function addLetterToDrop(letter, letterElem, starId) {
    // Harfi işaretle
    letterElem.classList.add('used');
    letterElem.style.opacity = '0.3';
    letterElem.style.pointerEvents = 'none';
    letterElem.style.transform = 'scale(0.9)';
    
    // Drop zone'a harf elementi ekle
    const dropZone = document.getElementById('drop-zone');
    const letterDisplay = document.createElement('span');
    letterDisplay.className = 'dropped-letter';
    letterDisplay.textContent = letter;
    letterDisplay.style.cssText = `
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 50px;
        height: 50px;
        background: linear-gradient(135deg, #9333ea 0%, #7c3aed 100%);
        border-radius: 12px;
        margin: 0 5px;
        font-size: 24px;
        font-weight: bold;
        color: white;
        box-shadow: 0 4px 15px rgba(147, 51, 234, 0.4);
        animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        cursor: pointer;
    `;
    dropZone.appendChild(letterDisplay);

    currentWord += letter;
    usedLetters.push({ letter, element: letterElem, display: letterDisplay });

    // Yanlış harfe dokununca geri al (sadece son harf)
    const undoLetter = (e) => {
        if (e) e.preventDefault();
        if (usedLetters[usedLetters.length - 1]?.display !== letterDisplay) return;
        usedLetters.pop();
        currentWord = currentWord.slice(0, -letter.length);
        letterDisplay.remove();
        letterElem.classList.remove('used');
        letterElem.style.opacity = '1';
        letterElem.style.pointerEvents = 'auto';
        letterElem.style.transform = '';
    };
    letterDisplay.onclick = undoLetter;
    letterDisplay.ontouchend = undoLetter;
    
    // Pop-in animasyonu için style ekle
    if (!document.getElementById('popInStyle')) {
        const style = document.createElement('style');
        style.id = 'popInStyle';
        style.textContent = `
            @keyframes popIn {
                0% { transform: scale(0); opacity: 0; }
                100% { transform: scale(1); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
    
    const target = getDragDropTarget(starId);

    if (normalizeWord(currentWord) === normalizeWord(target)) {
        setTimeout(() => {
            showSuccessScreen(starsData.find(s => s.id === starId));
        }, 500);
    } else if (currentWord.length >= target.length) {
        setTimeout(() => {
            alert(`Yanlış sıralama! ${target.toLocaleUpperCase('tr-TR').split('').join('-')} olmalı... 💜`);
            resetDragDrop(starId);
        }, 300);
    }
}

function resetDragDrop(starId) {
    currentWord = '';
    usedLetters = [];
    const dropZone = document.getElementById('drop-zone');
    const pool = document.getElementById('letters-pool');
    
    if (dropZone) dropZone.innerHTML = '';
    
    if (pool) {
        Array.from(pool.children).forEach(letter => {
            letter.classList.remove('used');
            letter.style.opacity = '1';
            letter.style.pointerEvents = 'auto';
            letter.style.transform = '';
        });
    }
}

// ========================================
// 💥 BIG BANG FİNAL
// ========================================
function triggerBigBang() {
    closeModal();
    closeFinalStar();

    const bigBang = document.getElementById('big-bang');
    bigBang.style.display = 'flex';

    // closeFinalStar body scroll'u geri açtı; big-bang tam ekran olduğu için
    // arkadaki sayfanın kaymasını tekrar engelle
    document.body.style.overflow = 'hidden';

    if (bgMusic) bgMusic.pause();
    
    const sound = new Audio('sounds/final-music.mp3');
    sound.play().catch(e => {});
    
    // Romantik efektler başlat
    startHeartRain();
    startUltimateHeartBurst();
    createFloatingRoses();
    initConfetti();
    
    setTimeout(() => {
        typeWriter(finalMessage, document.getElementById('final-text'));
    }, 2000);
}

function startHeartRain() {
    const container = document.getElementById('hearts-container');
    if (!container) return;

    const interval = setInterval(() => {
        const heart = document.createElement('div');
        heart.className = 'falling-heart';
        heart.textContent = ['🤍', '💜', '💖', '💗', '💝'][Math.floor(Math.random() * 5)];
        heart.style.left = Math.random() * 100 + '%';
        heart.style.top = '-50px';
        heart.style.fontSize = (Math.random() * 20 + 20) + 'px';
        heart.style.animation = `fall ${Math.random() * 3 + 3}s linear forwards`;
        heart.style.opacity = Math.random() * 0.5 + 0.5;
        container.appendChild(heart);

        setTimeout(() => heart.remove(), 6000);
    }, IS_MOBILE ? 400 : 200);
    
    setTimeout(() => clearInterval(interval), 15000);
}

// 💥 Ultimate Kalp Patlama
function startUltimateHeartBurst() {
    const hearts = ['🤍', '💜', '💖', '💝', '💗', '✨', '💫', '⭐', '🌟'];
    const colors = ['#ff69b4', '#9333ea', '#fbbf24', '#ffffff', '#ff1493'];
    
    // Ekranın çeşitli yerlerinden patlamalar (mobilde daha az parçacık)
    const burstCount = IS_MOBILE ? 5 : 8;
    const perBurst = IS_MOBILE ? 8 : 15;

    for (let burst = 0; burst < burstCount; burst++) {
        setTimeout(() => {
            const x = Math.random() * window.innerWidth;
            const y = Math.random() * window.innerHeight * 0.6 + window.innerHeight * 0.2;

            for (let i = 0; i < perBurst; i++) {
                const heart = document.createElement('div');
                heart.className = 'heart-burst';
                heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
                heart.style.left = x + 'px';
                heart.style.top = y + 'px';
                heart.style.fontSize = (Math.random() * 25 + 20) + 'px';
                heart.style.color = colors[Math.floor(Math.random() * colors.length)];
                heart.style.filter = `drop-shadow(0 0 10px ${colors[Math.floor(Math.random() * colors.length)]})`;
                
                const angle = (i / perBurst) * Math.PI * 2 + Math.random() * 0.5;
                const distance = 80 + Math.random() * 100;
                heart.style.setProperty('--tx', Math.cos(angle) * distance + 'px');
                heart.style.setProperty('--ty', Math.sin(angle) * distance + 'px');
                heart.style.animationDelay = (Math.random() * 0.3) + 's';
                heart.style.animationDuration = (1.5 + Math.random()) + 's';
                
                document.body.appendChild(heart);
                setTimeout(() => heart.remove(), 2500);
            }
        }, burst * 800);
    }
}

// 🌹 Yüzen Güller
function createFloatingRoses() {
    const roses = ['🌹', '🌸', '💐', '🌺'];
    
    for (let i = 0; i < 15; i++) {
        setTimeout(() => {
            const rose = document.createElement('div');
            rose.style.cssText = `
                position: fixed;
                font-size: ${Math.random() * 20 + 25}px;
                left: ${Math.random() * 100}%;
                top: 110%;
                pointer-events: none;
                z-index: 99;
                animation: roseFloat ${Math.random() * 4 + 5}s ease-in-out forwards;
                opacity: 0.8;
            `;
            rose.textContent = roses[Math.floor(Math.random() * roses.length)];
            document.body.appendChild(rose);
            
            setTimeout(() => rose.remove(), 9000);
        }, i * 600);
    }
}

let typeWriterTimer = null;

function typeWriter(text, element, speed = 50) {
    if (!element) return;

    // Önceki yazım devam ediyorsa durdur (iki typewriter aynı elemana yazmasın)
    if (typeWriterTimer) clearTimeout(typeWriterTimer);

    let i = 0;
    element.textContent = '';

    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            typeWriterTimer = setTimeout(type, speed);
        } else {
            typeWriterTimer = null;
        }
    }

    type();
}

function initConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const sizeCanvas = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };
    sizeCanvas();
    // Mobilde adres çubuğu / ekran döndürme boyutu değiştirir
    window.addEventListener('resize', sizeCanvas);
    setTimeout(() => window.removeEventListener('resize', sizeCanvas), 12000);

    const particles = [];
    const colors = ['#9333ea', '#ffffff', '#fbbf24', '#ff69b4', '#c084fc'];
    const particleCount = IS_MOBILE ? 80 : 200;

    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: canvas.width / 2,
            y: canvas.height / 2,
            vx: (Math.random() - 0.5) * 20,
            vy: (Math.random() - 0.5) * 20 - 5,
            color: colors[Math.floor(Math.random() * colors.length)],
            size: Math.random() * 8 + 4,
            rotation: Math.random() * 360
        });
    }
    
    let frame = 0;
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.2;
            p.rotation += 5;
            
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation * Math.PI / 180);
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size);
            ctx.restore();
        });
        
        frame++;
        if (frame < 300) requestAnimationFrame(animate);
    }
    
    animate();
}

// ========================================
// ✨ ALTIN FLAŞ EFEKTİ
// ========================================
function triggerGoldenFlash() {
    const flash = document.createElement('div');
    flash.className = 'golden-flash';
    document.body.appendChild(flash);
    
    setTimeout(() => flash.remove(), 1000);
}

// ========================================
// 🐛 DEBUG FONKSİYONLARI (Console'dan kullanılabilir)
// ========================================

// Tüm yıldızları açar (test için)
function debugCompleteAll() {
    currentStar = 13;
    renderStars();
    console.log('✨ Debug: Tüm yıldızlar açıldı!');
}

// Belirli bir yıldıza kadar açar
function debugCompleteUpTo(starNumber) {
    if (starNumber < 1 || starNumber > 12) {
        console.log('❌ Hata: 1-12 arası bir sayı girin');
        return;
    }
    currentStar = starNumber + 1;
    renderStars();
    console.log(`✨ Debug: İlk ${starNumber} yıldız açıldı!`);
}

// Yıldız pozisyonlarını console'a yazdırır
function debugStarPositions() {
    console.log('⭐ Yıldız Pozisyonları:');
    starsData.forEach((star, i) => {
        console.log(`  Yıldız ${i + 1}: top=${star.position.top}, left=${star.position.left}`);
    });
}


// ========================================
// 👁️ VISIBILITY & PERFORMANCE OPTİMİZASYONU
// ========================================

// Sayfa görünürlüğü değiştiğinde animasyonları durdur/başlat
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Sayfa gizliyse animasyonları durdur
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
    } else {
        // Sayfa görünürse animasyonları başlat
        if (!animationFrameId) {
            animateCanvas();
        }
    }
});

// IntersectionObserver ile görünür alandaki elementleri kontrol et
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

const elementObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
        } else {
            entry.target.classList.remove('in-view');
        }
    });
}, observerOptions);

// Yıldızları gözlemle
document.addEventListener('DOMContentLoaded', () => {
    const starElements = document.querySelectorAll('.star-point');
    starElements.forEach(star => elementObserver.observe(star));
});

// Touch olayları için passive listener
document.addEventListener('touchstart', () => {}, { passive: true });
document.addEventListener('touchmove', () => {}, { passive: true });

// Resize olayını debounce et
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        isMobile = window.innerWidth <= 768;
    }, 250);
}, { passive: true });

// Scroll olayını throttle et
let scrollTicking = false;
window.addEventListener('scroll', () => {
    if (!scrollTicking) {
        requestAnimationFrame(() => {
            scrollTicking = false;
        });
        scrollTicking = true;
    }
}, { passive: true });


// ========================================
// 💝 12. YILDIZ - ÖZEL FONKSİYONLAR
// ========================================

// ========================================
// 12. YILDIZ - FINAL STAR FONKSİYONLARI
// ========================================

// 12. Yıldızı Açma Fonksiyonu
let finalStarScrollY = 0;

function openFinalStar() {
    const modal = document.getElementById('final-star-modal');
    const contentDiv = document.getElementById('finalTextContent');
    
    // finalMessage'ı paragraflara böl
    const paragraphs = finalMessage.split('\n').filter(p => p.trim() !== '');
    
    // HTML oluştur
    let html = '';
    paragraphs.forEach((para, index) => {
        if (index === paragraphs.length - 1) {
            // Son paragraf özel kutuda
            html += `<div class="final-love-box">${para}</div>`;
        } else {
            html += `<p>${para}</p>`;
        }
    });
    html += '<button class="next-btn final-btn" onclick="triggerBigBang()" style="margin-top: 20px;">🎉 Sürpriz Final 🎉</button>';
    
    contentDiv.innerHTML = html;
    
    // Modal'ı göster
    modal.style.display = 'block';

    // Body scroll'u kapat (sadece modal scroll olacak).
    // position:fixed sayfayı en üste zıplatır; mevcut konumu saklayıp
    // kapanışta geri veriyoruz.
    finalStarScrollY = window.scrollY || window.pageYOffset || 0;
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${finalStarScrollY}px`;
    document.body.style.width = '100%';
    document.body.style.height = '100%';

    // iOS için touch fix
    const scrollContainer = document.querySelector('.final-scroll-container');
    if (scrollContainer) {
        scrollContainer.style.overflowY = 'auto';
        scrollContainer.scrollTop = 0; // En üste git
    }
}

// 12. Yıldızı Kapatma
function closeFinalStar() {
    const modal = document.getElementById('final-star-modal');
    modal.style.display = 'none';

    // Devam eden kalp/parıltı efektlerini durdur
    clearFinalEffects();

    // Body scroll'u geri aç ve eski konuma dön
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    document.body.style.height = '';
    window.scrollTo(0, finalStarScrollY);
}

// 12. Yıldız görevini tamamlama - YENİ MODAL'ı kullan
function completeStar12Task() {
    // Yeni final modal'ı aç
    openFinalStar();
    
    // Kalp yağmuru başlat
    startFinalHeartRain();
    createFinalSparkles();
}

// Touch event engelleyicilerini kaldır (12. yıldız için)
document.addEventListener('DOMContentLoaded', function() {
    const scrollContainer = document.querySelector('.final-scroll-container');
    if (scrollContainer) {
        scrollContainer.addEventListener('touchmove', function(e) {
            // Scroll container içinde touch'a izin ver
            e.stopPropagation();
        }, { passive: true });
    }
});
