/* ===================================================
   AxleOps — Vite Entry Point
   =================================================== */

// Import styles — Vite will process, bundle, and hot-reload CSS
import './css/styles.css';

// Import app module
import { initSidebar, initModals, initTabs, initStatusTabs, initGlobalActions, initTripFilters, initTripWizard } from './js/app.js';

// Import RBAC module
import { showRoleSelector, selectRole, renderSidebar, updateHeaderForRole, renderDemoToolbar } from './js/rbac.js';

/**
 * Load all page HTML fragments from /pages/ and inject them into the
 * content area. Once all pages are loaded, initialize UI interactions.
 */
function loadPages() {
    const pages = [
        'trip-slider-system',
        'dashboard', 'dashboard-owner', 'dashboard-fleet-manager',
        'dashboard-operator', 'dashboard-shop-manager', 'dashboard-accounts',
        'dashboard-admin',
        'dashboard-finance',
        'dashboard-accounts-exec',
        'dashboard-compliance', 'dashboard-auditor',
        'dashboard-inventory', 'dashboard-mechanic',
        'dashboard-sales', 'dashboard-account-mgr', 'dashboard-driver',
        'dashboard-branch-manager',
        'dashboard-placeholder',
        'product-map',
        'trips', 'active-trips', 'archived-trips', 'trip-archive-search', 'trip-detail', 'trip-create',
        'trip-settlement', 'driver-mobile', 'workflow-templates',
        'vehicle-list', 'vehicle-detail', 'vehicle-compliance',
        'vehicle-assignments', 'vehicle-new', 'vehicle-add-multiple', 'vehicle-import',
        'meter-history', 'expense-history', 'equipment',
        'contacts', 'contact-detail',
        'employees', 'accounts-list',
        'clients', 'client-detail', 'invoices', 'invoice-detail', 'payment-receipts', 'aging-analysis',
        'bill-collect', 'client-bill-master',
        'routes', 'route-detail',
        'inspections', 'inspection-detail', 'issues', 'reminders',
        'service-history', 'work-orders', 'work-order-new', 'work-order-create',
        'service-tasks', 'service-programs', 'shop-directory',
        'vendors', 'parts-list', 'part-detail',
        'purchase-orders', 'fuel-history', 'charging-history', 'places',
        'inventory-intelligence', 'vendor-capital', 'workshop-forecast', 'work-order-board',
        'documents', 'reports', 'report-detail', 'settings',
        'user-management',
        'chart-of-accounts', 'account-ledger', 'voucher-entry', 'profit-loss',
        'balance-sheet', 'day-book', 'trial-balance', 'trip-profitability', 'cash-flow', 'export-center',
        'insurance-spend',
        'owner-morning-briefing',
        'smart-recommendations',
        'customer-service-levels',
        'trip-alerts', 'alerting-rules', 'alert-detail', 'alert-analytics', 'escalation-matrix',
        'branches', 'partners', 'subcontractors',
        'vehicle-types',
        'behavioral-losses'
    ];

    const container = document.getElementById('page-content-area');
    let loaded = 0;

    pages.forEach(function (page) {
        fetch('pages/' + page + '.html')
            .then(function (r) { return r.text(); })
            .then(function (html) {
                const div = document.createElement('div');
                div.id = 'page-' + page;
                div.className = 'page-section';
                div.style.display = 'none';
                div.innerHTML = html;
                // Execute any inline scripts (innerHTML doesn't auto-execute scripts)
                div.querySelectorAll('script').forEach(function(oldScript) {
                    const newScript = document.createElement('script');
                    if (oldScript.src) {
                        newScript.src = oldScript.src;
                    } else {
                        newScript.textContent = oldScript.textContent;
                    }
                    oldScript.parentNode.replaceChild(newScript, oldScript);
                });
                container.appendChild(div);
                loaded++;
                if (loaded === pages.length) {
                    initModals();
                    initTabs();
                    initStatusTabs();
                    initGlobalActions();
                    initTripWizard();
                    initTripFilters();
                    onAllPagesLoaded();
                }
            })
            .catch(function (err) {
                console.warn(`Failed to load page: ${page}`, err);
                loaded++;
                if (loaded === pages.length) {
                    initModals();
                    initTabs();
                    initStatusTabs();
                    initGlobalActions();
                    initTripWizard();
                    onAllPagesLoaded();
                }
            });
    });
}

/**
 * Called after all pages are loaded. Always shows the role selector.
 */
function onAllPagesLoaded() {
    showRoleSelector();
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function () {
    initSidebar();
    loadPages();
});
