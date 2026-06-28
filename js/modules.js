'use strict';

const Utils = {
    showToast: (msg, type = 'info') => {
        alert(msg);
    },
    formatCurrency: (amount) => 'Rp ' + (amount || 0)
};

const vaultModule = { render: async () => `<div class="card p-4 border-0 shadow-sm"><h4 class="text-muted fw-bold mb-3">🔐 Password Vault</h4><p class="text-muted">Halaman ini hanya untuk user yang login.</p></div>` };
const notesModule = { render: async () => `<div class="card p-4 border-0 shadow-sm"><h4 class="text-muted fw-bold mb-3">📝 Notes</h4><p class="text-muted">Halaman ini hanya untuk user yang login.</p></div>` };
const todoModule = { render: async () => `<div class="card p-4 border-0 shadow-sm"><h4 class="text-muted fw-bold mb-3">✅ Todo List</h4><p class="text-muted">Halaman ini hanya untuk user yang login.</p></div>` };
const moneyModule = { render: async () => `<div class="card p-4 border-0 shadow-sm"><h4 class="text-muted fw-bold mb-3">💰 Money Manager</h4><p class="text-muted">Halaman ini hanya untuk user yang login.</p></div>` };
const travelModule = { render: async () => `<div class="card p-4 border-0 shadow-sm"><h4 class="text-muted fw-bold mb-3">🗺️ Travel Tracker</h4><p class="text-muted">Halaman ini hanya untuk user yang login.</p></div>` };

window.Utils = Utils;
window.vaultModule = vaultModule;
window.notesModule = notesModule;
window.todoModule = todoModule;
window.moneyModule = moneyModule;
window.travelModule = travelModule;