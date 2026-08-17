/* ========================================
   Yağmur'NIN 12 KAPISI - ANA KONTROL MERKEZİ
   Sıralı açılış, büyük modal, typewriter
   Kraliçem için! 🤍
   ======================================== */

class YağmurGalaxyQuest {
    constructor() {
        this.stars = getAllStars();
        this.currentStar = getCurrentStar();
        this.completedStars = getProgress();
        this.currentMission = null;
        this.musicPlaying = false;
        
        this.init();
    }
    
    init() {
        this.renderStars();
        this.drawConstellationLines();
        this.updateProgressBar();
        this.bindEvents();
        
        console.log('%c🤍 Yağmur\'NIN 12 KAPISI BAŞLADI 🤍', 'font-size: 24px; color: #9333ea; font-weight: bold;');
        console.log('%cMevcut kapı: ' + this.currentStar, 'font-size: 14px; color: #c084fc;');
    }
    
    renderStars() {
        const container = document.getElementById('stars-container');
        if (!container) return;
        container.innerHTML = '';
        
        this.stars.forEach(star => {
            const node = this.createStarNode(star);
            container.appendChild(node);
        });
    }
    
    createStarNode(star) {
        const node = document.createElement('div');
        node.className = 'star-node';
        node.id = `star-node-${star.id}`;
        node.style.left = star.x + '%';
        node.style.top = star.y + '%';
        
        if (star.id < this.currentStar) {
            node.classList.add('completed');
        } else if (star.id === this.currentStar) {
            node.classList.add('active');
        } else {
            node.classList.add('locked');
        }
        
        if (star.type === 'love') {
            node.classList.add('love-star');
        } else if (star.type === 'final') {
            node.classList.add('final-star');
        }
        
        node.innerHTML = `
            <div class="star-card" id="card-${star.id}">
                <div class="front">
                    <span class="star-number">${star.id}</span>
                </div>
                <div class="back">
                    <img src="${star.image}" alt="Yıldız ${star.id}" loading="lazy">
                </div>
            </div>
        `;
        
        node.addEventListener('click', () => this.handleStarClick(star));
        
        node.addEventListener('mouseenter', () => {
            if (window.universe && star.id === this.currentStar) {
                const rect = node.getBoundingClientRect();
                window.universe.createStarBurst(
                    rect.left + rect.width / 2,
                    rect.top + rect.height / 2
                );
            }
        });
        
        return node;
    }
    
    drawConstellationLines() {
        const svg = document.getElementById('constellation-svg');
        const path = document.getElementById('constellation-path');
        const activePath = document.getElementById('active-path');
        
        if (!svg || !path) return;
        
        let d = '';
        this.stars.forEach((star, index) => {
            if (index === 0) {
                d += `M ${star.x} ${star.y}`;
            } else {
                d += ` L ${star.x} ${star.y}`;
            }
        });
        
        path.setAttribute('d', d);
        
        let activeD = '';
        const activeStars = this.stars.filter(s => s.id <= this.currentStar);
        activeStars.forEach((star, index) => {
            if (index === 0) {
                activeD += `M ${star.x} ${star.y}`;
            } else {
                activeD += ` L ${star.x} ${star.y}`;
            }
        });
        
        if (activePath) {
            activePath.setAttribute('d', activeD);
        }
    }
    
    handleStarClick(star) {
        if (star.id > this.currentStar) {
            alert(`Önce ${this.currentStar}. yıldızı bitirmelisin prensesim! 🤍`);
            return;
        }
        
        if (star.id < this.currentStar) {
            this.showMessageModal(star);
            return;
        }
        
        if (star.mission === 'final') {
            this.showMessageModal(star, true);
        } else {
            this.openMissionModal(star);
        }
    }
    
    showMessageModal(star, isFinal = false) {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        overlay.onclick = () => this.closeMessageModal(overlay);
        
        const modal = document.createElement('div');
        modal.className = 'star-modal';
        modal.innerHTML = `
            <button class="close-modal" onclick="this.closest('.modal-overlay').remove()">&times;</button>
            <img src="${star.image}" alt="Yıldız ${star.id}">
            <div class="star-modal-content"></div>
        `;
        
        document.body.appendChild(overlay);
        overlay.appendChild(modal);
        
        const content = modal.querySelector('.star-modal-content');
        
        if (isFinal) {
            this.typewriterEffect(getFinalMessage(), content, () => {
                this.addGalaxyBadge(modal);
            });
            setTimeout(() => this.triggerFinalEffects(), 500);
        } else {
            this.typewriterEffect(star.message, content);
        }
        
        if (star.id === this.currentStar && star.id < 12) {
            this.flipCard(star.id);
            if (!this.completedStars.includes(star.id)) {
                this.completedStars.push(star.id);
                saveProgress(this.completedStars);
            }
            if (star.id === this.currentStar) {
                this.currentStar++;
                localStorage.setItem(CURRENT_STAR_KEY, this.currentStar.toString());
            }
            setTimeout(() => {
                this.renderStars();
                this.drawConstellationLines();
                this.updateProgressBar();
            }, 1000);
        }
    }
    
