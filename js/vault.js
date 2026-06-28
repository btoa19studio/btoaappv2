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
            const snapshot = await firebase.database().ref(`users/${uid}/passwords`).once('value');
            const raw = snapshot.val();
            this.data = raw ? Object.keys(raw).map(key => ({ id: key, ...raw[key] })) : [];
            const folderSet = new Set();
            this.data.forEach(item => {
                if (item.folder) folderSet.add(item.folder);
            });
            this.folders = Array.from(folderSet);
            this.filteredData = [...this.data];
            this.expandAllFolders();
        } catch (e) {
            console.error('Gagal load vault:', e);
            this.data = [];
            this.filteredData = [];
        }
    },

    expandAllFolders() {
        this.expandedFolders = [...this.folders, '_uncategorized'];
    },

    async render() {
        await this.init();
        const total = this.data.length;
        return `
            <div class="container-fluid p-0">
                <div class="d-flex flex-wrap align-items-center justify-content-between mb-4 gap-2">
                    <div>
                        <h4 class="fw-bold text-dark m-0">🔐 Password Vault</h4>
                        <span class="text-muted small">Total ${total} akun tersimpan</span>
                    </div>
                    <div class="d-flex gap-2 flex-wrap">
                        <div class="input-group" style="max-width: 200px;">
                            <span class="input-group-text bg-white border-end-0"><i class='bx bx-search'></i></span>
                            <input type="text" class="form-control border-start-0" id="vaultSearch" placeholder="Cari..." oninput="vaultModule.search(this.value)">
                        </div>
                        <select class="form-select" style="max-width: 120px;" id="vaultFilter" onchange="vaultModule.filterByFolder(this.value)">
                            <option value="">Semua Folder</option>
                            ${this.folders.map(f => `<option value="${f}">${f}</option>`).join('')}
                        </select>
                        <button class="btn btn-primary rounded-circle d-flex align-items-center justify-content-center" style="width: 44px; height: 44px;" onclick="vaultModule.showAddForm()">
                            <i class='bx bx-plus fs-4'></i>
                        </button>
                    </div>
                </div>

                <div id="vaultContainer">
                    ${this.renderFolders()}
                </div>
            </div>
        `;
    },

    renderFolders() {
        if (this.filteredData.length === 0) {
            return `<div class="text-center text-muted py-5"><i class='bx bx-lock-open fs-1'></i><p>Belum ada akun tersimpan.</p></div>`;
        }

        const grouped = {};
        const uncategorized = [];
        this.filteredData.forEach(item => {
            const key = item.folder || 'Tanpa Folder';
            if (key === 'Tanpa Folder') uncategorized.push(item);
            else {
                if (!grouped[key]) grouped[key] = [];
                grouped[key].push(item);
            }
        });

        let html = '';
        for (const [folderName, items] of Object.entries(grouped)) {
            const isOpen = this.expandedFolders.includes(folderName);
            html += `
                <div class="vault-folder mb-3">
                    <div class="vault-folder-header d-flex align-items-center justify-content-between p-3 bg-white rounded-3 shadow-sm border" onclick="vaultModule.toggleFolder('${folderName}')">
                        <div class="d-flex align-items-center gap-2">
                            <i class='bx ${isOpen ? 'bx-folder-open' : 'bx-folder'} fs-4 text-primary'></i>
                            <span class="fw-bold text-dark">${folderName}</span>
                            <span class="badge bg-light text-dark rounded-pill">${items.length}</span>
                        </div>
                        <i class='bx ${isOpen ? 'bx-chevron-up' : 'bx-chevron-down'} fs-4 text-muted'></i>
                    </div>
                    <div class="vault-folder-content ${isOpen ? '' : 'd-none'} p-3 pt-2">
                        ${this.renderAccountList(items)}
                    </div>
                </div>
            `;
        }

        if (uncategorized.length > 0) {
            const isOpen = this.expandedFolders.includes('_uncategorized');
            html += `
                <div class="vault-folder mb-3">
                    <div class="vault-folder-header d-flex align-items-center justify-content-between p-3 bg-white rounded-3 shadow-sm border" onclick="vaultModule.toggleFolder('_uncategorized')">
                        <div class="d-flex align-items-center gap-2">
                            <i class='bx bx-folder fs-4 text-secondary'></i>
                            <span class="fw-bold text-dark">Tanpa Folder</span>
                            <span class="badge bg-light text-dark rounded-pill">${uncategorized.length}</span>
                        </div>
                        <i class='bx ${isOpen ? 'bx-chevron-up' : 'bx-chevron-down'} fs-4 text-muted'></i>
                    </div>
                    <div class="vault-folder-content ${isOpen ? '' : 'd-none'} p-3 pt-2">
                        ${this.renderAccountList(uncategorized)}
                    </div>
                </div>
            `;
        }
        return html;
    },

    renderAccountList(items) {
        return items.map(item => `
            <div class="vault-account-card p-3 bg-light rounded-3 border mb-2" onclick="vaultModule.showDetail('${item.id}')">
                <div class="d-flex align-items-center justify-content-between">
                    <div class="d-flex align-items-center gap-2">
                        <i class='bx bx-globe fs-4 text-primary'></i>
                        <div>
                            <div class="fw-bold text-dark">${this.escapeHTML(item.siteName || item.website || 'Tanpa Nama')}</div>
                            <div class="text-muted small">${this.escapeHTML(item.username || item.email || '')}</div>
                            <div class="text-muted small" style="font-size: 10px;">Terakhir diubah ${item.updatedAt ? this.formatDate(item.updatedAt) : this.formatDate(item.createdAt)}</div>
                        </div>
                    </div>
                    <div class="d-flex gap-1">
                        <button class="btn btn-sm btn-outline-secondary rounded-circle" onclick="event.stopPropagation(); vaultModule.copyText('${item.password || ''}')" title="Salin Password">
                            <i class='bx bx-copy'></i>
                        </button>
                        <button class="btn btn-sm btn-outline-primary rounded-circle" onclick="event.stopPropagation(); vaultModule.showDetail('${item.id}')" title="Lihat Detail">
                            <i class='bx bx-info-circle'></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    },

    toggleFolder(folderName) {
        const idx = this.expandedFolders.indexOf(folderName);
        if (idx > -1) this.expandedFolders.splice(idx, 1);
        else this.expandedFolders.push(folderName);
        app.refresh();
    },

    search(query) {
        const q = query.toLowerCase();
        this.filteredData = this.data.filter(item => 
            (item.siteName || '').toLowerCase().includes(q) ||
            (item.username || '').toLowerCase().includes(q) ||
            (item.email || '').toLowerCase().includes(q) ||
            (item.folder || '').toLowerCase().includes(q)
        );
        app.refresh();
    },

    filterByFolder(folder) {
        if (!folder) this.filteredData = [...this.data];
        else this.filteredData = this.data.filter(item => item.folder === folder);
        app.refresh();
    },

    showDetail(id) {
        const item = this.data.find(i => i.id === id);
        if (!item) return;
        this.selectedItem = item;
        const modal = document.getElementById('modalDialog');
        const overlay = document.getElementById('modalOverlay');
        if (!modal || !overlay) return;

        overlay.className = 'modal-overlay bottom-sheet-overlay';
        modal.className = 'modal-dialog bottom-sheet';

        const passwordHidden = '••••••••';
        modal.innerHTML = `
            <div class="bottom-sheet-header">
                <div class="d-flex justify-content-between align-items-center p-3 border-bottom">
                    <h5 class="fw-bold m-0">Detail Akun</h5>
                    <button class="btn btn-icon" onclick="app.closeModal()"><i class='bx bx-x fs-4'></i></button>
                </div>
            </div>
            <div class="bottom-sheet-body p-3" style="max-height: 70vh; overflow-y: auto;">
                <div class="d-flex align-items-center gap-3 mb-3">
                    <div class="bg-primary bg-opacity-10 rounded-3 p-3">
                        <i class='bx bx-globe fs-2 text-primary'></i>
                    </div>
                    <div>
                        <h5 class="fw-bold m-0">${this.escapeHTML(item.siteName || item.website || 'Tanpa Nama')}</h5>
                        <div class="text-muted small">${item.category || 'Umum'}</div>
                    </div>
                </div>

                <div class="row g-2 mb-3">
                    <div class="col-6"><small class="text-muted">URL</small><div>${item.website || '-'}</div></div>
                    <div class="col-6"><small class="text-muted">Kategori</small><div>${item.category || '-'}</div></div>
                    <div class="col-6"><small class="text-muted">Email</small><div>${item.email || '-'}</div></div>
                    <div class="col-6"><small class="text-muted">Username</small><div>${item.username || '-'}</div></div>
                    <div class="col-12">
                        <small class="text-muted">Password</small>
                        <div class="d-flex align-items-center gap-2">
                            <span id="detailPasswordDisplay">${passwordHidden}</span>
                            <button class="btn btn-sm btn-outline-secondary rounded-circle" onclick="vaultModule.togglePasswordVisibility()">
                                <i class='bx bx-show' id="detailPasswordToggle"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-primary rounded-circle" onclick="vaultModule.copyText('${item.password || ''}')">
                                <i class='bx bx-copy'></i>
                            </button>
                        </div>
                    </div>
                </div>

                <hr>
                <div class="mb-2"><small class="text-muted">Catatan</small></div>
                <div class="p-2 bg-light rounded-3">${item.note || 'Tidak ada catatan.'}</div>
                <hr>
                <div class="d-flex justify-content-between text-muted small">
                    <span>Dibuat: ${this.formatDate(item.createdAt)}</span>
                    <span>Diubah: ${this.formatDate(item.updatedAt || item.createdAt)}</span>
                </div>

                <div class="d-flex gap-2 mt-3">
                    <button class="btn btn-outline-primary flex-fill" onclick="vaultModule.editItem('${item.id}')"><i class='bx bx-edit-alt'></i> Edit</button>
                    <button class="btn btn-outline-danger flex-fill" onclick="vaultModule.deleteItem('${item.id}')"><i class='bx bx-trash'></i> Hapus</button>
                </div>
            </div>
        `;

        overlay.classList.add('open');
        window._detailPasswordVisible = false;
    },

    togglePasswordVisibility() {
        const display = document.getElementById('detailPasswordDisplay');
        const toggleIcon = document.getElementById('detailPasswordToggle');
        if (!display || !toggleIcon) return;
        const item = this.selectedItem;
        if (!item) return;
        if (window._detailPasswordVisible) {
            display.textContent = '••••••••';
            toggleIcon.className = 'bx bx-show';
            window._detailPasswordVisible = false;
        } else {
            display.textContent = item.password || '-';
            toggleIcon.className = 'bx bx-hide';
            window._detailPasswordVisible = true;
        }
    },

    showAddForm() { this.showForm(null); },
    editItem(id) {
        const item = this.data.find(i => i.id === id);
        if (item) this.showForm(item);
    },

    showForm(item = null) {
        const modal = document.getElementById('modalDialog');
        const overlay = document.getElementById('modalOverlay');
        if (!modal || !overlay) return;
        const isEdit = !!item;

        overlay.className = 'modal-overlay';
        modal.className = 'modal-dialog';

        modal.innerHTML = `
            <div class="p-3 border-bottom d-flex justify-content-between align-items-center">
                <h5 class="fw-bold m-0">${isEdit ? '✏️ Edit Akun' : '➕ Tambah Akun'}</h5>
                <button class="btn btn-icon" onclick="app.closeModal()"><i class='bx bx-x fs-4'></i></button>
            </div>
            <div class="p-3" style="max-height: 75vh; overflow-y: auto;">
                <div class="row g-2">
                    <div class="col-12"><label class="form-label small">Nama Website</label><input class="form-control" id="vaultSiteName" value="${isEdit ? this.escapeHTML(item.siteName || '') : ''}" placeholder="Contoh: Instagram"></div>
                    <div class="col-12"><label class="form-label small">URL Website</label><input class="form-control" id="vaultWebsite" value="${isEdit ? this.escapeHTML(item.website || '') : ''}" placeholder="https://..."></div>
                    <div class="col-6"><label class="form-label small">Email</label><input class="form-control" id="vaultEmail" value="${isEdit ? this.escapeHTML(item.email || '') : ''}" placeholder="email@domain"></div>
                    <div class="col-6"><label class="form-label small">Username</label><input class="form-control" id="vaultUsername" value="${isEdit ? this.escapeHTML(item.username || '') : ''}" placeholder="@username"></div>
                    <div class="col-6"><label class="form-label small">Password</label><input class="form-control" id="vaultPassword" value="${isEdit ? this.escapeHTML(item.password || '') : ''}" type="password" placeholder="Min 6 karakter"></div>
                    <div class="col-6"><label class="form-label small">Kategori</label><select class="form-select" id="vaultCategory"><option ${isEdit && item.category === 'Email' ? 'selected' : ''}>Email</option><option ${isEdit && item.category === 'Sosial' ? 'selected' : ''}>Sosial</option><option ${isEdit && item.category === 'Banking' ? 'selected' : ''}>Banking</option><option ${isEdit && item.category === 'Lainnya' ? 'selected' : ''}>Lainnya</option></select></div>
                    <div class="col-12"><label class="form-label small">Folder</label><input class="form-control" id="vaultFolder" value="${isEdit ? this.escapeHTML(item.folder || '') : ''}" placeholder="Contoh: Pekerjaan, Pribadi, atau biarkan kosong"></div>
                    <div class="col-12"><label class="form-label small">Catatan</label><div id="editorjsContainer"></div></div>
                </div>
                <div class="d-flex gap-2 mt-3">
                    <button class="btn btn-primary flex-fill" onclick="vaultModule.saveItem(${isEdit ? `'${item.id}'` : 'null'})"><i class='bx bx-save'></i> Simpan</button>
                    <button class="btn btn-secondary flex-fill" onclick="app.closeModal()">Batal</button>
                </div>
            </div>
        `;
        overlay.classList.add('open');

        // Inisialisasi Editor.js
        this.initEditor(isEdit ? item.note : '');
    },

    async initEditor(noteContent) {
        const container = document.getElementById('editorjsContainer');
        if (!container) return;
        container.innerHTML = '';
        try {
            const editor = new EditorJS({
                holder: container,
                placeholder: 'Tulis catatan di sini... (termasuk gambar)',
                data: noteContent ? this.parseNote(noteContent) : { blocks: [] },
                tools: {
                    header: { class: Header, inlineToolbar: true },
                    paragraph: { class: Paragraph, inlineToolbar: true },
                    image: { 
                        class: ImageTool,
                        config: {
                            uploader: {
                                async uploadByFile(file) {
                                    return { success: 0 };
                                },
                                async uploadByUrl(url) {
                                    return { success: 1, file: { url } };
                                }
                            }
                        }
                    }
                }
            });
            this.editorInstance = editor;
        } catch (e) {
            console.warn('Editor.js gagal dimuat, gunakan textarea fallback');
            container.innerHTML = `<textarea class="form-control" id="vaultNoteFallback" rows="4">${noteContent || ''}</textarea>`;
        }
    },

    parseNote(note) {
        try { return JSON.parse(note); } catch { return { blocks: [{ type: 'paragraph', data: { text: note } }] }; }
    },

    async saveItem(id = null) {
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

        let note = '';
        if (this.editorInstance) {
            try {
                const saved = await this.editorInstance.save();
                note = JSON.stringify(saved);
            } catch { note = '{}'; }
        } else {
            note = document.getElementById('vaultNoteFallback')?.value || '';
        }

        const item = { siteName, website, email, username, password, category, folder, note, updatedAt: new Date().toISOString() };

        const uid = auth.currentUser?.uid;
        if (!uid) return;

        try {
            if (id) {
                await firebase.database().ref(`users/${uid}/passwords/${id}`).update(item);
                Utils.showToast('✅ Akun diperbarui', 'success');
            } else {
                const ref = firebase.database().ref(`users/${uid}/passwords`).push();
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

    async deleteItem(id) {
        if (!confirm('Hapus akun ini?')) return;
        const uid = auth.currentUser?.uid;
        if (!uid) return;
        try {
            await firebase.database().ref(`users/${uid}/passwords/${id}`).remove();
            Utils.showToast('🗑️ Akun dihapus', 'success');
            app.closeModal();
            app.refresh();
        } catch (error) {
            Utils.showToast('❌ Gagal menghapus: ' + error.message, 'error');
        }
    },

    copyText(text) {
        if (!text) return Utils.showToast('Tidak ada teks untuk disalin', 'error');
        navigator.clipboard?.writeText(text).then(() => Utils.showToast('📋 Disalin!', 'success'))
            .catch(() => Utils.showToast('❌ Gagal menyalin', 'error'));
    },

    escapeHTML(str) {
        if (!str) return '';
        return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
    },

    formatDate(dateStr) {
        if (!dateStr) return '-';
        try {
            return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
        } catch { return '-'; }
    }
};

window.vaultModule = vaultModule;