'use strict';

// 1. Global Database Dummy (Agar tidak error saat di-dev)
const db = {
    getAll: async () => { return []; },
    add: async () => {},
    delete: async () => {}
};

// 2. Utilities
const Utils = {
    showToast: (msg, type = 'info') => {
        alert(msg); // Sementara menggunakan alert agar mudah dilihat
    },
    formatCurrency: (amount) => 'Rp ' + (amount || 0)
};

// 3. Modules (Halaman Lain)
// Setiap module mengembalikan HTML string untuk ditampilkan di container
const vaultModule = { 
    render: async () => `<div class="card p-4 border-0 shadow-sm"><h4 class="text-muted fw-bold mb-3">🔐 Password Vault</h4><p class="text-muted">Halaman ini sedang dalam pengembangan.</p></div>` 
};
const notesModule = { 
    render: async () => `<div class="card p-4 border-0 shadow-sm"><h4 class="text-muted fw-bold mb-3">📝 Notes</h4><p class="text-muted">Halaman ini sedang dalam pengembangan.</p></div>` 
};
const todoModule = { 
    render: async () => `<div class="card p-4 border-0 shadow-sm"><h4 class="text-muted fw-bold mb-3">✅ Todo List</h4><p class="text-muted">Halaman ini sedang dalam pengembangan.</p></div>` 
};
const moneyModule = { 
    render: async () => `<div class="card p-4 border-0 shadow-sm"><h4 class="text-muted fw-bold mb-3">💰 Money Manager</h4><p class="text-muted">Halaman ini sedang dalam pengembangan.</p></div>` 
};
const travelModule = { 
    render: async () => `<div class="card p-4 border-0 shadow-sm"><h4 class="text-muted fw-bold mb-3">🗺️ Travel Tracker</h4><p class="text-muted">Halaman ini sedang dalam pengembangan.</p></div>` 
};

// 4. EXPORT KE GLOBAL SCOPE (KUNCI AGAR APP.JS BISA MEMBACA)
window.db = db;
window.Utils = Utils;
window.vaultModule = vaultModule;
window.notesModule = notesModule;
window.todoModule = todoModule;
window.moneyModule = moneyModule;
window.travelModule = travelModule;

console.log('✅ Modules Loaded');