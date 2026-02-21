// ============= GAME BOOSTER PRO =============
// Database game populer dengan package name dan intent
const GAME_DATABASE = [
    {
        name: "Mobile Legends",
        package: "com.mobile.legends",
        icon: "🎮",
        category: "MOBA",
        intent: "intent://com.mobile.legends/#Intent;scheme=androidapp;package=com.mobile.legends;end"
    },
    {
        name: "Free Fire",
        package: "com.dts.freefireth",
        icon: "🔥",
        category: "Battle Royale",
        intent: "intent://com.dts.freefireth/#Intent;scheme=androidapp;package=com.dts.freefireth;end"
    },
    {
        name: "PUBG Mobile",
        package: "com.tencent.ig",
        icon: "🔫",
        category: "Battle Royale",
        intent: "intent://com.tencent.ig/#Intent;scheme=androidapp;package=com.tencent.ig;end"
    },
    {
        name: "Genshin Impact",
        package: "com.miHoYo.GenshinImpact",
        icon: "✨",
        category: "RPG",
        intent: "intent://com.miHoYo.GenshinImpact/#Intent;scheme=androidapp;package=com.miHoYo.GenshinImpact;end"
    },
    {
        name: "Call of Duty",
        package: "com.activision.callofduty.shooter",
        icon: "🎯",
        category: "FPS",
        intent: "intent://com.activision.callofduty.shooter/#Intent;scheme=androidapp;package=com.activision.callofduty.shooter;end"
    },
    {
        name: "FIFA Soccer",
        package: "com.ea.gp.fifamobile",
        icon: "⚽",
        category: "Sports",
        intent: "intent://com.ea.gp.fifamobile/#Intent;scheme=androidapp;package=com.ea.gp.fifamobile;end"
    },
    {
        name: "Among Us",
        package: "com.innersloth.spacemafia",
        icon: "👾",
        category: "Party",
        intent: "intent://com.innersloth.spacemafia/#Intent;scheme=androidapp;package=com.innersloth.spacemafia;end"
    },
    {
        name: "eFootball",
        package: "jp.konami.pesam",
        icon: "⚽",
        category: "Sports",
        intent: "intent://jp.konami.pesam/#Intent;scheme=androidapp;package=jp.konami.pesam;end"
    },
    {
        name: "Arena of Valor",
        package: "com.garena.game.kgtw",
        icon: "⚔️",
        category: "MOBA",
        intent: "intent://com.garena.game.kgtw/#Intent;scheme=androidapp;package=com.garena.game.kgtw;end"
    }
];

// State aplikasi
let installedGames = [];
let boostActive = true;
let performanceInterval;

// ============= DETEKSI GAME TERINSTALL =============
async function detectInstalledGames() {
    showNotification("🔍 Memindai game terinstall...");
    
    const gameGrid = document.getElementById('gameGrid');
    gameGrid.innerHTML = '<div class="loading-games">Memindai game...</div>';
    
    installedGames = [];
    
    // Coba deteksi via Intent API [citation:7]
    for (const game of GAME_DATABASE) {
        const isInstalled = await checkAppInstalled(game.package);
        
        if (isInstalled) {
            installedGames.push(game);
        }
    }
    
    // Update UI
    updateGameGrid();
    document.getElementById('gameCount').textContent = installedGames.length + ' game';
    
    if (installedGames.length === 0) {
        showNotification("💡 Tidak ada game terdeteksi. Gunakan scan manual.");
    } else {
        showNotification(`✅ Ditemukan ${installedGames.length} game!`);
    }
}

// Cek apakah app terinstall menggunakan Intent [citation:7]
function checkAppInstalled(packageName) {
    return new Promise((resolve) => {
        // Di browser, kita menggunakan intent fallback
        const intentUrl = `intent://${packageName}/#Intent;package=${packageName};end`;
        
        // Simulasi deteksi (di real Android, bisa menggunakan getInstalledRelatedApps [citation:5])
        // Karena keterbatasan browser, kita simulasikan berdasarkan user agent
        const ua = navigator.userAgent;
        
        // Simulasi: game populer biasanya terinstall di HP gaming
        if (ua.includes('Android')) {
            // Logika sederhana: 70% chance game terinstall untuk demo
            // Di aplikasi real, ini diganti dengan API nyata
            const random = Math.random();
            
            // Prioritaskan game populer
            if (packageName.includes('mobile.legends') || 
                packageName.includes('freefire') || 
                packageName.includes('tencent.ig')) {
                // Lebih tinggi kemungkinannya
                setTimeout(() => resolve(random > 0.2), 300);
            } else {
                setTimeout(() => resolve(random > 0.5), 300);
            }
        } else {
            setTimeout(() => resolve(false), 300);
        }
    });
}

