const base_url = "http://localhost:8080";
const get_transactions_salesperson = base_url + "/transactions/salesperson";
const get_tran_five = base_url + "/transactions/salesperson/getFive";

const fetchAPI = async (url, method, body = null) => {
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : null,
    });
    return await res.json();
  };
  

const displayBilling = async () => {
    const transactions = await fetchAPI(get_transactions_salesperson);
    console.log(transactions);
    displayTransaction(transactions);
    displayTransactionsRight(transactions);
    const fiveTransactions = await fetchAPI(get_tran_five);
    displayInvoices(fiveTransactions);
    console.log(fiveTransactions);
}

function displayTransaction(transactions) {
    const container = document.getElementById('transaction-list'); // Assuming you have a container with this ID
    transactions.forEach(tran => {
        const listItem = document.createElement('li');
        listItem.className = 'list-group-item border-0 d-flex p-4 mb-2 bg-gray-100 border-radius-lg';

        // Customer information
        const customerInfoDiv = document.createElement('div');
        customerInfoDiv.className = 'd-flex flex-column';

        const customerName = document.createElement('h6');
        customerName.className = 'mb-3 text-sm';
        customerName.textContent = "Customer: " + tran.customer.name;

        const id = document.createElement('span');
        id.className = 'mb-2 text-xs';
        id.innerHTML = `ID: <span class="text-dark font-weight-bold ms-sm-2">${tran._id}</span>`;

        const phoneNumber = document.createElement('span');
        phoneNumber.className = 'mb-2 text-xs';
        phoneNumber.innerHTML = `Phone Number: <span class="text-dark font-weight-bold ms-sm-2">${tran.customer.phoneNumber}</span>`;

        const totalAmount = document.createElement('span');
        totalAmount.className = 'mb-2 text-xs';
        totalAmount.innerHTML = `Total Amount: <span class="text-dark font-weight-bold ms-sm-2">${tran.totalAmount}</span>`;

        const amountGiven = document.createElement('span');
        amountGiven.className = 'mb-2 text-xs';
        amountGiven.innerHTML = `Amount Given: <span class="text-dark font-weight-bold ms-sm-2">${tran.amountGiven}</span>`;

        const purchaseDate = document.createElement('span');
        purchaseDate.className = 'text-xs';
        purchaseDate.innerHTML = `Purchase Date: <span class="text-dark font-weight-bold ms-sm-2">${new Date(tran.date).toLocaleDateString()}</span>`;

        // Append customer details to div
        customerInfoDiv.appendChild(id);
        customerInfoDiv.appendChild(customerName);
        customerInfoDiv.appendChild(phoneNumber);
        customerInfoDiv.appendChild(totalAmount);
        customerInfoDiv.appendChild(amountGiven);
        customerInfoDiv.appendChild(purchaseDate);

        // Append customer info to list item
        listItem.appendChild(customerInfoDiv);

        // Append list item to container
        container.appendChild(listItem);
    });
}

function displayTransactionsRight(transactions) {
    const container = document.getElementById('transaction-list-right');

    transactions.forEach(transaction => {
        const listItem = document.createElement('li');
        listItem.className = 'list-group-item border-0 d-flex justify-content-between ps-0 mb-2 border-radius-lg';

        const leftDiv = document.createElement('div');
        leftDiv.className = 'd-flex align-items-center';

        const button = document.createElement('button');
        button.className = 'btn btn-icon-only btn-rounded btn-outline-success mb-0 me-3 btn-sm d-flex align-items-center justify-content-center';
        button.innerHTML = '<i class="fas fa-arrow-up"></i>';

        const infoDiv = document.createElement('div');
        infoDiv.className = 'd-flex flex-column';

        const productName = document.createElement('h6');
        productName.className = 'mb-1 text-dark text-sm';
        productName.textContent = transaction.products[0].product.name; // Assuming you want to display the first product's name

        const dateSpan = document.createElement('span');
        dateSpan.className = 'text-xs';
        dateSpan.textContent = `Date: ${new Date(transaction.date).toLocaleDateString()}, ${new Date(transaction.date).toLocaleTimeString()}`;

        infoDiv.appendChild(productName);
        infoDiv.appendChild(dateSpan);
        leftDiv.appendChild(button);
        leftDiv.appendChild(infoDiv);

        const amountDiv = document.createElement('div');
        amountDiv.className = 'd-flex align-items-center text-success text-gradient text-sm font-weight-bold';
        amountDiv.textContent = `$ ${transaction.totalAmount}`;

        listItem.appendChild(leftDiv);
        listItem.appendChild(amountDiv);
        container.appendChild(listItem);
    });
}

function displayInvoices(transactions) {
    const container = document.getElementById('invoice-list');

    transactions.forEach(transaction => {
        const listItem = document.createElement('li');
        listItem.className = 'list-group-item border-0 d-flex justify-content-between ps-0 mb-2 border-radius-lg';

        const leftDiv = document.createElement('div');
        leftDiv.className = 'd-flex flex-column';

        const invoiceDate = document.createElement('h6');
        invoiceDate.className = 'mb-1 text-dark font-weight-bold text-sm';
        invoiceDate.textContent = new Date(transaction.date).toLocaleDateString();

        const invoiceNumber = document.createElement('span');
        invoiceNumber.className = 'text-xs';
        invoiceNumber.textContent = `#${transaction._id}`;

        leftDiv.appendChild(invoiceDate);
        leftDiv.appendChild(invoiceNumber);

        const rightDiv = document.createElement('div');
        rightDiv.className = 'd-flex align-items-center text-sm';

        const amount = document.createTextNode(`$${transaction.totalAmount}`);
        rightDiv.appendChild(amount);

        const pdfButton = document.createElement('button');
        pdfButton.className = 'btn btn-link text-dark text-sm mb-0 px-0 ms-4';
        pdfButton.innerHTML = '<i class="fas fa-file-pdf text-lg me-1"></i> PDF';
        pdfButton.addEventListener('click', () => exportToPDF(transaction));

        rightDiv.appendChild(pdfButton);

        listItem.appendChild(leftDiv);
        listItem.appendChild(rightDiv);

        container.appendChild(listItem);
    });
}

function exportToPDF(transaction) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.text(`Transaction ID: ${transaction._id}`, 10, 10);
    doc.text(`Date: ${new Date(transaction.date).toLocaleDateString()}`, 10, 20);
    doc.text(`Total Amount: $${transaction.totalAmount}`, 10, 30);

    // Add product details
    transaction.products.forEach((product, index) => {
        doc.text(`Product ${index + 1}: ${product.product.name}, Quantity: ${product.quantity}`, 10, 40 + (index * 10));
    });

    doc.save(`Transaction-${transaction._id}.pdf`);
}

document.getElementById("view_all").addEventListener("click", async function (e) {
    e.preventDefault();
    const transactions = await fetchAPI(get_transactions_salesperson);
    const container = document.getElementById('invoice-list');
    container.innerHTML = "";
    displayInvoices(transactions);
    console.log(transactions);
});

document.addEventListener('DOMContentLoaded', (event) => {
    displayBilling();
});
