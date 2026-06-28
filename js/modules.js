'use strict';
const Utils = { showToast: (msg) => { alert(msg); } };
const vaultModule = { render: async () => `<div class="card p-4"><h4 class="text-muted">🔐 Vault</h4><p>Module siap</p></div>` };
const notesModule = { render: async () => `<div class="card p-4"><h4 class="text-muted">📝 Notes</h4><p>Module siap</p></div>` };
const todoModule = { render: async () => `<div class="card p-4"><h4 class="text-muted">✅ Todo</h4><p>Module siap</p></div>` };
const moneyModule = { render: async () => `<div class="card p-4"><h4 class="text-muted">💰 Money</h4><p>Module siap</p></div>` };
const travelModule = { render: async () => `<div class="card p-4"><h4 class="text-muted">🗺️ Travel</h4><p>Module siap</p></div>` };

window.Utils = Utils; 
window.vaultModule = vaultModule; window.notesModule = notesModule; window.todoModule = todoModule; window.moneyModule = moneyModule; window.travelModule = travelModule;