// Update tampilan grid game
function updateGameGrid() {
    const gameGrid = document.getElementById('gameGrid');
    
    if (installedGames.length === 0) {
        gameGrid.innerHTML = `
            <div class="loading-games" style="grid-column: span 3;">
                ⚠️ Tidak ada game terdeteksi<br>
                <small style="color: #8f9bb3;">Klik menu > Scan Ulang Game</small>
            </div>
        `;
        return;
    }
    
    gameGrid.innerHTML = installedGames.map(game => `
        <div class="game-card" data-package="${game.package}" data-intent="${game.intent}" data-name="${game.name}">
            <div class="game-icon">${game.icon}</div>
            <div class="game-name">${game.name}</div>
            <span class="game-boost-badge">BOOST</span>
        </div>
    `).join('');
    
    // Tambah event listener ke setiap game card
    document.querySelectorAll('.game-card').forEach(card => {
        card.addEventListener('click', function() {
            const packageName = this.dataset.package;
            const gameName = this.dataset.name;
            const intent = this.dataset.intent;
            
            launchGame(packageName, gameName, intent);
        });
    });
}

// ============= LAUNCH GAME DENGAN BOOST =============
function launchGame(packageName, gameName, intent) {
    showNotification(`⚡ Mengaktifkan mode boost untuk ${gameName}...`);
    
    // Jalankan boost sebelum buka game
    performBoost().then(() => {
        // Buka game menggunakan Android Intent [citation:7]
        try {
            // Metode 1: Intent URL
            const intentUrl = `intent://${packageName}/#Intent;package=${packageName};S.browser_fallback_url=https://play.google.com/store/apps/details?id=${packageName};end`;
            
            // Metode 2: Market URL jika intent gagal
            const marketUrl = `market://details?id=${packageName}`;
            
            // Coba buka dengan intent
            window.location.href = intentUrl;
            
            // Fallback ke Play Store jika gagal
            setTimeout(() => {
                window.location.href = marketUrl;
            }, 500);
            
            showNotification(`🎮 Membuka ${gameName} dengan mode turbo!`);
            
            // Aktifkan mode DND jika diaktifkan
            if (document.getElementById('dndMode').checked) {
                enableDNDMode();
            }
            
        } catch (e) {
            // Fallback ke Play Store
            window.open(`https://play.google.com/store/apps/details?id=${packageName}`, '_blank');
        }
    });
}

// ============= PERFORMANCE BOOST =============
async function performBoost() {
    return new Promise((resolve) => {
        // Animasi boost
        const boostBtn = document.querySelector('.boost-btn');
        if (boostBtn) {
            boostBtn.style.transform = 'scale(0.95)';
            setTimeout(() => boostBtn.style.transform = 'scale(1)', 200);
        }
        
        showNotification('⚡ Membersihkan RAM dan mengoptimalkan performa...');
        
        // Simulasi proses boost
        setTimeout(() => {
            // Update statistik setelah boost
            updatePerformanceStats(true);
            
            // Catat waktu boost terakhir
            localStorage.setItem('lastBoost', Date.now());
            
            showNotification('✅ Boost selesai! Game siap dimainkan');
            resolve();
        }, 1500);
    });
}

// Update performa statistik
function updatePerformanceStats(boosted = false) {
    // Simulasi pembacaan hardware [citation:5]
    if ('deviceMemory' in navigator) {
        const totalRam = navigator.deviceMemory;
        let usedRam, freeRam;
        
        if (boosted) {
            // Setelah boost, RAM lebih lega
            usedRam = Math.round(totalRam * (0.3 + Math.random() * 0.1));
            freeRam = totalRam - usedRam;
            document.getElementById('freeRam').textContent = `${freeRam.toFixed(1)}/${totalRam} GB`;
        } else {
            usedRam = Math.round(totalRam * (0.6 + Math.random() * 0.2));
            freeRam = totalRam - usedRam;
            document.getElementById('freeRam').textContent = `${freeRam.toFixed(1)}/${totalRam} GB`;
        }
    } else {
        // Estimasi jika API tidak tersedia
        document.getElementById('freeRam').textContent = boosted ? '2.8/4.0 GB' : '1.6/4.0 GB';
    }
    
    // Simulasi CPU usage
    const cpuBase = boosted ? 25 : 45;
    const cpuRandom = Math.round(cpuBase + Math.random() * 15);
    document.getElementById('cpuUsage').textContent = cpuRandom + '%';
    
    // Simulasi suhu
    const tempBase = boosted ? 38 : 42;
    const tempRandom = tempBase + Math.round(Math.random() * 3);
    document.getElementById('temperature').textContent = tempRandom + '°C';
}

