/* ===================================================
   Fleet Management Demo - Navigation & Interactions
   (ES Module - Vite compatible)
   =================================================== */

/* =========================
   Sidebar Navigation
   ========================= */
function initSidebar() {
  bindSidebarEvents();
}

function bindSidebarEvents() {
  // Toggle sub-menus
  document.querySelectorAll('.nav-item[data-toggle]').forEach(function (item) {
    item.addEventListener('click', function (e) {
      e.preventDefault();
      var targetId = this.getAttribute('data-toggle');
      var subNav = document.getElementById(targetId);
      if (subNav) {
        subNav.classList.toggle('open');
        this.classList.toggle('expanded');
      }
    });
  });

  // Nav link clicks
  document.querySelectorAll('.nav-item[data-page]').forEach(function (item) {
    item.addEventListener('click', function (e) {
      e.preventDefault();
      var page = this.getAttribute('data-page');
      navigateTo(page);
    });
  });
}

/**
 * Re-initialize sidebar after dynamic rebuild (used by RBAC role switching)
 */
function reinitSidebar() {
  bindSidebarEvents();
}

function navigateTo(page) {
  // Route to role-specific dashboard when "Dashboard" is clicked
  if (page === 'dashboard') {
    var currentRole = null;
    if (typeof window.getCurrentRole === 'function') {
      currentRole = window.getCurrentRole();
    }
    if (currentRole && window.ROLE_DASHBOARDS && window.ROLE_DASHBOARDS[currentRole]) {
      page = window.ROLE_DASHBOARDS[currentRole];
    }
  }

  // Update active states  
  document.querySelectorAll('.nav-item').forEach(function (n) {
    n.classList.remove('active');
  });

  // Highlight the Dashboard nav item when showing role-specific dashboard
  var activePage = page;
  if (page.startsWith('dashboard-')) {
    activePage = 'dashboard';
  }
  var target = document.querySelector('.nav-item[data-page="' + activePage + '"]');
  if (!target) {
    target = document.querySelector('.nav-item[data-page="' + page + '"]');
  }
  if (target) {
    target.classList.add('active');
    // Also expand parent if in sub-nav
    var parentSubNav = target.closest('.sub-nav');
    if (parentSubNav) {
      parentSubNav.classList.add('open');
      var parentToggle = document.querySelector('[data-toggle="' + parentSubNav.id + '"]');
      if (parentToggle) parentToggle.classList.add('expanded');
    }
  }

  // Show/Hide page content
  document.querySelectorAll('.page-section').forEach(function (section) {
    section.style.display = 'none';
  });

  var pageSection = document.getElementById('page-' + page);
  if (pageSection) {
    pageSection.style.display = 'block';
    // Scroll to top
    var contentArea = document.querySelector('.page-content');
    if (contentArea) contentArea.scrollTop = 0;
  }

  // Update breadcrumb
  updateBreadcrumb(page);

  // Enforce role-based visibility: hide finance-only elements for Operations roles
  applyFinanceVisibility();
}

/**
 * Operations roles (fleet_manager, operator, driver) should NOT see
 * revenue, profitability, or margin data — that's Finance's domain.
 * Elements with class "finance-only" are hidden for these roles.
 */
function applyFinanceVisibility() {
  var role = null;
  if (typeof window.getCurrentRole === 'function') {
    role = window.getCurrentRole();
  }
  var opsRoles = ['fleet_manager', 'operator', 'driver'];
  var isOpsRole = role && opsRoles.indexOf(role) !== -1;
  document.querySelectorAll('.finance-only').forEach(function (el) {
    el.style.display = isOpsRole ? 'none' : '';
  });
}

var pageHistory = [];

function updateBreadcrumb(page) {
  var breadcrumb = document.getElementById('breadcrumb');
  if (!breadcrumb) return;

  // Clear breadcrumb action buttons (dashboard pages inject their own)
  var bcActions = document.getElementById('breadcrumb-actions');
  if (bcActions) bcActions.innerHTML = '';

  var labels = {
    'dashboard': 'Dashboard',
    'dashboard-owner': 'Owner Dashboard',
    'dashboard-fleet-manager': 'Fleet Operations',
    'dashboard-operator': 'Operations Desk',
    'dashboard-shop-manager': 'Workshop Dashboard',
    'dashboard-accounts': 'Accounts & Billing',
    'dashboard-admin': 'System Administration',
    'dashboard-finance': 'Financial Command',
    'dashboard-accounts-exec': 'Accounts Work Queue',
    'product-map': 'Product Map',
    'dashboard-compliance': 'Compliance Monitor',
    'dashboard-auditor': 'Audit Center',
    'dashboard-inventory': 'Inventory Control',
    'dashboard-mechanic': 'My Work Queue',
    'dashboard-sales': 'Sales Pipeline',
    'dashboard-account-mgr': 'Client Health',
    'dashboard-driver': 'Driver Dashboard',
    'dashboard-branch-manager': 'Branch Operations Center',
    'trips': 'Trip Dashboard',
    'active-trips': 'Active Trips',
    'archived-trips': 'Settled Trips',
    'trip-archive-search': 'Archived Trips',
    'trip-detail': 'Trip Detail',
    'trip-create': 'Add Trip',

    'trip-settlement': 'Trip Settlement',
    'driver-mobile': 'Driver App',
    'vehicle-list': 'Vehicle List',
    'vehicle-detail': 'Vehicle Detail',
    'vehicle-compliance': 'Vehicle Compliance',
    'vehicle-assignments': 'Vehicle Assignments',
    'vehicle-new': 'New Vehicle',
    'vehicle-add-multiple': 'Add Multiple Vehicles',
    'vehicle-import': 'Import Vehicles',
    'meter-history': 'Meter History',
    'expense-history': 'Expense History',
    'equipment': 'Equipment',
    'contacts': 'Drivers',
    'contact-detail': 'Driver Detail',
    'employees': 'Employees',
    'accounts-list': 'Accounts',
    'clients': 'Client List',
    'client-detail': 'Client Detail',
    'invoices': 'Invoices',
    'invoice-detail': 'Invoice Detail',
    'payment-receipts': 'Payment Receipts',
    'aging-analysis': 'Aging Analysis',
    'routes': 'Routes',
    'route-detail': 'Route Detail',
    'inspections': 'Inspections',
    'inspection-detail': 'Inspection Detail',
    'issues': 'Issues',
    'reminders': 'Reminders',
    'service-history': 'Service History',
    'work-orders': 'Work Orders',
    'work-order-new': 'Work Order #371',
    'work-order-create': 'New Work Order',
    'service-tasks': 'Service Tasks',
    'service-programs': 'Service Programs',
    'shop-directory': 'Shop Directory',
    'vendors': 'Vendors',
    'parts-list': 'Parts List',
    'part-detail': 'Part Detail',
    'purchase-orders': 'Purchase Orders',
    'fuel-history': 'Fuel History',
    'charging-history': 'Charging History',
    'places': 'Places',
    'documents': 'Documents',
    'reports': 'Reports',
    'report-detail': 'Operating Cost Summary',
    'settings': 'Settings',
    'user-management': 'User Management',
    'chart-of-accounts': 'Chart of Accounts',
    'voucher-entry': 'Voucher Entry',
    'day-book': 'Day Book',
    'profit-loss': 'Profit & Loss',
    'balance-sheet': 'Balance Sheet',
    'cash-flow': 'Cash Flow',
    'trip-profitability': 'Trip Profitability',
    'trip-alerts': 'Trip Alerts',
    'branches': 'Branch Management',
    'partners': 'Franchise & Partners',
    'subcontractors': 'Subcontractors & Brokers',
    'vehicle-types': 'Vehicle Type Management',
    'warehouse-loading': 'Warehouse Loading',
    'inventory-intelligence': 'Inventory Intelligence',
    'workshop-forecast': 'Workshop Forecast',
    'vendor-capital': 'Vendor Capital',
    'work-order-board': 'Work Order Board',
    'alert-command': 'Alert Command Center',
    'account-ledger': 'Account Ledger'
  };

  // Track history — avoid duplicating the same page consecutively
  var prevPage = pageHistory.length > 0 ? pageHistory[pageHistory.length - 1] : null;
  if (prevPage && prevPage !== page) {
    // keep history stack manageable
    if (pageHistory.length > 20) pageHistory.shift();
  }
  if (prevPage !== page && prevPage !== null) {
    // prevPage is already on the stack — good
  }

  // Show back link if there's a previous page
  if (prevPage && prevPage !== page) {
    var prevLabel = labels[prevPage] || prevPage;
    breadcrumb.innerHTML = '<a href="#" onclick="goBack();return false;" style="color:var(--primary,#2563eb);text-decoration:none;font-weight:500;display:inline-flex;align-items:center;gap:4px;"><i class="fas fa-arrow-left" style="font-size:11px;"></i> Back to ' + prevLabel + '</a>';
  } else {
    // No history (landing page) — show current page name
    var currentLabel = labels[page] || page;
    breadcrumb.innerHTML = '<span style="color:var(--text-secondary,#6b7280);">' + currentLabel + '</span>';
  }

  // Push current page onto history
  if (prevPage !== page) {
    pageHistory.push(page);
  }


}

function goBack() {
  if (pageHistory.length > 1) {
    pageHistory.pop(); // remove current
    var prev = pageHistory.pop(); // get previous (will be re-pushed by navigateTo)
    navigateTo(prev);
  }
}
window.goBack = goBack;

/* =========================
   Modal
   ========================= */
function initModals() {
  document.querySelectorAll('[data-modal]').forEach(function (trigger) {
    trigger.addEventListener('click', function () {
      var modalId = this.getAttribute('data-modal');
      openModal(modalId);
    });
  });

  document.querySelectorAll('.modal-overlay').forEach(function (overlay) {
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) {
        closeModal(overlay.id);
      }
    });
  });

  document.querySelectorAll('.close-btn, [data-close-modal]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var overlay = this.closest('.modal-overlay');
      if (overlay) overlay.classList.remove('active');
    });
  });
}

function openModal(id) {
  var modal = document.getElementById(id);
  if (!modal) return;
  // Convert modal-overlay to slider presentation
  modal.style.display = 'block';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.15);z-index:99997;animation:sliderBackdropIn 0.2s ease-out forwards;';
  modal.classList.add('active');
  var content = modal.querySelector('.modal, .modal-content');
  if (content) {
    content.style.cssText = 'position:fixed;top:0;right:0;bottom:0;width:520px;max-width:92vw;background:#fff;z-index:99998;display:flex;flex-direction:column;box-shadow:-4px 0 20px rgba(0,0,0,0.1);animation:sliderPanelIn 0.2s ease-out;border-radius:0;max-height:100vh;overflow-y:auto;';
  }
}

function closeModal(id) {
  var modal = document.getElementById(id);
  if (!modal) return;
  modal.classList.remove('active');
  modal.style.display = 'none';
  var content = modal.querySelector('.modal, .modal-content');
  if (content) content.style.cssText = '';
}

/* =========================
   Tabs
   ========================= */
function initTabs() {
  document.querySelectorAll('.tabs').forEach(function (tabGroup) {
    tabGroup.querySelectorAll('.tab').forEach(function (tab) {
      tab.addEventListener('click', function () {
        // Remove active from siblings
        tabGroup.querySelectorAll('.tab').forEach(function (t) {
          t.classList.remove('active');
        });
        this.classList.add('active');

        // Show tab content if data-tab is specified
        var targetTab = this.getAttribute('data-tab');
        if (targetTab) {
          var container = tabGroup.closest('.card, .detail-section, .widget, .page-section');
          if (container) {
            container.querySelectorAll('.tab-content').forEach(function (tc) {
              tc.style.display = 'none';
            });
            var target = container.querySelector('#' + targetTab);
            if (target) target.style.display = 'block';
          }
        }
      });
    });
  });
}

/* =========================
   Status Tabs
   ========================= */
function initStatusTabs() {
  document.querySelectorAll('.status-tabs').forEach(function (tabGroup) {
    tabGroup.querySelectorAll('.status-tab').forEach(function (tab) {
      tab.addEventListener('click', function () {
        tabGroup.querySelectorAll('.status-tab').forEach(function (t) {
          t.classList.remove('active');
        });
        this.classList.add('active');
      });
    });
  });
}

/* =========================
   Toast Notification System
   ========================= */
function showToast(message, type) {
  type = type || 'success';
  var container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.style.cssText = 'position:fixed;top:20px;right:20px;z-index:99999;display:flex;flex-direction:column;gap:8px;pointer-events:none;';
    document.body.appendChild(container);
  }
  var icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', info: 'fa-info-circle', warning: 'fa-exclamation-triangle' };
  var colors = { success: '#16a34a', error: '#dc2626', info: '#2563eb', warning: '#f59e0b' };
  var toast = document.createElement('div');
  toast.style.cssText = 'pointer-events:auto;display:flex;align-items:center;gap:10px;padding:12px 20px;background:#fff;border-radius:10px;box-shadow:0 4px 24px rgba(0,0,0,0.12);border-left:4px solid ' + colors[type] + ';font-size:13px;font-weight:500;color:#1e293b;min-width:280px;animation:slideInRight 0.3s ease;opacity:1;transition:opacity 0.3s ease,transform 0.3s ease;';
  toast.innerHTML = '<i class="fas ' + icons[type] + '" style="color:' + colors[type] + ';font-size:16px;"></i><span>' + message + '</span>';
  container.appendChild(toast);
  setTimeout(function () {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(30px)';
    setTimeout(function () { toast.remove(); }, 300);
  }, 2800);
}


/* =========================
   Auto-Wire Dead Buttons
   ========================= */
function detectEntityFromPage(btn) {
  var page = btn.closest('.page-section');
  var pageId = page ? page.id : '';
  var map = {
    'vehicle': 'vehicle', 'contact': 'contact', 'client': 'invoice', 'vendor': 'vendor',
    'part': 'part', 'invoice': 'invoice', 'issue': 'issue', 'fuel': 'fuel',
    'reminder': 'reminder', 'inspection': 'inspection', 'route': 'route',
    'place': 'place', 'equipment': 'equipment', 'work-order': 'issue',
    'purchase': 'purchaseorder', 'document': 'document', 'expense': 'expense',
    'driver-ledger': 'transaction', 'meter': 'meter', 'charging': 'charging',
    'service-task': 'servicetask', 'service-program': 'serviceprogram',
    'compliance': 'compliance',
    'assignment': 'assignment', 'shop': 'shop', 'subcontractor': 'vendor',
    'partner': 'vendor', 'branch': 'place'
  };
  for (var key in map) { if (pageId.indexOf(key) >= 0) return map[key]; }
  // Detect from button text
  var t = btn.textContent.trim().toLowerCase();
  if (t.includes('vehicle')) return 'vehicle';
  if (t.includes('contact') || t.includes('driver')) return 'contact';
  if (t.includes('vendor')) return 'vendor';
  if (t.includes('part')) return 'part';
  if (t.includes('invoice')) return 'invoice';
  if (t.includes('issue')) return 'issue';
  if (t.includes('fuel')) return 'fuel';
  if (t.includes('reminder')) return 'reminder';
  if (t.includes('inspection')) return 'inspection';
  if (t.includes('route')) return 'route';
  if (t.includes('expense')) return 'expense';
  if (t.includes('meter')) return 'meter';
  if (t.includes('document') || t.includes('upload')) return 'document';
  if (t.includes('assignment')) return 'assignment';
  if (t.includes('training') || t.includes('license') || t.includes('review') || t.includes('entry') || t.includes('certification')) return 'contact';
  if (t.includes('work order')) return 'issue';
  if (t.includes('service task')) return 'servicetask';
  if (t.includes('program')) return 'serviceprogram';
  if (t.includes('shop')) return 'shop';
  if (t.includes('equipment')) return 'equipment';
  if (t.includes('place')) return 'place';
  if (t.includes('purchase order')) return 'purchaseorder';
  if (t.includes('charging')) return 'charging';
  return null;
}

