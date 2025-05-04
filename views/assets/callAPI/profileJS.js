const base_url = "http://localhost:8080";

const get_profile = base_url + "/profile";
const update_avatar = base_url + "/upload-avatar";
const update_profile = base_url + "/update-profile";
const get_new_salesperson = base_url + "/new-salesperson";

const fetchAPI = async (url, method, body = null) => {
    try {
        const res = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: body ? JSON.stringify(body) : null
        });

        if (!res.ok) {
            throw new Error(`HTTP error! Status: ${res.status}`);
        }

        const data = await res.json();
        return data;
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
    }
};

const displayProfile = async () => {
    try {
        const profileData = await fetchAPI(get_profile, "GET");
        const imageElement = document.getElementById('profileImage');
        const name = document.getElementById('name');
        const role = document.getElementById('role');
        const fullNameInput = document.getElementById('fullNameInput');
        const passwordInput = document.getElementById('passwordField');
        const email = document.getElementById('email');

        email.innerHTML = profileData.email;
        passwordInput.value = profileData.password;
        fullNameInput.value = profileData.fullname;
        name.innerHTML = profileData.fullname;
        role.innerHTML = profileData.role;
        imageElement.src = profileData.profilePicture;
    } catch (error) {
        console.error("Error:", error);
    }
};

displayProfile();

document.getElementById('editProfileIcon').addEventListener('click', function () {
    console.log('Edit profile icon clicked');
    // Make input fields editable
    let fullNameInput = document.getElementById('fullNameInput');
    let mobileInput = document.getElementById('mobileInput');
    // Add more fields as necessary

    fullNameInput.removeAttribute('readonly');
    mobileInput.removeAttribute('readonly');
    // Remove 'readonly' from other fields as necessary

    // Focus on the 'Full Name' field
    fullNameInput.focus();
});

const updateAvatar = async (event) => {
    let file = event.target.files[0];
    let reader = new FileReader();
    reader.onload = async function (e) {
        const formData = new FormData();
        formData.append('image', file);
        fetch(update_avatar, {
            method: 'PATCH',
            body: formData
        }).then(res => res.json())
            .then(data => {
                if (data.error) {
                    swal({
                        title: "Error!",
                        text: data.error,
                        icon: "error",
                        button: "OK",
                    });
                } else {
                    document.getElementById("profileImage").src = e.target.result;
                    swal({
                        title: "Success!",
                        text: "Upload avatar successfully",
                        icon: "success",
                        button: "OK",
                    });
                }
            });
    }
    reader.readAsDataURL(file);
    displayProfile();
}

document.getElementById('editProfileIcon').addEventListener('click', function() {
    let fullNameInput = document.getElementById('fullNameInput');
    let passwordField = document.getElementById('passwordField');
    let saveIcon = document.getElementById('saveProfileIcon');

    // Remove the 'readonly' attribute to make the fields editable
    fullNameInput.removeAttribute('readonly');
    passwordField.removeAttribute('readonly');

    // Add 'form-control' class to make it look like a regular input field
    fullNameInput.classList.add('form-control');
    passwordField.classList.add('form-control');

    // Remove 'form-control-plaintext' class to change appearance to editable
    fullNameInput.classList.remove('form-control-plaintext');
    passwordField.classList.remove('form-control-plaintext');

    // Show the 'Save' icon
    saveIcon.style.display = 'inline';

    // Hide the 'Edit' icon
    this.style.display = 'none';

    // Focus on the 'Full Name' input
    fullNameInput.focus();
    document.getElementById('saveProfileIcon').style.display = 'inline';
    this.style.display = 'none';
});

// Listener for the password visibility toggle
document.getElementById('togglePasswordVisibility').addEventListener('click', function() {
    let passwordField = document.getElementById('passwordField');
    if (passwordField.type === 'password') {
        passwordField.type = 'text';
        this.classList.remove('fa-eye');
        this.classList.add('fa-eye-slash');
    } else {
        passwordField.type = 'password';
        this.classList.remove('fa-eye-slash');
        this.classList.add('fa-eye');
    }
});

document.getElementById('saveProfileIcon').addEventListener('click', function() {
    let fullNameInput = document.getElementById('fullNameInput');
    let passwordField = document.getElementById('passwordField');
    let email = document.getElementById('email');
    // Make the fields read-only again
    fullNameInput.setAttribute('readonly', true);
    passwordField.setAttribute('readonly', true);

    // Switch the input classes back to 'form-control-plaintext'
    fullNameInput.classList.remove('form-control');
    passwordField.classList.remove('form-control');
    fullNameInput.classList.add('form-control-plaintext');
    passwordField.classList.add('form-control-plaintext');

    // Hide the 'Save' icon and show the 'Edit' icon
    document.getElementById('editProfileIcon').style.display = 'inline';
    this.style.display = 'none';

    // Here you should also handle the saving of the data, for example, sending it to the server
    let data = {
        fullname: fullNameInput.value,
        password: passwordField.value,
        email: email.innerHTML
    }
    fetch(update_profile, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }).then(res => res.json())
        .then(data => {
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
                    text: "Update profile successfully",
                    icon: "success",
                    button: "OK",
                });
            }
        });
});

const displayNewSalesperson = async () => {
    try {
        const usersData = await fetchAPI(get_new_salesperson, "GET");
        // Assuming `usersList` is the id of the ul element where you want to display the users
        const usersList = document.getElementById('usersList');
        usersList.innerHTML = ''; // Clear existing list

        usersData.forEach(user => {
            usersList.innerHTML += `
                <li class="list-group-item border-0 d-flex align-items-center px-0 mb-2">
                    <div class="avatar me-3">
                        <img src="${user.profilePicture}" alt="${user.fullname}" class="border-radius-lg shadow">
                    </div>
                    <div class="d-flex align-items-start flex-column justify-content-center">
                        <h6 class="mb-0 text-sm">${user.fullname}</h6>
                        <p class="mb-0 text-xs">${user.email}</p>
                    </div>
                </li>
            `;
        });
    } catch (error) {
        console.error("Error:", error);
    }
};

displayNewSalesperson()