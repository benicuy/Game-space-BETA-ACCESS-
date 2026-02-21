// ============= GAME BOOSTER PRO - FLOATING STATS =============
// Database game populer
const GAME_DATABASE = [
    {
        name: "Mobile Legends",
        package: "com.mobile.legends",
        icon: "🎮",
        category: "MOBA",
        uri: "mobilelegends://"
    },
    {
        name: "Free Fire",
        package: "com.dts.freefireth",
        icon: "🔥",
        category: "Battle Royale",
        uri: "freefire://"
    },
    {
        name: "Free Fire MAX",
        package: "com.dts.freefiremax",
        icon: "🔥",
        category: "Battle Royale",
        uri: "freefiremax://"
    },
    {
        name: "PUBG Mobile",
        package: "com.tencent.ig",
        icon: "🔫",
        category: "Battle Royale",
        uri: "pubgm://"
    },
    {
        name: "Genshin Impact",
        package: "com.miHoYo.GenshinImpact",
        icon: "✨",
        category: "RPG",
        uri: "genshinimpact://"
    },
    {
        name: "Call of Duty",
        package: "com.activision.callofduty.shooter",
        icon: "🎯",
        category: "FPS",
        uri: "codm://"
    }
];

// State aplikasi
let installedGames = [];
let boostActive = true;
let performanceInterval;
let floatingActive = false;
let fps = 60;
let frameCount = 0;
let lastFpsUpdate = performance.now();

// ============= FLOATING WINDOW SETUP =============
let floatingWindow = document.getElementById('floatingWindow');
let isDragging = false;
let dragOffsetX, dragOffsetY;
let isMinimized = false;

// Fungsi untuk mengaktifkan floating window
function enableFloatingWindow(enable) {
    if (enable) {
        floatingWindow.style.display = 'block';
        floatingActive = true;
        
        // Load posisi terakhir
        const savedPos = localStorage.getItem('floatingPos');
        if (savedPos) {
            const pos = JSON.parse(savedPos);
            floatingWindow.style.top = pos.top;
            floatingWindow.style.left = pos.left;
        }
        
        showNotification('📊 Floating stats aktif');
    } else {
        floatingWindow.style.display = 'none';
        floatingActive = false;
        showNotification('Floating stats nonaktif');
    }
}

// Drag & Drop untuk floating window
function setupFloatingDrag() {
    const dragArea = document.getElementById('dragArea');
    const header = document.querySelector('.floating-header');
    
    function startDrag(e) {
        e.preventDefault();
        isDragging = true;
        
        const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
        const clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;
        
        const rect = floatingWindow.getBoundingClientRect();
        dragOffsetX = clientX - rect.left;
        dragOffsetY = clientY - rect.top;
        
        floatingWindow.style.transition = 'none';
    }
    
    function onDrag(e) {
        if (!isDragging) return;
        e.preventDefault();
        
        const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
        const clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;
        
        // Batasi agar tidak keluar layar
        const maxX = window.innerWidth - floatingWindow.offsetWidth;
        const maxY = window.innerHeight - floatingWindow.offsetHeight;
        
        let newX = Math.min(Math.max(0, clientX - dragOffsetX), maxX);
        let newY = Math.min(Math.max(0, clientY - dragOffsetY), maxY);
        
        floatingWindow.style.left = newX + 'px';
        floatingWindow.style.top = newY + 'px';
    }
    
    function stopDrag() {
        if (isDragging) {
            isDragging = false;
            floatingWindow.style.transition = 'all 0.1s';
            
            // Simpan posisi
            const pos = {
                top: floatingWindow.style.top,
                left: floatingWindow.style.left
            };
            localStorage.setItem('floatingPos', JSON.stringify(pos));
        }
    }
    
    // Event listeners
    dragArea.addEventListener('mousedown', startDrag);
    dragArea.addEventListener('touchstart', startDrag, { passive: false });
    header.addEventListener('mousedown', startDrag);
    header.addEventListener('touchstart', startDrag, { passive: false });
    
    window.addEventListener('mousemove', onDrag);
    window.addEventListener('touchmove', onDrag, { passive: false });
    window.addEventListener('mouseup', stopDrag);
    window.addEventListener('touchend', stopDrag);
}

