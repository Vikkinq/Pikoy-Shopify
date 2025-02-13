// Store for sales history
let salesHistory = [];
let currentOrder = [];

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    // Load sales history from localStorage if available
    const savedSales = localStorage.getItem('salesHistory');
    if (savedSales) {
        salesHistory = JSON.parse(savedSales);
        updateDashboard();
    }

    // Set up event listeners for the modal
    const modal = document.getElementById('paymentModal');
    const completeOrderBtn = document.getElementById('completeOrderBtn');
    const modalCustomerPayment = document.getElementById('modalCustomerPayment');

    completeOrderBtn.addEventListener('click', completeOrder);

    modalCustomerPayment.addEventListener('input', updateChange);

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    const clearRecordsBtn = document.querySelector('.clear-records-btn');
    if (clearRecordsBtn) {
        clearRecordsBtn.addEventListener('click', downloadAndClearRecentRecords);
    }
});

// Show/Hide Menu Functions
function showMainMenu() {
    document.getElementById('mainMenu').style.display = 'grid';
    document.getElementById('wholeOptions').style.display = 'none';
    document.getElementById('partsOptions').style.display = 'none';
    document.getElementById('soupOptions').style.display = 'none';
    document.getElementById('riceOptions').style.display = 'none';
    document.getElementById('dashboard').style.display = 'none';
}

function showOptions(type) {
    document.getElementById('mainMenu').style.display = 'none';
    document.getElementById('wholeOptions').style.display = type === 'whole' ? 'block' : 'none';
    document.getElementById('partsOptions').style.display = type === 'parts' ? 'block' : 'none';
    document.getElementById('soupOptions').style.display = type === 'soup' ? 'block' : 'none';
    document.getElementById('riceOptions').style.display = type === 'rice' ? 'block' : 'none';
}

function showDashboard() {
    document.getElementById('mainMenu').style.display = 'none';
    document.getElementById('wholeOptions').style.display = 'none';
    document.getElementById('partsOptions').style.display = 'none';
    document.getElementById('soupOptions').style.display = 'none';
    document.getElementById('riceOptions').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
    updateDashboard();
}

// Order Management
function addToOrder(itemName, price) {
    const existingItem = currentOrder.find(item => item.name === itemName);
    
    if (existingItem) {
        existingItem.quantity += 1;
        existingItem.total = existingItem.quantity * existingItem.price;
    } else {
        currentOrder.push({
            name: itemName,
            price: price,
            quantity: 1,
            total: price
        });
    }
    
    updateOrderDisplay();
}

function updateOrderDisplay() {
    const orderItems = document.getElementById('orderItems');
    orderItems.innerHTML = currentOrder.map(item => `
        <div class="order-item">
            <div class="order-item-details">
                <h3>${item.name}</h3>
                <p>₱${item.price} x ${item.quantity}</p>
            </div>
            <div class="order-item-total">₱${item.total}</div>
            <div class="quantity-controls">
                <button onclick="updateQuantity('${item.name}', -1)">-</button>
                <span>${item.quantity}</span>
                <button onclick="updateQuantity('${item.name}', 1)">+</button>
            </div>
        </div>
    `).join('');

    updateOrderSummary();
}

function updateQuantity(itemName, change) {
    const item = currentOrder.find(item => item.name === itemName);
    if (!item) return;

    item.quantity += change;
    if (item.quantity <= 0) {
        currentOrder = currentOrder.filter(i => i.name !== itemName);
    } else {
        item.total = item.quantity * item.price;
    }

    updateOrderDisplay();
}

function updateOrderSummary() {
    const subtotal = currentOrder.reduce((sum, item) => sum + item.total, 0);
    document.getElementById('subtotal').textContent = `₱${subtotal.toFixed(2)}`;
}

function clearOrder() {
    currentOrder = [];
    updateOrderDisplay();
}

function proceedToPayment() {
    if (currentOrder.length === 0) {
        alert('Please add items to your order first!');
        return;
    }

    const subtotal = currentOrder.reduce((sum, item) => sum + item.total, 0);
    document.getElementById('modalSubtotal').textContent = `₱${subtotal.toFixed(2)}`;
    document.getElementById('modalCustomerPayment').value = '';
    document.getElementById('modalChange').textContent = '₱0.00';

    document.getElementById('paymentModal').style.display = 'block';
}

function updateChange() {
    const subtotal = currentOrder.reduce((sum, item) => sum + item.total, 0);
    const customerPayment = parseFloat(document.getElementById('modalCustomerPayment').value);
    const change = isNaN(customerPayment) ? 0 : Math.max(0, customerPayment - subtotal);
    document.getElementById('modalChange').textContent = `₱${change.toFixed(2)}`;
}

