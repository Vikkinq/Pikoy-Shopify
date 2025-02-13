// Function to clear sales records within the last 24 hours
function clear24HourData() {
    const now = new Date();
    const filteredSales = salesHistory.filter(sale => {
        const saleDate = new Date(sale.date);
        const diffHours = (now - saleDate) / (1000 * 60 * 60);
        return diffHours > 24;
    });

    salesHistory = filteredSales;
    localStorage.setItem('salesHistory', JSON.stringify(salesHistory));
    updateDashboard();
    alert('Sales data from the last 24 hours has been cleared.');
}

// Function to calculate change based on customer payment
function calculateChange(payment, total) {
    const change = payment - total;
    document.getElementById('change').textContent = `₱${change.toFixed(2)}`;
}

// Modified completeOrder function to handle customer payment and change
function completeOrder() {
    if (currentOrder.length === 0) {
        alert('Please add items to your order first!');
        return;
    }

    const subtotal = currentOrder.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * 0.05;
    const total = subtotal;

    const paymentInput = document.getElementById('customerPayment');
    const payment = parseFloat(paymentInput.value);

    if (isNaN(payment) || payment < total) {
        alert('Invalid payment amount. Please enter a sufficient payment.');
        return;
    }

    calculateChange(payment, total);

    // Create sales record
    const sale = {
        date: new Date().toLocaleString(),
        items: currentOrder.map(item => `${item.name} x${item.quantity}`).join(', '),
        total: total,
        subtotal: subtotal,
        tax: tax
    };

    // Add to sales history
    salesHistory.unshift(sale);
    localStorage.setItem('salesHistory', JSON.stringify(salesHistory));
    updateDashboard();
    clearOrder();
    alert('Order completed successfully!');
}
