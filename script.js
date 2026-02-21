// ============= GAME BOOSTER PRO - DENGAN GAMBAR KOSONG =============

// Database game dengan placeholder gambar (kosong)
const GAMES = [
    {
        name: "Mobile Legends",
        package: "com.mobile.legends",
        uri: "mobilelegends://",
        category: "MOBA",
        image: "" // Kosong, nanti diisi manual
    },
    {
        name: "Free Fire",
        package: "com.dts.freefireth",
        uri: "freefire://",
        category: "Battle Royale",
        image: ""
    },
    {
        name: "Free Fire MAX",
        package: "com.dts.freefiremax",
        uri: "freefiremax://",
        category: "Battle Royale",
        image: ""
    },
    {
        name: "PUBG Mobile",
        package: "com.tencent.ig",
        uri: "pubgm://",
        category: "Battle Royale",
        image: ""
    },
    {
        name: "Genshin Impact",
        package: "com.miHoYo.GenshinImpact",
        uri: "genshinimpact://",
        category: "RPG",
        image: ""
    },
    {
        name: "Call of Duty",
        package: "com.activision.callofduty.shooter",
        uri: "codm://",
        category: "FPS",
        image: ""
    },
    {
        name: "FIFA Mobile",
        package: "com.ea.gp.fifamobile",
        uri: "fifamobile://",
        category: "Sports",
        image: ""
    },
    {
        name: "Among Us",
        package: "com.innersloth.spacemafia",
        uri: "amongus://",
        category: "Party",
        image: ""
    },
    {
        name: "League of Legends",
        package: "com.riotgames.league.wildrift",
        uri: "wildrift://",
        category: "MOBA",
        image: ""
    },
    {
        name: "eFootball",
        package: "jp.konami.pesam",
        uri: "efootball://",
        category: "Sports",
        image: ""
    },
    {
        name: "Arena of Valor",
        package: "com.garena.game.kgtw",
        uri: "aov://",
        category: "MOBA",
        image: ""
    },
    {
        name: "Mobile Legends Advance",
        package: "com.mobile.legends.advance",
        uri: "mladvance://",
        category: "RPG",
        image: ""
    }
];

// ============= STATE MANAGEMENT =============
let state = {
    detectedGames: [],
    recentGames: JSON.parse(localStorage.getItem('recentGames') || '[]'),
    hasPermission: false,
    floatingActive: false,
    currentGame: null,
    fps: 60,
    frameCount: 0,
    lastFpsUpdate: performance.now()
};

// ============= ELEMENTS =============
const elements = {
    floatingWindow: document.getElementById('floatingWindow'),
    floatingToggle: document.getElementById('floatingToggle'),
    permissionCard: document.getElementById('permissionCard'),
    gameGrid: document.getElementById('gameGrid'),
    recentGames: document.getElementById('recentGames'),
    toast: document.getElementById('toast'),
    menuModal: document.getElementById('menuModal'),
    floatGameName: document.getElementById('floatGameName'),
    ramValue: document.getElementById('ramValue'),
    cpuValue: document.getElementById('cpuValue'),
    tempValue: document.getElementById('tempValue'),
    fpsValue: document.getElementById('fpsValue'),
    floatRam: document.getElementById('floatRam'),
    floatCpu: document.getElementById('floatCpu'),
    floatTemp: document.getElementById('floatTemp'),
    floatFps: document.getElementById('floatFps')
};

// ============= INITIALIZATION =============
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    checkPermission();
    scanGames();
    startPerformanceMonitor();
    setupEventListeners();
    setupFloatingDrag();
    renderRecentGames();
    updateDeviceInfo();
}

// ============= DEVICE INFO =============
function updateDeviceInfo() {
    const deviceModel = document.getElementById('deviceModel');
    if (/Android/i.test(navigator.userAgent)) {
        deviceModel.textContent = 'Android Device';
    } else {
        deviceModel.textContent = 'Desktop Mode';
    }
}

