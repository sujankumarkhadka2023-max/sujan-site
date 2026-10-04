const API = window.APP_CONFIG.API_BASE_URL.replace(/\/$/, "");

document.getElementById("loginForm").addEventListener("submit", async event => {
  event.preventDefault();

  const message = document.getElementById("message");
  message.textContent = "";

  try {
    const response = await fetch(API + "/api/auth/login", {
      method: "POST",
      credentials: "include",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({
        email: document.getElementById("email").value,
        password: document.getElementById("password").value
      })
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) throw new Error(data.error || "Login failed.");

    location.href = "./dashboard.html";
  } catch (error) {
    message.textContent = error.message;
  }
});
