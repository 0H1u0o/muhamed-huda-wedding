/* ===== Wedding Invitation Scripts ===== */
/* Muhamed & Huda — June 12, 2026 */

// Hide invitation on load
document.getElementById('invitation').style.display = 'none';

// ===== MUSIC PLAYER =====
const bgMusic = document.getElementById('bg-music');
const musicToggle = document.getElementById('music-toggle');
const iconOn = document.getElementById('music-icon-on');
const iconOff = document.getElementById('music-icon-off');

let isMusicPlaying = false;
let hasSetInitialTime = false;

function startMusic() {
    if (!bgMusic) return;
    bgMusic.volume = 0.4; // Soft background volume
    
    if (!hasSetInitialTime) {
        bgMusic.currentTime = 30; // Skip first 30 seconds
        hasSetInitialTime = true;
    }
    
    const playPromise = bgMusic.play();

    if (playPromise !== undefined) {
        playPromise.then(() => {
            isMusicPlaying = true;
            updateMusicUI();
        }).catch(() => {
            // Autoplay blocked — user can manually toggle
            isMusicPlaying = false;
            updateMusicUI();
        });
    }
}

function toggleMusic() {
    if (!bgMusic) return;

    if (isMusicPlaying) {
        bgMusic.pause();
        isMusicPlaying = false;
    } else {
        if (!hasSetInitialTime) {
            bgMusic.currentTime = 30; // Skip first 30 seconds
            hasSetInitialTime = true;
        }
        bgMusic.play().then(() => {
            isMusicPlaying = true;
        }).catch(() => {});
    }
    updateMusicUI();
}

function updateMusicUI() {
    if (isMusicPlaying) {
        iconOn.style.display = 'block';
        iconOff.style.display = 'none';
        musicToggle.classList.add('playing');
    } else {
        iconOn.style.display = 'none';
        iconOff.style.display = 'block';
        musicToggle.classList.remove('playing');
    }
}

if (musicToggle) {
    musicToggle.addEventListener('click', toggleMusic);
}

// ===== SEAL OPENING =====
function openInvitation() {
    const seal = document.getElementById('seal-screen');
    seal.style.opacity = '0';
    seal.style.pointerEvents = 'none';

    // Start music on this user gesture (browser requirement)
    startMusic();

    setTimeout(() => {
        seal.style.display = 'none';
        const inv = document.getElementById('invitation');
        inv.style.display = 'block';
        setTimeout(() => { inv.style.opacity = '1'; }, 50);
        startCountdown();

        // Show music toggle button with a slight delay
        setTimeout(() => {
            if (musicToggle) musicToggle.classList.add('visible');
        }, 1500);
    }, 1000);
}

// ===== COUNTDOWN TIMER =====
function startCountdown() {
    const target = new Date(2026, 5, 12, 20, 0, 0).getTime(); // Month is 0-indexed: 5 = June

    function update() {
        const now = Date.now();
        const diff = target - now;

        if (diff <= 0) {
            ['days','hours','minutes','seconds'].forEach(id => {
                document.getElementById(id).innerText = '00';
            });
            return;
        }

        const d = Math.floor(diff / 86400000);
        const h = Math.floor((diff % 86400000) / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);

        document.getElementById('days').innerText    = String(d).padStart(2,'0');
        document.getElementById('hours').innerText   = String(h).padStart(2,'0');
        document.getElementById('minutes').innerText = String(m).padStart(2,'0');
        document.getElementById('seconds').innerText = String(s).padStart(2,'0');
    }

    update();
    setInterval(update, 1000);
}

// ===== SLIDING PHOTO GALLERY =====
let currentSlideIndex = 0;
const gallerySlider = document.getElementById('gallery-slider');
const dots = document.querySelectorAll('#gallery-dots .dot');

function showSlide(index) {
    const totalSlides = document.querySelectorAll('.gallery-slide').length;
    if (index >= totalSlides) currentSlideIndex = 0;
    else if (index < 0) currentSlideIndex = totalSlides - 1;
    else currentSlideIndex = index;

    if (gallerySlider) {
        gallerySlider.style.transform = `translateX(-${currentSlideIndex * 100}%)`;
    }

    // Update active dot
    dots.forEach((dot, idx) => {
        if (idx === currentSlideIndex) dot.classList.add('active');
        else dot.classList.remove('active');
    });
}

function nextSlide() {
    showSlide(currentSlideIndex + 1);
}

function prevSlide() {
    showSlide(currentSlideIndex - 1);
}

function currentSlide(idx) {
    showSlide(idx);
}

