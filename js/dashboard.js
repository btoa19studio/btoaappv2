'use strict';
class DashboardModule {
    async render() {
        // Layout dashboard menggunakan Grid Bootstrap 5
        return `
            <div class="container-fluid p-0">
                <!-- Header -->
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h4 class="fw-bold text-dark m-0">📊 Ringkasan Aktivitas</h4>
                    <span class="text-muted small">${new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>

                <!-- Stats Cards (Bootstrap Grid) -->
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

                <!-- Placeholder Content -->
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