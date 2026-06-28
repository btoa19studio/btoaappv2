'use strict';

// 1. Inisialisasi Firebase
const firebaseConfig = {
    apiKey: "AIzaSyA4BVxcbPKWzyTZaQp5xyN9bluEcSNINnE",
    authDomain: "allinoneapp-b5578.firebaseapp.com",
    projectId: "allinoneapp-b5578",
    storageBucket: "allinoneapp-b5578.firebasestorage.app",
    messagingSenderId: "37135502818",
    appId: "1:37135502818:web:35fff036f12efe1b457dbb"
};

let firebaseApp;
try {
    firebaseApp = firebase.app();
} catch {
    firebaseApp = firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();

// 2. Render Halaman Login / Signup
function renderAuthPage() {
    const container = document.getElementById('pageContainer');
    if (!container) return;

    // Reset total container
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
                        
                        <!-- 🔥 CHECKBOX DIPERJELAS DENGAN STYLE LANGSUNG -->
                        <div class="form-check mb-3 d-flex align-items-center">
                            <input class="form-check-input" type="checkbox" id="rememberMe" 
                                   style="width: 18px; height: 18px; margin-right: 10px; cursor: pointer;">
                            <label class="form-check-label text-muted small" for="rememberMe" style="cursor: pointer;">
                                Ingat saya
                            </label>
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

    // --- 1. LOAD DATA DARI LOCALSTORAGE ---
    const savedEmail = localStorage.getItem('authEmail');
    const savedPass = localStorage.getItem('authPass');
    if (savedEmail) document.getElementById('authEmail').value = savedEmail;
    if (savedPass) document.getElementById('authPassword').value = savedPass;
    if (savedEmail && savedPass) document.getElementById('rememberMe').checked = true;

    // --- 2. TOGGLE LOGIN / SIGNUP ---
    let isLogin = true;
    const title = document.getElementById('authTitle');
    const btn = document.getElementById('authSubmitBtn');
    const toggleText = document.getElementById('authToggleText');
    const toggleLink = document.getElementById('authToggleLink');
    const errorEl = document.getElementById('authError');
    const emailInput = document.getElementById('authEmail');
    const passInput = document.getElementById('authPassword');
    const rememberMeCheck = document.getElementById('rememberMe');

    toggleLink.onclick = (e) => {
        e.preventDefault();
        isLogin = !isLogin;
        title.innerText = isLogin ? '🔐 Masuk ke Aplikasi' : '📝 Daftar Akun Baru';
        btn.innerText = isLogin ? 'Masuk' : 'Daftar';
        toggleText.innerText = isLogin ? 'Belum punya akun?' : 'Sudah punya akun?';
        toggleLink.innerText = isLogin ? 'Daftar Sekarang' : 'Masuk';
        errorEl.innerText = '';
        
        emailInput.value = '';
        passInput.value = '';
        rememberMeCheck.checked = false;
        localStorage.removeItem('authEmail');
        localStorage.removeItem('authPass');
    };

    // --- 3. LOGIKA SUBMIT ---
    btn.onclick = async () => {
        const email = emailInput.value.trim();
        const pass = passInput.value;
        errorEl.innerText = '';

        if (!email || !pass) { errorEl.innerText = 'Email dan Password wajib diisi!'; return; }

        try {
            if (isLogin) {
                await auth.signInWithEmailAndPassword(email, pass);
            } else {
                await auth.createUserWithEmailAndPassword(email, pass);
            }

            // --- 4. SIMPAN DATA JIKA CHECKBOX DICENTANG ---
            if (rememberMeCheck.checked) {
                localStorage.setItem('authEmail', email);
                localStorage.setItem('authPass', pass);
            } else {
                localStorage.removeItem('authEmail');
                localStorage.removeItem('authPass');
            }

        } catch (error) {
            errorEl.innerText = error.message.replace('Firebase: ', '');
        }
    };
}

// 3. Logout
function logoutUser() { 
    localStorage.removeItem('authEmail');
    localStorage.removeItem('authPass');
    auth.signOut(); 
}

// 4. Ekspor ke Global
window.auth = auth;
window.renderAuthPage = renderAuthPage;
window.logoutUser = logoutUser;

console.log('✅ Auth Module (With Visible Checkbox) Loaded');