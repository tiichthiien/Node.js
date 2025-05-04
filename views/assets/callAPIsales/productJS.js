const base_url = "http://localhost:8080";

const get_all_products = base_url + "/products";
const add_product = base_url + "/products";
const create_transaction = base_url + "/transactions";
const get_tran_byId = base_url + "/transactions/getById";

const fetchAPI = async (url, method, body = null) => {
  const headers = {};

  // Check if the body is an instance of FormData
  if (!(body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(body);
  }

  const res = await fetch(url, {
    method,
    headers,
    body: body,
  });
  return await res.json();
};

const fetchAPI2 = async (url, method, body = null) => {
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : null,
  });
  return await res.json();
};

const barcodeInput = document.querySelector("input[placeholder='Barcode']");
const nameInput = document.querySelector("input[placeholder='Name']");

const filterAndDisplayProducts = async () => {
  const barcode = barcodeInput.value;
  const name = nameInput.value;
  displayProducts(barcode, name);
};

barcodeInput.addEventListener("input", filterAndDisplayProducts);
nameInput.addEventListener("input", filterAndDisplayProducts);

const displayProducts = async (barcode = "", name = "") => {
  try {
    const products = await fetchAPI2(get_all_products, "GET");
    const productsContainer = document.querySelector(".grid.grid-cols-4.gap-4");
    productsContainer.innerHTML = "";

    products.forEach((product) => {
      const productNameLower = product.name.toLowerCase();
      const nameLower = name.toLowerCase();
      if ((barcode && product.barcode.includes(barcode)) || (name && productNameLower.includes(nameLower)) || (!barcode && !name)) {
        const productDiv = document.createElement("div");
        productDiv.className =
          "product p-3 space-y-4 bg-white border cursor-pointer group rounded-xl";
        productDiv.setAttribute("data-id", product._id);
        productDiv.innerHTML = `
                <img src="${product.image}" alt="${
          product.name
        }" class="product-image">
                <div class="product-details">
                    <h2 class="product-title">${product.name}</h2>
                    <p class="product-brand">${product.barcode}</p>
                    <p class="product-brand">${product.category}</p>
                    <p class="product-price">$${product.retailPrice.toFixed(
                      2
                    )}</p>
                    <p class="product-brand">Quantity: ${product.quantity}</p>
                </div>
                <div class="product-actions hidden">
                    <button class="product-add-to-cart-btn">Add to Cart</button>
                </div>
            `;
        productsContainer.appendChild(productDiv);
      }
    });
    addEventListenersToCartButtons();
  } catch (error) {
    console.error("Error:", error);
  }
};

displayProducts(); // Call the function to display products

const addEventListenersToCartButtons = () => {
  document.querySelectorAll(".product-add-to-cart-btn").forEach((button) => {
    button.addEventListener("click", addToCart);
  });
};

const deleteProduct = async (productId) => {
  try {
    const delete_product = base_url + "/products/" + productId;
    fetchAPI(delete_product, "DELETE").then((data) => {
      if (data.error) {
        swal({
          title: "Error!",
          text: data.error,
          icon: "error",
          button: "OK",
        });
      } else {
        swal({
          title: "Success!",
          text: "Delete product successfully",
          icon: "success",
          button: "OK",
        });
        displayProducts();
      }
    });
  } catch (error) {
    console.error("Error:", error);
  }
};

const updateProduct = async (productId) => {
  try {
    const update_product = base_url + "/products/" + productId;
    fetchAPI(update_product, "PATCH").then((data) => {
      if (data.error) {
        swal({
          title: "Error!",
          text: data.error,
          icon: "error",
          button: "OK",
        });
      } else {
        displayProducts();
      }
    });
  } catch (error) {
    console.error("Error:", error);
  }
};

// Add to Cart
document.querySelectorAll(".product-add-to-cart-btn").forEach((button) => {
  button.addEventListener("click", addToCart);
});

function addToCart(event) {
  const productElement = event.target.closest(".product");
  const productId = productElement.getAttribute("data-id");
  const productName =
    productElement.querySelector(".product-title").textContent;
  const productPrice = parseFloat(
    productElement.querySelector(".product-price").textContent.replace("$", "")
  );

  const cartContainer = document.querySelector(".cart-items-container");
  let cartItem = cartContainer.querySelector(`[data-id="${productId}"]`);

  if (cartItem) {
    const quantityElement = cartItem.querySelector(".cart-item-quantity");
    quantityElement.value = parseInt(quantityElement.value) + 1;
    updateItemTotal(cartItem, productPrice);
  } else {
    cartItem = document.createElement("div");
    cartItem.classList.add("cart-item");
    cartItem.setAttribute("data-id", productId);
    cartItem.innerHTML = `
    <span class="cart-item-name">${productName}</span>
    <span class="cart-item-price">$${productPrice}</span>
    <input class="cart-item-quantity" type="number" value="1" min="1">
    <span class="cart-item-total-price">$${productPrice}</span>
    <button class="cart-item-remove-btn">Remove</button>
`;
    cartContainer.appendChild(cartItem);
    const removeBtn = cartItem.querySelector(".cart-item-remove-btn");
    removeBtn.addEventListener("click", (e) => removeFromCart(e, productId));

    const quantityInput = cartItem.querySelector(".cart-item-quantity");
    quantityInput.addEventListener("change", (e) => {
      updateItemTotal(cartItem, productPrice);
      updateTotal();
    });
  }

  updateTotal();
}

