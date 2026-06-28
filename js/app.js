'use strict';

class App {
    constructor() { 
        this.currentPage = 'dashboard'; 
    }

    async init() {
        try {
            // Setup semua komponen UI
            this.setupSidebar();
            this.setupThemeToggle();
            this.setupCustomizer();
            this.setupFAB();
            
            // Muat halaman pertama
            await this.loadPage('dashboard');
            
            // Hilangkan loading screen
            document.getElementById('loadingScreen').classList.add('hidden');
        } catch(e) { 
            console.error("Error App Init:", e); 
        }
    }

    setupSidebar() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebarOverlay');
        const menuToggle = document.getElementById('menuToggle');
        const closeSidebar = document.getElementById('closeSidebar');

        // Fungsi helper untuk toggle sidebar mobile
        const toggleMobileSidebar = (forceClose = false) => {
            if (forceClose) {
                sidebar.classList.remove('open');
                overlay.classList.remove('active');
                return;
            }
            sidebar.classList.toggle('open');
            // Sync overlay
            if (sidebar.classList.contains('open')) {
                overlay.classList.add('active');
            } else {
                overlay.classList.remove('active');
            }
        };

        // 1. Event tombol hamburger (Mobile)
        if(menuToggle) menuToggle.onclick = () => toggleMobileSidebar();

        // 2. Event tombol close (X) di sidebar (Mobile)
        if(closeSidebar) closeSidebar.onclick = () => toggleMobileSidebar(true);

        // 3. Event klik area kosong (Overlay) untuk menutup sidebar
        if(overlay) overlay.onclick = () => toggleMobileSidebar(true);

        // 4. Toggle Collapse Sidebar (Desktop)
        document.getElementById('sidebarToggle').onclick = () => {
            sidebar.classList.toggle('d-none');
            document.getElementById('mainContent').classList.toggle('ms-0');
        };

        // 5. Navigasi Link (Otomatis tutup sidebar setelah klik di mobile)
        document.querySelectorAll('.sidebar .nav-link[data-page]').forEach(el => {
            el.onclick = (e) => { 
                e.preventDefault(); 
                const page = el.dataset.page;
                this.loadPage(page);
                
                // Jika di mobile, tutup sidebar setelah pindah halaman
                if (window.innerWidth < 768) {
                    toggleMobileSidebar(true);
                }
            };
        });
    }

    setupThemeToggle() {
        const themeToggle = document.getElementById('themeToggle');
        if(themeToggle) {
            themeToggle.onclick = () => {
                const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
                document.documentElement.setAttribute('data-theme', next);
                themeToggle.innerHTML = next === 'dark' ? '<i class=\'bx bx-sun fs-4\'></i>' : '<i class=\'bx bx-moon fs-4\'></i>';
                localStorage.setItem('theme', next);
            };
        }
    }

    setupCustomizer() {
        const customizerBtn = document.getElementById('customizerBtn');
        if(customizerBtn) {
            customizerBtn.onclick = (e) => {
                e.preventDefault();
                const offcanvas = new bootstrap.Offcanvas(document.getElementById('customizerOffcanvas'));
                offcanvas.show();
            };
        }

        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.onclick = () => {
                const theme = btn.dataset.theme;
                document.documentElement.setAttribute('data-theme', theme);
                localStorage.setItem('theme', theme);
                document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            };
        });
    }

    setupFAB() { 
        const fab = document.getElementById('fabBtn');
        if(fab) fab.onclick = () => window.Utils.showToast('⚡ Fitur cepat siap dikembangkan!'); 
    }
    
    async loadPage(page) {
        this.currentPage = page;
        const container = document.getElementById('pageContainer');
        
        // Update active class di sidebar
        document.querySelectorAll('.sidebar .nav-link[data-page]').forEach(el => {
            el.classList.toggle('active', el.dataset.page === page);
        });
        
        // Update Title
        const titles = { dashboard: '🏠 Dashboard', vault: '🔐 Vault', notes: '📝 Notes', todo: '✅ Todo', money: '💰 Money', travel: '🗺️ Travel' };
        document.getElementById('pageTitle').innerText = titles[page] || page;

        // Render Konten berdasarkan halaman
        if(page === 'dashboard') container.innerHTML = await window.dashboardModule.render();
        else if(page === 'vault') container.innerHTML = await window.vaultModule.render();
        else if(page === 'notes') container.innerHTML = await window.notesModule.render();
        else if(page === 'todo') container.innerHTML = await window.todoModule.render();
        else if(page === 'money') container.innerHTML = await window.moneyModule.render();
        else if(page === 'travel') container.innerHTML = await window.travelModule.render();
        else container.innerHTML = '<div class="card p-4"><p>Halaman tidak ditemukan</p></div>';
    }
}

// START APLIKASI
const app = new App();
window.app = app; // Ekspor ke window agar bisa diakses jika diperlukan

// Tunggu DOM siap, lalu jalankan init
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => app.init());
} else {
    app.init();
}