function initGlobalActions() {
  // Wire up all buttons that have no onclick and no data-modal
  document.querySelectorAll('.btn.btn-primary, .btn.btn-secondary, .btn.btn-link, .btn-icon').forEach(function (btn) {
    if (btn.onclick || btn.getAttribute('data-modal') || btn.getAttribute('data-close-modal') !== null || btn.getAttribute('data-action-wired')) return;

    var text = btn.textContent.trim().toLowerCase();
    var rawText = btn.textContent.trim();

    // Export buttons → real CSV download
    if (text.includes('export')) {
      btn.setAttribute('data-action-wired', '1');
      btn.addEventListener('click', function () { handleExport('Report'); });
      return;
    }
    // Print buttons → actual print
    if (text.includes('print')) {
      btn.setAttribute('data-action-wired', '1');
      btn.addEventListener('click', function () { handlePrint(); });
      return;
    }
    // Save buttons
    if (text.includes('save') && !text.includes('save and')) {
      btn.setAttribute('data-action-wired', '1');
      btn.addEventListener('click', function () { handleSave(); });
      return;
    }
    // Approve buttons → visual state change
    if (text.includes('approve')) {
      btn.setAttribute('data-action-wired', '1');
      btn.addEventListener('click', function () {
        this.innerHTML = '<i class="fas fa-check-circle"></i> Approved';
        this.classList.remove('btn-primary'); this.classList.add('btn-secondary');
        this.style.color = '#16a34a'; this.style.borderColor = '#16a34a';
        this.style.pointerEvents = 'none';
        showToast('Approved successfully!', 'success');
      });
      return;
    }
    // Assign buttons → visual state change
    if (text.includes('assign') && !text.includes('unassign')) {
      btn.setAttribute('data-action-wired', '1');
      btn.addEventListener('click', function () {
        this.innerHTML = '<i class="fas fa-check"></i> Assigned';
        this.style.pointerEvents = 'none'; this.style.opacity = '0.7';
        showToast('Assignment updated!', 'success');
      });
      return;
    }
    // Settle/Acknowledge buttons → visual state change
    if (text.includes('settle') || text.includes('acknowledge')) {
      btn.setAttribute('data-action-wired', '1');
      btn.addEventListener('click', function () {
        this.innerHTML = '<i class="fas fa-check"></i> Done';
        this.style.pointerEvents = 'none'; this.style.opacity = '0.7';
        showToast(rawText + ' completed', 'success');
      });
      return;
    }
    // Unwatch toggle
    if (text.includes('unwatch') || text.includes('watch')) {
      btn.setAttribute('data-action-wired', '1');
      btn.addEventListener('click', function () {
        var isWatching = this.textContent.trim().includes('Unwatch');
        this.innerHTML = isWatching ? '<i class="fas fa-eye"></i> Watch' : '<i class="fas fa-eye-slash"></i> Unwatch';
        showToast(isWatching ? 'Stopped watching' : 'Now watching this item', 'info');
      });
      return;
    }
    // Ellipsis (⋮ / …) buttons → show context dropdown menu
    if (text === '' && btn.querySelector('.fa-ellipsis-h, .fa-ellipsis-v')) {
      btn.setAttribute('data-action-wired', '1');
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var entity = detectEntityFromPage(this);
        var items = [
          { icon: 'fa-edit', label: 'Edit', action: "openEntityModal('" + (entity || 'contact') + "')" },
          { icon: 'fa-copy', label: 'Duplicate', action: "showToast('Duplicate created — ID: #' + Math.floor(Math.random()*9000+1000),'success')" },
          { icon: 'fa-share-alt', label: 'Copy Link', action: "navigator.clipboard.writeText(window.location.href);showToast('Link copied to clipboard','success')" },
          { divider: true },
          { icon: 'fa-history', label: 'View Activity Log', action: "navigateTo('reports')" },
          { icon: 'fa-file-export', label: 'Export as PDF', action: "handleExport('Record')" },
          { divider: true },
          { icon: 'fa-archive', label: 'Archive', action: "showConfirmDialog('Archive Item','This item will be moved to the archive. You can restore it later.', \"showToast('Archived successfully','success')\")" },
          { icon: 'fa-trash-alt', label: 'Delete', action: "showConfirmDialog('Delete Item','This action cannot be undone. All associated data will be permanently removed.', \"showToast('Deleted successfully','success')\")", danger: true }
        ];
        showDropdown(this, items);
      });
      return;
    }
    // "Add ▾" dropdown buttons
    if (text === 'add ▾') {
      btn.setAttribute('data-action-wired', '1');
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var items = [
          { icon: 'fa-gas-pump', label: 'Fuel Entry', action: "openEntityModal('fuel')" },
          { icon: 'fa-receipt', label: 'Expense', action: "openEntityModal('expense')" },
          { icon: 'fa-wrench', label: 'Work Order', action: "navigateTo('work-order-create')" },
          { icon: 'fa-clipboard-check', label: 'Inspection', action: "openEntityModal('inspection')" },
          { icon: 'fa-exclamation-triangle', label: 'Issue', action: "openEntityModal('issue')" },
          { divider: true },
          { icon: 'fa-tachometer-alt', label: 'Meter Entry', action: "openEntityModal('meter')" },
          { icon: 'fa-file-upload', label: 'Document', action: "openEntityModal('document')" },
          { icon: 'fa-link', label: 'Assignment', action: "openEntityModal('assignment')" }
        ];
        showDropdown(this, items);
      });
      return;
    }
    // Adjust Stock → open part modal
    if (text.includes('adjust stock')) {
      btn.setAttribute('data-action-wired', '1');
      btn.addEventListener('click', function () { openEntityModal('part'); });
      return;
    }
    // Day Book button
    if (text.includes('day book')) {
      btn.setAttribute('data-action-wired', '1');
      btn.addEventListener('click', function () { navigateTo('day-book'); });
      return;
    }
    // Add Invoice
    if (text.includes('add invoice')) {
      btn.setAttribute('data-action-wired', '1');
      btn.addEventListener('click', function () { openEntityModal('invoice'); });
      return;
    }
    // Edit buttons → open contextual edit modal pre-filled
    if (text === 'edit' || text.includes('edit label')) {
      btn.setAttribute('data-action-wired', '1');
      btn.addEventListener('click', function () {
        var entity = detectEntityFromPage(this);
        if (entity && entitySchemas[entity]) {
          openEntityModal(entity);
        } else {
          showEditOverlay();
        }
      });
      return;
    }
    // Message buttons → open a compose form
    if (text.includes('message')) {
      btn.setAttribute('data-action-wired', '1');
      btn.addEventListener('click', function () {
        openEntityModal('contact');
      });
      return;
    }
    // New/Add/Create buttons → detect entity and open correct modal
    if (text.includes('add ') || text.includes('new ') || text.includes('create ') || text.match(/^\+\s/)) {
      btn.setAttribute('data-action-wired', '1');
      btn.addEventListener('click', function () {
        var entity = detectEntityFromPage(this);
        if (entity && entitySchemas[entity]) {
          openEntityModal(entity);
        } else {
          // Fallback: use button text to detect
          var t = this.textContent.trim().toLowerCase();
          if (t.includes('vehicle')) openEntityModal('vehicle');
          else if (t.includes('contact') || t.includes('driver')) openEntityModal('contact');
          else if (t.includes('vendor')) openEntityModal('vendor');
          else if (t.includes('part')) openEntityModal('part');
          else if (t.includes('route')) openEntityModal('route');
          else if (t.includes('place')) openEntityModal('place');
          else openEntityModal('issue'); // sensible default
        }
      });
      return;
    }
    // Compact / Manage Widgets / misc
    if (text.includes('compact') || text.includes('manage widget')) {
      btn.setAttribute('data-action-wired', '1');
      btn.addEventListener('click', function () { showToast('Layout updated', 'info'); });
      return;
    }
    // Track Live / History / Investigate
    if (text.includes('track live') || text.includes('investigate') || text.includes('inspection form') || text.includes('bulk manage')) {
      btn.setAttribute('data-action-wired', '1');
      btn.addEventListener('click', function () {
        showToast(this.textContent.trim() + ' — available in pro version', 'info');
      });
      return;
    }
    // Link buttons (btn-link with + icon)
    if (btn.classList.contains('btn-link') || btn.classList.contains('btn-icon')) {
      if (text.match(/^\+/) || btn.querySelector('.fa-plus')) {
        btn.setAttribute('data-action-wired', '1');
        btn.addEventListener('click', function () {
          var entity = detectEntityFromPage(this);
          if (entity && entitySchemas[entity]) {
            openEntityModal(entity);
          }
        });
        return;
      }
    }
    // Call / Phone buttons → visual state change
    if (text === 'call' || text === 'call now') {
      btn.setAttribute('data-action-wired', '1');
      btn.addEventListener('click', function () {
        this.innerHTML = '<i class="fas fa-phone-alt"></i> Calling...';
        this.style.pointerEvents = 'none'; this.style.opacity = '0.7';
        var self = this;
        setTimeout(function () { self.innerHTML = '✓ Called'; showToast('Call logged successfully', 'success'); }, 1500);
      });
      return;
    }
    // Remind button
    if (text === 'remind' || text === 'send reminder') {
      btn.setAttribute('data-action-wired', '1');
      btn.addEventListener('click', function () {
        this.innerHTML = '✓ Sent';
        this.style.pointerEvents = 'none'; this.style.opacity = '0.7';
        showToast('Payment reminder sent via email & SMS', 'success');
      });
      return;
    }
    // Check / Verify button
    if (text === 'check' || text === 'verify') {
      btn.setAttribute('data-action-wired', '1');
      btn.addEventListener('click', function () {
        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        var self = this;
        setTimeout(function () { self.innerHTML = '✓ Verified'; self.style.color = '#16a34a'; self.style.pointerEvents = 'none'; showToast('Status verified', 'success'); }, 1000);
      });
      return;
    }
    // Apply / Accept buttons
    if (text === 'apply' || text === 'accept') {
      btn.setAttribute('data-action-wired', '1');
      btn.addEventListener('click', function () {
        this.innerHTML = '✓ Applied';
        this.style.pointerEvents = 'none'; this.style.opacity = '0.7';
        showToast('Applied successfully', 'success');
      });
      return;
    }
    // Review button
    if (text === 'review') {
      btn.setAttribute('data-action-wired', '1');
      btn.addEventListener('click', function () {
        var entity = detectEntityFromPage(this);
        if (entity && entitySchemas[entity]) openEntityModal(entity);
        else navigateTo('reports');
      });
      return;
    }
    // Pickup / Dispatch buttons
    if (text === 'pickup' || text.includes('dispatch') || text.includes('start trip')) {
      btn.setAttribute('data-action-wired', '1');
      btn.addEventListener('click', function () {
        this.innerHTML = '<i class="fas fa-check"></i> Done';
        this.style.pointerEvents = 'none'; this.style.opacity = '0.7';
        showToast(rawText + ' confirmed', 'success');
      });
      return;
    }
    // Reject button
    if (text === 'reject' || text === 'decline') {
      btn.setAttribute('data-action-wired', '1');
      btn.addEventListener('click', function () {
        var self = this;
        showConfirmDialog('Reject Item', 'Are you sure you want to reject this? This action will notify the requester.', "document.querySelector('[data-rejecting]').innerHTML='✗ Rejected';document.querySelector('[data-rejecting]').style.pointerEvents='none';document.querySelector('[data-rejecting]').style.color='#dc2626';document.querySelector('[data-rejecting]').removeAttribute('data-rejecting');showToast('Rejected','warning')");
        this.setAttribute('data-rejecting', '1');
      });
      return;
    }
    // Resolve / Close buttons
    if (text === 'resolve' || text === 'close' || text === 'close issue') {
      btn.setAttribute('data-action-wired', '1');
      btn.addEventListener('click', function () {
        this.innerHTML = '✓ Resolved';
        this.style.pointerEvents = 'none'; this.style.color = '#16a34a';
        showToast('Resolved successfully', 'success');
      });
      return;
    }
    // Start / Complete / Finish buttons
    if (text === 'start' || text === 'complete' || text === 'finish' || text === 'mark complete') {
      btn.setAttribute('data-action-wired', '1');
      btn.addEventListener('click', function () {
        this.innerHTML = '<i class="fas fa-check-circle"></i> ' + (text === 'start' ? 'Started' : 'Completed');
        this.style.pointerEvents = 'none'; this.style.color = '#16a34a';
        showToast(rawText + ' — updated', 'success');
      });
      return;
    }
    // Generate / Download buttons
    if (text.includes('generate') || text.includes('download')) {
      btn.setAttribute('data-action-wired', '1');
      btn.addEventListener('click', function () { handleExport(rawText); });
      return;
    }
    // Post Comment button
    if (text.includes('post comment') || text.includes('add comment')) {
      btn.setAttribute('data-action-wired', '1');
      btn.addEventListener('click', function () {
        showToast('Comment posted', 'success');
      });
      return;
    }
    // Attach / Upload button
    if (text.includes('attach') || text.includes('upload')) {
      btn.setAttribute('data-action-wired', '1');
      btn.addEventListener('click', function () {
        var fi = document.createElement('input'); fi.type = 'file';
        fi.onchange = function () { showToast('File attached: ' + fi.files[0].name, 'success'); };
        fi.click();
      });
      return;
    }
    // Share button
    if (text.includes('share')) {
      btn.setAttribute('data-action-wired', '1');
      btn.addEventListener('click', function () {
        navigator.clipboard.writeText(window.location.href);
        showToast('Link copied to clipboard', 'success');
      });
      return;
    }
    // Mark all read
    if (text.includes('mark all read') || text.includes('mark all')) {
      btn.setAttribute('data-action-wired', '1');
      btn.addEventListener('click', function () {
        this.innerHTML = '✓ Done';
        this.style.pointerEvents = 'none';
        showToast('All marked as read', 'success');
      });
      return;
    }
    // Submit / Send buttons
    if (text === 'submit' || text === 'send' || text.includes('submit')) {
      btn.setAttribute('data-action-wired', '1');
      btn.addEventListener('click', function () {
        this.innerHTML = '<i class="fas fa-check"></i> Submitted';
        this.style.pointerEvents = 'none'; this.style.opacity = '0.7';
        showToast('Submitted successfully', 'success');
      });
      return;
    }
    // Cancel buttons (not on modals)
    if (text === 'cancel') {
      btn.setAttribute('data-action-wired', '1');
      btn.addEventListener('click', function () {
        showToast('Action cancelled', 'info');
      });
      return;
    }
    // Contact button
    if (text === 'contact') {
      btn.setAttribute('data-action-wired', '1');
      btn.addEventListener('click', function () { openEntityModal('contact'); });
      return;
    }
    // Schedule button
    if (text === 'schedule' || text.includes('schedule')) {
      btn.setAttribute('data-action-wired', '1');
      btn.addEventListener('click', function () { openEntityModal('inspection'); });
      return;
    }
    // Mark / Flag buttons
    if (text.includes('mark') || text.includes('flag')) {
      btn.setAttribute('data-action-wired', '1');
      btn.addEventListener('click', function () {
        this.innerHTML = '✓ Marked';
        this.style.pointerEvents = 'none'; this.style.opacity = '0.7';
        showToast('Marked successfully', 'success');
      });
      return;
    }
    // Generic fallback — smart button (visual state change, not a lazy toast)
    if (!btn.getAttribute('data-action-wired')) {
      btn.setAttribute('data-action-wired', '1');
      btn.addEventListener('click', function () {
        var t = this.textContent.trim();
        if (t && t.length < 30 && t.length > 0) {
          this.style.opacity = '0.6';
          this.style.pointerEvents = 'none';
          var origHTML = this.innerHTML;
          this.innerHTML = '<i class="fas fa-check" style="margin-right:4px;"></i>' + t;
          showToast(t + ' completed', 'success');
          var self = this;
          setTimeout(function () { self.innerHTML = origHTML; self.style.opacity = '1'; self.style.pointerEvents = 'auto'; }, 3000);
        }
      });
    }
  });

  // Wire dead links — href="#" without onclick
  document.querySelectorAll('a[href="#"]').forEach(function (link) {
    if (link.onclick || link.getAttribute('data-link-wired')) return;
    link.setAttribute('data-link-wired', '1');
    var text = link.textContent.trim();

    // Trip IDs
    if (text.match(/^TRP-/)) {
      link.addEventListener('click', function (e) { e.preventDefault(); navigateTo('trip-detail'); });
      return;
    }
    // Vehicle plates (format: XX-##-XX-####)
    if (text.match(/^[A-Z]{2}-\d{2}-[A-Z]{2,3}-\d{3,4}$/)) {
      link.addEventListener('click', function (e) { e.preventDefault(); navigateTo('vehicle-detail'); });
      return;
    }
    // Work Order IDs
    if (text.match(/^#\d+$/) || text.match(/^WO-/)) {
      link.addEventListener('click', function (e) { e.preventDefault(); navigateTo('work-order-new'); });
      return;
    }
    // Invoice IDs
    if (text.match(/^INV-/)) {
      link.addEventListener('click', function (e) { e.preventDefault(); navigateTo('invoice-detail'); });
      return;
    }
    // Voucher IDs
    if (text.match(/^PMT-|^RCT-|^SLS-|^JRN-|^PUR-|^CNT-/)) {
      link.addEventListener('click', function (e) { e.preventDefault(); navigateTo('voucher-entry'); });
      return;
    }
    // Known client names 
    var knownClients = ['Reliance Industries', 'Tata Steel', 'Hindustan Unilever', 'ITC Limited', 'Adani Ports', 'Mahindra Logistics', 'Asian Paints', 'Bharat Petroleum', 'BlueDart Express', 'Godrej Consumer', 'Larsen & Toubro', 'GAIL India', 'Sun Pharma'];
    if (knownClients.indexOf(text) >= 0) {
      link.addEventListener('click', function (e) { e.preventDefault(); navigateTo('client-detail'); });
      return;
    }
    // Known contact/driver names
    var contactNames = ['Rajesh Kumar', 'Anita Verma', 'Vikram Singh', 'Deepak Patel', 'Meera Joshi', 'Kiran Nair', 'Priya Sharma', 'Lakshmi Iyer', 'Amit Mehta', 'Rahul Banerjee', 'Tarun Mishra', 'Govind Thakur', 'Ravi Shankar', 'Suresh Patel', 'Chandan Das', 'Suresh Menon', 'Carlos Garcia'];
    if (contactNames.indexOf(text) >= 0) {
      link.addEventListener('click', function (e) { e.preventDefault(); navigateTo('contact-detail'); });
      return;
    }
    // Route names (X → Y pattern)
    if (text.includes('→')) {
      link.addEventListener('click', function (e) { e.preventDefault(); navigateTo('route-detail'); });
      return;
    }
    // "View All" links → navigate to list page
    if (text === 'View All' || text === 'View all') {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        var section = this.closest('.section-header');
        if (section) {
          var heading = section.querySelector('h3');
          if (heading) {
            var h = heading.textContent.trim().toLowerCase();
            if (h.includes('invoice')) navigateTo('invoices');
            else if (h.includes('trip')) navigateTo('trips');
            else if (h.includes('work order')) navigateTo('work-orders');
            else if (h.includes('issue')) navigateTo('issues');
            else if (h.includes('inspection')) navigateTo('inspections');
            else if (h.includes('fuel')) navigateTo('fuel-history');
            else if (h.includes('reminder')) navigateTo('reminders');
            else if (h.includes('service')) navigateTo('service-history');
            else navigateTo('reports');
          }
        }
      });
      return;
    }
    // Add / + links → detect entity and open modal
    if (text.match(/^\+ /) || text.match(/^Add /)) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        var entity = detectEntityFromPage(this);
        // Also check text
        var t = this.textContent.trim().toLowerCase();
        if (t.includes('issue')) entity = 'issue';
        else if (t.includes('service reminder') || t.includes('reminder')) entity = 'reminder';
        else if (t.includes('work order')) entity = 'issue';
        else if (t.includes('fuel')) entity = 'fuel';
        else if (t.includes('license')) entity = 'contact';
        else if (t.includes('training')) entity = 'contact';
        else if (t.includes('review')) entity = 'contact';
        else if (t.includes('entry')) entity = 'transaction';
        if (entity && entitySchemas[entity]) openEntityModal(entity);
      });
      return;
    }
    // Link Asset, Service Reminder links
    if (text.includes('Link Asset')) {
      link.addEventListener('click', function (e) { e.preventDefault(); openEntityModal('equipment'); });
      return;
    }
    if (text.includes('Service Reminders') || text.includes('Customize')) {
      link.addEventListener('click', function (e) { e.preventDefault(); navigateTo('reminders'); });
      return;
    }
    // History links
    if (text === 'History' || text === 'All Fields' || text === 'Decode Chassis') {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        showToast(text + ' panel opened', 'info');
      });
      return;
    }
    // Generic fallback — no more lazy toast
    link.addEventListener('click', function (e) {
      e.preventDefault();
      // Try to navigate intelligently
      var t = this.textContent.trim();
      if (t.length > 0 && t.length < 60) {
        var entity = detectEntityFromPage(this);
        if (entity && entitySchemas[entity]) {
          openEntityModal(entity);
        }
      }
    });
  });

  // Wire filter buttons (div.filter-btn) → show filter dropdown
  // Skip .trip-filter buttons — they are handled by initTripFilters()
  document.querySelectorAll('.filter-btn').forEach(function (fb) {
    if (fb.classList.contains('trip-filter')) return;
    if (fb.onclick || fb.getAttribute('data-filter-wired')) return;
    fb.setAttribute('data-filter-wired', '1');
    fb.style.cursor = 'pointer';
    fb.addEventListener('click', function (e) {
      e.stopPropagation();
      var text = this.textContent.trim().replace(' ▾', '');
      var options = [];
      if (text.includes('Status')) options = ['All', 'Active', 'Inactive', 'Pending', 'Suspended'];
      else if (text.includes('Group')) options = ['All Groups', 'Mumbai', 'Pune', 'Delhi', 'Maharashtra'];
      else if (text.includes('Role')) options = ['All Roles', 'Operator', 'Mechanic', 'Manager', 'Admin', 'Sales'];
      else if (text.includes('Industry')) options = ['All Industries', 'Manufacturing', 'Logistics', 'FMCG', 'Pharma', 'Oil & Gas'];
      else if (text.includes('Type')) options = ['All Types', 'Truck', 'Van', 'Car', 'Trailer', 'EV'];
      else if (text.includes('Priority')) options = ['All', 'Critical', 'High', 'Medium', 'Low'];
      else if (text.includes('Category')) options = ['All', 'Tires', 'Engine', 'Electrical', 'Body', 'Filters', 'Fluids'];
      else if (text.includes('Store') || text.includes('Warehouse')) options = ['All Stores', 'Main Store', 'Mumbai Depot', 'Pune Depot', 'Delhi Depot'];
      else options = ['All', 'Today', 'This Week', 'This Month', 'This Quarter', 'This Year', 'Custom Range'];
      var items = options.map(function (opt) {
        return { icon: 'fa-check', label: opt, action: "showToast('Filter: " + opt + "','info')" };
      });
      showDropdown(this, items);
    });
  });

  // Wire clickable stat cards without onclick
  document.querySelectorAll('.stat-card').forEach(function (card) {
    if (card.onclick || card.getAttribute('data-card-wired')) return;
    card.setAttribute('data-card-wired', '1');
    card.style.cursor = 'pointer';
    card.addEventListener('click', function () {
      navigateTo('reports');
    });
  });

  // Wire document file links (links with file icons that go nowhere)
  document.querySelectorAll('a[href="#"] .fa-file-pdf, a[href="#"] .fa-file-image, a[href="#"] .fa-file-excel').forEach(function (icon) {
    var link = icon.closest('a');
    if (link && !link.getAttribute('data-link-wired')) {
      link.setAttribute('data-link-wired', '1');
      link.addEventListener('click', function (e) {
        e.preventDefault();
        showToast('Document preview: ' + this.textContent.trim(), 'info');
      });
    }
  });
}

