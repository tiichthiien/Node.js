const base_url = "http://localhost:8080";

const change_password = base_url + "/change-first-password";

const fetchAPI = async (url, method, body = null) => {
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : null,
  });
  return await res.json();
};

document
  .getElementById("change-first-password-form")
  .addEventListener("submit", function (e) {
    e.preventDefault();
    const password = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    if (password !== confirmPassword) {
      swal({
        title: "Error!",
        text: "Password and confirm password must be the same!",
        icon: "error",
        button: "OK",
      });
    } else {
      fetchAPI(change_password, "PATCH", { newPassword : password }).then((data) => {
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
            text: "Change password successfully!",
            icon: "success",
            button: "OK",
          });
          window.location.href = "/pages/profile";
        }
      });
    }
  });
