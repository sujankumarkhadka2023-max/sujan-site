const API = window.APP_CONFIG.API_BASE_URL.replace(/\/$/, "");

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[c]));
}

async function request(path) {
  const response = await fetch(API + path);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Request failed.");
  return data;
}

function render(items, targetId) {
  const target = document.getElementById(targetId);

  if (!items.length) {
    target.innerHTML = "";
    return;
  }

  target.innerHTML = items.map(item => `
    <article class="card">
      ${item.imageUrl ? `<img class="article-image" src="${escapeHTML(item.imageUrl)}" alt="">` : ""}
      <h2>${escapeHTML(item.title || "")}</h2>
      <div class="body">${escapeHTML(item.body).replace(/\n/g, "<br>")}</div>
    </article>
  `).join("");
}

async function loadContent(type, targetId) {
  const target = document.getElementById(targetId);

  try {
    const data = await request("/api/public/" + type);
    render(data.items, targetId);
  } catch (error) {
    target.innerHTML = `<p class="error">${escapeHTML(error.message)}</p>`;
  }
}

async function loadLatest(targetId) {
  const target = document.getElementById(targetId);

  try {
    const [opinion, news] = await Promise.all([
      request("/api/public/opinion"),
      request("/api/public/news")
    ]);

    const items = [...opinion.items, ...news.items]
      .sort((a, b) => b.updatedAt - a.updatedAt);

    render(items, targetId);
  } catch (error) {
    target.innerHTML = `<p class="error">${escapeHTML(error.message)}</p>`;
  }
}
