'use strict';
class DashboardModule {
    async render() {
        return `
            <div class="dashboard-modern">
                <div class="stats-grid">
                    <div class="stat-card" style="border-top-color:#7367F0;"><div class="stat-value">0</div><div>Password</div></div>
                    <div class="stat-card" style="border-top-color:#00CFE8;"><div class="stat-value">0</div><div>Catatan</div></div>
                    <div class="stat-card" style="border-top-color:#28C76F;"><div class="stat-value">0</div><div>Tugas</div></div>
                    <div class="stat-card" style="border-top-color:#FF9F43;"><div class="stat-value">0</div><div>Transaksi</div></div>
                    <div class="stat-card" style="border-top-color:#EA5455;"><div class="stat-value">0</div><div>Perjalanan</div></div>
                </div>
            </div>
        `;
    }
}
const dashboardModule = new DashboardModule();
window.dashboardModule = dashboardModule;
