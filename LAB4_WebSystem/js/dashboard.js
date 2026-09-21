let liveUpdateTimer = null;

function renderInventoryTable() {
  const tableBody = document.getElementById('inventoryTableBody');
  if (!tableBody) return;

  const categoryFilter = document.getElementById('categoryFilter')?.value || 'all';
  const statusFilter = document.getElementById('statusFilter')?.value || 'all';
  const query = document.getElementById('searchInput')?.value || '';

  const filteredProducts = DataManager.filterProducts({
    category: categoryFilter,
    status: statusFilter,
    query: query
  });

  tableBody.innerHTML = filteredProducts.map(item => {
    let badgeClass = 'bg-success';
    if (item.status === 'Low Stock') badgeClass = 'bg-warning text-dark';
    if (item.status === 'Out of Stock') badgeClass = 'bg-danger';

    return `
      <tr>
        <td><strong>${item.id}</strong></td>
        <td>${item.name}</td>
        <td><span class="badge bg-secondary">${item.category}</span></td>
        <td>₱${item.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
        <td><strong>${item.quantity}</strong></td>
        <td><span class="badge ${badgeClass}">${item.status}</span></td>
      </tr>
    `;
  }).join('');
}

function checkLowStockAlerts() {
  const alertContainer = document.getElementById('alertContainer');
  if (!alertContainer) return;

  const lowStockItems = DataManager.getLowStockProducts();
  if (lowStockItems.length > 0) {
    alertContainer.innerHTML = `
      <div class="alert alert-warning alert-dismissible fade show shadow-sm" role="alert">
        <i class="bi bi-exclamation-triangle-fill me-2"></i>
        <strong>Low Stock Warning:</strong> ${lowStockItems.length} product(s) are at or below reorder levels (${lowStockItems.map(i => i.name).join(', ')}).
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>
    `;
  } else {
    alertContainer.innerHTML = '';
  }
}

function startLiveUpdates(intervalMs = 4000) {
  if (liveUpdateTimer) clearInterval(liveUpdateTimer);

  liveUpdateTimer = setInterval(() => {
    const updatedItem = DataManager.simulateStockChange();
    if (updatedItem) {
      renderInventoryTable();
      refreshDashboardVisuals();
      checkLowStockAlerts();
    }
  }, intervalMs);
}

function stopLiveUpdates() {
  if (liveUpdateTimer) {
    clearInterval(liveUpdateTimer);
    liveUpdateTimer = null;
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  await DataManager.fetchProductsFromAPI();

  renderInventoryTable();
  initCharts();
  checkLowStockAlerts();

  document.getElementById('categoryFilter')?.addEventListener('change', renderInventoryTable);
  document.getElementById('statusFilter')?.addEventListener('change', renderInventoryTable);
  document.getElementById('searchInput')?.addEventListener('input', renderInventoryTable);

  document.getElementById('exportCsvBtn')?.addEventListener('click', () => {
    const categoryFilter = document.getElementById('categoryFilter')?.value || 'all';
    const statusFilter = document.getElementById('statusFilter')?.value || 'all';
    const query = document.getElementById('searchInput')?.value || '';

    const currentList = DataManager.filterProducts({ category: categoryFilter, status: statusFilter, query: query });
    DataManager.exportToCSV(currentList);
  });

  const autoToggle = document.getElementById('autoRefreshToggle');
  if (autoToggle) {
    if (autoToggle.checked) startLiveUpdates(4000);

    autoToggle.addEventListener('change', (e) => {
      if (e.target.checked) {
        startLiveUpdates(4000);
      } else {
        stopLiveUpdates();
      }
    });
  }
});