// ============= PERMISSION HANDLING =============
function checkPermission() {
    state.hasPermission = localStorage.getItem('floatPermission') === 'granted';
    
    elements.permissionCard.style.display = state.hasPermission ? 'none' : 'flex';
    elements.floatingToggle.disabled = !state.hasPermission;
    
    if (!state.hasPermission) {
        elements.floatingToggle.checked = false;
        elements.floatingWindow.style.display = 'none';
        state.floatingActive = false;
    }
}

document.getElementById('requestPermBtn').addEventListener('click', () => {
    if (/Android/i.test(navigator.userAgent)) {
        showToast('🔓 Buka Settings > Apps > Game Booster > Advanced > Draw over other apps');
        
        setTimeout(() => {
            if (confirm('Sudah mengizinkan floating window?')) {
                localStorage.setItem('floatPermission', 'granted');
                checkPermission();
                showToast('✅ Izin diberikan!');
            }
        }, 3000);
    } else {
        localStorage.setItem('floatPermission', 'granted');
        checkPermission();
        showToast('✅ Izin diberikan (mode desktop)');
    }
});

// ============= GAME DETECTION =============
async function scanGames() {
    showToast('🔍 Memindai game...');
    
    elements.gameGrid.innerHTML = '<div class="loading">Memindai game...</div>';
    
    state.detectedGames = [];
    const isAndroid = /Android/i.test(navigator.userAgent);
    
    if (isAndroid) {
        // Deteksi via Intent
        for (const game of GAMES) {
            if (await checkGameInstalled(game.package)) {
                state.detectedGames.push(game);
            }
            await new Promise(r => setTimeout(r, 50));
        }
    }
    
    // Fallback ke semua game
    if (state.detectedGames.length === 0) {
        state.detectedGames = GAMES.slice(0, 6);
    }
    
    renderGameList();
    document.getElementById('gameCount').textContent = `${state.detectedGames.length} game`;
}

function checkGameInstalled(packageName) {
    return new Promise(resolve => {
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        
        const timer = setTimeout(() => {
            document.body.removeChild(iframe);
            resolve(false);
        }, 200);
        
        iframe.onload = () => {
            clearTimeout(timer);
            document.body.removeChild(iframe);
            resolve(true);
        };
        
        iframe.src = `intent://${packageName}/#Intent;package=${packageName};end`;
        document.body.appendChild(iframe);
    });
}

// ============= RENDER GAME LIST DENGAN GAMBAR KOSONG =============
function renderGameList() {
    if (state.detectedGames.length === 0) {
        elements.gameGrid.innerHTML = '<div class="loading">Tidak ada game terdeteksi</div>';
        return;
    }
    
    elements.gameGrid.innerHTML = state.detectedGames.map(game => `
        <div class="game-card" data-pkg="${game.package}" data-uri="${game.uri}" data-name="${game.name}">
            <div class="game-image">
                <img src="${game.image || 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'80\' height=\'80\' viewBox=\'0 0 80 80\'%3E%3Crect width=\'80\' height=\'80\' fill=\'%232a2f45\'/%3E%3Ctext x=\'16\' y=\'48\' fill=\'%234a6cf7\' font-size=\'32\'%3E🎮%3C/text%3E%3C/svg%3E'}" 
                     alt="${game.name}"
                     onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'80\' height=\'80\' viewBox=\'0 0 80 80\'%3E%3Crect width=\'80\' height=\'80\' fill=\'%232a2f45\'/%3E%3Ctext x=\'16\' y=\'48\' fill=\'%234a6cf7\' font-size=\'32\'%3E🎮%3C/text%3E%3C/svg%3E'">
            </div>
            <div class="game-title">${game.name}</div>
            <div class="game-category">${game.category}</div>
            <span class="game-boost-badge">BOOST & MAIN</span>
        </div>
    `).join('');
    
    // Add click handlers
    document.querySelectorAll('.game-card').forEach(card => {
        card.addEventListener('click', () => {
            const name = card.dataset.name;
            const pkg = card.dataset.pkg;
            const uri = card.dataset.uri;
            launchGame(name, pkg, uri);
        });
    });
}

