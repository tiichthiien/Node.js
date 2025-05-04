const base_url = "http://localhost:8080";

const get_all_users = base_url + "/users";
const get_detail_user = base_url + "/users/:id";
const toggle_lock = base_url + "/toggle-lock/:id";
const resend_email = base_url + "/resend-email/:id";
const add_user = base_url + "/add-user";

const fetchAPI = async (url, method, body = null) => {
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : null,
    });
    return await res.json();
  };

const displayUsers = async () => {
  try {
    const usersData = await fetchAPI(get_all_users, "GET");
    const tableBody = document.getElementById("usersTableBody");
    tableBody.innerHTML = ""; // Clear existing content

    usersData.forEach((user) => {
      // Determine status badge based on user status
      const statusBadge = user.status === 'online'
        ? "bg-gradient-success"
        : "bg-gradient-secondary";
      
      const activeBadge = user.isActive
        ? "bg-gradient-success"
        : "bg-gradient-secondary";

      const lockBadge = user.isLocked
        ? "bg-gradient-danger"
        : "bg-gradient-success";
      const lockStatus = user.isLocked ? "Locked" : "Unlocked";
      const activeStatus = user.isActive ? "Active" : "Inactive";

      // Create the table row with the new structure
      const row = `
                <tr>
                    <td>
                        <div class="d-flex px-2 py-1">
                            <div>
                                <img src="${
                                  user.profilePicture
                                }" class="avatar avatar-sm me-3" alt="profile picture">
                            </div>
                            <div class="d-flex flex-column justify-content-center">
                                <h6 class="mb-0 text-sm">${user.fullname}</h6>
                                <p class="text-xs text-secondary mb-0">${
                                  user.email
                                }</p>
                            </div>
                        </div>
                    </td>
                    <td>
                        <p class="text-xs font-weight-bold mb-0">${
                          user.role
                        }</p>
                    </td>
                    <td class="align-middle text-center text-sm">
                        <span class="badge badge-sm ${statusBadge}">${
        user.status
      }</span>
                    </td>
                    <td class="align-middle text-center text-sm">
                        <span class="badge badge-sm ${activeBadge}">${activeStatus}</span>
                    </td>
                    <td class="align-middle text-center text-sm">
                        <span class="badge badge-sm ${lockBadge}">${lockStatus}</span>
                    </td>
                    <td class="align-middle text-center">
                        <span class="text-secondary text-xs font-weight-bold">${new Date(
                          user.creationDate
                        ).toLocaleDateString()}</span>
                    </td>
                    <td>
                        <!-- Dropdown Menu -->
                        <div class="dropdown">
                            <button class="btn btn-secondary dropdown-toggle"
                                    type="button"
                                    data-bs-toggle="dropdown" aria-expanded="false">
                                ...
                            </button>
                            <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton">
                                <li><a class="dropdown-item" href="javascript:;" data-user-id="${
                                  user._id
                                }" onclick="handleDropdownItemClick(event, 'Detail')">Detail</a></li>
                                <li><a class="dropdown-item" href="javascript:;" data-user-id="${
                                  user._id
                                }" onclick="handleDropdownItemClick(event, 'Resend Email')">Resend Email</a></li>
                                <li><a class="dropdown-item" href="javascript:;" data-user-id="${
                                  user._id
                                }" onclick="handleDropdownItemClick(event, 'Lock/Unlock')">Lock/Unlock</a></li>
                            </ul>
                        </div>
                    </td>
                </tr>
            `;

      // Append the row to the table body
      tableBody.innerHTML += row;
    });
  } catch (error) {
    console.error("Error:", error);
  }
};

function showDropdown(element) {
  // Toggle the dropdown menu visibility
  const dropdownMenu = element.nextElementSibling;
  dropdownMenu.style.display =
    dropdownMenu.style.display === "none" || dropdownMenu.style.display === ""
      ? "block"
      : "none";
}

displayUsers();

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

function handleDropdownItemClick(event, action) {
  const userId = event.target.getAttribute("data-user-id");

  switch (action) {
    case "Detail":
      // Handle 'Detail' action
      break;
    case "Resend Email":
      fetchAPI(resend_email.replace(":id", userId), "POST").then((data) => {
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
            text: "Resend email successfully",
            icon: "success",
            button: "OK",
          });
          displayUsers();
        }
      });
      break;
    case "Lock/Unlock":
      fetchAPI(toggle_lock.replace(":id", userId), "PATCH").then((data) => {
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
            text: "Toggle lock successfully",
            icon: "success",
            button: "OK",
          });
          displayUsers();
        }
      });
      break;
    default:
      console.log("Unknown action");
  }
}

document
  .getElementById("addUserForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();
    const fullname = document.getElementById("fullname").value;
    const email = document.getElementById("email").value;
    fetchAPI(add_user, "POST", { fullname, email }).then((data) => {
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
          text: "Add user successfully",
          icon: "success",
          button: "OK",
        });
        displayUsers();
      }
    });
  });
