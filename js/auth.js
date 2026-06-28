'use strict';

const vaultModule = {
    data: [],
    folders: [],
    filteredData: [],
    expandedFolders: [],
    selectedItem: null,
    editorInstance: null,

    async init() {
        this.editorInstance = null;
        await this.loadData();
    },

    async loadData() {
        const uid = auth.currentUser?.uid;
        if (!uid) return;
        try {
            const snapshot = await firebase.database().ref('users/' + uid + '/passwords').once('value');
            const raw = snapshot.val();
            this.data = raw ? Object.keys(raw).map(key => ({ id: key, ...raw[key] })) : [];
            const folderSet = new Set();
            this.data.forEach(item => {
                if (item.folder) folderSet.add(item.folder);
            });
            this.folders = Array.from(folderSet);
            this.filteredData = [...this.data];
            this.expandedFolders = [...this.folders, '_uncategorized'];
        } catch (e) {
            console.error('Gagal load vault:', e);
            this.data = [];
            this.filteredData = [];
        }
    },

    async render() {
        await this.init();
        const total = this.data.length;
        return `
            <div class="container-fluid p-0">
                <div class="d-flex flex-wrap align-items-center justify-content-between mb-4 gap-2">
                    <div>
                        <h4 class="fw-bold text-dark m-0">🔐 Password Vault</h4>
                        <span class="text-muted small">Total ' + total + ' akun tersimpan</span>
                    </div>
                    <div class="d-flex gap-2 flex-wrap">
                        <div class="input-group" style="max-width: 200px;">
                            <span class="input-group-text bg-white border-end-0"><i class="bx bx-search"></i></span>
                            <input type="text" class="form-control border-start-0" id="vaultSearch" placeholder="Cari...">
                        </div>
                        <select class="form-select" style="max-width: 120px;" id="vaultFilter">
                            <option value="">Semua Folder</option>
                        </select>
                        <button class="btn btn-primary rounded-circle d-flex align-items-center justify-content-center" style="width: 44px; height: 44px;" onclick="vaultModule.showAddForm()">
                            <i class="bx bx-plus fs-4"></i>
                        </button>
                    </div>
                </div>
                <div id="vaultContainer">
                    <div class="text-center text-muted py-5"><i class="bx bx-lock-open fs-1"></i><p>Belum ada akun tersimpan. Klik + untuk menambahkan.</p></div>
                </div>
            </div>
        `;
    },

    async saveItem(id) {
        const siteName = document.getElementById('vaultSiteName').value.trim();
        const website = document.getElementById('vaultWebsite').value.trim();
        const email = document.getElementById('vaultEmail').value.trim();
        const username = document.getElementById('vaultUsername').value.trim();
        const password = document.getElementById('vaultPassword').value.trim();
        const category = document.getElementById('vaultCategory').value;
        const folder = document.getElementById('vaultFolder').value.trim();
        if (!siteName || !password) {
            Utils.showToast('Nama Website dan Password wajib diisi!', 'error');
            return;
        }
        const item = { siteName, website, email, username, password, category, folder, updatedAt: new Date().toISOString() };
        const uid = auth.currentUser?.uid;
        if (!uid) return;
        try {
            if (id) {
                await firebase.database().ref('users/' + uid + '/passwords/' + id).update(item);
                Utils.showToast('✅ Akun diperbarui', 'success');
            } else {
                const ref = firebase.database().ref('users/' + uid + '/passwords').push();
                item.createdAt = new Date().toISOString();
                await ref.set(item);
                Utils.showToast('✅ Akun ditambahkan', 'success');
            }
            app.closeModal();
            app.refresh();
        } catch (error) {
            Utils.showToast('❌ Gagal menyimpan: ' + error.message, 'error');
        }
    },

    showAddForm() {
        const modal = document.getElementById('modalDialog');
        const overlay = document.getElementById('modalOverlay');
        if (!modal || !overlay) return;
        overlay.className = 'modal-overlay';
        modal.className = 'modal-dialog';
        modal.innerHTML = `
            <div class="p-3 border-bottom d-flex justify-content-between align-items-center">
                <h5 class="fw-bold m-0">➕ Tambah Akun</h5>
                <button class="btn btn-icon" onclick="app.closeModal()"><i class="bx bx-x fs-4"></i></button>
            </div>
            <div class="p-3">
                <div class="row g-2">
                    <div class="col-12"><label class="form-label small">Nama Website</label><input class="form-control" id="vaultSiteName" placeholder="Contoh: Instagram"></div>
                    <div class="col-12"><label class="form-label small">URL Website</label><input class="form-control" id="vaultWebsite" placeholder="https://..."></div>
                    <div class="col-6"><label class="form-label small">Email</label><input class="form-control" id="vaultEmail" placeholder="email@domain"></div>
                    <div class="col-6"><label class="form-label small">Username</label><input class="form-control" id="vaultUsername" placeholder="@username"></div>
                    <div class="col-6"><label class="form-label small">Password</label><input class="form-control" id="vaultPassword" type="password" placeholder="Min 6 karakter"></div>
                    <div class="col-6"><label class="form-label small">Kategori</label><select class="form-select" id="vaultCategory"><option>Email</option><option>Sosial</option><option>Banking</option><option>Lainnya</option></select></div>
                    <div class="col-12"><label class="form-label small">Folder</label><input class="form-control" id="vaultFolder" placeholder="Contoh: Pekerjaan, Pribadi"></div>
                </div>
                <div class="d-flex gap-2 mt-3">
                    <button class="btn btn-primary flex-fill" onclick="vaultModule.saveItem(null)"><i class="bx bx-save"></i> Simpan</button>
                    <button class="btn btn-secondary flex-fill" onclick="app.closeModal()">Batal</button>
                </div>
            </div>
        `;
        overlay.classList.add('open');
    },

    copyText(text) {
        if (!text) return Utils.showToast('Tidak ada teks untuk disalin', 'error');
        navigator.clipboard?.writeText(text).then(() => Utils.showToast('📋 Disalin!', 'success'))
            .catch(() => Utils.showToast('❌ Gagal menyalin', 'error'));
    }
};

window.vaultModule = vaultModule;
console.log('✅ Vault Module Loaded');