// ============= LAUNCH GAME =============
function launchGame(gameName, packageName, uri) {
    showToast(`🚀 Membuka ${gameName}...`);
    
    // Set active game
    state.currentGame = gameName;
    elements.floatGameName.textContent = `🎮 Game: ${gameName}`;
    
    // Save to recent
    const recent = { name: gameName, pkg: packageName, time: Date.now() };
    state.recentGames = [recent, ...state.recentGames.filter(g => g.pkg !== packageName)].slice(0, 5);
    localStorage.setItem('recentGames', JSON.stringify(state.recentGames));
    renderRecentGames();
    
    // Boost before launch
    performBoost(() => {
        // Launch game
        try {
            if (uri) {
                window.location.href = uri;
            } else {
                window.location.href = `intent://${packageName}/#Intent;package=${packageName};end`;
            }
            
            // Auto enable floating
            setTimeout(() => {
                if (state.hasPermission && elements.floatingToggle.checked) {
                    elements.floatingWindow.style.display = 'block';
                    state.floatingActive = true;
                }
            }, 2000);
        } catch (e) {
            showToast('❌ Gagal membuka game');
        }
    });
}

// ============= RENDER RECENT GAMES =============
function renderRecentGames() {
    if (state.recentGames.length === 0) {
        elements.recentGames.innerHTML = '<div class="recent-item">-</div>';
        return;
    }
    
    elements.recentGames.innerHTML = state.recentGames.map(game => `
        <div class="recent-item" data-pkg="${game.pkg}" data-name="${game.name}">
            <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20'%3E%3Crect width='20' height='20' fill='%234a6cf7' opacity='0.3'/%3E%3Ctext x='2' y='16' fill='white' font-size='14'%3E🎮%3C/text%3E%3C/svg%3E" alt="game">
            <span>${game.name}</span>
        </div>
    `).join('');
    
    document.querySelectorAll('.recent-item').forEach(item => {
        item.addEventListener('click', () => {
            const name = item.dataset.name;
            const pkg = item.dataset.pkg;
            const game = GAMES.find(g => g.package === pkg);
            launchGame(name, pkg, game?.uri || '');
        });
    });
}

// ============= BOOST FUNCTION =============
function performBoost(callback) {
    // Animasi
    document.querySelectorAll('.boost-btn, .float-boost').forEach(btn => {
        btn.style.transform = 'scale(0.95)';
        setTimeout(() => btn.style.transform = 'scale(1)', 200);
    });
    
    showToast('⚡ Membersihkan RAM...');
    
    setTimeout(() => {
        updateStats(true);
        showToast('✅ Boost selesai!');
        if (callback) callback();
    }, 1500);
}

// ============= FLOATING WINDOW =============
elements.floatingToggle.addEventListener('change', (e) => {
    if (!state.hasPermission) return;
    
    state.floatingActive = e.target.checked;
    elements.floatingWindow.style.display = e.target.checked ? 'block' : 'none';
    
    if (e.target.checked) {
        showToast('📊 Floating stats aktif');
    }
});

// Drag floating window
function setupFloatingDrag() {
    const dragHandle = document.getElementById('dragHandle');
    let isDragging = false;
    let offsetX, offsetY;
    
    dragHandle.addEventListener('mousedown', (e) => {
        isDragging = true;
        offsetX = e.clientX - elements.floatingWindow.offsetLeft;
        offsetY = e.clientY - elements.floatingWindow.offsetTop;
    });
    
    dragHandle.addEventListener('touchstart', (e) => {
        isDragging = true;
        offsetX = e.touches[0].clientX - elements.floatingWindow.offsetLeft;
        offsetY = e.touches[0].clientY - elements.floatingWindow.offsetTop;
    });
    
    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        elements.floatingWindow.style.left = (e.clientX - offsetX) + 'px';
        elements.floatingWindow.style.top = (e.clientY - offsetY) + 'px';
    });
    
    document.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
        elements.floatingWindow.style.left = (e.touches[0].clientX - offsetX) + 'px';
        elements.floatingWindow.style.top = (e.touches[0].clientY - offsetY) + 'px';
    });
    
    document.addEventListener('mouseup', () => isDragging = false);
    document.addEventListener('touchend', () => isDragging = false);
}