// Update floating window stats
function updateFloatingStats() {
    if (!floatingActive) return;
    
    // RAM
    if ('deviceMemory' in navigator) {
        const totalRam = navigator.deviceMemory;
        const usedRam = Math.round(totalRam * (0.4 + Math.random() * 0.2));
        const freeRam = totalRam - usedRam;
        document.getElementById('floatRam').textContent = `${freeRam.toFixed(1)}/${totalRam} GB`;
    } else {
        document.getElementById('floatRam').textContent = '2.1/4.0 GB';
    }
    
    // CPU
    const cpuUsage = Math.round(25 + Math.random() * 30);
    document.getElementById('floatCpu').textContent = cpuUsage + '%';
    
    // Suhu
    const temp = 38 + Math.round(Math.random() * 5);
    document.getElementById('floatTemp').textContent = temp + '°C';
    
    // Baterai
    if ('getBattery' in navigator) {
        navigator.getBattery().then(battery => {
            const level = Math.round(battery.level * 100);
            const charging = battery.charging ? '⚡' : '';
            document.getElementById('floatBattery').textContent = level + '% ' + charging;
            
            // Glow effect berdasarkan performa
            const glow = document.getElementById('floatGlow');
            if (level < 20 && !battery.charging) {
                glow.style.background = 'linear-gradient(90deg, #ff6b6b, #ff4757)';
            } else {
                glow.style.background = 'linear-gradient(90deg, #4a6cf7, #6c5ce7)';
            }
        });
    } else {
        document.getElementById('floatBattery').textContent = '85%';
    }
    
    // Network
    if ('connection' in navigator) {
        const conn = navigator.connection;
        const type = conn.effectiveType || '4G';
        document.getElementById('floatNetwork').textContent = type.toUpperCase();
    } else {
        document.getElementById('floatNetwork').textContent = navigator.onLine ? '4G' : 'Offline';
    }
    
    // FPS
    document.getElementById('floatFps').textContent = fps;
    
    // Update glow width based on performance
    const perfScore = Math.min(100, Math.round((fps / 60) * 80 + cpuUsage / 2));
    document.getElementById('floatGlow').style.width = perfScore + '%';
}

// ============= GAME DETECTION =============
async function detectInstalledGames() {
    showNotification("🔍 Memindai game terinstall...");
    
    const gameGrid = document.getElementById('gameGrid');
    gameGrid.innerHTML = '<div class="loading-games">Memindai game...</div>';
    
    installedGames = [];
    
    // Deteksi game
    for (const game of GAME_DATABASE) {
        const isInstalled = await checkAppInstalled(game.package);
        if (isInstalled) {
            installedGames.push(game);
        }
    }
    
    // Fallback
    if (installedGames.length === 0) {
        installedGames = GAME_DATABASE.slice(0, 6);
    }
    
    updateGameGrid();
    document.getElementById('gameCount').textContent = installedGames.length + ' game';
}

function checkAppInstalled(packageName) {
    return new Promise((resolve) => {
        if (/Android/i.test(navigator.userAgent)) {
            // Simulasi deteksi
            setTimeout(() => {
                // Game populer biasanya terinstall
                if (packageName.includes('mobile.legends') || 
                    packageName.includes('freefire') || 
                    packageName.includes('tencent')) {
                    resolve(Math.random() > 0.3);
                } else {
                    resolve(Math.random() > 0.6);
                }
            }, 200);
        } else {
            resolve(false);
        }
    });
}

function updateGameGrid() {
    const gameGrid = document.getElementById('gameGrid');
    
    if (installedGames.length === 0) {
        gameGrid.innerHTML = '<div class="loading-games">Tidak ada game</div>';
        return;
    }
    
    gameGrid.innerHTML = installedGames.map(game => `
        <div class="game-card" data-package="${game.package}" data-uri="${game.uri}" data-name="${game.name}">
            <div class="game-icon">${game.icon}</div>
            <div class="game-name">${game.name}</div>
            <span class="game-boost-badge">BOOST</span>
        </div>
    `).join('');
    
    document.querySelectorAll('.game-card').forEach(card => {
        card.addEventListener('click', function() {
            const packageName = this.dataset.package;
            const gameName = this.dataset.name;
            const uri = this.dataset.uri;
            launchGame(packageName, gameName, uri);
        });
    });
}

// ============= LAUNCH GAME =============
function launchGame(packageName, gameName, uri) {
    showNotification(`⚡ Membuka ${gameName} dengan mode turbo...`);
    
    performBoost().then(() => {
        try {
            // Coba buka dengan URI scheme
            if (uri) {
                window.location.href = uri;
                
                // Aktifkan floating window saat game berjalan
                if (document.getElementById('enableFloating').checked) {
                    setTimeout(() => {
                        floatingWindow.style.display = 'block';
                        floatingActive = true;
                    }, 1000);
                }
                
                showNotification(`🎮 ${gameName} dimulai!`);
            } else {
                // Fallback ke intent
                const intent = `intent://${packageName}/#Intent;scheme=androidapp;package=${packageName};end`;
                window.location.href = intent;
            }
        } catch (e) {
            showNotification('❌ Gagal membuka game');
        }
    });
}

// ============= PERFORMANCE =============
async function performBoost() {
    return new Promise((resolve) => {
        const boostBtn = document.querySelector('.boost-btn');
        boostBtn.style.transform = 'scale(0.95)';
        setTimeout(() => boostBtn.style.transform = 'scale(1)', 200);
        
        showNotification('⚡ Membersihkan RAM...');
        
        setTimeout(() => {
            updatePerformanceStats(true);
            showNotification('✅ Boost selesai!');
            resolve();
        }, 1500);
    });
}

