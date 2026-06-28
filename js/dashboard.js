'use strict';

class DashboardModule {
    constructor() {
        this.latitude = '--';
        this.longitude = '--';
        this.accuracy = '--';
        this.status = 'Mendapatkan lokasi...';
        this.locationName = 'Menentukan alamat...'; 
        this.isWatching = false;
        this.watchId = null;
        this.containerId = 'locationDisplay';
        this.lastFetchTime = 0; 
    }

    // Memulai pelacakan GPS
    startTracking() {
        if (this.isWatching) return;
        if (!navigator.geolocation) {
            this.status = '⚠️ GPS tidak didukung.';
            this.updateLocationUI();
            return;
        }
        
        this.isWatching = true;
        this.status = '🔍 Mencari lokasi...';
        this.updateLocationUI();

        this.watchId = navigator.geolocation.watchPosition(
            (position) => {
                const newLat = position.coords.latitude.toFixed(6);
                const newLon = position.coords.longitude.toFixed(6);
                
                this.latitude = newLat;
                this.longitude = newLon;
                this.accuracy = position.coords.accuracy.toFixed(1);
                this.status = '✅ GPS Aktif';
                
                const now = Date.now();
                if (now - this.lastFetchTime > 5000) { // Batasi request API setiap 5 detik
                    this.lastFetchTime = now;
                    this.fetchLocationName(newLat, newLon);
                }

                this.updateLocationUI();
            },
            (error) => {
                let msg = '❌ Error GPS: ';
                switch(error.code) {
                    case error.PERMISSION_DENIED: msg += 'Izin ditolak.'; break;
                    case error.POSITION_UNAVAILABLE: msg += 'Sinyal tidak tersedia.'; break;
                    case error.TIMEOUT: msg += 'Waktu habis.'; break;
                    default: msg += 'Terjadi kesalahan.';
                }
                this.status = msg;
                this.updateLocationUI();
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
        );
    }

    // Mengambil nama daerah dari API OpenStreetMap
    async fetchLocationName(lat, lon) {
        try {
            this.locationName = 'Mencari alamat...';
            this.updateLocationUI();

            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=18&accept-language=id`
            );
            
            if (!response.ok) throw new Error('Gagal menghubungi server peta');

            const data = await response.json();
            
            if (data && data.address) {
                const addr = data.address;
                let name = addr.road || addr.suburb || addr.city_district || addr.town || addr.city || addr.village || addr.county;
                let city = addr.city || addr.town || addr.village || addr.county;
                let state = addr.state || addr.province;

                let fullAddress = name;
                if (city && city !== name) fullAddress += `, ${city}`;
                if (state && !fullAddress.includes(state)) fullAddress += `, ${state}`;

                this.locationName = fullAddress.length > 0 ? fullAddress : data.display_name;
            } else {
                this.locationName = 'Nama daerah tidak ditemukan';
            }
        } catch (error) {
            console.error('Gagal mengambil alamat:', error);
            this.locationName = 'Gagal memuat alamat';
        } finally {
            this.updateLocationUI();
        }
    }

    // Memperbarui UI lokasi
    updateLocationUI() {
        const el = document.getElementById(this.containerId);
        if (!el) return;
        
        let statusIcon = 'bx bx-current-location';
        let statusColor = 'text-primary';
        if (this.status.includes('Error') || this.status.includes('tidak')) {
            statusIcon = 'bx bx-error';
            statusColor = 'text-danger';
        } else if (this.status.includes('Aktif')) {
            statusIcon = 'bx bx-check-circle';
            statusColor = 'text-success';
        }

        el.innerHTML = `
            <div class="d-flex align-items-center justify-content-between w-100 flex-wrap">
                <div class="d-flex align-items-center gap-3">
                    <i class='${statusIcon} fs-2 ${statusColor}'></i>
                    <div>
                        <div class="fw-bold small text-dark">📍 Lokasi Saya</div>
                        <div id="locationNameDisplay" class="fw-semibold text-dark" style="font-size: 1rem;">
                            ${this.locationName}
                        </div>
                        <div class="text-muted small" style="font-size: 11px;">
                            Lat: <strong>${this.latitude}</strong> | Lon: <strong>${this.longitude}</strong>
                        </div>
                        <div class="text-muted small" style="font-size: 10px;">
                            Akurasi: ±${this.accuracy}m | Status: ${this.status}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    async render() {
        // Jalankan GPS setelah komponen dirender
        setTimeout(() => this.startTracking(), 500);

        // Format Tanggal
        const dateStr = new Date().toLocaleDateString('id-ID', { 
            weekday: 'long', 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
        });

        return `
            <div class="container-fluid p-0">
                <!-- HEADER: Lokasi & Tanggal -->
                <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
                    <div id="locationDisplay" class="card border-0 shadow-sm bg-white p-3 flex-grow-1" style="max-width: 100%;">
                        <div class="d-flex align-items-center gap-2">
                            <div class="spinner-border spinner-border-sm text-primary" role="status"></div>
                            <span class="text-muted small">Mengaktifkan GPS...</span>
                        </div>
                    </div>
                    <div class="text-muted small text-end fw-bold bg-white p-2 rounded-3 shadow-sm border d-none d-sm-block">
                        📅 ${dateStr}
                    </div>
                    <div class="text-muted small text-end d-sm-none w-100">
                        📅 ${dateStr}
                    </div>
                </div>

                <!-- STATS CARDS (0 untuk demo) -->
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
                    <div class="col-md-4 col-lg">
                        <div class="stat-card p-3 bg-white rounded-3 shadow-sm border">
                            <div class="d-flex align-items-center justify-content-between">
                                <div>
                                    <p class="text-muted small mb-1">Catatan</p>
                                    <h3 class="stat-number mb-0 text-info">0</h3>
                                </div>
                                <div class="icon-wrapper bg-info bg-opacity-10 text-info">
                                    <i class='bx bxs-note fs-3'></i>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4 col-lg">
                        <div class="stat-card p-3 bg-white rounded-3 shadow-sm border">
                            <div class="d-flex align-items-center justify-content-between">
                                <div>
                                    <p class="text-muted small mb-1">Tugas</p>
                                    <h3 class="stat-number mb-0 text-success">0</h3>
                                </div>
                                <div class="icon-wrapper bg-success bg-opacity-10 text-success">
                                    <i class='bx bxs-check-circle fs-3'></i>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4 col-lg">
                        <div class="stat-card p-3 bg-white rounded-3 shadow-sm border">
                            <div class="d-flex align-items-center justify-content-between">
                                <div>
                                    <p class="text-muted small mb-1">Transaksi</p>
                                    <h3 class="stat-number mb-0 text-warning">0</h3>
                                </div>
                                <div class="icon-wrapper bg-warning bg-opacity-10 text-warning">
                                    <i class='bx bxs-wallet fs-3'></i>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4 col-lg">
                        <div class="stat-card p-3 bg-white rounded-3 shadow-sm border">
                            <div class="d-flex align-items-center justify-content-between">
                                <div>
                                    <p class="text-muted small mb-1">Perjalanan</p>
                                    <h3 class="stat-number mb-0 text-danger">0</h3>
                                </div>
                                <div class="icon-wrapper bg-danger bg-opacity-10 text-danger">
                                    <i class='bx bxs-map fs-3'></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- AKTIVITAS TERBARU -->
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