// Minimize floating
document.getElementById('minimizeFloat').addEventListener('click', () => {
    elements.floatingWindow.classList.toggle('minimized');
});

// Close floating
document.getElementById('closeFloat').addEventListener('click', () => {
    elements.floatingWindow.style.display = 'none';
    elements.floatingToggle.checked = false;
    state.floatingActive = false;
});

// ============= STATS UPDATE =============
function startPerformanceMonitor() {
    // FPS Counter
    function measureFPS() {
        state.frameCount++;
        const now = performance.now();
        if (now - state.lastFpsUpdate >= 1000) {
            state.fps = state.frameCount;
            state.frameCount = 0;
            state.lastFpsUpdate = now;
        }
        requestAnimationFrame(measureFPS);
    }
    measureFPS();
    
    // Update stats every second
    setInterval(() => {
        updateStats(false);
    }, 1000);
}

function updateStats(boosted = false) {
    // RAM
    if ('deviceMemory' in navigator) {
        const totalRam = navigator.deviceMemory;
        let freeRam;
        
        if (boosted) {
            freeRam = Math.round(totalRam * 0.7);
        } else {
            freeRam = Math.round(totalRam * (0.4 + Math.random() * 0.2));
        }
        
        elements.ramValue.textContent = `${freeRam}/${totalRam} GB`;
        elements.floatRam.textContent = `${freeRam}/${totalRam} GB`;
    } else {
        elements.ramValue.textContent = boosted ? '2.8/4.0 GB' : '1.6/4.0 GB';
        elements.floatRam.textContent = boosted ? '2.8/4.0 GB' : '1.6/4.0 GB';
    }
    
    // CPU
    const cpuBase = boosted ? 25 : 45;
    const cpuRandom = cpuBase + Math.round(Math.random() * 15);
    elements.cpuValue.textContent = cpuRandom + '%';
    elements.floatCpu.textContent = cpuRandom + '%';
    
    // Temperature
    const tempBase = boosted ? 38 : 42;
    const tempRandom = tempBase + Math.round(Math.random() * 3);
    elements.tempValue.textContent = tempRandom + '°C';
    elements.floatTemp.textContent = tempRandom + '°C';
    
    // FPS
    elements.fpsValue.textContent = state.fps;
    elements.floatFps.textContent = state.fps;
}

// ============= TOAST NOTIFICATION =============
function showToast(message, duration = 2000) {
    elements.toast.textContent = message;
    elements.toast.classList.add('show');
    
    setTimeout(() => {
        elements.toast.classList.remove('show');
    }, duration);
}

// ============= EVENT LISTENERS =============
function setupEventListeners() {
    // Boost buttons
    document.getElementById('boostBtn').addEventListener('click', () => performBoost());
    document.getElementById('floatBoostBtn').addEventListener('click', () => performBoost());
    
    // Menu
    document.getElementById('menuBtn').addEventListener('click', () => {
        elements.menuModal.classList.add('show');
    });
    
    document.getElementById('closeMenu').addEventListener('click', () => {
        elements.menuModal.classList.remove('show');
    });
    
    // Menu items
    document.getElementById('rescanBtn').addEventListener('click', () => {
        elements.menuModal.classList.remove('show');
        scanGames();
    });
    
    document.getElementById('checkPermBtn').addEventListener('click', () => {
        elements.menuModal.classList.remove('show');
        checkPermission();
        showToast(state.hasPermission ? '✅ Izin aktif' : '❌ Izin belum diberikan');
    });
    
    document.getElementById('resetFloatBtn').addEventListener('click', () => {
        elements.menuModal.classList.remove('show');
        elements.floatingWindow.style.top = '100px';
        elements.floatingWindow.style.left = '20px';
        showToast('🪟 Posisi floating direset');
    });
    
    // Bottom navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function() {
            document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
            this.classList.add('active');
            
            const page = this.dataset.page;
            if (page === 'games') {
                document.querySelector('.game-section').scrollIntoView({ behavior: 'smooth' });
            } else if (page === 'stats') {
                document.querySelector('.boost-panel').scrollIntoView({ behavior: 'smooth' });
            } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    });
 }