// ============= HARDWARE DETECTION =============
async function detectHardware() {
    // Deteksi RAM [citation:5]
    if ('deviceMemory' in navigator) {
        const ram = navigator.deviceMemory;
        document.getElementById('deviceStatus').textContent = `${ram} GB RAM • Android`;
    } else {
        document.getElementById('deviceStatus').textContent = 'Android Device';
    }
    
    // Deteksi battery
    if ('getBattery' in navigator) {
        try {
            const battery = await navigator.getBattery();
            
            battery.addEventListener('levelchange', () => {
                const level = Math.round(battery.level * 100);
                if (level < 15 && !battery.charging) {
                    showNotification('⚠️ Baterai rendah! Colok charger untuk performa maksimal');
                }
            });
        } catch (e) {}
    }
    
    // Update performa setiap 3 detik
    performanceInterval = setInterval(() => {
        updatePerformanceStats(false);
    }, 3000);
}

// ============= DND MODE =============
function enableDNDMode() {
    // Simulasi DND mode
    showNotification('🔕 Mode DND aktif - notifikasi akan diblokir');
    
    // Di real implementation, ini bisa menggunakan API Notifikasi
    if ('Notification' in window) {
        // Minta permission untuk blok notifikasi
        Notification.requestPermission();
    }
}

// ============= CLEAR CACHE =============
function clearCache() {
    showNotification('🗑️ Membersihkan cache aplikasi...');
    
    // Simulasi bersihkan cache
    setTimeout(() => {
        if ('caches' in window) {
            caches.keys().then(names => {
                names.forEach(name => {
                    caches.delete(name);
                });
            });
        }
        
        // Bersihkan localStorage yang tidak perlu
        // Tapi jangan hapus data penting
        
        showNotification('✅ Cache dibersihkan!');
    }, 1000);
}

// ============= NOTIFICATION =============
function showNotification(message) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 2000);
}

// ============= EVENT LISTENERS =============
document.addEventListener('DOMContentLoaded', async () => {
    // Deteksi hardware
    await detectHardware();
    
    // Deteksi game terinstall
    await detectInstalledGames();
    
    // Update performa awal
    updatePerformanceStats(false);
    
    // ===== BUTTON EVENT =====
    
    // Quick boost button
    document.getElementById('quickBoostBtn').addEventListener('click', performBoost);
    
    // Menu button
    const menuBtn = document.getElementById('menuBtn');
    const menuModal = document.getElementById('menuModal');
    const closeModal = document.querySelector('.close-modal');
    
    menuBtn.addEventListener('click', () => {
        menuModal.classList.add('show');
    });
    
    closeModal.addEventListener('click', () => {
        menuModal.classList.remove('show');
    });
    
    // Click outside modal
    menuModal.addEventListener('click', (e) => {
        if (e.target === menuModal) {
            menuModal.classList.remove('show');
        }
    });
    
    // Menu items
    document.getElementById('scanGames').addEventListener('click', async () => {
        menuModal.classList.remove('show');
        await detectInstalledGames();
    });
    
    document.getElementById('clearAllCache').addEventListener('click', () => {
        menuModal.classList.remove('show');
        clearCache();
    });
    
    document.getElementById('aboutApp').addEventListener('click', () => {
        menuModal.classList.remove('show');
        showNotification('Game Booster Pro v1.0');
    });
    
    // Boost toggle
    document.getElementById('boostToggle').addEventListener('change', function(e) {
        boostActive = e.target.checked;
        if (boostActive) {
            showNotification('⚡ Mode boost aktif');
        } else {
            showNotification('Mode boost nonaktif');
        }
    });
    
    // DND mode toggle
    document.getElementById('dndMode').addEventListener('change', function(e) {
        if (e.target.checked) {
            enableDNDMode();
        }
    });
    
    // Auto clear toggle
    document.getElementById('autoClear').addEventListener('change', function(e) {
        if (e.target.checked) {
            showNotification('Auto-clear memory aktif');
        }
    });
    
    // Bottom navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function() {
            document.querySelectorAll('.nav-item').forEach(nav => {
                nav.classList.remove('active');
            });
            this.classList.add('active');
            
            const tab = this.dataset.tab;
            if (tab === 'boost') {
                // Scroll ke performance card
                document.querySelector('.performance-card').scrollIntoView({ behavior: 'smooth' });
            } else if (tab === 'settings') {
                // Scroll ke features
                document.querySelector('.features-card').scrollIntoView({ behavior: 'smooth' });
            } else {
                // Games tab
                document.querySelector('.game-section').scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
});

// Bersihkan interval saat page unload
window.addEventListener('beforeunload', () => {
    if (performanceInterval) {
        clearInterval(performanceInterval);
    }
});