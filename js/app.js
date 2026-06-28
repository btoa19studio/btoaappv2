'use strict';
class App {
    constructor() { this.currentPage = 'dashboard'; }
    async init() {
        try {
            this.setupSidebar();
            this.setupThemeToggle();
            this.setupCustomizer();
            this.setupFAB();
            await this.loadPage('dashboard');
            document.getElementById('loadingScreen').classList.add('hidden');
        } catch(e) { console.error(e); }
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
            // Toggle class
            sidebar.classList.toggle('open');
            // Sync overlay
            if (sidebar.classList.contains('open')) {
                overlay.classList.add('active');
            } else {
                overlay.classList.remove('active');
            }
        };

        // Event listener untuk tombol menu mobile
        if(menuToggle) menuToggle.onclick = () => toggleMobileSidebar();

        // Event listener untuk tombol close (X) di sidebar mobile
        if(closeSidebar) closeSidebar.onclick = () => toggleMobileSidebar(true);

        // Event listener untuk overlay (klik area kosong)
        if(overlay) overlay.onclick = () => toggleMobileSidebar(true);

        // Toggle untuk Desktop (Collapse) - Hanya di Desktop
        document.getElementById('sidebarToggle').onclick = () => {
            sidebar.classList.toggle('d-none');
            document.getElementById('mainContent').classList.toggle('ms-0');
        };

        // Navigasi Link (Jika menu diklik, sidebar mobile otomatis menutup)
        document.querySelectorAll('.sidebar .nav-link[data-page]').forEach(el => {
            el.onclick = (e) => { 
                e.preventDefault(); 
                this.loadPage(el.dataset.page);
                // Tutup sidebar setelah klik link (di mobile)
                if (window.innerWidth < 768) {
                    toggleMobileSidebar(true);
                }
            };
        });
    }
    setupThemeToggle() {
        document.getElementById('themeToggle').onclick = () => {
            const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', next);
            document.getElementById('themeToggle').innerHTML = next === 'dark' ? '<i class=\'bx bx-sun fs-4\'></i>' : '<i class=\'bx bx-moon fs-4\'></i>';
            localStorage.setItem('theme', next);
        };
    }
    setupCustomizer() {
        document.getElementById('customizerBtn').onclick = (e) => {
            e.preventDefault();
            const offcanvas = new bootstrap.Offcanvas(document.getElementById('customizerOffcanvas'));
            offcanvas.show();
        };
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
    setupFAB() { document.getElementById('fabBtn').onclick = () => Utils.showToast('Fitur siap dikembangkan!'); }
    
    async loadPage(page) {
        this.currentPage = page;
        const container = document.getElementById('pageContainer');
        document.querySelectorAll('.sidebar .nav-link[data-page]').forEach(el => {
            el.classList.toggle('active', el.dataset.page === page);
        });
        
        // Update Title
        const titles = { dashboard: '🏠 Dashboard', vault: '🔐 Vault', notes: '📝 Notes', todo: '✅ Todo', money: '💰 Money', travel: '🗺️ Travel' };
        document.getElementById('pageTitle').innerText = titles[page] || page;

        // Render Konten
        if(page === 'dashboard') container.innerHTML = await window.dashboardModule.render();
        else if(page === 'vault') container.innerHTML = await window.vaultModule.render();
        else if(page === 'notes') container.innerHTML = await window.notesModule.render();
        else if(page === 'todo') container.innerHTML = await window.todoModule.render();
        else if(page === 'money') container.innerHTML = await window.moneyModule.render();
        else if(page === 'travel') container.innerHTML = await window.travelModule.render();
    }
}

// Mulai App
window.app = new App();
document.addEventListener('DOMContentLoaded', () => window.app.init());