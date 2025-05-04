const base_url = "http://localhost:8080";

const get_all_products = base_url + "/products";
const add_product = base_url + "/products";
const update_product = base_url + "/products";
const delete_product = base_url + "/products";
const get_product_byid = base_url + "/products";

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
                  <button class="btn btn-danger product-remove-btn" data-product-id="${product._id}">Remove</button>
                  <button class="btn btn-primary product-update-btn" data-product-id="${product._id}">Update</button>
                </div>
            `;
        productsContainer.appendChild(productDiv);
      }
    });
    addEventListenersToRemoveAndUpdateButtons();
  } catch (error) {
    console.error("Error:", error);
  }
};

function addEventListenersToRemoveAndUpdateButtons() {
  document.querySelectorAll('.product-remove-btn').forEach(button => {
    button.addEventListener('click', () => confirmRemove(button.getAttribute('data-product-id')));
  });

  document.querySelectorAll('.product-update-btn').forEach(button => {
    button.addEventListener('click', () => showUpdateForm(button.getAttribute('data-product-id')));
  });
}

displayProducts(); // Call the function to display products

document.getElementById("addProduct").addEventListener("submit", function (e) {
  e.preventDefault();
  const name = document.getElementById("name").value;
  const importPrice = document.getElementById("import-price").value;
  const retailPrice = document.getElementById("retail-price").value;
  const quantity = document.getElementById("quantity").value;
  const category = document.getElementById("category").value;
  const image = document.getElementById("image").files[0];

  const formData = new FormData();
  formData.append("name", name);
  formData.append("importPrice", importPrice);
  formData.append("retailPrice", retailPrice);
  formData.append("quantity", quantity);
  formData.append("category", category);
  formData.append("image", image);
  fetchAPI(add_product, "POST", formData).then((data) => {
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
        text: "Add product successfully!",
        icon: "success",
        button: "OK",
      });
      displayProducts();
    }
  });
});

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

function confirmRemove(productId) {
  swal({
    title: "Are you sure?",
    text: "Do you really want to remove this product?",
    icon: "warning",
    buttons: true,
    dangerMode: true,
  }).then((willDelete) => {
    if (willDelete) {
      handleRemove(productId);
    }
  });
}

async function showUpdateForm(productId) {
  try {
    const productData = await fetchAPI2(`${update_product}/${productId}`, "GET");
    console.log(productData);

    document.getElementById("name_update").value = productData.name;
    document.getElementById("retail_price_update").value = productData.retailPrice;
    document.getElementById("import_price_update").value = productData.importPrice;
    document.getElementById("quantity_update").value = productData.quantity;
    document.getElementById("category_update").value = productData.category;
    document.getElementById("image_update").value = "";

    document.getElementById("updateProduct").setAttribute("data-product-id", productId);

    let updateProductModal = new bootstrap.Modal(document.getElementById("updateProductModal"));
    updateProductModal.show();
  } catch (error) {
    console.error("Error fetching product data:", error);
  }
}

document
  .getElementById("updateProduct")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    const productId = this.getAttribute("data-product-id");
    const formData = new FormData(this);
    const {name_update, retail_price_update, import_price_update, quantity_update, category_update} = Object.fromEntries(formData.entries());
    const formData_submit = new FormData();
    formData_submit.append("name", name_update);
    formData_submit.append("importPrice", import_price_update);
    formData_submit.append("retailPrice", retail_price_update);
    formData_submit.append("quantity", quantity_update);
    formData_submit.append("category", category_update);
    formData_submit.append("image", document.getElementById("image_update").files[0]);
    // Here you can call your API to update the product
    updateProduct(productId, formData_submit);
  });

async function updateProduct(productId, formData) {
  try {
    // Call your API to update the product (adjust the URL as needed)
    fetchAPI(
      `${update_product}/${productId}`,
      "PATCH",
      formData
    ).then((data) => {
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
          text: "Update product successfully!",
          icon: "success",
          button: "OK",
        });
        displayProducts();
      }
    });
  } catch (error) {
    console.error("Error updating product:", error);
  }
}

function handleRemove(productId) {
  fetchAPI2(`${delete_product}/${productId}`, "DELETE").then((data) => {
    console.log(data);
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
        text: "Remove product successfully!",
        icon: "success",
        button: "OK",
      });
      displayProducts();
    }
  });
}

// function handleUpdate(formData) {
//   // Your logic to update the product
//   console.log("Update product:", formData.get("id"));
//   // After updating, refresh the products list
//   displayProducts();
// }