/* =========================
   Entity Field Schemas
   ========================= */
var entitySchemas = {
  vehicle: {
    title: 'Add Vehicle', icon: 'fa-truck', fields: [
      { l: 'License Plate *', t: 'text', p: 'e.g. MH04XX1234' }, { l: 'Year', t: 'text', p: 'e.g. 2023' },
      { l: 'Make *', t: 'select', o: ['Tata', 'Mahindra', 'Ashok Leyland', 'BharatBenz', 'Eicher', 'Force'] },
      { l: 'Model', t: 'text', p: 'e.g. Ace Gold' }, { l: 'Chassis No.', t: 'text', p: 'Enter chassis number...' },
      { l: 'Type', t: 'select', o: ['Truck', 'Pickup', 'Van', 'Car', 'EV'] },
      { l: 'Fuel Type', t: 'select', o: ['Diesel', 'Petrol', 'CNG', 'Electric', 'Hybrid'] },
      { l: 'Group', t: 'select', o: ['Mumbai', 'Pune', 'Delhi', 'Maharashtra'] },
      { l: 'Operator', t: 'select', o: ['Unassigned', 'Rajesh Kumar', 'Anita Verma', 'Vikram Singh'] },
      { l: 'Registration State', t: 'text', p: 'e.g. Maharashtra' }, { l: 'Color', t: 'text', p: 'e.g. Silver' },
      { l: 'Ownership', t: 'select', o: ['Owned', 'Leased', 'Rented'] }
    ]
  },
  contact: {
    title: 'Add Contact', icon: 'fa-user-plus', fields: [
      { l: 'Full Name *', t: 'text', p: 'e.g. Rajesh Kumar' }, { l: 'Email', t: 'text', p: 'email@company.com' },
      { l: 'Phone *', t: 'text', p: '+91 98200-XXXXX' }, { l: 'Mobile', t: 'text', p: '+91 98200-XXXXX' },
      { l: 'Role', t: 'select', o: ['Operator', 'Mechanic', 'Manager', 'Admin', 'Sales'] },
      { l: 'Group', t: 'select', o: ['Mumbai', 'Pune', 'Delhi', 'Maharashtra'] },
      { l: 'Employee ID', t: 'text', p: 'e.g. EMP-1042' },
      { l: 'License Number', t: 'text', p: 'e.g. DL-876543' },
      { l: 'License Class', t: 'select', o: ['HMV (Heavy Motor Vehicle)', 'LMV', 'Transport'] },
      { l: 'Emergency Contact', t: 'text', p: 'Name · Phone' }
    ]
  },
  vendor: {
    title: 'Add Vendor', icon: 'fa-store', fields: [
      { l: 'Vendor Name *', t: 'text', p: 'e.g. Apollo Tyres Service' }, { l: 'Category', t: 'select', o: ['Tires', 'Engine', 'Electrical', 'Body Work', 'General Service', 'Fuel', 'Parts'] },
      { l: 'Contact Person', t: 'text', p: 'Name' }, { l: 'Phone *', t: 'text', p: '+91...' },
      { l: 'Email', t: 'text', p: 'vendor@example.com' }, { l: 'GSTIN', t: 'text', p: 'e.g. 27AAACR5055K1ZK' },
      { l: 'Address', t: 'textarea', p: 'Full address...' }, { l: 'Payment Terms', t: 'select', o: ['Immediate', 'Net 15', 'Net 30', 'Net 45', 'Net 60'] }
    ]
  },
  part: {
    title: 'Add Part', icon: 'fa-cog', fields: [
      { l: 'Part Name *', t: 'text', p: 'e.g. MRF Steel Muscle 10R20' }, { l: 'Part Number *', t: 'text', p: 'e.g. MRF-SM-10R20' },
      { l: 'Manufacturer', t: 'text', p: 'e.g. MRF' }, { l: 'Category', t: 'select', o: ['Tires', 'Brakes', 'Engine', 'Electrical', 'Filters', 'Fluids', 'Suspension', 'Body', 'Other'] },
      { l: 'Unit Cost (₹)', t: 'text', p: 'e.g. 15768' }, { l: 'In Stock', t: 'text', p: 'e.g. 12' },
      { l: 'Min Quantity', t: 'text', p: 'e.g. 4' }, { l: 'Location', t: 'text', p: 'e.g. Main Warehouse, Bay A-3' },
      { l: 'Preferred Vendor', t: 'select', o: ['Tire Kingdom', 'Apollo Service', 'TVS Auto', 'Castrol Express'] }
    ]
  },
  invoice: {
    title: 'Add Invoice', icon: 'fa-file-invoice', fields: [
      { l: 'Client *', t: 'select', o: ['Reliance Industries', 'Tata Steel', 'Hindustan Unilever', 'ITC Limited', 'Adani Ports', 'Mahindra Logistics'] },
      { l: 'Invoice Date', t: 'date' }, { l: 'Due Date', t: 'date' },
      { l: 'Trip References', t: 'text', p: 'e.g. TRP-0142, TRP-0141' },
      { l: 'Amount (₹) *', t: 'text', p: 'e.g. 284500' },
      { l: 'GST Rate', t: 'select', o: ['5%', '12%', '18%', '28%'] },
      { l: 'Notes', t: 'textarea', p: 'Invoice notes...' }
    ]
  },
  issue: {
    title: 'Add Issue', icon: 'fa-exclamation-triangle', fields: [
      { l: 'Title *', t: 'text', p: 'e.g. Oil leak from oil pan' },
      { l: 'Vehicle *', t: 'select', o: ['MH04AB1234', 'MH04CD5678', 'MH12EF9012', 'MH12GH3456', 'DL01IJ7890'] },
      { l: 'Priority', t: 'select', o: ['Low', 'Medium', 'High', 'Critical'] },
      { l: 'Assigned To', t: 'select', o: ['Unassigned', 'Rajesh Kumar', 'Amit Mehta', 'Chandan Das'] },
      { l: 'Due Date', t: 'date' }, { l: 'Description', t: 'textarea', p: 'Describe the issue in detail...' }
    ]
  },
  expense: {
    title: 'New Expense', icon: 'fa-receipt', fields: [
      { l: 'Vehicle *', t: 'select', o: ['MH04AB1234', 'MH04CD5678', 'MH12EF9012', 'MH12GH3456'] },
      { l: 'Expense Type *', t: 'select', o: ['Diesel', 'Toll', 'Driver Allowance', 'Loading/Unloading', 'Parking', 'Repair', 'Insurance', 'Other'] },
      { l: 'Amount (₹) *', t: 'text', p: 'e.g. 3200' }, { l: 'Date', t: 'date' },
      { l: 'Trip Reference', t: 'select', o: ['None', 'TRP-2024-0142', 'TRP-2024-0141', 'TRP-2024-0140'] },
      { l: 'Payment Method', t: 'select', o: ['Cash', 'FASTag', 'Bank Transfer', 'UPI', 'Card'] },
      { l: 'Receipt / Notes', t: 'textarea', p: 'Details...' }
    ]
  },
  fuel: {
    title: 'New Fuel Entry', icon: 'fa-gas-pump', fields: [
      { l: 'Vehicle *', t: 'select', o: ['MH04AB1234', 'MH04CD5678', 'MH12EF9012', 'MH12GH3456'] },
      { l: 'Fuel Type', t: 'select', o: ['Diesel', 'Petrol', 'CNG'] },
      { l: 'Quantity (Litres) *', t: 'text', p: 'e.g. 120' }, { l: 'Price per Litre (₹)', t: 'text', p: 'e.g. 89.50' },
      { l: 'Total Cost (₹)', t: 'text', p: 'e.g. 10740' }, { l: 'Odometer (km)', t: 'text', p: 'e.g. 153297' },
      { l: 'Station', t: 'text', p: 'e.g. HP Fuel Station, Andheri' }, { l: 'Date', t: 'date' },
      { l: 'Driver', t: 'select', o: ['Rajesh Kumar', 'Anita Verma', 'Vikram Singh', 'Deepak Patel'] }
    ]
  },
  reminder: {
    title: 'New Reminder', icon: 'fa-bell', fields: [
      { l: 'Reminder Type *', t: 'select', o: ['Service Due', 'Insurance Renewal', 'PUC Renewal', 'Fitness Certificate', 'Road Tax', 'Permit Renewal', 'Tire Rotation', 'Oil Change'] },
      { l: 'Vehicle *', t: 'select', o: ['MH04AB1234', 'MH04CD5678', 'MH12EF9012', 'MH12GH3456', 'All Vehicles'] },
      { l: 'Due Date', t: 'date' }, { l: 'Due Meter (km)', t: 'text', p: 'e.g. 160000' },
      { l: 'Alert Before', t: 'select', o: ['1 Week', '2 Weeks', '1 Month', '2 Months'] },
      { l: 'Notes', t: 'textarea', p: 'Additional details...' }
    ]
  },
  inspection: {
    title: 'New Inspection', icon: 'fa-clipboard-check', fields: [
      { l: 'Inspection Form *', t: 'select', o: ['Driver Vehicle Inspection Report (Simple)', 'Pre-Trip Inspection', 'Post-Trip Inspection', 'Monthly Safety Inspection', 'Brake System Check'] },
      { l: 'Vehicle *', t: 'select', o: ['MH04AB1234', 'MH04CD5678', 'MH12EF9012', 'MH12GH3456'] },
      { l: 'Inspector *', t: 'select', o: ['Rajesh Kumar', 'Chandan Das', 'Amit Mehta', 'Priya Sharma'] },
      { l: 'Scheduled Date', t: 'date' }, { l: 'Priority', t: 'select', o: ['Normal', 'Urgent'] }
    ]
  },
  /* route: removed — handled by routes.html slider */
  place: {
    title: 'Add Place', icon: 'fa-map-marker-alt', fields: [
      { l: 'Place Name *', t: 'text', p: 'e.g. Reliance Jamnagar Refinery' },
      { l: 'Type', t: 'select', o: ['Warehouse', 'Factory', 'Port', 'Depot', 'Fuel Station', 'Toll Plaza', 'Client Site', 'Other'] },
      { l: 'Address *', t: 'textarea', p: 'Full address...' }, { l: 'City', t: 'text', p: 'e.g. Jamnagar' },
      { l: 'State', t: 'text', p: 'e.g. Gujarat' }, { l: 'PIN Code', t: 'text', p: 'e.g. 361142' },
      { l: 'Contact Person', t: 'text', p: 'Name' }, { l: 'Phone', t: 'text', p: '+91...' }
    ]
  },
  equipment: {
    title: 'Add Equipment', icon: 'fa-tools', fields: [
      { l: 'Equipment Name *', t: 'text', p: 'e.g. GPS Tracker Unit' }, { l: 'Serial / ID', t: 'text', p: 'e.g. GPS-2024-001' },
      { l: 'Type', t: 'select', o: ['GPS Tracker', 'Dashcam', 'Speed Governor', 'Fuel Sensor', 'Load Sensor', 'Communication Device', 'Tool Kit'] },
      { l: 'Assigned Vehicle', t: 'select', o: ['Unassigned', 'MH04AB1234', 'MH04CD5678', 'MH12EF9012'] },
      { l: 'Purchase Date', t: 'date' }, { l: 'Cost (₹)', t: 'text', p: 'e.g. 12000' },
      { l: 'Warranty Until', t: 'date' }
    ]
  },
  shop: {
    title: 'Add Shop', icon: 'fa-warehouse', fields: [
      { l: 'Shop Name *', t: 'text', p: 'e.g. Central Service Bay' }, { l: 'Location', t: 'text', p: 'e.g. Mumbai Depot' },
      { l: 'Type', t: 'select', o: ['In-House', 'External', 'Partner'] },
      { l: 'Specialization', t: 'select', o: ['General Service', 'Engine', 'Electrical', 'Body & Paint', 'Tires', 'All'] },
      { l: 'Manager', t: 'text', p: 'e.g. Amit Mehta' }, { l: 'Phone', t: 'text', p: '+91...' },
      { l: 'Capacity (vehicles/day)', t: 'text', p: 'e.g. 5' }
    ]
  },
  purchaseorder: {
    title: 'New Purchase Order', icon: 'fa-shopping-cart', fields: [
      { l: 'Vendor *', t: 'select', o: ['Apollo Tyres Service', 'TVS Auto Assist', 'Castrol Express Care', 'MRF Tyres', 'Bosch Service', 'HP Petrol'] },
      { l: 'PO Date', t: 'date' }, { l: 'Expected Delivery', t: 'date' },
      { l: 'Items', t: 'textarea', p: 'List items and quantities...' }, { l: 'Total Amount (₹)', t: 'text', p: 'e.g. 48000' },
      { l: 'Payment Terms', t: 'select', o: ['Immediate', 'Net 15', 'Net 30', 'Net 45'] },
      { l: 'Ship To', t: 'select', o: ['Main Warehouse', 'Mumbai Depot', 'Pune Depot', 'Delhi Depot'] }
    ]
  },
  document: {
    title: 'Upload Document', icon: 'fa-file-upload', fields: [
      { l: 'Document Type *', t: 'select', o: ['Registration Certificate', 'Insurance Policy', 'PUC Certificate', 'Fitness Certificate', 'Permit', 'Invoice', 'Contract', 'Other'] },
      { l: 'Related Vehicle', t: 'select', o: ['None', 'MH04AB1234', 'MH04CD5678', 'MH12EF9012', 'MH12GH3456'] },
      { l: 'Title *', t: 'text', p: 'e.g. Insurance Policy 2024-25' },
      { l: 'Expiry Date', t: 'date' }, { l: 'Notes', t: 'textarea', p: 'Optional notes...' },
      { l: 'File', t: 'file' }
    ]
  },
  assignment: {
    title: 'New Assignment', icon: 'fa-link', fields: [
      { l: 'Vehicle *', t: 'select', o: ['MH04AB1234', 'MH04CD5678', 'MH12EF9012', 'MH12GH3456', 'DL01IJ7890'] },
      { l: 'Driver *', t: 'select', o: ['Rajesh Kumar', 'Anita Verma', 'Vikram Singh', 'Deepak Patel', 'Meera Joshi'] },
      { l: 'Start Date *', t: 'date' }, { l: 'End Date', t: 'date' },
      { l: 'Assignment Type', t: 'select', o: ['Permanent', 'Temporary', 'Per-Trip'] },
      { l: 'Notes', t: 'textarea', p: 'Assignment details...' }
    ]
  },
  transaction: {
    title: 'New Transaction', icon: 'fa-exchange-alt', fields: [
      { l: 'Driver *', t: 'select', o: ['Rajesh Kumar', 'Anita Verma', 'Vikram Singh', 'Deepak Patel'] },
      { l: 'Transaction Type *', t: 'select', o: ['Advance', 'Settlement', 'Deduction', 'Bonus', 'Salary', 'Reimbursement'] },
      { l: 'Amount (₹) *', t: 'text', p: 'e.g. 5000' }, { l: 'Date', t: 'date' },
      { l: 'Trip Reference', t: 'select', o: ['None', 'TRP-2024-0142', 'TRP-2024-0141', 'TRP-2024-0140'] },
      { l: 'Narration', t: 'textarea', p: 'Transaction details...' }
    ]
  },
  meter: {
    title: 'New Meter Entry', icon: 'fa-tachometer-alt', fields: [
      { l: 'Vehicle *', t: 'select', o: ['MH04AB1234', 'MH04CD5678', 'MH12EF9012', 'MH12GH3456'] },
      { l: 'Reading (km) *', t: 'text', p: 'e.g. 153297' }, { l: 'Date', t: 'date' },
      { l: 'Source', t: 'select', o: ['Manual', 'GPS', 'Fuel Entry', 'Inspection', 'Work Order'] },
      { l: 'Notes', t: 'textarea', p: 'Optional...' }
    ]
  },
  charging: {
    title: 'New Charging Entry', icon: 'fa-bolt', fields: [
      { l: 'Vehicle *', t: 'select', o: ['MH12PQ2345 (Nexon EV)', 'DL01RS6789 (eVerito)'] },
      { l: 'Energy (kWh) *', t: 'text', p: 'e.g. 35' }, { l: 'Cost (₹)', t: 'text', p: 'e.g. 420' },
      { l: 'Charger Type', t: 'select', o: ['DC Fast (CCS)', 'DC Fast (CHAdeMO)', 'AC Level 2', 'AC Home'] },
      { l: 'Station', t: 'text', p: 'e.g. Tata Power, Andheri' }, { l: 'Date', t: 'date' },
      { l: 'SOC Start (%)', t: 'text', p: 'e.g. 15' }, { l: 'SOC End (%)', t: 'text', p: 'e.g. 90' }
    ]
  },
  servicetask: {
    title: 'New Service Task', icon: 'fa-wrench', fields: [
      { l: 'Task Name *', t: 'text', p: 'e.g. Engine Oil Change' }, { l: 'Category', t: 'select', o: ['Preventive', 'Corrective', 'Inspection', 'Tire', 'Fluid', 'Filter', 'Brake', 'Electrical'] },
      { l: 'Description', t: 'textarea', p: 'Task description...' }, { l: 'Est. Duration (hrs)', t: 'text', p: 'e.g. 2' },
      { l: 'Est. Cost (₹)', t: 'text', p: 'e.g. 3500' }
    ]
  },
  serviceprogram: {
    title: 'New Program', icon: 'fa-calendar-check', fields: [
      { l: 'Program Name *', t: 'text', p: 'e.g. 10,000 km Preventive Maintenance' }, { l: 'Interval Type', t: 'select', o: ['Distance (km)', 'Time (days)', 'Both'] },
      { l: 'Interval Value', t: 'text', p: 'e.g. 10000' }, { l: 'Vehicle Group', t: 'select', o: ['All Vehicles', 'Mumbai', 'Pune', 'Delhi'] },
      { l: 'Tasks Included', t: 'textarea', p: 'e.g. Oil change, Filter replacement, Brake check' },
      { l: 'Est. Cost (₹)', t: 'text', p: 'e.g. 8500' }
    ]
  },
  compliance: {
    title: 'Add Document', icon: 'fa-shield-alt', fields: [
      { l: 'Document Type *', t: 'select', o: ['Insurance', 'PUC Certificate', 'Fitness Certificate', 'Road Tax Receipt', 'Permit', 'Registration Certificate'] },
      { l: 'Vehicle *', t: 'select', o: ['MH04AB1234', 'MH04CD5678', 'MH12EF9012', 'MH12GH3456'] },
      { l: 'Document Number', t: 'text', p: 'e.g. POL-2024-001' }, { l: 'Issue Date', t: 'date' },
      { l: 'Expiry Date *', t: 'date' }, { l: 'Issuing Authority', t: 'text', p: 'e.g. RTO Mumbai' },
      { l: 'File', t: 'file' }
    ]
  }
};