    closeMessageModal(overlay) {
        overlay.remove();
    }
    
    addGalaxyBadge(container) {
        const badge = document.createElement('div');
        badge.className = 'galaxy-badge';
        badge.innerHTML = '🏆 GALAKSİ FETHEDİLDİ 🏆';
        badge.style.cssText = `
            margin-top: 30px;
            padding: 15px 30px;
            background: linear-gradient(135deg, #fbbf24, #f59e0b);
            color: #000;
            border-radius: 50px;
            font-weight: 700;
            font-size: 18px;
            animation: badgePulse 2s infinite;
            display: inline-block;
        `;
        container.querySelector('.star-modal').appendChild(badge);
    }
    
    typewriterEffect(text, container, callback = null) {
        container.innerHTML = '';
        const cursor = document.createElement('span');
        cursor.className = 'typing-cursor';
        
        let index = 0;
        const speed = 30;
        
        const type = () => {
            if (index < text.length) {
                const char = text.charAt(index);
                
                if (char === '\n') {
                    container.appendChild(document.createElement('br'));
                } else {
                    container.appendChild(document.createTextNode(char));
                }
                
                container.appendChild(cursor);
                index++;
                
                setTimeout(type, speed);
            } else {
                cursor.remove();
                if (callback) callback();
            }
        };
        
        type();
    }
    
    openMissionModal(star) {
        this.currentMission = star;
        const modal = document.getElementById('mission-modal');
        
        document.getElementById('mission-id').textContent = star.id;
        document.getElementById('mission-title').textContent = star.title;
        document.getElementById('mission-question').textContent = star.question;
        
        document.querySelectorAll('.mission-type').forEach(el => {
            el.classList.add('hidden');
        });
        
        const missionEl = document.getElementById(`${star.mission}-mission`);
        if (missionEl) {
            missionEl.classList.remove('hidden');
        }
        
        this.prepareMission(star);
        modal.classList.add('active');
    }
    
    closeMissionModal() {
        const modal = document.getElementById('mission-modal');
        modal.classList.remove('active');
        this.currentMission = null;
    }
    
    prepareMission(star) {
        switch(star.mission) {
            case 'click':
                document.getElementById('click-btn').onclick = () => {
                    this.completeMission();
                };
                break;
                
            case 'input':
            case 'password':
                const input = document.getElementById('mission-input');
                input.value = '';
                setTimeout(() => input.focus(), 100);
                document.getElementById('submit-input').onclick = () => {
                    this.checkInputAnswer(input.value, star);
                };
                input.onkeypress = (e) => {
                    if (e.key === 'Enter') {
                        this.checkInputAnswer(input.value, star);
                    }
                };
                break;
                
            case 'date':
                const dateInput = document.getElementById('mission-date');
                document.getElementById('submit-date').onclick = () => {
                    this.checkDateAnswer(dateInput.value, star);
                };
                break;
                
            case 'puzzle':
                this.initPuzzleMission(star);
                break;
                
            case 'xox':
                this.initXOXMission(star);
                break;
                
            case 'hold':
                this.initHoldMission(star);
                break;
                
            case 'cipher':
                const cipherInput = document.getElementById('mission-input');
                cipherInput.value = '';
                setTimeout(() => cipherInput.focus(), 100);
                document.getElementById('submit-input').onclick = () => {
                    this.checkCipherAnswer(cipherInput.value, star);
                };
                cipherInput.onkeypress = (e) => {
                    if (e.key === 'Enter') {
                        this.checkCipherAnswer(cipherInput.value, star);
                    }
                };
                break;
                
            case 'doors':
                this.initDoorsMission(star);
                break;
        }
    }
    
    checkInputAnswer(value, star) {
        if (!value.trim()) {
            alert('Bir şey yazmalısın prensesim! 🤍');
            return;
        }
        
        if (checkPassword(value, star.password, star.altPasswords)) {
            if (star.specialEffect === 'gold-flash') {
                this.triggerGoldFlash();
            }
            this.completeMission();
        } else {
            alert('Yanlışşş!!! Tekrar dene kraliçem! 🤍');
        }
    }
    
    checkDateAnswer(value, star) {
        if (!value) {
            alert('Tarih seçmelisin hanımefendi! 🤍');
            return;
        }
        
        const date = new Date(value);
        // 25 Şubat 2009 kontrolü
        if (date.getDate() === 25 && date.getMonth() === 1 && date.getFullYear() === 2009) {
            this.completeMission();
        } else {
            alert('O tarih değil prensesim! 25 Şubat 2009\'u dene! 🤍');
        }
    }
    
