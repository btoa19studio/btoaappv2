'use strict';
class DashboardModule {
    constructor() {
        this.latitude = '--';
        this.longitude = '--';
        this.accuracy = '--';
        this.status = 'Mendapatkan lokasi...';
        this.isWatching = false;
        this.watchId = null;
        this.containerId = 'locationDisplay'; // ID untuk pembaruan DOM
    }

    startTracking() {
        if (this.isWatching) return;
        if (!navigator.geolocation) {
            this.status = 'GPS tidak didukung browser ini.';
            this.updateLocationUI();
            return;
        }
        this.isWatching = true;
        this.status = 'Sedang mencari lokasi...';
        this.updateLocationUI();

        this.watchId = navigator.geolocation.watchPosition(
            (position) => {
                this.latitude = position.coords.latitude.toFixed(6);
                this.longitude = position.coords.longitude.toFixed(6);
                this.accuracy = position.coords.accuracy.toFixed(1);
                this.status = 'Aktif';
                this.updateLocationUI();
            },
            (error) => {
                let msg = 'Error GPS: ';
                switch(error.code) {
                    case error.PERMISSION_DENIED: msg += 'Izin ditolak.'; break;
                    case error.POSITION_UNAVAILABLE: msg += 'Lokasi tidak tersedia.'; break;
                    case error.TIMEOUT: msg += 'Waktu habis.'; break;
                    default: msg += 'Terjadi kesalahan.';
                }
                this.status = msg;
                this.updateLocationUI();
            }
        );
    }

    updateLocationUI() {
        const el = document.getElementById(this.containerId);
        if (!el) return;
        el.innerHTML = `
            <div class="d-flex align-items-center justify-content-between">
                <div class="d-flex align-items-center gap-2">
                    <i class='bx bx-current-location fs-3 text-primary'></i>
                    <div>
                        <div class="fw-bold small">📍 Lokasi Saya</div>
                        <div class="text-muted small">Lat: ${this.latitude} | Lon: ${this.longitude}</div>
                        <div class="text-muted small" style="font-size: 10px;">Akurasi: ±${this.accuracy}m | Status: ${this.status}</div>
                    </div>
                </div>
            </div>
        `;
    }

    async render() {
        // Memulai pelacakan saat halaman di-render
        setTimeout(() => this.startTracking(), 500);
        
        const dateStr = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

        return `
            <div class="container-fluid p-0">
                <!-- Header Tanggal -->
                <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap">
                    <div id="locationDisplay" class="card border-0 shadow-sm bg-white p-3 w-100 mb-2">
                        <div class="d-flex align-items-center gap-2">
                            <div class="spinner-border spinner-border-sm text-primary" role="status"></div>
                            <span class="text-muted small">Memuat lokasi...</span>
                        </div>
                    </div>
                    <span class="text-muted small ms-auto">${dateStr}</span>
                </div>

                <!-- Stats Cards tetap ada di bawah -->
                <div class="row g-3 mb-4">
                    <div class="col-md-4 col-lg">
                        <div class="stat-card p-3 bg-white rounded-3 shadow-sm border">
                            <div class="d-flex align-items-center justify-content-between">
                                <div>
                                    <p class="text-muted small mb-1">Password</p>
                                    <h3 class="stat-number mb-0 text-primary">0</h3>
                                </div>
                                <div class="icon-wrapper bg-primary bg-opacity-10 text-primary">
                                    <i class='bx bxs-lock fs-3'></i>
                                </div>
                            </div>
                        </div>
                    </div>
                    <!-- ... sisa kartu stat ... -->
                </div>

                <!-- Aktivitas Terbaru -->
                <div class="card border-0 shadow-sm bg-white">
                    <div class="card-body p-4">
                        <h5 class="card-title fw-bold text-dark">🕐 Aktivitas Terbaru</h5>
                        <p class="text-muted small mb-0">Belum ada aktivitas untuk ditampilkan di sini.</p>
                    </div>
                </div>
            </div>
        `;
    }
}
const dashboardModule = new DashboardModule();
window.dashboardModule = dashboardModule;