/* =========================
   Contextual Modal Builder
   ========================= */
function openEntityModal(entityKey) {
  var schema = entitySchemas[entityKey];
  if (!schema) return;
  var existing = document.getElementById('entity-modal');
  if (existing) existing.remove();

  var fieldsHtml = '';
  var cols = schema.fields.length > 5 ? 2 : 1;
  fieldsHtml += '<div style="display:grid;grid-template-columns:' + (cols === 2 ? '1fr 1fr' : '1fr') + ';gap:14px;">';
  schema.fields.forEach(function (f) {
    var inp = '';
    var fStyle = 'width:100%;padding:9px 12px;border:1px solid #e2e8f0;border-radius:8px;font-size:13px;color:#1e293b;outline:none;box-sizing:border-box;font-family:inherit;transition:border-color 0.15s;';
    if (f.t === 'select') {
      inp = '<select style="' + fStyle + 'background:#fff;">';
      inp += '<option value="">Select...</option>';
      f.o.forEach(function (opt) { inp += '<option>' + opt + '</option>'; });
      inp += '</select>';
    } else if (f.t === 'textarea') {
      inp = '<textarea placeholder="' + (f.p || '') + '" rows="2" style="' + fStyle + 'resize:vertical;"></textarea>';
    } else if (f.t === 'date') {
      inp = '<input type="date" style="' + fStyle + '">';
    } else if (f.t === 'file') {
      inp = '<div style="' + fStyle + 'display:flex;align-items:center;gap:8px;cursor:pointer;color:#64748b;background:#f8fafc;" onclick="var fi=document.createElement(\'input\');fi.type=\'file\';fi.onchange=function(){showToast(\'File selected: \'+fi.files[0].name,\'success\')};fi.click()"><i class="fas fa-cloud-upload-alt"></i> Choose file...</div>';
    } else {
      inp = '<input type="text" placeholder="' + (f.p || '') + '" style="' + fStyle + '">';
    }
    var span = (f.t === 'textarea') ? 'grid-column:1/-1;' : '';
    fieldsHtml += '<div style="' + span + '"><label style="display:block;font-size:11px;font-weight:600;color:#64748b;margin-bottom:5px;text-transform:uppercase;letter-spacing:0.5px;">' + f.l + '</label>' + inp + '</div>';
  });
  fieldsHtml += '</div>';

  // Build as right-side slider instead of centered modal
  var backdrop = document.createElement('div');
  backdrop.id = 'entity-modal';
  backdrop.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.15);z-index:99997;animation:sliderBackdropIn 0.2s ease-out forwards;';

  var slider = document.createElement('div');
  slider.style.cssText = 'position:fixed;top:0;right:0;bottom:0;width:520px;max-width:92vw;background:#fff;z-index:99998;display:flex;flex-direction:column;box-shadow:-4px 0 20px rgba(0,0,0,0.1);animation:sliderPanelIn 0.2s ease-out;font-family:"DM Sans",system-ui,sans-serif;';
  slider.innerHTML =
      '<div style="background:#1e2a3a;padding:18px 22px;display:flex;align-items:center;gap:12px;flex-shrink:0;">'
    + '<div style="width:36px;height:36px;border-radius:10px;background:rgba(255,255,255,0.15);display:flex;align-items:center;justify-content:center;"><i class="fas ' + schema.icon + '" style="color:#fff;font-size:14px;"></i></div>'
    + '<h3 style="margin:0;font-size:16px;font-weight:700;color:#fff;flex:1;">' + schema.title + '</h3>'
    + '<button onclick="document.getElementById(\'entity-modal\').remove();document.getElementById(\'entity-slider\').remove()" style="background:rgba(255,255,255,0.15);border:none;width:32px;height:32px;border-radius:8px;font-size:15px;cursor:pointer;color:#fff;display:flex;align-items:center;justify-content:center;">✕</button>'
    + '</div>'
    + '<div style="flex:1;overflow-y:auto;padding:20px;">' + fieldsHtml + '</div>'
    + '<div style="padding:14px 20px;border-top:1px solid #e2e8f0;display:flex;justify-content:flex-end;gap:10px;flex-shrink:0;background:#f8fafc;">'
    + '<button onclick="document.getElementById(\'entity-modal\').remove();document.getElementById(\'entity-slider\').remove()" style="padding:9px 18px;border:1px solid #d1d5db;border-radius:8px;background:#fff;cursor:pointer;font-size:13px;font-weight:500;color:#374151;">Cancel</button>'
    + '<button onclick="showToast(\'' + schema.title.replace('Add ', '').replace('New ', '').replace('Create ', '') + ' saved successfully!\',\'success\');document.getElementById(\'entity-modal\').remove();document.getElementById(\'entity-slider\').remove()" style="padding:9px 18px;border:none;border-radius:8px;background:#2563eb;color:#fff;cursor:pointer;font-size:13px;font-weight:600;"><i class="fas fa-check" style="margin-right:4px;"></i>Save</button>'
    + '</div>';
  slider.id = 'entity-slider';

  backdrop.addEventListener('click', function (e) { if (e.target === backdrop) { backdrop.remove(); slider.remove(); } });
  document.addEventListener('keydown', function handler(e) { if (e.key === 'Escape') { var b = document.getElementById('entity-modal'); var s = document.getElementById('entity-slider'); if (b) b.remove(); if (s) s.remove(); document.removeEventListener('keydown', handler); } });
  document.body.appendChild(backdrop);
  document.body.appendChild(slider);
}

