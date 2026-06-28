'use strict';

class App {
    constructor() { 
        this.currentPage = 'dashboard'; 
        this.user = null;
    }

    async init() {
        auth.onAuthStateChanged((user) => {
            if (user) {
                this.user = user;
                document.getElementById('userAvatar').innerText = user.email.charAt(0).toUpperCase();
                this.loadDashboard();
            } else {
                renderAuthPage();
                document.getElementById('loadingScreen').classList.add('hidden');
            }
        });
    }

    loadDashboard() {
        try {
            // 💥 KEMBALIKAN HEADER DAN FAB SETELAH LOGIN BERHASIL
            const header = document.getElementById('appHeader');
            const fab = document.getElementById('fabBtn');
            if(header) header.style.display = 'flex'; // Navbar default display flex
            if(fab) fab.style.display = 'flex';      // FAB default display flex

            this.setupSidebar();
            this.setupThemeToggle();
            this.setupCustomizer();
            this.setupFAB();
            this.setupLogout();
            
            this.loadPage('dashboard');
            document.getElementById('loadingScreen').classList.add('hidden');
        } catch(e) { 
            console.error("Error App Init:", e); 
        }
    }

    setupLogout() {
        document.getElementById('logoutBtn').onclick = (e) => {
            e.preventDefault();
            if(confirm('Apakah Anda yakin ingin keluar?')) {
                logoutUser();
            }
        };
    }

    setupSidebar() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebarOverlay');
        const menuToggle = document.getElementById('menuToggle');
        const closeSidebar = document.getElementById('closeSidebar');

        const toggleMobileSidebar = (forceClose = false) => {
            if (forceClose) {
                sidebar.classList.remove('open');
                overlay.classList.remove('active');
                return;
            }
            sidebar.classList.toggle('open');
            if (sidebar.classList.contains('open')) {
                overlay.classList.add('active');
            } else {
                overlay.classList.remove('active');
            }
        };

        if(menuToggle) menuToggle.onclick = () => toggleMobileSidebar();
        if(closeSidebar) closeSidebar.onclick = () => toggleMobileSidebar(true);
        if(overlay) overlay.onclick = () => toggleMobileSidebar(true);

        document.getElementById('sidebarToggle').onclick = () => {
            sidebar.classList.toggle('d-none');
            document.getElementById('mainContent').classList.toggle('ms-0');
        };

        document.querySelectorAll('.sidebar .nav-link[data-page]').forEach(el => {
            el.onclick = (e) => { 
                e.preventDefault(); 
                const page = el.dataset.page;
                this.loadPage(page);
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
        
        document.querySelectorAll('.sidebar .nav-link[data-page]').forEach(el => {
            el.classList.toggle('active', el.dataset.page === page);
        });
        
        const titles = { dashboard: '🏠 Dashboard', vault: '🔐 Vault', notes: '📝 Notes', todo: '✅ Todo', money: '💰 Money', travel: '🗺️ Travel' };
        document.getElementById('pageTitle').innerText = titles[page] || page;

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
window.app = app;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => app.init());
} else {
    app.init();
}