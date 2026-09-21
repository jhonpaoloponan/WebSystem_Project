let categoryChart = null;
let statusChart = null;

function initCharts() {
  const categoryCtx = document.getElementById('categoryChartCanvas');
  const statusCtx = document.getElementById('statusChartCanvas');

  if (categoryCtx) {
    categoryChart = new Chart(categoryCtx, {
      type: 'bar',
      data: {
        labels: ['Peripherals', 'Displays', 'Accessories', 'Audio', 'Storage'],
        datasets: [{
          label: 'Total Value (₱)',
          data: [0, 0, 0, 0, 0],
          backgroundColor: '#3b82f6'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (val) => '₱' + val.toLocaleString()
            }
          }
        }
      }
    });
  }

  if (statusCtx) {
    statusChart = new Chart(statusCtx, {
      type: 'doughnut',
      data: {
        labels: ['In Stock', 'Low Stock', 'Out of Stock'],
        datasets: [{
          data: [0, 0, 0],
          backgroundColor: ['#22c55e', '#eab308', '#ef4444']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });
  }

  refreshDashboardVisuals();
}

function refreshDashboardVisuals() {
  const products = DataManager.getProducts();
  if (!products || products.length === 0) return;

  const categories = ['Peripherals', 'Displays', 'Accessories', 'Audio', 'Storage'];
  const categorySummary = DataManager.getCategorySummary();
  const categoryValues = categories.map(cat => categorySummary[cat]?.totalValue || 0);

  if (categoryChart) {
    categoryChart.data.datasets[0].data = categoryValues;
    categoryChart.update();
  }

  let inStock = 0, lowStock = 0, outOfStock = 0;
  products.forEach(item => {
    if (item.status === 'In Stock') inStock++;
    else if (item.status === 'Low Stock') lowStock++;
    else if (item.status === 'Out of Stock') outOfStock++;
  });

  if (statusChart) {
    statusChart.data.datasets[0].data = [inStock, lowStock, outOfStock];
    statusChart.update();
  }
}