function updateItemTotal(cartItem, productPrice) {
  const quantity = parseInt(
    cartItem.querySelector(".cart-item-quantity").value
  );
  const total = productPrice * quantity;
  cartItem.querySelector(
    ".cart-item-total-price"
  ).textContent = `$${total.toFixed(2)}`;
}

function removeFromCart(event, productId) {
  const cartItem = event.target.closest(".cart-item");
  if (cartItem) {
    cartItem.remove();
  }
  updateTotal();
}

function updateTotal() {
  const totalElement = document.querySelector(".total-amount");
  const cartItems = document.querySelectorAll(".cart-item");
  let total = 0;

  cartItems.forEach((item) => {
    const price = parseFloat(
      item.querySelector(".cart-item-price").textContent.replace("$", "")
    );
    const quantity = parseInt(item.querySelector(".cart-item-quantity").value);
    total += price * quantity;
  });

  totalElement.textContent = total.toFixed(2);
}

document.addEventListener("DOMContentLoaded", function () {
  // Get the button and the modal elements
  var addNewButton = document.getElementById("add-new");
  var addUserModal = new bootstrap.Modal(
    document.getElementById("addUserModal")
  );

  // Add click event listener to the button
  addNewButton.addEventListener("click", function () {
    // Show the modal
    addUserModal.show();
  });
});

document.getElementById("checkoutButton").addEventListener("click", () => {
  var checkoutModal = new bootstrap.Modal(
    document.getElementById("checkoutModal")
  );
  const totalAmount = parseFloat(
    document.querySelector(".total-amount").textContent
  );
  document.getElementById("total-amount-form").textContent =
    "Total: $" + totalAmount;
  checkoutModal.show();
});

function getCartItems() {
  const cartItems = document.querySelectorAll(".cart-item");
  const products = [];

  cartItems.forEach((item) => {
    const productId = item.getAttribute("data-id");
    const quantity = parseInt(item.querySelector(".cart-item-quantity").value);
    products.push({ product: productId, quantity: quantity });
  });

  return products;
}

const fetchAPI3 = async (url, method, body = null) => {
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : null,
  });

  const data = await res.json();

  return { status: res.status, data };
};

const fetchAPI_tran = async (url, method, body = null) => {
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : null,
  });
  return await res.json();
};

document
  .getElementById("checkoutForm")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    const totalAmount = parseFloat(
      document.querySelector(".total-amount").textContent
    );
    const phoneNumber = document.getElementById("phone-number").value;
    const amountGiven = parseFloat(
      document.getElementById("amount-given").value
    );
    const nameCustomer = document.getElementById("name_customer").value;
    const address = document.getElementById("address").value;

    const products = getCartItems(); // Ensure this function returns the correct format

    let data = {
      phoneNumber,
      totalAmount,
      amountGiven,
      products, // Should be an array of { product: productId, quantity: quantity }
    };

    // Conditionally add name and address if their fields are visible
    if (
      document.getElementById("name-address-group").style.display === "block"
    ) {
      data.name = nameCustomer;
    }
    if (document.getElementById("address-group").style.display === "block") {
      data.address = address;
    }

    fetchAPI3(create_transaction, "POST", data).then( async (response) => {
      if (response.status === 404) {
        swal(
          "Customer does not exists",
          "Please input name and address to create new customer"
        );
        addCustomerDetailsFields();
      } else if (response.data.error) {
        // Handling other errors
        console.error(response.data.error);
      } else {
        // Success handling
        swal({
          title: "Success!",
          text: "Checkout successfully",
          icon: "success",
          button: "OK",
        });
        console.log(response.data);
        const transaction = await fetchAPI_tran(get_tran_byId + "/" + response.data._id, "GET");
        exportToPDF(transaction);
        document.getElementById("phone-number").value = "";
        document.getElementById("amount-given").value = "";
        document.getElementById("name_customer").value = "";
        document.getElementById("address").value = "";

        document.getElementById("name-address-group").style.display = "none";
        document.getElementById("address-group").style.display = "none";

        clearCart();

        document.getElementById("total-amount-form").textContent =
          "Total: $0.00";

        displayProducts();
      }
    });
  });

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

function clearCart() {
  const cartContainer = document.querySelector(".cart-items-container");
  cartContainer.innerHTML = "";

  const totalAmountElement = document.querySelector(".total-amount");
  totalAmountElement.textContent = "0.00";
}

document.getElementById("amount-given").addEventListener("input", function () {
  const totalAmount = parseFloat(
    document
      .getElementById("total-amount-form")
      .textContent.replace("Total: $", "")
  );
  const amountGiven = parseFloat(this.value);

  if (amountGiven < totalAmount) {
    document.querySelector(
      '#checkoutForm button[type="submit"]'
    ).style.display = "none";
  } else {
    document.querySelector(
      '#checkoutForm button[type="submit"]'
    ).style.display = "block";
  }
});

function addCustomerDetailsFields() {
  var nameAddressGroup = document.getElementById("name-address-group");
  var addressGroup = document.getElementById("address-group");
  nameAddressGroup.style.display = "block";
  addressGroup.style.display = "block";
  document.getElementById("name_customer").setAttribute("required", "");
  document.getElementById("address").setAttribute("required", "");
}

function hideCustomerDetailsFields() {
  var nameAddressGroup = document.getElementById("name-address-group");
  var addressGroup = document.getElementById("address-group");
  nameAddressGroup.style.display = "none";
  addressGroup.style.display = "none";
  document.getElementById("name_customer").removeAttribute("required");
  document.getElementById("address").removeAttribute("required");
}

hideCustomerDetailsFields();