/* =========================
   Dropdown Menu
   ========================= */
function showDropdown(btn, items) {
  document.querySelectorAll('.action-dropdown').forEach(function (d) { d.remove(); });
  var rect = btn.getBoundingClientRect();
  var dd = document.createElement('div');
  dd.className = 'action-dropdown';
  dd.style.cssText = 'position:fixed;top:' + (rect.bottom + 4) + 'px;right:' + (window.innerWidth - rect.right) + 'px;background:#fff;border-radius:10px;box-shadow:0 8px 30px rgba(0,0,0,0.15);border:1px solid #e5e7eb;min-width:200px;z-index:99997;animation:slideUp 0.15s ease;overflow:hidden;';
  items.forEach(function (item) {
    if (item.divider) { dd.innerHTML += '<div style="height:1px;background:#e5e7eb;margin:4px 0;"></div>'; return; }
    dd.innerHTML += '<div style="padding:9px 16px;font-size:13px;color:' + (item.danger ? '#dc2626' : '#374151') + ';cursor:pointer;display:flex;align-items:center;gap:10px;transition:background 0.1s;" onmouseover="this.style.background=\'#f1f5f9\'" onmouseout="this.style.background=\'#fff\'" onclick="' + (item.action || '') + ';document.querySelectorAll(\'.action-dropdown\').forEach(function(d){d.remove()})"><i class="fas ' + item.icon + '" style="width:16px;text-align:center;font-size:12px;color:#94a3b8;"></i>' + item.label + '</div>';
  });
  document.body.appendChild(dd);
  setTimeout(function () { document.addEventListener('click', function handler() { dd.remove(); document.removeEventListener('click', handler); }); }, 50);
}

/* =========================
   CSV Export Simulation
   ========================= */
function handleExport(entity) {
  var pageName = entity || 'data';
  var csvContent = 'data:text/csv;charset=utf-8,';
  csvContent += 'ID,Name,Status,Date,Amount\n';
  csvContent += 'SAMPLE-001,Sample Record 1,Active,2024-05-14,48500\n';
  csvContent += 'SAMPLE-002,Sample Record 2,Completed,2024-05-13,32000\n';
  csvContent += 'SAMPLE-003,Sample Record 3,Pending,2024-05-12,18200\n';
  var link = document.createElement('a');
  link.setAttribute('href', encodeURI(csvContent));
  link.setAttribute('download', pageName.toLowerCase().replace(/\s+/g, '_') + '_export_' + new Date().toISOString().slice(0, 10) + '.csv');
  document.body.appendChild(link);
  link.click();
  link.remove();
  showToast(pageName + ' exported — CSV file downloaded', 'success');
}

function handlePrint() {
  window.print();
}

function handleSave(entity) {
  showToast((entity || 'Changes') + ' saved successfully!', 'success');
}

function handleAction(action, detail) {
  showToast(action + (detail ? ': ' + detail : ''), 'success');
}

/* =========================
   Notification Panel
   ========================= */
function showNotificationPanel(btn) {
  var existing = document.getElementById('notif-panel');
  if (existing) { existing.remove(); return; }
  var rect = btn.getBoundingClientRect();
  var panel = document.createElement('div');
  panel.id = 'notif-panel';
  panel.style.cssText = 'position:fixed;top:' + (rect.bottom + 8) + 'px;right:20px;width:380px;max-height:480px;background:#fff;border-radius:14px;box-shadow:0 12px 40px rgba(0,0,0,0.18);border:1px solid #e5e7eb;z-index:99997;animation:slideUp 0.2s ease;overflow:hidden;';
  var notifications = [
    { icon: 'fa-exclamation-triangle', color: '#f59e0b', title: 'Tire Inspection Failed', desc: 'Vehicle MH04VW6256 — rear right tire needs replacement', time: '2 hours ago', unread: true },
    { icon: 'fa-oil-can', color: '#ef4444', title: 'Service Overdue', desc: 'MH12EF9012 is 1,200 km past scheduled oil change', time: '5 hours ago', unread: false },
    { icon: 'fa-file-invoice', color: '#2563eb', title: 'Invoice Approved', desc: 'INV-2024-0892 (₹2,84,500) approved by Reliance Industries', time: 'Yesterday', unread: false },
    { icon: 'fa-route', color: '#16a34a', title: 'Trip Completed', desc: 'TRP-2024-0142 Mumbai → Delhi delivered on time', time: 'Yesterday', unread: false },
    { icon: 'fa-shield-alt', color: '#8b5cf6', title: 'Insurance Expiring', desc: 'MH04CD5678 insurance expires in 12 days', time: '2 days ago', unread: false },
    { icon: 'fa-user-check', color: '#0891b2', title: 'License Renewed', desc: 'Rajesh Kumar\'s HMV license renewed until 2027', time: '3 days ago', unread: false }
  ];
  var html = '<div style="padding:16px 20px;border-bottom:1px solid #e5e7eb;display:flex;align-items:center;justify-content:space-between;">';
  html += '<h3 style="margin:0;font-size:15px;font-weight:700;color:#1e293b;">Notifications</h3>';
  html += '<span style="font-size:12px;color:#2563eb;cursor:pointer;" onclick="document.getElementById(\'notif-panel\').remove();showToast(\'All marked as read\',\'success\')">Mark all read</span>';
  html += '</div><div style="max-height:400px;overflow-y:auto;">';
  notifications.forEach(function (n) {
    html += '<div style="padding:12px 20px;border-bottom:1px solid #f1f5f9;display:flex;gap:12px;cursor:pointer;transition:background 0.1s;' + (n.unread ? 'background:#f0f7ff;' : '') + '" onmouseover="this.style.background=\'#f8fafc\'" onmouseout="this.style.background=\'' + (n.unread ? '#f0f7ff' : '#fff') + '\'">';
    html += '<div style="width:32px;height:32px;border-radius:8px;background:' + n.color + '15;display:flex;align-items:center;justify-content:center;flex-shrink:0;"><i class="fas ' + n.icon + '" style="font-size:12px;color:' + n.color + ';"></i></div>';
    html += '<div style="flex:1;min-width:0;"><div style="font-size:13px;font-weight:' + (n.unread ? '600' : '500') + ';color:#1e293b;margin-bottom:2px;">' + n.title + '</div>';
    html += '<div style="font-size:12px;color:#64748b;line-height:1.4;">' + n.desc + '</div>';
    html += '<div style="font-size:11px;color:#94a3b8;margin-top:4px;">' + n.time + '</div></div>';
    if (n.unread) html += '<div style="width:8px;height:8px;border-radius:50%;background:#2563eb;flex-shrink:0;margin-top:4px;"></div>';
    html += '</div>';
  });
  html += '</div>';
  html += '<div style="padding:10px 20px;border-top:1px solid #e5e7eb;text-align:center;"><a href="#" onclick="document.getElementById(\'notif-panel\').remove();navigateTo(\'alerts\');return false;" style="font-size:12px;color:#2563eb;text-decoration:none;font-weight:600;">View All Notifications</a></div>';
  panel.innerHTML = html;
  document.body.appendChild(panel);
  setTimeout(function () { document.addEventListener('click', function handler(e) { if (!panel.contains(e.target) && e.target !== btn) { panel.remove(); document.removeEventListener('click', handler); } }); }, 50);
}

/* =========================
   Help Panel
   ========================= */
function showHelpPanel(btn) {
  var existing = document.getElementById('help-panel');
  if (existing) { existing.remove(); return; }
  var rect = btn.getBoundingClientRect();
  var panel = document.createElement('div');
  panel.id = 'help-panel';
  panel.style.cssText = 'position:fixed;top:' + (rect.bottom + 8) + 'px;right:20px;width:320px;background:#fff;border-radius:14px;box-shadow:0 12px 40px rgba(0,0,0,0.18);border:1px solid #e5e7eb;z-index:99997;animation:slideUp 0.2s ease;overflow:hidden;';
  var helpItems = [
    { icon: 'fa-book', label: 'Getting Started Guide', desc: 'Learn the basics of AxleOps' },
    { icon: 'fa-video', label: 'Video Tutorials', desc: 'Watch step-by-step walkthroughs' },
    { icon: 'fa-keyboard', label: 'Keyboard Shortcuts', desc: 'Speed up your workflow' },
    { icon: 'fa-life-ring', label: 'Contact Support', desc: 'Get help from our team' },
    { icon: 'fa-comments', label: 'Community Forum', desc: 'Connect with other fleet managers' },
    { icon: 'fa-bug', label: 'Report a Bug', desc: 'Help us improve AxleOps' },
    { icon: 'fa-file-alt', label: 'API Documentation', desc: 'For developers and integrations' },
    { icon: 'fa-info-circle', label: 'About AxleOps', desc: 'Version 2.4.1 · Build 2024.05' }
  ];
  var html = '<div style="padding:16px 20px;border-bottom:1px solid #e5e7eb;">';
  html += '<h3 style="margin:0;font-size:15px;font-weight:700;color:#1e293b;">Help & Resources</h3>';
  html += '</div><div>';
  helpItems.forEach(function (item) {
    html += '<div style="padding:10px 20px;display:flex;align-items:center;gap:12px;cursor:pointer;transition:background 0.1s;" onmouseover="this.style.background=\'#f8fafc\'" onmouseout="this.style.background=\'#fff\'" onclick="document.getElementById(\'help-panel\').remove();showToast(\'' + item.label + ' opened\',\'info\')">';
    html += '<i class="fas ' + item.icon + '" style="width:16px;text-align:center;font-size:13px;color:#64748b;"></i>';
    html += '<div><div style="font-size:13px;font-weight:500;color:#1e293b;">' + item.label + '</div>';
    html += '<div style="font-size:11px;color:#94a3b8;">' + item.desc + '</div></div></div>';
  });
  html += '</div>';
  panel.innerHTML = html;
  document.body.appendChild(panel);
  setTimeout(function () { document.addEventListener('click', function handler(e) { if (!panel.contains(e.target) && e.target !== btn) { panel.remove(); document.removeEventListener('click', handler); } }); }, 50);
}

/* =========================
   Confirmation Dialog
   ========================= */