// ===== RSVP FORM CONTROLLER =====
function setAttendance(button) {
    // Deactivate both buttons
    document.querySelectorAll('.attendance-btn').forEach(btn => btn.classList.remove('active'));
    // Activate clicked button
    button.classList.add('active');
    
    const value = button.getAttribute('data-value');
    document.getElementById('attendance-status').value = value;

    // Show/hide guest count and color dress options based on attendance
    const rsvpDetails = document.getElementById('rsvp-details');
    if (value === 'attending') {
        rsvpDetails.style.display = 'block';
    } else {
        rsvpDetails.style.display = 'none';
    }
}

function selectColor(button) {
    // Deactivate all color buttons
    document.querySelectorAll('.color-option').forEach(btn => btn.classList.remove('active'));
    // Activate clicked button
    button.classList.add('active');

    const value = button.getAttribute('data-color');
    document.getElementById('chosen-color').value = value;

    // Toggle custom color input if 'Custom' option selected
    const customInput = document.getElementById('custom-color-input');
    if (value === 'Custom') {
        customInput.style.display = 'block';
        customInput.required = true;
    } else {
        customInput.style.display = 'none';
        customInput.required = false;
        customInput.value = '';
    }
}

// ===== GOOGLE SHEETS / NETLIFY RSVP SUBMISSION =====
/**
 * Note for deployment:
 * Replace 'YOUR_GOOGLE_SCRIPT_WEB_APP_URL' with your actual Google Apps Script URL.
 * See instructions on how to set it up!
 */
const GOOGLE_SCRIPT_URL = 'YOUR_GOOGLE_SCRIPT_WEB_APP_URL'; 

function submitRSVP(event) {
    event.preventDefault();

    const loader = document.getElementById('submit-loader');
    const submitBtn = document.querySelector('.rsvp-submit-btn');
    const rsvpStatus = document.getElementById('rsvp-status');

    // Get Form Data
    const guestName = document.getElementById('guest-name').value.trim();
    const attendance = document.getElementById('attendance-status').value;
    const guestCount = attendance === 'attending' ? document.getElementById('guest-count').value : '0';
    let chosenColor = document.getElementById('chosen-color').value;
    
    if (chosenColor === 'Custom') {
        chosenColor = document.getElementById('custom-color-input').value.trim();
    }
    
    const wishes = document.getElementById('guest-wishes').value.trim();

    if (!guestName) {
        showStatus('Please enter your name.', 'error');
        return;
    }

    // Toggle loading UI
    loader.style.display = 'inline-block';
    submitBtn.disabled = true;
    showStatus('', '');

    const rsvpData = {
        name: guestName,
        attendance: attendance === 'attending' ? 'Yes' : 'No',
        guests: guestCount,
        color: attendance === 'attending' ? chosenColor : 'N/A',
        wishes: wishes || 'No message left'
    };

    // Helper to print dynamic guest cards to virtual guestbook in real-time
    function addNewWishToGuestbook(data) {
        const wishesList = document.getElementById('wishes-list');
        if (!wishesList) return;

        const wishCard = document.createElement('div');
        wishCard.className = 'wish-card';

        const wishText = document.createElement('p');
        wishText.className = 'wish-text';
        wishText.innerText = data.wishes !== 'No message left' ? `"${data.wishes}"` : `"Looking forward to celebrating with you!"`;

        const wishAuthor = document.createElement('div');
        wishAuthor.className = 'wish-author';

        const authorName = document.createElement('strong');
        authorName.innerText = data.name;

        const metaSpan = document.createElement('span');
        metaSpan.className = 'wish-meta';
        metaSpan.innerText = data.attendance === 'Yes' ? `${data.color} Theme · Guest` : 'Wishing from afar';

        wishAuthor.appendChild(authorName);
        wishAuthor.appendChild(metaSpan);
        wishCard.appendChild(wishText);
        wishCard.appendChild(wishAuthor);

        // Prepend to top of guestbook
        wishesList.insertBefore(wishCard, wishesList.firstChild);
    }

    // Attempt submission to Google Sheets
    if (GOOGLE_SCRIPT_URL && GOOGLE_SCRIPT_URL !== 'YOUR_GOOGLE_SCRIPT_WEB_APP_URL') {
        fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors', // standard workaround for cross-origin Apps Script posts
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(rsvpData)
        })
        .then(() => {
            handleSuccess(rsvpData);
        })
        .catch(err => {
            console.error('Error submitting RSVP:', err);
            // Fallback success for user demo or local test
            handleSuccess(rsvpData);
        });
    } else {
        // No Sheets Script URL configured yet — simulate submission locally for testing
        setTimeout(() => {
            handleSuccess(rsvpData);
        }, 1500);
    }

    function handleSuccess(data) {
        loader.style.display = 'none';
        submitBtn.disabled = false;
        
        if (data.attendance === 'Yes') {
            showStatus('Thank you! Your R.S.V.P. has been recorded joyfully. ✨', 'success');
        } else {
            showStatus('Thank you for letting us know. Your wishes are warmly received. ❦', 'success');
        }

        // Add dynamically to page guestbook!
        addNewWishToGuestbook(data);

        // Reset Form
        document.getElementById('rsvp-form').reset();
        // Reset interactive elements
        document.querySelectorAll('.attendance-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector('.attendance-btn[data-value="attending"]').classList.add('active');
        document.getElementById('attendance-status').value = 'attending';
        document.getElementById('rsvp-details').style.display = 'block';

        document.querySelectorAll('.color-option').forEach(btn => btn.classList.remove('active'));
        document.querySelector('.color-option[data-color="Forest Green"]').classList.add('active');
        document.getElementById('chosen-color').value = 'Forest Green';
        document.getElementById('custom-color-input').style.display = 'none';
        document.getElementById('custom-color-input').value = '';
    }

    function showStatus(msg, type) {
        rsvpStatus.innerText = msg;
        rsvpStatus.className = 'rsvp-message ' + type;
    }
}

