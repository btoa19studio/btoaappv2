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

// 2. Flag: Hanya izinkan auto-login 1x (saat pertama kali buka aplikasi)
let autoLoginAttempted = false;

// 3. Render Halaman Login / Signup (Dengan Pembersihan Container)
function renderAuthPage() {
    const container = document.getElementById('pageContainer');
    if (!container) {
        console.error('❌ pageContainer tidak ditemukan!');
        return;
    }

    // 💥 KUNCI PERBAIKAN: Kosongkan container sebelum mengisi ulang
    container.innerHTML = '';

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
                </div>
            </div>
        </div>
    `;

    // Logika Toggle Login / Signup
    let isLogin = true;
    const title = document.getElementById('authTitle');
    const btn = document.getElementById('authSubmitBtn');
    const toggleText = document.getElementById('authToggleText');
    const toggleLink = document.getElementById('authToggleLink');
    const errorEl = document.getElementById('authError');

    toggleLink.onclick = (e) => {
        e.preventDefault();
        isLogin = !isLogin;
        title.innerText = isLogin ? '🔐 Masuk ke Aplikasi' : '📝 Daftar Akun Baru';
        btn.innerText = isLogin ? 'Masuk' : 'Daftar';
        toggleText.innerText = isLogin ? 'Belum punya akun?' : 'Sudah punya akun?';
        toggleLink.innerText = isLogin ? 'Daftar Sekarang' : 'Masuk';
        errorEl.innerText = '';
    };

    // Logika Submit
    btn.onclick = async () => {
        const email = document.getElementById('authEmail').value;
        const pass = document.getElementById('authPassword').value;
        errorEl.innerText = '';

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
            errorEl.innerText = error.message.replace('Firebase: ', '');
        }
    };
}

// 4. Logout
function logoutUser() { 
    auth.signOut(); 
}

// 5. Fungsi Auto-Login Demo
function autoLoginDemo() {
    if (autoLoginAttempted) {
        console.log('⏸️ Auto-login dilewati (sudah pernah dicoba sebelumnya).');
        return;
    }
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

// 6. Ekspor ke Global
window.auth = auth;
window.renderAuthPage = renderAuthPage;
window.logoutUser = logoutUser;
window.autoLoginDemo = autoLoginDemo;

// 7. Listener untuk Auto-Login
// (Kita biarkan app.js yang menangani UI, auth.js hanya menangani logika demo)
auth.onAuthStateChanged((user) => {
    if (!user && !autoLoginAttempted) {
        // Jika belum ada user dan auto-login belum dicoba, jalankan demo
        autoLoginDemo();
    }
});

console.log('✅ Auth Module Loaded (Fixed)');