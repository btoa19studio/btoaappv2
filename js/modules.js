'use strict';
class LocalDB {
    constructor() { this.db = null; }
    async open() {
        if(this.db) return this.db;
        return new Promise((resolve, reject) => {
            const req = indexedDB.open('AllInOneDB', 1);
            req.onupgradeneeded = (e) => {
                const db = e.target.result;
                ['passwords','notes','todos','transactions','tracks'].forEach(store => {
                    if(!db.objectStoreNames.contains(store)) db.createObjectStore(store, {keyPath: 'id', autoIncrement: true});
                });
            };
            req.onsuccess = (e) => { this.db = e.target.result; resolve(this.db); };
            req.onerror = (e) => reject(e.target.error);
        });
    }
    async getAll(store) { if(!this.db) await this.open(); return new Promise((resolve, reject) => { const tx = this.db.transaction(store,'readonly'); const req = tx.objectStore(store).getAll(); req.onsuccess = () => resolve(req.result || []); req.onerror = () => reject(req.error); }); }
    async add(store, item) { if(!this.db) await this.open(); return new Promise((resolve, reject) => { const tx = this.db.transaction(store,'readwrite'); const req = tx.objectStore(store).add(item); req.onsuccess = () => resolve(req.result); req.onerror = () => reject(req.error); }); }
    async delete(store, id) { if(!this.db) await this.open(); return new Promise((resolve, reject) => { const tx = this.db.transaction(store,'readwrite'); const req = tx.objectStore(store).delete(id); req.onsuccess = () => resolve(); req.onerror = () => reject(req.error); }); }
}
const db = new LocalDB();
const Utils = {
    showToast: (msg) => { alert(msg); },
    formatCurrency: (amount) => 'Rp ' + (amount || 0)
};
const vaultModule = { render: async () => `<div class="card"><h3>🔐 Vault</h3><p>Module siap</p></div>` };
const notesModule = { render: async () => `<div class="card"><h3>📝 Notes</h3><p>Module siap</p></div>` };
const todoModule = { render: async () => `<div class="card"><h3>✅ Todo</h3><p>Module siap</p></div>` };
const moneyModule = { render: async () => `<div class="card"><h3>💰 Money</h3><p>Module siap</p></div>` };
const travelModule = { render: async () => `<div class="card"><h3>🗺️ Travel</h3><p>Module siap</p></div>` };
window.db = db; window.Utils = Utils; window.vaultModule = vaultModule; window.notesModule = notesModule; window.todoModule = todoModule; window.moneyModule = moneyModule; window.travelModule = travelModule;