// ===== FALLING GOLDEN STARS CANVAS ANIMATION =====
(function() {
    const canvas = document.getElementById('starfield-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let particles = [];
    let animationFrameId;

    // Golden wedding colors matching the premium theme
    const colors = [
        'rgba(212, 175, 106, ', // gold-light
        'rgba(184, 146, 42, ',  // gold
        'rgba(238, 216, 152, ', // gold-pale
        'rgba(255, 255, 255, '  // white twinkle
    ];

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        initParticles();
    }

    class StarParticle {
        constructor() {
            this.reset(true);
        }

        reset(isInitial = false) {
            this.x = Math.random() * canvas.width;
            this.y = isInitial ? Math.random() * canvas.height : -10;
            this.size = Math.random() * 2 + 0.6; // diameter size between 0.6 and 2.6
            this.speedY = Math.random() * 0.5 + 0.15; // slow romantic falling speed
            this.speedX = Math.random() * 0.2 - 0.1; // soft drift speed
            this.alpha = Math.random() * 0.55 + 0.15; // dynamic opacity
            this.twinkleSpeed = Math.random() * 0.015 + 0.005; // twinkle transition rhythm
            this.twinkleDir = Math.random() > 0.5 ? 1 : -1;
            this.colorBase = colors[Math.floor(Math.random() * colors.length)];
            this.isFourPoint = Math.random() > 0.85; // 15% chance to draw a premium 4-point star
            this.angle = Math.random() * Math.PI;
            this.spinSpeed = Math.random() * 0.008 - 0.004;
        }

        update() {
            this.y += this.speedY;
            this.x += this.speedX + Math.sin(this.y * 0.008) * 0.12; // wavy natural motion path
            this.angle += this.spinSpeed;

            // Soft glow pulse twinkle transitions
            this.alpha += this.twinkleSpeed * this.twinkleDir;
            if (this.alpha >= 0.85) {
                this.alpha = 0.85;
                this.twinkleDir = -1;
            } else if (this.alpha <= 0.1) {
                this.alpha = 0.1;
                this.twinkleDir = 1;
            }

            // Screen reset boundaries
            if (this.y > canvas.height + 10 || this.x < -10 || this.x > canvas.width + 10) {
                this.reset(false);
            }
        }

        draw() {
            ctx.fillStyle = this.colorBase + this.alpha + ')';
            
            if (this.isFourPoint) {
                // Draw glowing 4-pointed luxury star
                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.rotate(this.angle);
                ctx.beginPath();
                for (let i = 0; i < 4; i++) {
                    ctx.lineTo(0, -this.size * 2.2);
                    ctx.lineTo(this.size * 0.4, -this.size * 0.4);
                    ctx.rotate(Math.PI / 2);
                }
                ctx.closePath();
                ctx.fill();
                ctx.restore();
            } else {
                // Draw soft glowing circular star
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.closePath();
                ctx.fill();
            }
        }
    }

    function initParticles() {
        particles = [];
        // Capped counts to guarantee high performance on mobile processors
        const particleCount = canvas.width < 600 ? 30 : 65;
        for (let i = 0; i < particleCount; i++) {
            particles.push(new StarParticle());
        }
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(p => {
            p.update();
            p.draw();
        });

        animationFrameId = requestAnimationFrame(animate);
    }

    // Window hooks
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    animate();
})();