function completeOrder() {
    const subtotal = currentOrder.reduce((sum, item) => sum + item.total, 0);
    const customerPayment = parseFloat(document.getElementById('modalCustomerPayment').value);

    if (isNaN(customerPayment) || customerPayment < subtotal) {
        alert('Please enter a valid payment amount that covers the total.');
        return;
    }

    const change = customerPayment - subtotal;
    const tax = subtotal * 0.05;
    const total = subtotal + tax;

    // Create sales record
    const sale = {
        date: new Date().toLocaleString(),
        items: currentOrder.map(item => `${item.name} x${item.quantity}`).join(', '),
        total: total,
        subtotal: subtotal,
        tax: tax,
        customerPayment: customerPayment,
        change: change
    };

    // Add to sales history
    salesHistory.unshift(sale);
    
    // Save to localStorage
    localStorage.setItem('salesHistory', JSON.stringify(salesHistory));

    // Update dashboard if visible
    updateDashboard();

    // Print receipt
    printReceipt(sale);

    // Clear current order
    clearOrder();

    // Close modal
    document.getElementById('paymentModal').style.display = 'none';

    alert('Order completed successfully!');
}

function printReceipt(sale) {
    const receiptWindow = window.open('', '_blank');
    receiptWindow.document.write(`
        <html>
        <head>
            <title>Receipt</title>
            <style>
                body { font-family: Arial, sans-serif; }
                .receipt { width: 300px; margin: 0 auto; }
                .header { text-align: center; margin-bottom: 20px; }
                .item { display: flex; justify-content: space-between; margin-bottom: 5px; }
                .total { border-top: 1px solid black; margin-top: 10px; padding-top: 10px; }
            </style>
        </head>
        <body>
            <div class="receipt">
                <div class="header">
                    <h2>Pikoy's Fried Chicken</h2>
                    <p>${sale.date}</p>
                </div>
                <div class="items">
                    ${sale.items.split(', ').map(item => `
                        <div class="item">
                            <span>${item}</span>
                            <span>₱${(currentOrder.find(i => `${i.name} x${i.quantity}` === item).total).toFixed(2)}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="total">
                    <div class="item"><strong>Subtotal:</strong> <span>₱${sale.subtotal.toFixed(2)}</span></div>
                    <div class="item"><strong>Tax:</strong> <span>₱${sale.tax.toFixed(2)}</span></div>
                    <div class="item"><strong>Total:</strong> <span>₱${sale.total.toFixed(2)}</span></div>
                    <div class="item"><strong>Payment:</strong> <span>₱${sale.customerPayment.toFixed(2)}</span></div>
                    <div class="item"><strong>Change:</strong> <span>₱${sale.change.toFixed(2)}</span></div>
                </div>
                <div class="header">
                    <p>Thank you for your purchase!</p>
                </div>
            </div>
        </body>
        </html>
    `);
    receiptWindow.document.close();
    receiptWindow.print();
}

function updateDashboard() {
    // Update today's sales
    const today = new Date().toLocaleDateString();
    const todaySales = salesHistory
        .filter(sale => new Date(sale.date).toLocaleDateString() === today)
        .reduce((sum, sale) => sum + sale.total, 0);
    
    document.getElementById('todaySales').textContent = todaySales.toFixed(2);
    document.getElementById('totalOrders').textContent = salesHistory.length;

    // Update sales history table
    const salesHistoryTable = document.getElementById('salesHistory');
    salesHistoryTable.innerHTML = salesHistory.map(sale => `
        <tr>
            <td>${sale.date}</td>
            <td>${sale.items}</td>
            <td>₱${sale.total.toFixed(2)}</td>
        </tr>
    `).join('');
}


function downloadAndClearRecentRecords() {
    if (!confirm("Are you sure you want to download and clear all records from the last 24 hours?")) {
        return;
    }

    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentRecords = salesHistory.filter(sale => new Date(sale.date) >= twentyFourHoursAgo);
    const recordsToKeep = salesHistory.filter(sale => new Date(sale.date) < twentyFourHoursAgo);

    if (recentRecords.length === 0) {
        alert("No records found in the last 24 hours.");
        return;
    }

    // Download CSV
    downloadCSV(recentRecords);

    // Clear recent records
    salesHistory = recordsToKeep;
    localStorage.setItem('salesHistory', JSON.stringify(salesHistory));
    updateDashboard();

    alert("Records from the last 24 hours have been downloaded and cleared.");
}

function downloadCSV(records) {
    const headers = ['Date', 'Items', 'Subtotal', 'Tax', 'Total', 'Customer Payment', 'Change'];
    const csvContent = [
        headers.join(','),
        ...records.map(record => [
            record.date,
            `"${record.items}"`,
            record.subtotal.toFixed(2),
            record.tax.toFixed(2),
            record.total.toFixed(2),
            record.customerPayment.toFixed(2),
            record.change.toFixed(2)
        ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `sales_records_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// Initialize with main menu
showMainMenu();