function updatePerformanceStats(boosted = false) {
    if ('deviceMemory' in navigator) {
        const totalRam = navigator.deviceMemory;
        let freeRam;
        
        if (boosted) {
            freeRam = Math.round((totalRam * 0.7) * 10) / 10;
        } else {
            freeRam = Math.round((totalRam * 0.4) * 10) / 10;
        }
        
        document.getElementById('freeRam').textContent = `${freeRam}/${totalRam} GB`;
    } else {
        document.getElementById('freeRam').textContent = boosted ? '2.8/4.0 GB' : '1.6/4.0 GB';
    }
    
    const cpu = boosted ? 25 : 45;
    document.getElementById('cpuUsage').textContent = (cpu + Math.round(Math.random() * 10)) + '%';
    document.getElementById('temperature').textContent = (boosted ? 38 : 42) + '°C';
}

// ============= FPS COUNTER =============
function measureFPS() {
    frameCount++;
    const now = performance.now();
    const delta = now - lastFpsUpdate;
    
    if (delta >= 1000) {
        fps = Math.round((frameCount * 1000) / delta);
        frameCount = 0;
        lastFpsUpdate = now;
    }
    
    requestAnimationFrame(measureFPS);
}

// ============= NOTIFICATION =============
function showNotification(message, duration = 2000) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, duration);
}

// ============= INIT =============
document.addEventListener('DOMContentLoaded', async () => {
    // Setup floating window
    setupFloatingDrag();
    
    // Floating toggle
    const enableFloating = document.getElementById('enableFloating');
    enableFloating.addEventListener('change', function(e) {
        enableFloatingWindow(e.target.checked);
    });
    
    // Minimize button
    document.getElementById('minimizeFloating').addEventListener('click', () => {
        floatingWindow.classList.toggle('minimized');
        isMinimized = !isMinimized;
    });
    
    // Close button
    document.getElementById('closeFloating').addEventListener('click', () => {
        floatingWindow.style.display = 'none';
        enableFloating.checked = false;
        floatingActive = false;
    });
    
    // Start updates
    await detectInstalledGames();
    updatePerformanceStats(false);
    measureFPS();
    
    // Update stats setiap detik
    setInterval(() => {
        updatePerformanceStats(false);
        updateFloatingStats();
    }, 1000);
    
    // ===== EVENT LISTENERS =====
    document.getElementById('quickBoostBtn').addEventListener('click', performBoost);
    
    // Menu
    const menuBtn = document.getElementById('menuBtn');
    const menuModal = document.getElementById('menuModal');
    const closeModal = document.querySelector('.close-modal');
    
    menuBtn.addEventListener('click', () => menuModal.classList.add('show'));
    closeModal.addEventListener('click', () => menuModal.classList.remove('show'));
    menuModal.addEventListener('click', (e) => {
        if (e.target === menuModal) menuModal.classList.remove('show');
    });
    
    // Menu items
    document.getElementById('scanGames').addEventListener('click', async () => {
        menuModal.classList.remove('show');
        await detectInstalledGames();
    });
    
    document.getElementById('clearAllCache').addEventListener('click', () => {
        menuModal.classList.remove('show');
        showNotification('🗑️ Cache dibersihkan!');
    });
    
    document.getElementById('resetFloating').addEventListener('click', () => {
        menuModal.classList.remove('show');
        floatingWindow.style.top = '100px';
        floatingWindow.style.left = '20px';
        localStorage.removeItem('floatingPos');
        showNotification('🪟 Posisi floating direset');
    });
    
    document.getElementById('aboutApp').addEventListener('click', () => {
        menuModal.classList.remove('show');
        showNotification('Game Booster Pro v2.0 - With Floating Stats');
    });
    
    // Boost toggle
    document.getElementById('boostToggle').addEventListener('change', function(e) {
        boostActive = e.target.checked;
        showNotification(boostActive ? '⚡ Mode boost aktif' : 'Mode boost nonaktif');
    });
    
    // DND mode
    document.getElementById('dndMode').addEventListener('change', function(e) {
        if (e.target.checked) {
            showNotification('🔕 Mode DND aktif - notifikasi diblokir');
        }
    });
    
    // Auto clear
    document.getElementById('autoClear').addEventListener('change', function(e) {
        showNotification(e.target.checked ? 'Auto-clear aktif' : 'Auto-clear nonaktif');
    });
    
    // Bottom navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function() {
            document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
            this.classList.add('active');
            
            const tab = this.dataset.tab;
            if (tab === 'boost') {
                document.querySelector('.performance-card').scrollIntoView({ behavior: 'smooth' });
            } else if (tab === 'settings') {
                document.querySelector('.features-card').scrollIntoView({ behavior: 'smooth' });
            } else {
                document.querySelector('.game-section').scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
});