function showConfirmDialog(title, message, onConfirm) {
  var existing = document.getElementById('confirm-dialog');
  if (existing) existing.remove();
  var existingSlider = document.getElementById('confirm-slider');
  if (existingSlider) existingSlider.remove();

  var backdrop = document.createElement('div');
  backdrop.id = 'confirm-dialog';
  backdrop.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.15);z-index:99997;animation:sliderBackdropIn 0.2s ease-out forwards;';

  var slider = document.createElement('div');
  slider.id = 'confirm-slider';
  slider.style.cssText = 'position:fixed;top:0;right:0;bottom:0;width:400px;max-width:92vw;background:#fff;z-index:99998;display:flex;flex-direction:column;box-shadow:-4px 0 20px rgba(0,0,0,0.1);animation:sliderPanelIn 0.2s ease-out;font-family:"DM Sans",system-ui,sans-serif;';
  slider.innerHTML = '<div style="padding:16px 20px;border-bottom:1px solid #e2e8f0;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;">'
    + '<h3 style="margin:0;font-size:16px;font-weight:700;color:#1e293b;">' + title + '</h3>'
    + '<button onclick="document.getElementById(\'confirm-dialog\').remove();document.getElementById(\'confirm-slider\').remove()" style="background:#F1F5F9;border:none;width:32px;height:32px;border-radius:8px;font-size:16px;cursor:pointer;font-weight:700;color:#64748B;display:flex;align-items:center;justify-content:center;">✕</button>'
    + '</div>'
    + '<div style="flex:1;overflow-y:auto;padding:24px 20px;">'
    + '<div style="width:48px;height:48px;border-radius:12px;background:#fef2f2;display:flex;align-items:center;justify-content:center;margin-bottom:16px;"><i class="fas fa-exclamation-triangle" style="font-size:20px;color:#dc2626;"></i></div>'
    + '<p style="margin:0;font-size:14px;color:#64748b;line-height:1.6;">' + message + '</p>'
    + '</div>'
    + '<div style="padding:14px 20px;border-top:1px solid #e2e8f0;display:flex;justify-content:flex-end;gap:10px;flex-shrink:0;background:#f8fafc;">'
    + '<button onclick="document.getElementById(\'confirm-dialog\').remove();document.getElementById(\'confirm-slider\').remove()" style="padding:9px 18px;border:1px solid #d1d5db;border-radius:8px;background:#fff;cursor:pointer;font-size:13px;font-weight:500;color:#374151;">Cancel</button>'
    + '<button onclick="' + onConfirm + ';document.getElementById(\'confirm-dialog\').remove();document.getElementById(\'confirm-slider\').remove()" style="padding:9px 18px;border:none;border-radius:8px;background:#dc2626;color:#fff;cursor:pointer;font-size:13px;font-weight:600;">Confirm</button>'
    + '</div>';

  backdrop.addEventListener('click', function (e) { if (e.target === backdrop) { backdrop.remove(); slider.remove(); } });
  document.body.appendChild(backdrop);
  document.body.appendChild(slider);
}

/* =========================
   Edit Overlay for Detail Pages
   ========================= */
function showEditOverlay() {
  var existing = document.getElementById('edit-overlay-bar');
  if (existing) { existing.remove(); return; }
  // Make all info-value fields editable
  document.querySelectorAll('.info-value').forEach(function (el) {
    if (el.querySelector('a') || el.querySelector('span') || el.querySelector('div')) return;
    var text = el.textContent.trim();
    if (text === '—' || text.length === 0) return;
    el.setAttribute('data-original', text);
    el.contentEditable = 'true';
    el.style.background = '#eff6ff';
    el.style.border = '1px solid #93c5fd';
    el.style.borderRadius = '6px';
    el.style.padding = '4px 8px';
    el.style.outline = 'none';
  });
  // Show edit bar
  var bar = document.createElement('div');
  bar.id = 'edit-overlay-bar';
  bar.style.cssText = 'position:fixed;bottom:0;left:0;right:0;background:#fff;border-top:2px solid #2563eb;padding:12px 24px;display:flex;align-items:center;justify-content:space-between;z-index:99996;box-shadow:0 -4px 20px rgba(0,0,0,0.1);animation:slideUp 0.2s ease;';
  bar.innerHTML = '<div style="display:flex;align-items:center;gap:8px;"><i class="fas fa-edit" style="color:#2563eb;"></i><span style="font-size:13px;font-weight:600;color:#1e293b;">Edit Mode Active</span><span style="font-size:12px;color:#64748b;"> — Click on highlighted fields to edit</span></div>'
    + '<div style="display:flex;gap:8px;">'
    + '<button onclick="cancelEditOverlay()" style="padding:8px 16px;border:1px solid #d1d5db;border-radius:8px;background:#fff;cursor:pointer;font-size:13px;font-weight:500;color:#374151;">Cancel</button>'
    + '<button onclick="saveEditOverlay()" style="padding:8px 16px;border:none;border-radius:8px;background:#2563eb;color:#fff;cursor:pointer;font-size:13px;font-weight:600;"><i class="fas fa-check" style="margin-right:4px;"></i>Save Changes</button>'
    + '</div>';
  document.body.appendChild(bar);
}

function cancelEditOverlay() {
  document.querySelectorAll('.info-value[data-original]').forEach(function (el) {
    el.textContent = el.getAttribute('data-original');
    el.contentEditable = 'false';
    el.style.background = '';
    el.style.border = '';
    el.style.borderRadius = '';
    el.style.padding = '';
    el.removeAttribute('data-original');
  });
  var bar = document.getElementById('edit-overlay-bar');
  if (bar) bar.remove();
  showToast('Changes discarded', 'info');
}

function saveEditOverlay() {
  document.querySelectorAll('.info-value[data-original]').forEach(function (el) {
    el.contentEditable = 'false';
    el.style.background = '';
    el.style.border = '';
    el.style.borderRadius = '';
    el.style.padding = '';
    el.removeAttribute('data-original');
  });
  var bar = document.getElementById('edit-overlay-bar');
  if (bar) bar.remove();
  showToast('Changes saved successfully!', 'success');
}

/* ===================================================
   Trip Filter System — Searchable Dropdowns, Multi-Select,
   Dependent Filters, Typeahead Search
   =================================================== */

var tripFilterState = {
  client: [],
  vehicletype: null,
  branch: null,
  status: [],
  period: 'This Month',
  route: null,
  driver: null,
  exceptiontype: null,
  profitrange: null
};

var tripFilterOptions = {
  client: [
    { label: 'Reliance Industries', meta: 'Oil & Gas' },
    { label: 'Tata Steel', meta: 'Steel' },
    { label: 'Hindustan Unilever', meta: 'FMCG' },
    { label: 'ITC Limited', meta: 'FMCG' },
    { label: 'Adani Ports', meta: 'Infrastructure' },
    { label: 'Mahindra Logistics', meta: 'Logistics' },
    { label: 'Delhivery', meta: 'Logistics' },
    { label: 'BlueDart', meta: 'Courier' },
    { label: 'Asian Paints', meta: 'Paints' },
    { label: 'Bharat Petroleum', meta: 'Oil & Gas' },
    { label: 'Godrej Consumer', meta: 'FMCG' },
    { label: 'Larsen & Toubro', meta: 'Infrastructure' },
    { label: 'GAIL India', meta: 'Oil & Gas' },
    { label: 'Sun Pharma', meta: 'Pharma' }
  ],
  vehicletype: [
    { label: 'All Types', value: null },
    { label: 'LCV', meta: 'Light Commercial' },
    { label: 'Medium Truck (2-Axle)', meta: '16-25 Ton' },
    { label: 'Heavy Truck (3-Axle)', meta: '25-37 Ton' },
    { label: 'Multi-Axle Trailer', meta: '37+ Ton' },
    { label: 'Container 20ft', meta: 'TEU' },
    { label: 'Container 40ft', meta: 'FEU' },
    { label: 'Tanker', meta: 'Liquid' },
    { label: 'ODC', meta: 'Over Dimensional' }
  ],
  branch: [
    { label: 'All Branches', value: null },
    { label: 'Mumbai HQ', meta: '42 vehicles' },
    { label: 'Delhi NCR', meta: '28 vehicles' },
    { label: 'Ahmedabad', meta: '15 vehicles' },
    { label: 'Pune', meta: '18 vehicles' },
    { label: 'Chennai', meta: '12 vehicles' }
  ],
  status: [
    { label: 'Scheduled', dot: '#fbbc04' },
    { label: 'En Route', dot: '#4285f4' },
    { label: 'Delayed', dot: '#ea4335' },
    { label: 'Issue Raised', dot: '#dc2626' },
    { label: 'Reassigned', dot: '#8b5cf6' },
    { label: 'Partial Delivery', dot: '#f59e0b' },
    { label: 'Completed', dot: '#34a853' },
    { label: 'Cancelled', dot: '#9ca3af' },
    { label: 'Pending Approval', dot: '#0891b2' }
  ],
  period: [
    { label: 'Today', value: 'Today' },
    { label: 'Yesterday', value: 'Yesterday' },
    { label: 'This Week', value: 'This Week' },
    { label: 'Last Week', value: 'Last Week' },
    { label: 'This Month', value: 'This Month' },
    { label: 'Last Month', value: 'Last Month' },
    { label: 'This Quarter', value: 'This Quarter' },
    { label: 'Custom Range', value: 'Custom Range', icon: 'fa-calendar-week' }
  ],
  driver: [
    { label: 'All Drivers', value: null },
    { label: 'Rajesh Kumar', meta: 'MH04AB1234' },
    { label: 'Anita Verma', meta: 'MH12EF9012' },
    { label: 'Vikram Singh', meta: 'MH04CD5678' },
    { label: 'Deepak Patel', meta: 'MH12GH3456' },
    { label: 'Meera Joshi', meta: 'MH04KL4567' },
    { label: 'Kiran Nair', meta: 'MH04MN8901' },
    { label: 'Amit Mehta', meta: 'MH04TU3344' },
    { label: 'Suresh Reddy', meta: 'DL01EF9012' },
    { label: 'Govind Thakur', meta: 'MH04VW6256' },
    { label: 'Priya Sharma', meta: 'DL01AB5678' }
  ],
  exceptiontype: [
    { label: 'Breakdown — Mechanical', meta: 'Engine / Gearbox' },
    { label: 'Breakdown — Tyre', meta: 'Puncture / Burst' },
    { label: 'Client Reroute', meta: 'Destination change' },
    { label: 'Client Cancel', meta: 'Trip cancelled by client' },
    { label: 'Partial Reject', meta: 'Goods rejected at delivery' },
    { label: 'Quantity Mismatch', meta: 'Loading / unloading variance' },
    { label: 'Accident — Minor', meta: 'No injury' },
    { label: 'Accident — Major', meta: 'Injury / vehicle damage' }
  ],
  profitrange: [
    { label: 'All Ranges', value: null },
    { label: 'Loss-making', meta: '< ₹0', dot: '#dc2626' },
    { label: 'Below Margin Floor', meta: '< 8%', dot: '#f59e0b' },
    { label: 'Above Target', meta: '> 12%', dot: '#16a34a' }
  ],
  route: {}  // populated dynamically per client
};

// Client → Route mapping
var clientRoutes = {
  'Reliance Industries': ['Mumbai → Delhi', 'Mumbai → Ahmedabad', 'Mumbai → Jamnagar', 'Delhi → Lucknow'],
  'Tata Steel': ['Mumbai → Pune', 'Jamshedpur → Kolkata', 'Mumbai → Chennai'],
  'Hindustan Unilever': ['Delhi → Jaipur', 'Mumbai → Bangalore', 'Mumbai → Hyderabad'],
  'ITC Limited': ['Mumbai → Ahmedabad', 'Kolkata → Patna', 'Chennai → Bangalore'],
  'Adani Ports': ['Mumbai → Chennai', 'Mundra → Delhi', 'Mumbai → Vizag'],
  'Mahindra Logistics': ['Pune → Bangalore', 'Mumbai → Hyderabad', 'Delhi → Chandigarh'],
  'Delhivery': ['Delhi → Mumbai', 'Mumbai → Pune', 'Bangalore → Hyderabad', 'Delhi → Kolkata'],
  'BlueDart': ['Mumbai → Delhi', 'Mumbai → Bangalore', 'Chennai → Hyderabad'],
  'Asian Paints': ['Mumbai → Kolkata', 'Mumbai → Delhi', 'Pune → Ahmedabad'],
  'Bharat Petroleum': ['Mumbai → Delhi', 'Mumbai → Jamnagar', 'Chennai → Vizag'],
  'Godrej Consumer': ['Mumbai → Pune', 'Mumbai → Ahmedabad'],
  'Larsen & Toubro': ['Mumbai → Baroda', 'Mumbai → Hyderabad', 'Delhi → Jaipur'],
  'GAIL India': ['Delhi → Mathura', 'Mumbai → Hazira'],
  'Sun Pharma': ['Ahmedabad → Mumbai', 'Mumbai → Delhi', 'Hyderabad → Chennai']
};

// Search index for typeahead
var tripSearchIndex = [
  { text: 'TRP-2024-0142', type: 'Trip', icon: 'fa-route', color: '#4285f4' },
  { text: 'TRP-2024-0141', type: 'Trip', icon: 'fa-route', color: '#4285f4' },
  { text: 'TRP-2024-0140', type: 'Trip', icon: 'fa-route', color: '#4285f4' },
  { text: 'TRP-2024-0139', type: 'Trip', icon: 'fa-route', color: '#4285f4' },
  { text: 'TRP-2024-0138', type: 'Trip', icon: 'fa-route', color: '#4285f4' },
  { text: 'TRP-2024-0137', type: 'Trip', icon: 'fa-route', color: '#4285f4' },
  { text: 'TRP-2024-0135', type: 'Trip', icon: 'fa-route', color: '#4285f4' },
  { text: 'TRP-2024-0134', type: 'Trip', icon: 'fa-route', color: '#4285f4' },
  { text: 'Reliance Industries', type: 'Client', icon: 'fa-briefcase', color: '#16a34a' },
  { text: 'Tata Steel', type: 'Client', icon: 'fa-briefcase', color: '#16a34a' },
  { text: 'Hindustan Unilever', type: 'Client', icon: 'fa-briefcase', color: '#16a34a' },
  { text: 'ITC Limited', type: 'Client', icon: 'fa-briefcase', color: '#16a34a' },
  { text: 'Adani Ports', type: 'Client', icon: 'fa-briefcase', color: '#16a34a' },
  { text: 'Mahindra Logistics', type: 'Client', icon: 'fa-briefcase', color: '#16a34a' },
  { text: 'Asian Paints', type: 'Client', icon: 'fa-briefcase', color: '#16a34a' },
  { text: 'MH04AB1234', type: 'Vehicle', icon: 'fa-truck', color: '#8b5cf6' },
  { text: 'MH12EF9012', type: 'Vehicle', icon: 'fa-truck', color: '#8b5cf6' },
  { text: 'MH04CD5678', type: 'Vehicle', icon: 'fa-truck', color: '#8b5cf6' },
  { text: 'MH12GH3456', type: 'Vehicle', icon: 'fa-truck', color: '#8b5cf6' },
  { text: 'MH04KL4567', type: 'Vehicle', icon: 'fa-truck', color: '#8b5cf6' },
  { text: 'MH04MN8901', type: 'Vehicle', icon: 'fa-truck', color: '#8b5cf6' },
  { text: 'DL01EF9012', type: 'Vehicle', icon: 'fa-truck', color: '#8b5cf6' },
  { text: 'Rajesh Kumar', type: 'Driver', icon: 'fa-user', color: '#0891b2' },
  { text: 'Anita Verma', type: 'Driver', icon: 'fa-user', color: '#0891b2' },
  { text: 'Vikram Singh', type: 'Driver', icon: 'fa-user', color: '#0891b2' },
  { text: 'Deepak Patel', type: 'Driver', icon: 'fa-user', color: '#0891b2' },
  { text: 'Meera Joshi', type: 'Driver', icon: 'fa-user', color: '#0891b2' },
  { text: 'Kiran Nair', type: 'Driver', icon: 'fa-user', color: '#0891b2' },
  { text: 'Amit Mehta', type: 'Driver', icon: 'fa-user', color: '#0891b2' },
  { text: 'Mumbai → Delhi', type: 'Route', icon: 'fa-map-signs', color: '#d97706' },
  { text: 'Mumbai → Pune', type: 'Route', icon: 'fa-map-signs', color: '#d97706' },
  { text: 'Delhi → Jaipur', type: 'Route', icon: 'fa-map-signs', color: '#d97706' },
  { text: 'Mumbai → Ahmedabad', type: 'Route', icon: 'fa-map-signs', color: '#d97706' },
  { text: 'Mumbai → Chennai', type: 'Route', icon: 'fa-map-signs', color: '#d97706' },
  { text: 'Pune → Bangalore', type: 'Route', icon: 'fa-map-signs', color: '#d97706' },
  { text: 'Mumbai → Kolkata', type: 'Route', icon: 'fa-map-signs', color: '#d97706' }
];

