'use strict';

const Utils = {
    showToast: (msg, type = 'info') => {
        const container = document.getElementById('toastContainer');
        if (!container) return;
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = msg;
        container.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 300);
        }, 3000);
    },
    formatCurrency: (amount) => 'Rp ' + (amount || 0)
};

// 🔥 PERBAIKAN PENTING: HAPUS FALLBACK, JANGAN TIMPA VAULT MODULE!
window.Utils = Utils;

// Daftarkan modul lain sebagai placeholder (tidak mengganggu vault)
const notesModule = { render: async () => `<div class="card p-4"><h4 class="text-muted fw-bold">📝 Notes</h4><p class="text-muted">Fitur dalam pengembangan.</p></div>` };
const todoModule = { render: async () => `<div class="card p-4"><h4 class="text-muted fw-bold">✅ Todo</h4><p class="text-muted">Fitur dalam pengembangan.</p></div>` };
const moneyModule = { render: async () => `<div class="card p-4"><h4 class="text-muted fw-bold">💰 Money</h4><p class="text-muted">Fitur dalam pengembangan.</p></div>` };
const travelModule = { render: async () => `<div class="card p-4"><h4 class="text-muted fw-bold">🗺️ Travel</h4><p class="text-muted">Fitur dalam pengembangan.</p></div>` };

window.notesModule = notesModule;
window.todoModule = todoModule;
window.moneyModule = moneyModule;
window.travelModule = travelModule;

// ✅ VAULT TIDAK BOLEH DIDEFINISIKAN DI SINI, BIARKAN `vault.js` YANG MENDEFINISIKANNYA