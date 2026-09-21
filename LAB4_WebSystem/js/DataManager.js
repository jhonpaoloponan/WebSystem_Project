const DataManager = {
    apiUrl: 'api/activities.php',
    products: [],

    // Local fallback data if PHP/Server isn't reachable
    fallbackData: [
        { id: "PROD-001", name: "Wireless Ergonomic Mouse", category: "Peripherals", price: 2499, quantity: 20, reorderLevel: 10, status: "In Stock" },
        { id: "PROD-002", name: "Mechanical Gaming Keyboard", category: "Peripherals", price: 3999, quantity: 8, reorderLevel: 10, status: "Low Stock" },
        { id: "PROD-003", name: "27-Inch 4K QLED Monitor", category: "Displays", price: 36500, quantity: 5, reorderLevel: 5, status: "Low Stock" },
        { id: "PROD-004", name: "USB-C Docking Station", category: "Accessories", price: 450, quantity: 3, reorderLevel: 5, status: "Low Stock" },
        { id: "PROD-005", name: "Noise-Canceling Headphones", category: "Audio", price: 5599, quantity: 0, reorderLevel: 5, status: "Out of Stock" },
        { id: "PROD-006", name: "HD Webcam 1080p", category: "Peripherals", price: 3000, quantity: 13, reorderLevel: 10, status: "In Stock" },
        { id: "PROD-007", name: "Hard Drive 1TB", category: "Storage", price: 1200, quantity: 15, reorderLevel: 5, status: "In Stock" },
        { id: "PROD-008", name: "Solid State Drive 500GB", category: "Storage", price: 2300, quantity: 20, reorderLevel: 5, status: "In Stock" }
    ],

    async fetchProductsFromAPI() {
        try {
            const response = await fetch(this.apiUrl);
            if (!response.ok) throw new Error('Network response was not ok');
            
            const result = await response.json();
            
            let loaded = [];
            if (Array.isArray(result)) {
                loaded = result;
            } else if (result && Array.isArray(result.data)) {
                loaded = result.data;
            }

            if (loaded.length > 0) {
                this.products = loaded;
            } else {
                this.products = [...this.fallbackData];
            }
        } catch (error) {
            console.warn('API fetch unavailable. Using local fallback data.');
            this.products = [...this.fallbackData];
        }

        this.updateStockStatuses();
        return this.products;
    },

    getProducts() {
        return this.products;
    },

    /**
     * Recalculates stock status based on current quantity vs reorder level
     */
    updateStockStatuses() {
        this.products.forEach(item => {
            if (item.quantity <= 0) {
                item.status = "Out of Stock";
            } else if (item.quantity <= item.reorderLevel) {
                item.status = "Low Stock";
            } else {
                item.status = "In Stock";
            }
        });
    },

    /**
     * Filters products based on Category, Status, and Search Query
     */
    filterProducts({ category = 'all', status = 'all', query = '' }) {
        return this.products.filter(item => {
            const matchesCategory = category === 'all' || item.category.toLowerCase() === category.toLowerCase();
            const matchesStatus = status === 'all' || item.status.toLowerCase() === status.toLowerCase();
            const matchesQuery = item.name.toLowerCase().includes(query.toLowerCase()) || 
                                 item.id.toLowerCase().includes(query.toLowerCase());

            return matchesCategory && matchesStatus && matchesQuery;
        });
    },

    /**
     * Retrieves items that are low or out of stock for dashboard alerts
     */
    getLowStockProducts() {
        return this.products.filter(item => item.quantity <= item.reorderLevel);
    },

    /**
     * Aggregates total value and item count by Category for Chart.js
     */
    getCategorySummary() {
        const categories = {};
        this.products.forEach(item => {
            if (!categories[item.category]) {
                categories[item.category] = { totalValue: 0, totalQuantity: 0 };
            }
            categories[item.category].totalValue += item.price * item.quantity;
            categories[item.category].totalQuantity += item.quantity;
        });
        return categories;
    },

    /**
     * Simulates stock updates for auto-refresh feature
     */
    simulateStockChange() {
        if (this.products.length === 0) return null;

        const randomIndex = Math.floor(Math.random() * this.products.length);
        const randomDelta = Math.floor(Math.random() * 7) - 3; // Shift between -3 and +3
        const product = this.products[randomIndex];

        product.quantity = Math.max(0, product.quantity + randomDelta);
        this.updateStockStatuses();

        return product;
    },

    /**
     * Exports current data set to CSV file
     */
    exportToCSV(dataList = this.products) {
        const headers = ['SKU ID', 'Product Name', 'Category', 'Price (PHP)', 'Quantity', 'Status'];
        const rows = dataList.map(item => [
            `"${item.id}"`, 
            `"${item.name.replace(/"/g, '""')}"`, 
            `"${item.category}"`, 
            item.price.toFixed(2), 
            item.quantity, 
            `"${item.status}"`
        ]);

        const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `inventory_export_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
};