function initTripFilters() {
  var filterBar = document.querySelector('.trip-filter-bar');
  if (!filterBar) return;

  // Wire all .trip-filter buttons
  filterBar.querySelectorAll('.trip-filter').forEach(function (btn) {
    if (btn.getAttribute('data-trip-filter-wired')) return;
    btn.setAttribute('data-trip-filter-wired', '1');
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      openTripFilterDropdown(this);
    });
  });

  // Wire advanced filters row too
  var advRow = document.getElementById('advanced-filters-row');
  if (advRow) {
    advRow.querySelectorAll('.trip-filter').forEach(function (btn) {
      if (btn.getAttribute('data-trip-filter-wired')) return;
      btn.setAttribute('data-trip-filter-wired', '1');
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        openTripFilterDropdown(this);
      });
    });
  }

  // More Filters toggle
  var toggleBtn = document.getElementById('toggle-advanced-filters');
  if (toggleBtn && !toggleBtn.getAttribute('data-wired')) {
    toggleBtn.setAttribute('data-wired', '1');
    toggleBtn.addEventListener('click', function () {
      var row = document.getElementById('advanced-filters-row');
      if (!row) return;
      var visible = row.style.display !== 'none';
      row.style.display = visible ? 'none' : 'flex';
      this.classList.toggle('active', !visible);
      this.querySelector('span').textContent = visible ? 'More Filters' : 'Less Filters';
    });
  }

  // Search typeahead
  var searchInput = document.getElementById('trip-search-input');
  if (searchInput && !searchInput.getAttribute('data-wired')) {
    searchInput.setAttribute('data-wired', '1');
    var debounceTimer;
    searchInput.addEventListener('input', function () {
      var val = this.value.trim();
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(function () { showTripTypeahead(val); }, 150);
    });
    searchInput.addEventListener('focus', function () {
      if (this.value.trim().length >= 2) showTripTypeahead(this.value.trim());
    });
    searchInput.addEventListener('blur', function () {
      setTimeout(function () {
        var ta = document.getElementById('trip-search-typeahead');
        if (ta) ta.style.display = 'none';
      }, 200);
    });
  }

  // Clear advanced filters
  var clearBtn = document.getElementById('clear-advanced-filters');
  if (clearBtn && !clearBtn.getAttribute('data-wired')) {
    clearBtn.setAttribute('data-wired', '1');
    clearBtn.addEventListener('click', function () {
      tripFilterState.route = null;
      tripFilterState.driver = null;
      tripFilterState.exceptiontype = null;
      tripFilterState.profitrange = null;
      updateAllFilterLabels();
      updateDependentFilters();
      this.style.display = 'none';
      showToast('Advanced filters cleared', 'info');
    });
  }
}

function openTripFilterDropdown(btn) {
  // Close existing
  closeTripFilterDropdowns();
  var filterKey = btn.getAttribute('data-filter');
  var isMulti = btn.getAttribute('data-multi') === 'true';
  var options = tripFilterOptions[filterKey];
  if (!options) return;

  // For route, build dynamic options
  if (filterKey === 'route') {
    var selectedClients = tripFilterState.client;
    var routeOpts = [{ label: 'All Routes', value: null }];
    if (selectedClients && selectedClients.length > 0) {
      selectedClients.forEach(function (cl) {
        var routes = clientRoutes[cl] || [];
        routes.forEach(function (r) {
          routeOpts.push({ label: r, meta: cl });
        });
      });
    }
    options = routeOpts;
  }

  btn.classList.add('open');

  var rect = btn.getBoundingClientRect();
  var dd = document.createElement('div');
  dd.className = 'trip-filter-dropdown' + (isMulti ? '' : ' single-select');
  dd.setAttribute('data-filter-key', filterKey);

  // Determine if search should be shown (show for all with more than 4 options)
  var showSearch = options.length > 4;

  var html = '';

  // Header with search
  if (showSearch) {
    html += '<div class="tfd-header">';
    html += '<i class="fas fa-search" style="font-size:11px;color:#94a3b8;"></i>';
    html += '<input type="text" placeholder="Search..." class="tfd-search-input" autocomplete="off">';
    html += '</div>';
  }

  // Options body
  html += '<div class="tfd-body">';
  if (isMulti) {
    // "All" option for multi-select
    var allLabel = filterKey === 'client' ? 'All Clients' : filterKey === 'status' ? 'All Statuses' : 'All';
    var currentArr = tripFilterState[filterKey] || [];
    var isAllSelected = currentArr.length === 0;
    html += buildFilterOption(allLabel, null, isAllSelected, true, null, null);
  }
  options.forEach(function (opt) {
    var isSelected = false;
    if (isMulti) {
      isSelected = (tripFilterState[filterKey] || []).indexOf(opt.label) >= 0;
    } else {
      isSelected = tripFilterState[filterKey] === (opt.value !== undefined ? opt.value : opt.label);
      // For period default
      if (filterKey === 'period' && tripFilterState.period === null && opt.label === 'This Month') isSelected = true;
    }
    html += buildFilterOption(opt.label, opt.meta || null, isSelected, isMulti, opt.dot || null, opt.icon || null);
  });
  html += '</div>';

  // Footer for multi-select
  if (isMulti) {
    html += '<div class="tfd-footer">';
    html += '<button class="tfd-clear" onclick="clearTripFilter(\'' + filterKey + '\')">Clear</button>';
    html += '<button class="tfd-apply" onclick="applyTripFilter(\'' + filterKey + '\')">Apply</button>';
    html += '</div>';
  }

  // Custom range for period
  if (filterKey === 'period') {
    html += '<div class="tfd-custom-range" id="tfd-custom-range">';
    html += '<input type="date" id="tfd-range-start">';
    html += '<input type="date" id="tfd-range-end">';
    html += '<button onclick="applyCustomRange()">Go</button>';
    html += '</div>';
  }

  dd.innerHTML = html;

  // Position
  var top = rect.bottom + 4;
  var left = rect.left;
  // Keep within viewport
  if (left + 280 > window.innerWidth) left = window.innerWidth - 290;
  dd.style.top = top + 'px';
  dd.style.left = left + 'px';

  document.body.appendChild(dd);

  // Wire search input
  if (showSearch) {
    var searchInp = dd.querySelector('.tfd-search-input');
    if (searchInp) {
      searchInp.focus();
      searchInp.addEventListener('input', function () {
        var q = this.value.trim().toLowerCase();
        dd.querySelectorAll('.tfd-option').forEach(function (opt) {
          var lbl = opt.getAttribute('data-label').toLowerCase();
          var meta = (opt.getAttribute('data-meta') || '').toLowerCase();
          opt.style.display = (lbl.indexOf(q) >= 0 || meta.indexOf(q) >= 0 || q === '') ? 'flex' : 'none';
        });
      });
    }
  }

  // Wire option clicks
  dd.querySelectorAll('.tfd-option').forEach(function (opt) {
    opt.addEventListener('click', function () {
      handleFilterOptionClick(dd, filterKey, isMulti, this);
    });
  });

  // Close on outside click
  setTimeout(function () {
    document.addEventListener('click', function handler(e) {
      if (!dd.contains(e.target) && e.target !== btn && !btn.contains(e.target)) {
        closeTripFilterDropdowns();
        document.removeEventListener('click', handler);
      }
    });
  }, 50);
}

function buildFilterOption(label, meta, selected, isMulti, dot, icon) {
  var cls = 'tfd-option' + (selected ? ' selected' : '');
  var html = '<div class="' + cls + '" data-label="' + label + '" data-meta="' + (meta || '') + '">';
  if (isMulti) {
    html += '<div class="tfd-check">' + (selected ? '<i class="fas fa-check" style="font-size:9px;"></i>' : '') + '</div>';
  } else {
    html += '<div class="tfd-check">' + (selected ? '<div style="width:8px;height:8px;border-radius:50%;background:#2563eb;"></div>' : '') + '</div>';
  }
  if (dot) {
    html += '<div class="tfd-dot" style="background:' + dot + ';"></div>';
  }
  if (icon) {
    html += '<i class="fas ' + icon + '" style="font-size:10px;color:#94a3b8;"></i>';
  }
  html += '<span>' + label + '</span>';
  if (meta) {
    html += '<span class="tfd-meta">' + meta + '</span>';
  }
  html += '</div>';
  return html;
}

function handleFilterOptionClick(dd, filterKey, isMulti, optEl) {
  var label = optEl.getAttribute('data-label');

  if (isMulti) {
    // Check if this is the "All" option
    var allLabel = filterKey === 'client' ? 'All Clients' : filterKey === 'status' ? 'All Statuses' : 'All';
    if (label === allLabel) {
      // Clear all selections
      tripFilterState[filterKey] = [];
      dd.querySelectorAll('.tfd-option').forEach(function (o) {
        o.classList.remove('selected');
        o.querySelector('.tfd-check').innerHTML = '';
      });
      optEl.classList.add('selected');
      optEl.querySelector('.tfd-check').innerHTML = '<i class="fas fa-check" style="font-size:9px;"></i>';
      return;
    }
    // Remove "All" selection
    var allOpt = dd.querySelector('.tfd-option[data-label="' + allLabel + '"]');
    if (allOpt) { allOpt.classList.remove('selected'); allOpt.querySelector('.tfd-check').innerHTML = ''; }

    // Toggle this option
    var arr = tripFilterState[filterKey] || [];
    var idx = arr.indexOf(label);
    if (idx >= 0) {
      arr.splice(idx, 1);
      optEl.classList.remove('selected');
      optEl.querySelector('.tfd-check').innerHTML = '';
    } else {
      arr.push(label);
      optEl.classList.add('selected');
      optEl.querySelector('.tfd-check').innerHTML = '<i class="fas fa-check" style="font-size:9px;"></i>';
    }
    tripFilterState[filterKey] = arr;

    // If nothing selected, re-select "All"
    if (arr.length === 0 && allOpt) {
      allOpt.classList.add('selected');
      allOpt.querySelector('.tfd-check').innerHTML = '<i class="fas fa-check" style="font-size:9px;"></i>';
    }
  } else {
    // Single select — immediate apply
    var options = tripFilterOptions[filterKey];
    // Check for "All" variant (value: null)
    var opt = null;
    if (filterKey === 'route') {
      opt = { label: label, value: (label === 'All Routes' ? null : label) };
    } else {
      for (var i = 0; i < options.length; i++) {
        if (options[i].label === label) { opt = options[i]; break; }
      }
    }
    var val = opt ? (opt.value !== undefined ? opt.value : opt.label) : label;
    tripFilterState[filterKey] = val;

    // Handle custom range for period
    if (filterKey === 'period' && label === 'Custom Range') {
      var crDiv = dd.querySelector('#tfd-custom-range');
      if (crDiv) crDiv.classList.add('visible');
      // Don't close
      dd.querySelectorAll('.tfd-option').forEach(function (o) {
        o.classList.remove('selected');
        o.querySelector('.tfd-check').innerHTML = '';
      });
      optEl.classList.add('selected');
      optEl.querySelector('.tfd-check').innerHTML = '<div style="width:8px;height:8px;border-radius:50%;background:#2563eb;"></div>';
      return;
    }

    updateAllFilterLabels();
    updateDependentFilters();
    closeTripFilterDropdowns();
    showToast('Filter: ' + label, 'info');
  }
}

function applyTripFilter(filterKey) {
  updateAllFilterLabels();
  updateDependentFilters();
  closeTripFilterDropdowns();
  var arr = tripFilterState[filterKey] || [];
  if (arr.length > 0) {
    showToast(arr.length + ' ' + filterKey + '(s) selected', 'info');
  } else {
    showToast('Showing all ' + filterKey + 's', 'info');
  }
}

function clearTripFilter(filterKey) {
  tripFilterState[filterKey] = [];
  updateAllFilterLabels();
  updateDependentFilters();
  closeTripFilterDropdowns();
  showToast(filterKey.charAt(0).toUpperCase() + filterKey.slice(1) + ' filter cleared', 'info');
}

function applyCustomRange() {
  var start = document.getElementById('tfd-range-start');
  var end = document.getElementById('tfd-range-end');
  var startVal = start ? start.value : '';
  var endVal = end ? end.value : '';
  if (startVal && endVal) {
    tripFilterState.period = startVal + ' to ' + endVal;
    updateAllFilterLabels();
    closeTripFilterDropdowns();
    showToast('Period: ' + startVal + ' to ' + endVal, 'info');
  } else {
    showToast('Please select both start and end dates', 'warning');
  }
}

function closeTripFilterDropdowns() {
  document.querySelectorAll('.trip-filter-dropdown').forEach(function (d) { d.remove(); });
  document.querySelectorAll('.trip-filter.open').forEach(function (b) { b.classList.remove('open'); });
}

