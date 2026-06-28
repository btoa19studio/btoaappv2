'use strict';

// 1. Inisialisasi Auth Firebase
const firebaseConfig = {
    apiKey: "AIzaSyA4BVxcbPKWzyTZaQp5xyN9bluEcSNINnE",
    authDomain: "allinoneapp-b5578.firebaseapp.com",
    projectId: "allinoneapp-b5578",
    storageBucket: "allinoneapp-b5578.firebasestorage.app",
    messagingSenderId: "37135502818",
    appId: "1:37135502818:web:35fff036f12efe1b457dbb"
};

// Cegah inisialisasi ganda
let firebaseApp;
try {
    firebaseApp = firebase.app();
} catch {
    firebaseApp = firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();

// 2. Variabel Flag: Membatasi Auto-Login hanya sekali saat aplikasi pertama dibuka
let autoLoginAttempted = false;

// 3. Fungsi Render Halaman Login / Signup
function renderAuthPage() {
    const container = document.getElementById('pageContainer');
    if (!container) return;
    
    container.innerHTML = `
        <div class="d-flex justify-content-center align-items-center" style="min-height: 70vh;">
            <div class="card shadow-lg border-0" style="width: 100%; max-width: 400px;">
                <div class="card-body p-4">
                    <h4 class="card-title text-center fw-bold mb-4" id="authTitle">🔐 Masuk ke Aplikasi</h4>
                    
                    <div id="authForm">
                        <div class="mb-3">
                            <label class="form-label text-muted small">Email</label>
                            <input type="email" class="form-control" id="authEmail" placeholder="contoh@email.com">
                        </div>
                        <div class="mb-3">
                            <label class="form-label text-muted small">Password</label>
                            <input type="password" class="form-control" id="authPassword" placeholder="Min 6 karakter">
                        </div>
                        <button class="btn btn-primary w-100 mb-3" id="authSubmitBtn">Masuk</button>
                    </div>

                    <p class="text-center small mb-0 text-muted">
                        <span id="authToggleText">Belum punya akun?</span> 
                        <a href="#" id="authToggleLink" class="text-decoration-none fw-bold">Daftar Sekarang</a>
                    </p>
                    <div id="authError" class="text-danger small text-center mt-2"></div>
                    <div id="authSystemError" class="text-danger small text-center mt-2 fw-bold"></div>
                </div>
            </div>
        </div>
    `;

    // 4. Logika Toggle Login / Signup
    let isLogin = true;
    const title = document.getElementById('authTitle');
    const btn = document.getElementById('authSubmitBtn');
    const toggleText = document.getElementById('authToggleText');
    const toggleLink = document.getElementById('authToggleLink');
    const errorEl = document.getElementById('authError');
    const systemErrorEl = document.getElementById('authSystemError');

    toggleLink.onclick = (e) => {
        e.preventDefault();
        isLogin = !isLogin;
        title.innerText = isLogin ? '🔐 Masuk ke Aplikasi' : '📝 Daftar Akun Baru';
        btn.innerText = isLogin ? 'Masuk' : 'Daftar';
        toggleText.innerText = isLogin ? 'Belum punya akun?' : 'Sudah punya akun?';
        toggleLink.innerText = isLogin ? 'Daftar Sekarang' : 'Masuk';
        errorEl.innerText = '';
        systemErrorEl.innerText = '';
    };

    // 5. Logika Submit
    btn.onclick = async () => {
        const email = document.getElementById('authEmail').value;
        const pass = document.getElementById('authPassword').value;
        errorEl.innerText = '';
        systemErrorEl.innerText = '';

        if(!email || !pass) { errorEl.innerText = 'Email dan Password wajib diisi!'; return; }

        try {
            if(isLogin) {
                await auth.signInWithEmailAndPassword(email, pass);
            } else {
                await auth.createUserWithEmailAndPassword(email, pass);
                await firebase.database().ref('users/' + auth.currentUser.uid).set({
                    email: email,
                    name: email.split('@')[0]
                });
            }
        } catch (error) {
            const msg = error.message;
            if (msg.includes('CONFIGURATION_NOT_FOUND')) {
                systemErrorEl.innerText = '⚠️ Error Server: Login Email/Password belum diaktifkan di Firebase Console. Silakan buka Firebase > Authentication > Sign-in method dan aktifkan Email/Password.';
            } else {
                errorEl.innerText = msg.replace('Firebase: ', '');
            }
        }
    };
}

// 6. Logout (Dipanggil oleh tombol di sidebar)
function logoutUser() { 
    auth.signOut(); 
}

// 7. Fitur Demo: Login Otomatis (Hanya untuk pengembangan)
function autoLoginDemo() {
    // Hanya jalankan jika belum pernah dijalankan sebelumnya
    if (autoLoginAttempted) return;
    autoLoginAttempted = true;

    const demoEmail = 'demo@user.com';
    const demoPass = '123456';

    auth.signInWithEmailAndPassword(demoEmail, demoPass)
        .then(() => console.log('✅ Berhasil login otomatis dengan akun demo.'))
        .catch((error) => {
            if (error.code === 'auth/user-not-found') {
                auth.createUserWithEmailAndPassword(demoEmail, demoPass)
                    .then(() => {
                        console.log('✅ Akun demo berhasil dibuat dan login otomatis.');
                        firebase.database().ref('users/' + auth.currentUser.uid).set({ email: demoEmail, name: 'Demo User' });
                    })
                    .catch((err) => console.error('❌ Gagal membuat akun demo:', err.message));
            } else {
                console.error('❌ Gagal login otomatis:', error.message);
            }
        });
}

// 8. Ekspor ke Global
window.auth = auth;
window.renderAuthPage = renderAuthPage;
window.logoutUser = logoutUser;
window.autoLoginDemo = autoLoginDemo;

// 9. Listener Status Auth (FIXED: Auto-login hanya saat pertama kali buka aplikasi)
auth.onAuthStateChanged((user) => {
    const header = document.getElementById('appHeader');
    const fab = document.getElementById('fabBtn');

    if (user) {
        // LOGIN BERHASIL
        document.getElementById('userAvatar').innerText = user.email.charAt(0).toUpperCase();
        if(header) header.classList.remove('d-none');
        if(fab) fab.classList.remove('d-none');
        console.log('✅ User login:', user.email);
        // Load dashboard dilakukan oleh app.js
    } else {
        // LOGOUT ATAU BELUM LOGIN
        if(header) header.classList.add('d-none');
        if(fab) fab.classList.add('d-none');
        renderAuthPage();
        document.getElementById('loadingScreen').classList.add('hidden');
        
        // 💡 KUNCI PERBAIKAN: Hanya jalankan auto-login jika aplikasi baru dibuka (dan belum pernah login)
        // Jika user melakukan Logout manual, autoLoginAttempted sudah true, jadi tidak akan jalan lagi!
        if (!autoLoginAttempted) {
            autoLoginDemo();
        }
    }
});

console.log('✅ Auth Module Loaded (Fixed Logout Loop)');