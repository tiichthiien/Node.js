const base_url = "http://localhost:8080";

const api_login = base_url + "/login";
const forgot_password = base_url + "/recover-password";

const fetchAPI = async (url, method, body = null) => {
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : null,
  });
  return await res.json();
};

document.getElementById("login-form").addEventListener("submit", function (e) {
  e.preventDefault();
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  logInFunction(username, password);
});

document
  .getElementById("forgot-password-form")
  .addEventListener("submit", function (e) {
    e.preventDefault();
    const email = document.getElementById("email").value;
    fetchAPI(forgot_password, "POST", { email }).then((data) => {
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
          text: data.message,
          icon: "success",
          button: "OK",
        });
      }
    });
  });

const logInFunction = (username, password) => {
  fetchAPI(api_login, "POST", { username, password }).then((data) => {
    if (data.error) {
      swal({
        title: "Error!",
        text: data.error,
        icon: "error",
        button: "OK",
      });
    } else {
      window.location.href = "/pages/profile";
    }
  });
};