function updateAllFilterLabels() {
  // Client
  var clientBtn = document.getElementById('filter-client');
  if (clientBtn) {
    var cl = tripFilterState.client || [];
    var labelEl = clientBtn.querySelector('.filter-label');
    if (cl.length === 0) {
      labelEl.textContent = 'All Clients';
      clientBtn.classList.remove('has-selection');
    } else if (cl.length === 1) {
      labelEl.innerHTML = cl[0];
      clientBtn.classList.add('has-selection');
    } else {
      labelEl.innerHTML = cl.length + ' Clients <span class="filter-count">' + cl.length + '</span>';
      clientBtn.classList.add('has-selection');
    }
  }

  // Vehicle Type
  var vtBtn = document.getElementById('filter-vehicletype');
  if (vtBtn) {
    var vt = tripFilterState.vehicletype;
    var vtLabel = vtBtn.querySelector('.filter-label');
    vtLabel.textContent = vt || 'All Types';
    vtBtn.classList.toggle('has-selection', !!vt);
  }

  // Branch
  var brBtn = document.getElementById('filter-branch');
  if (brBtn) {
    var br = tripFilterState.branch;
    var brLabel = brBtn.querySelector('.filter-label');
    brLabel.textContent = br || 'All Branches';
  }

  // Status
  var stBtn = document.getElementById('filter-status');
  if (stBtn) {
    var st = tripFilterState.status || [];
    var stLabel = stBtn.querySelector('.filter-label');
    if (st.length === 0) {
      stLabel.textContent = 'All Statuses';
      stBtn.classList.remove('has-selection');
    } else if (st.length === 1) {
      stLabel.textContent = st[0];
      stBtn.classList.add('has-selection');
    } else {
      stLabel.innerHTML = st.length + ' Statuses <span class="filter-count">' + st.length + '</span>';
      stBtn.classList.add('has-selection');
    }
  }

  // Period
  var perBtn = document.getElementById('filter-period');
  if (perBtn) {
    var per = tripFilterState.period;
    perBtn.querySelector('.filter-label').textContent = per || 'This Month';
  }

  // Route
  var rtBtn = document.getElementById('filter-route');
  if (rtBtn) {
    var rt = tripFilterState.route;
    rtBtn.querySelector('.filter-label').textContent = rt || 'Route';
  }

  // Driver
  var drBtn = document.getElementById('filter-driver');
  if (drBtn) {
    var dr = tripFilterState.driver;
    drBtn.querySelector('.filter-label').textContent = dr || 'All Drivers';
    drBtn.classList.toggle('has-selection', !!dr);
  }

  // Exception Type
  var etBtn = document.getElementById('filter-exceptiontype');
  if (etBtn) {
    var et = tripFilterState.exceptiontype;
    etBtn.querySelector('.filter-label').textContent = et || 'Exception Type';
  }

  // Profit Range
  var prBtn = document.getElementById('filter-profitrange');
  if (prBtn) {
    var pr = tripFilterState.profitrange;
    prBtn.querySelector('.filter-label').textContent = pr || 'Profit Range';
    prBtn.classList.toggle('has-selection', !!pr);
  }

  // Show/hide clear advanced
  var clearAdv = document.getElementById('clear-advanced-filters');
  if (clearAdv) {
    var hasAdvanced = tripFilterState.route || tripFilterState.driver || tripFilterState.exceptiontype || tripFilterState.profitrange;
    clearAdv.style.display = hasAdvanced ? 'inline-flex' : 'none';
  }
}

function updateDependentFilters() {
  // Route depends on Client
  var routeBtn = document.getElementById('filter-route');
  if (routeBtn) {
    var hasClient = tripFilterState.client && tripFilterState.client.length > 0;
    if (hasClient) {
      routeBtn.classList.add('enabled');
      routeBtn.title = 'Filter by route';
    } else {
      routeBtn.classList.remove('enabled');
      routeBtn.title = 'Select a Client first';
      tripFilterState.route = null;
      routeBtn.querySelector('.filter-label').textContent = 'Route';
    }
  }

  // Exception Type depends on Status including "Exception"
  var exBtn = document.getElementById('filter-exceptiontype');
  if (exBtn) {
    var hasException = (tripFilterState.status || []).indexOf('Issue Raised') >= 0;
    if (hasException) {
      exBtn.classList.add('enabled');
      exBtn.title = 'Filter by exception type';
    } else {
      exBtn.classList.remove('enabled');
      exBtn.title = 'Select Exception in Status first';
      tripFilterState.exceptiontype = null;
      exBtn.querySelector('.filter-label').textContent = 'Exception Type';
    }
  }
}

function showTripTypeahead(query) {
  var ta = document.getElementById('trip-search-typeahead');
  if (!ta) return;
  if (query.length < 2) { ta.style.display = 'none'; return; }

  var q = query.toLowerCase();
  var matches = tripSearchIndex.filter(function (item) {
    return item.text.toLowerCase().indexOf(q) >= 0;
  }).slice(0, 8);

  if (matches.length === 0) {
    ta.style.display = 'none';
    return;
  }

  var html = '';
  matches.forEach(function (m) {
    var highlighted = m.text.replace(new RegExp('(' + query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi'), '<mark>$1</mark>');
    html += '<div class="typeahead-item" data-text="' + m.text + '" data-type="' + m.type + '">';
    html += '<div class="ta-icon" style="background:' + m.color + '15;color:' + m.color + ';"><i class="fas ' + m.icon + '"></i></div>';
    html += '<div class="ta-text">' + highlighted + '</div>';
    html += '<div class="ta-type">' + m.type + '</div>';
    html += '</div>';
  });
  ta.innerHTML = html;
  ta.style.display = 'block';

  // Wire typeahead clicks
  ta.querySelectorAll('.typeahead-item').forEach(function (item) {
    item.addEventListener('mousedown', function (e) {
      e.preventDefault();
      var text = this.getAttribute('data-text');
      var type = this.getAttribute('data-type');
      document.getElementById('trip-search-input').value = text;
      ta.style.display = 'none';
      showToast('Searching: ' + text + ' (' + type + ')', 'info');
    });
  });
}

/* =========================
   Trip Wizard Step Navigation
   ========================= */
function initTripWizard() {
  var stepper = document.getElementById('trip-wizard-stepper');
  if (!stepper) return; // Not on trip-create page

  var currentStep = 0;
  var steps = stepper.querySelectorAll('.trip-wizard-step');
  var sections = document.querySelectorAll('.trip-wizard-section');
  var stepLabels = ['Client & route', 'Vehicle & driver', 'Consignment', 'Review & costs'];
  var navContainer = document.getElementById('trip-wizard-step-nav');
  var createBtn = document.getElementById('trip-wizard-create-btn');

  if (!navContainer || !createBtn || steps.length === 0) return;

  function updateHeaderNav() {
    var html = '';
    if (currentStep > 0) {
      html += '<button class="btn btn-secondary btn-step-nav" onclick="tripWizardGoStep(' + (currentStep - 1) + ')"><i class="fas fa-arrow-left" style="margin-right:4px;"></i> Back</button>';
    }
    if (currentStep < steps.length - 1) {
      html += '<button class="btn btn-primary btn-step-nav" onclick="tripWizardGoStep(' + (currentStep + 1) + ')">Next: ' + stepLabels[currentStep + 1] + ' <i class="fas fa-arrow-right" style="margin-left:4px;"></i></button>';
    }
    navContainer.innerHTML = html;
    // Show Create Trip button only on last step
    createBtn.style.display = (currentStep === steps.length - 1) ? '' : 'none';
  }

  window.tripWizardGoStep = function (n) {
    sections[currentStep].classList.remove('visible');
    steps[currentStep].classList.remove('active');
    if (n > currentStep) steps[currentStep].classList.add('completed');
    currentStep = n;
    sections[currentStep].classList.add('visible');
    steps[currentStep].classList.add('active');
    for (var i = 0; i < n; i++) steps[i].classList.add('completed');
    for (var i = n + 1; i < steps.length; i++) {
      steps[i].classList.remove('active');
      steps[i].classList.remove('completed');
    }
    updateHeaderNav();
  };

  steps.forEach(function (s) {
    s.addEventListener('click', function () {
      tripWizardGoStep(parseInt(s.dataset.step));
    });
  });

  // Initialize header nav for step 0
  updateHeaderNav();
}

/* ═══ Dispatch Board / List Toggle ═══ */
function switchDispatchView(view) {
  var tripsPage = document.getElementById('page-trips');
  if (!tripsPage) return;
  var listView = tripsPage.querySelector('.table-container');
  var boardView = document.getElementById('dispatch-board-view');
  var boardBtn = document.getElementById('dispatch-board-btn');
  var listBtn = document.getElementById('dispatch-list-btn');

  if (view === 'board') {
    if (listView) listView.style.display = 'none';
    if (boardView) boardView.style.display = 'block';
    if (boardBtn) boardBtn.classList.add('active');
    if (listBtn) listBtn.classList.remove('active');
  } else {
    if (listView) listView.style.display = 'block';
    if (boardView) boardView.style.display = 'none';
    if (boardBtn) boardBtn.classList.remove('active');
    if (listBtn) listBtn.classList.add('active');
  }
}

/* ═══ Client quick-filter for board view ═══ */
function filterDispatchBoard(btn, clientFilter) {
  // Update chip active state
  document.querySelectorAll('.dispatch-client-chip').forEach(function (c) {
    c.classList.remove('active');
    c.style.borderColor = '#e5e7eb';
    c.style.background = 'transparent';
    c.style.color = '#4b5563';
  });
  btn.classList.add('active');
  btn.style.borderColor = '#2563eb';
  btn.style.background = '#eff6ff';
  btn.style.color = '#1d4ed8';

  // Filter cards
  document.querySelectorAll('.dispatch-card').forEach(function (card) {
    var client = card.getAttribute('data-client') || '';
    if (clientFilter === 'all' || client.includes(clientFilter)) {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });
}

// Export functions for use in main.js and make them available globally
// (needed because page HTML fragments use inline onclick="navigateTo(...)")
export { initSidebar, reinitSidebar, initModals, initTabs, initStatusTabs, navigateTo, openModal, closeModal, showToast, initGlobalActions, initTripFilters, initTripWizard };

// Attach to window for inline onclick handlers in page fragments
window.navigateTo = navigateTo;
window.openModal = openModal;
window.closeModal = closeModal;
window.reinitSidebar = reinitSidebar;
window.showToast = showToast;
window.handleExport = handleExport;
window.handlePrint = handlePrint;
window.handleSave = handleSave;
window.handleAction = handleAction;
window.openEntityModal = openEntityModal;
window.showDropdown = showDropdown;
window.showNotificationPanel = showNotificationPanel;
window.showHelpPanel = showHelpPanel;
window.showConfirmDialog = showConfirmDialog;
window.applyFinanceVisibility = applyFinanceVisibility;
window.showEditOverlay = showEditOverlay;
window.cancelEditOverlay = cancelEditOverlay;
window.saveEditOverlay = saveEditOverlay;
window.initTripFilters = initTripFilters;
window.closeTripFilterDropdowns = closeTripFilterDropdowns;
window.applyTripFilter = applyTripFilter;
window.clearTripFilter = clearTripFilter;
window.applyCustomRange = applyCustomRange;
window.switchDispatchView = switchDispatchView;
window.filterDispatchBoard = filterDispatchBoard;

/* =========================
   Work Order Module Functions
   ========================= */

/**
 * Toggle custom dropdown open/close
 */
function toggleWoDropdown(id) {
  var dropdown = document.getElementById(id);
  if (!dropdown) return;
  var isOpen = dropdown.classList.contains('open');
  // Close all other dropdowns first
  document.querySelectorAll('.wo-dropdown.open').forEach(function (d) {
    d.classList.remove('open');
  });
  if (!isOpen) {
    dropdown.classList.add('open');
  }
}

/**
 * Select an item from a WO dropdown
 */
function selectWoDropdown(id, label) {
  var dropdown = document.getElementById(id);
  if (!dropdown) return;
  var trigger = dropdown.querySelector('.wo-dropdown-trigger');
  if (trigger) {
    trigger.classList.remove('placeholder');
    // Keep the arrow
    trigger.innerHTML = '<span>' + label + '</span><span class="arrow">▼</span>';
  }
  dropdown.classList.remove('open');
}

/**
 * Toggle service task accordion
 */
function toggleWoTask(headerEl) {
  var arrow = headerEl.querySelector('.expand-arrow');
  var body = headerEl.nextElementSibling;
  if (arrow && body) {
    arrow.classList.toggle('expanded');
    body.classList.toggle('open');
  }
}

/**
 * Switch Line Items tab (Service Tasks / Labor / Parts)
 */
function woLineTab(tabEl, targetId) {
  // Deactivate sibling tabs
  var tabGroup = tabEl.closest('.tabs');
  if (tabGroup) {
    tabGroup.querySelectorAll('.tab').forEach(function (t) { t.classList.remove('active'); });
  }
  tabEl.classList.add('active');

  // Show/hide tab panels
  ['wo-tasks-tab', 'wo-labor-tab', 'wo-parts-tab'].forEach(function (panelId) {
    var panel = document.getElementById(panelId);
    if (panel) panel.style.display = panelId === targetId ? 'block' : 'none';
  });
}

/**
 * Switch between list and calendar views on work orders page
 */
function woSwitchView(mode) {
  var listView = document.getElementById('wo-list-view');
  var calView = document.getElementById('wo-calendar-view');
  var listBtn = document.getElementById('wo-view-list');
  var calBtn = document.getElementById('wo-view-calendar');

  if (mode === 'calendar') {
    if (listView) listView.style.display = 'none';
    if (calView) calView.style.display = 'block';
    if (listBtn) listBtn.classList.remove('active');
    if (calBtn) calBtn.classList.add('active');
  } else {
    if (listView) listView.style.display = 'block';
    if (calView) calView.style.display = 'none';
    if (listBtn) listBtn.classList.add('active');
    if (calBtn) calBtn.classList.remove('active');
  }
}

/**
 * Calendar navigation (stub — just shows toast since data is static)
 */
function woCalendarNav(direction) {
  showToast(direction > 0 ? 'Next Week' : 'Previous Week', 'info');
}

function woCalendarToday() {
  showToast('Jumped to current week', 'info');
}

/**
 * Set labor hours from quick-select buttons
 */
function setWoLaborHours(hours, btnEl) {
  var input = document.getElementById('wo-labor-hours');
  if (input) input.value = hours;
  // Update active state
  var container = btnEl.closest('.wo-quick-times');
  if (container) {
    container.querySelectorAll('.wo-quick-time-btn').forEach(function (b) { b.classList.remove('active'); });
    btnEl.classList.add('active');
  }
}

/**
 * Initialize WO status tabs filtering on the list page
 */
function initWoStatusTabs() {
  var tabsContainer = document.getElementById('wo-status-tabs');
  if (!tabsContainer) return;

  tabsContainer.querySelectorAll('.wo-status-tab[data-status]').forEach(function (tab) {
    tab.addEventListener('click', function () {
      tabsContainer.querySelectorAll('.wo-status-tab').forEach(function (t) { t.classList.remove('active'); });
      this.classList.add('active');

      var status = this.getAttribute('data-status');
      var rows = document.querySelectorAll('.wo-list-row');
      rows.forEach(function (row) {
        if (status === 'all') {
          row.style.display = '';
          return;
        }
        var badge = row.querySelector('.status-badge');
        if (badge) {
          var badgeText = badge.textContent.trim().toLowerCase().replace(/\s+/g, '-');
          row.style.display = badgeText.includes(status) ? '' : 'none';
        }
      });
    });
  });
}

// Close dropdowns on outside click
document.addEventListener('click', function (e) {
  if (!e.target.closest('.wo-dropdown')) {
    document.querySelectorAll('.wo-dropdown.open').forEach(function (d) {
      d.classList.remove('open');
    });
  }
});

// Expose WO functions on window
window.toggleWoDropdown = toggleWoDropdown;
window.selectWoDropdown = selectWoDropdown;
window.toggleWoTask = toggleWoTask;
window.woLineTab = woLineTab;
window.woSwitchView = woSwitchView;
window.woCalendarNav = woCalendarNav;
window.woCalendarToday = woCalendarToday;
window.setWoLaborHours = setWoLaborHours;
window.initWoStatusTabs = initWoStatusTabs;
