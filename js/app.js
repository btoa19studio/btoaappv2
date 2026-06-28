'use strict';

class App {
    constructor() { 
        this.currentPage = 'dashboard'; 
        this.user = null;
    }

    async init() {
        auth.onAuthStateChanged((user) => {
            const header = document.getElementById('appHeader');
            const fab = document.getElementById('fabBtn');

            if (user) {
                this.user = user;
                if(header) header.classList.remove('d-none');
                if(fab) fab.classList.remove('d-none');
                
                document.getElementById('userAvatar').innerText = user.email.charAt(0).toUpperCase();
                document.getElementById('dropdownAvatar').innerText = user.email.charAt(0).toUpperCase();
                document.getElementById('dropdownName').innerText = user.email.split('@')[0];
                document.getElementById('dropdownEmail').innerText = user.email;

                this.loadDashboard();
                document.getElementById('loadingScreen').classList.add('hidden');
            } else {
                this.user = null;
                if(header) header.classList.add('d-none');
                if(fab) fab.classList.add('d-none');

                document.querySelectorAll('.sidebar .nav-link[data-page]').forEach(el => {
                    el.classList.remove('active');
                });
                document.getElementById('pageTitle').innerText = '🔐 Silakan Login';

                const container = document.getElementById('pageContainer');
                container.innerHTML = ''; 
                renderAuthPage(); 
                
                document.getElementById('loadingScreen').classList.add('hidden');

                if (!localStorage.getItem('demoAccountCreated')) {
                    console.log('🛠️ Membuat akun demo...');
                    const demoEmail = 'demo@user.com';
                    const demoPass = '123456';
                    auth.createUserWithEmailAndPassword(demoEmail, demoPass)
                        .then(() => {
                            console.log('✅ Akun demo berhasil. Login otomatis...');
                            localStorage.setItem('demoAccountCreated', 'true');
                        })
                        .catch((err) => {
                            if (err.code !== 'auth/email-already-in-use') {
                                console.error('Gagal membuat akun demo:', err.message);
                            }
                        });
                }
            }
        });

        document.getElementById('editProfileBtn')?.addEventListener('click', (e) => {
            e.preventDefault();
            const newName = prompt('Masukkan nama baru Anda:', this.user?.email?.split('@')[0] || 'Pengguna');
            if (newName && newName.trim() !== '') {
                document.getElementById('dropdownName').innerText = newName.trim();
                Utils.showToast('✅ Nama profil diperbarui (lokal)', 'success');
            }
        });

        document.getElementById('dropdownLogoutBtn')?.addEventListener('click', (e) => {
            e.preventDefault();
            if(confirm('Apakah Anda yakin ingin keluar?')) {
                logoutUser();
            }
        });
    }

    loadDashboard() {
        try {
            this.setupSidebar();
            this.setupThemeToggle();
            this.setupCustomizer();
            this.setupLogout();
            this.setupFAB();
            this.loadPage('dashboard');
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

    // 🔥 PERBAIKAN PENTING DI SINI
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

        // ✅ PERBAIKAN NAVIGASI SIDEBAR (Pastikan event listener bekerja)
        document.querySelectorAll('.sidebar .nav-link').forEach(el => {
            el.onclick = (e) => { 
                e.preventDefault(); 
                const page = el.dataset.page;
                if (page) {
                    this.loadPage(page);
                    if (window.innerWidth < 768) {
                        toggleMobileSidebar(true);
                    }
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
        if(fab) {
            fab.onclick = () => {
                if (this.currentPage === 'vault' && window.vaultModule && typeof window.vaultModule.showAddForm === 'function') {
                    window.vaultModule.showAddForm();
                } else {
                    Utils.showToast('⚡ Fitur cepat siap dikembangkan!', 'info');
                }
            };
        }
    }
    
    async loadPage(page) {
        if (!this.user) return;
        this.currentPage = page;
        const container = document.getElementById('pageContainer');
        document.querySelectorAll('.sidebar .nav-link[data-page]').forEach(el => {
            el.classList.toggle('active', el.dataset.page === page);
        });
        
        const titles = { dashboard: '🏠 Dashboard', vault: '🔐 Vault', notes: '📝 Notes', todo: '✅ Todo', money: '💰 Money', travel: '🗺️ Travel' };
        document.getElementById('pageTitle').innerText = titles[page] || page;

        // ✅ ROUTING HALAMAN
        if (page === 'dashboard') container.innerHTML = await window.dashboardModule.render();
        else if (page === 'vault') container.innerHTML = await window.vaultModule.render();
        else if (page === 'notes') container.innerHTML = await window.notesModule.render();
        else if (page === 'todo') container.innerHTML = await window.todoModule.render();
        else if (page === 'money') container.innerHTML = await window.moneyModule.render();
        else if (page === 'travel') container.innerHTML = await window.travelModule.render();
        else container.innerHTML = '<div class="card p-4"><p>Halaman tidak ditemukan</p></div>';
    }
}

const app = new App();
window.app = app;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => app.init());
} else {
    app.init();
}