    checkCipherAnswer(value, star) {
        if (!value.trim()) return;
        
        if (checkPassword(value, star.password, star.altPasswords)) {
            this.completeMission();
        } else {
            alert(`Yanlış! İpucu: "${star.hint}" 🤍`);
        }
    }
    
    initPuzzleMission(star) {
        const slotsContainer = document.getElementById('letter-slots');
        const poolContainer = document.getElementById('letter-pool');
        
        slotsContainer.innerHTML = '';
        poolContainer.innerHTML = '';
        
        const answer = star.password;
        const letters = star.letters;
        
        answer.split('').forEach((_, index) => {
            const slot = document.createElement('div');
            slot.className = 'letter-slot';
            slot.dataset.index = index;
            slot.onclick = () => this.removeLetterFromSlot(slot);
            slotsContainer.appendChild(slot);
        });
        
        letters.forEach((letter, index) => {
            const tile = document.createElement('div');
            tile.className = 'letter-tile';
            tile.textContent = letter;
            tile.dataset.letter = letter;
            tile.dataset.index = index;
            tile.onclick = () => this.addLetterToSlot(tile);
            poolContainer.appendChild(tile);
        });
        
        document.getElementById('submit-puzzle').onclick = () => {
            const slots = slotsContainer.querySelectorAll('.letter-slot');
            let word = '';
            slots.forEach(slot => {
                word += slot.textContent || '';
            });
            
            if (word === answer) {
                this.completeMission();
            } else {
                alert('Harfleri doğru sırala prensesim! 🤍');
            }
        };
    }
    
    addLetterToSlot(tile) {
        if (tile.classList.contains('used')) return;
        
        const slots = document.querySelectorAll('.letter-slot');
        const emptySlot = Array.from(slots).find(slot => !slot.textContent);
        
        if (emptySlot) {
            emptySlot.textContent = tile.dataset.letter;
            emptySlot.classList.add('filled');
            tile.classList.add('used');
        }
    }
    
    removeLetterFromSlot(slot) {
        if (!slot.textContent) return;
        
        const letter = slot.textContent;
        const tiles = document.querySelectorAll('.letter-tile');
        const usedTile = Array.from(tiles).find(
            tile => tile.dataset.letter === letter && tile.classList.contains('used')
        );
        
        if (usedTile) {
            usedTile.classList.remove('used');
        }
        
        slot.textContent = '';
        slot.classList.remove('filled');
    }
    
    initXOXMission(star) {
        const grid = document.getElementById('xox-grid');
        const status = document.querySelector('.xox-status');
        grid.innerHTML = '';
        
        let board = ['', '', '', '', '', '', '', '', ''];
        let currentPlayer = 'X';
        let gameActive = true;
        
        board.forEach((_, index) => {
            const cell = document.createElement('div');
            cell.className = 'xox-cell';
            cell.dataset.index = index;
            
            cell.onclick = () => {
                if (!gameActive || board[index] !== '' || currentPlayer !== 'X') return;
                
                board[index] = 'X';
                cell.textContent = 'X';
                cell.classList.add('x');
                
                if (this.checkXOXWin(board, 'X')) {
                    status.textContent = star.winMessage;
                    gameActive = false;
                    setTimeout(() => this.completeMission(), 1000);
                    return;
                }
                
                if (board.every(cell => cell !== '')) {
                    status.textContent = star.loseMessage;
                    gameActive = false;
                    setTimeout(() => this.completeMission(), 1000);
                    return;
                }
                
                currentPlayer = 'O';
                status.textContent = 'Sıra bende... 🤍';
                
                setTimeout(() => {
                    if (!gameActive) return;
                    
                    const emptyCells = board.map((v, i) => v === '' ? i : null).filter(v => v !== null);
                    if (emptyCells.length > 0) {
                        const move = emptyCells[Math.floor(Math.random() * emptyCells.length)];
                        board[move] = 'O';
                        const compCell = grid.children[move];
                        compCell.textContent = 'O';
                        compCell.classList.add('o');
                        
                        if (this.checkXOXWin(board, 'O')) {
                            status.textContent = 'Kazandım! Ama sen yine de kazandın kalbimde! 🤍';
                            gameActive = false;
                            setTimeout(() => this.completeMission(), 1000);
                            return;
                        }
                        
                        currentPlayer = 'X';
                        status.textContent = 'Sıra sende kraliçem! 🤍';
                    }
                }, 800);
            };
            
            grid.appendChild(cell);
        });
    }
    
    checkXOXWin(board, player) {
        const winConditions = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];
        
