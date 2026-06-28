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
        } catch(e) { alert('Error: '+e.message); }
    }
    setupSidebar() {
        const toggle = document.getElementById('menuToggle');
        const close = document.getElementById('closeSidebar');
        if(toggle) toggle.onclick = () => document.getElementById('sidebar').classList.toggle('open');
        if(close) close.onclick = () => document.getElementById('sidebar').classList.remove('open');
        document.querySelectorAll('.nav-item[data-page]').forEach(el => {
            el.onclick = (e) => { e.preventDefault(); this.loadPage(el.dataset.page); };
        });
    }
    setupThemeToggle() {
        document.getElementById('themeToggle').onclick = () => {
            const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', next);
        };
    }
    setupCustomizer() {
        document.getElementById('customizerBtn').onclick = (e) => { e.preventDefault(); document.getElementById('customizer').classList.add('open'); };
        document.getElementById('closeCustomizer').onclick = () => document.getElementById('customizer').classList.remove('open');
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.onclick = () => {
                document.documentElement.setAttribute('data-theme', btn.dataset.theme);
                document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            };
        });
    }
    setupFAB() { document.getElementById('fabBtn').onclick = () => Utils.showToast('FAB siap digunakan'); }
    async loadPage(page) {
        this.currentPage = page;
        const container = document.getElementById('pageContainer');
        document.querySelectorAll('.nav-item[data-page]').forEach(el => el.classList.toggle('active', el.dataset.page === page));
        if(page === 'dashboard') container.innerHTML = await window.dashboardModule.render();
        else if(page === 'vault') container.innerHTML = await window.vaultModule.render();
        else if(page === 'notes') container.innerHTML = await window.notesModule.render();
        else if(page === 'todo') container.innerHTML = await window.todoModule.render();
        else if(page === 'money') container.innerHTML = await window.moneyModule.render();
        else if(page === 'travel') container.innerHTML = await window.travelModule.render();
    }
}
window.app = new App();
document.addEventListener('DOMContentLoaded', () => window.app.init());