        return winConditions.some(condition => {
            return condition.every(index => board[index] === player);
        });
    }
    
    initHoldMission(star) {
        const btn = document.getElementById('hold-btn');
        const progress = document.getElementById('hold-progress');
        let holding = false;
        let progressValue = 0;
        let interval;
        
        const startHold = (e) => {
            e.preventDefault();
            holding = true;
            progressValue = 0;
            
            interval = setInterval(() => {
                if (!holding) {
                    clearInterval(interval);
                    progress.style.width = '0%';
                    return;
                }
                
                progressValue += 100 / (star.duration / 50);
                progress.style.width = progressValue + '%';
                
                if (progressValue >= 100) {
                    clearInterval(interval);
                    holding = false;
                    this.completeMission();
                }
            }, 50);
        };
        
        const endHold = () => {
            holding = false;
            clearInterval(interval);
            progress.style.width = '0%';
        };
        
        btn.onmousedown = startHold;
        btn.onmouseup = endHold;
        btn.onmouseleave = endHold;
        btn.ontouchstart = startHold;
        btn.ontouchend = endHold;
    }
    
    initDoorsMission(star) {
        const doors = document.querySelectorAll('.door');
        
        doors.forEach(door => {
            door.onclick = () => {
                const doorId = parseInt(door.dataset.door);
                const doorData = star.doors.find(d => d.id === doorId);
                
                door.classList.add('selected');
                
                setTimeout(() => {
                    alert(doorData.message);
                    this.completeMission();
                }, 300);
            };
        });
    }
    
    completeMission() {
        if (!this.currentMission) return;
        
        const star = this.currentMission;
        this.closeMissionModal();
        
        setTimeout(() => {
            this.showMessageModal(star);
        }, 300);
    }
    
    flipCard(starId) {
        const card = document.getElementById(`card-${starId}`);
        if (card) {
            card.classList.add('flipped');
        }
    }
    
    updateProgressBar() {
        const percent = ((this.currentStar - 1) / 12) * 100;
        const fill = document.getElementById('progress-fill');
        const text = document.getElementById('progress-text');
        if (fill) fill.style.width = percent + '%';
        if (text) text.textContent = Math.floor(percent) + '%';
    }
    
    triggerGoldFlash() {
        const flash = document.createElement('div');
        flash.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: radial-gradient(circle, rgba(251, 191, 36, 0.9) 0%, rgba(251, 191, 36, 0.5) 50%, transparent 70%);
            z-index: 9999;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.5s;
        `;
        document.body.appendChild(flash);
        
        setTimeout(() => flash.style.opacity = '1', 10);
        setTimeout(() => flash.style.opacity = '0', 1000);
        setTimeout(() => flash.remove(), 1500);
    }
    
    triggerFinalEffects() {
        if (window.universe) {
            window.universe.triggerConfetti();
        }
        
        const container = document.getElementById('hearts-rain');
        if (container) {
            container.classList.add('active');
            
            const createHeart = () => {
                const heart = document.createElement('span');
                heart.className = 'falling-heart';
                heart.textContent = '🤍';
                heart.style.left = Math.random() * 100 + '%';
                heart.style.animationDuration = (Math.random() * 3 + 2) + 's';
                heart.style.fontSize = (Math.random() * 20 + 15) + 'px';
                container.appendChild(heart);
                
                setTimeout(() => heart.remove(), 5000);
            };
            
            const interval = setInterval(createHeart, 200);
            setTimeout(() => clearInterval(interval), 15000);
            
            for (let i = 0; i < 20; i++) {
                setTimeout(createHeart, i * 100);
            }
        }
    }
    
    toggleMusic() {
        const music = document.getElementById('bg-music');
        const btn = document.getElementById('music-btn');
        const btnText = btn.querySelector('.music-text');
        
        if (this.musicPlaying) {
            music.pause();
            btn.classList.remove('playing');
            btnText.textContent = 'Müziği Aç';
        } else {
            music.play().catch(e => console.log('Müzik otomatik oynatılamadı:', e));
            btn.classList.add('playing');
            btnText.textContent = 'Müziği Kapat';
        }
        
        this.musicPlaying = !this.musicPlaying;
    }
    
    bindEvents() {
        const musicBtn = document.getElementById('music-btn');
        if (musicBtn) {
            musicBtn.addEventListener('click', () => this.toggleMusic());
        }
        
        const closeModalBtn = document.querySelector('.mission-modal .modal-close');
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', () => this.closeMissionModal());
        }
        
        const backdrop = document.querySelector('.mission-modal .modal-backdrop');
        if (backdrop) {
            backdrop.addEventListener('click', () => this.closeMissionModal());
        }
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeMissionModal();
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.YağmurQuest = new YağmurGalaxyQuest();
    
    if (typeof gsap !== 'undefined') {
        gsap.from('#love-bar', {
            y: -100,
            opacity: 0,
            duration: 1,
            ease: 'power4.out'
        });
    }
});
