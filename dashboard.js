const API = window.APP_CONFIG.API_BASE_URL.replace(/\/$/, "");
const $ = id => document.getElementById(id);

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[c]));
}

async function api(path, options = {}) {
  const response = await fetch(API + path, {
    credentials: "include",
    ...options,
    headers: {
      ...(options.body instanceof FormData ? {} : {"Content-Type":"application/json"}),
      ...(options.headers || {})
    }
  });

  const data = await response.json().catch(() => ({}));

  if (response.status === 401) {
    location.href = "./index.html";
    throw new Error("Unauthorized.");
  }

  if (!response.ok) throw new Error(data.error || "Request failed.");

  return data;
}

async function load() {
  try {
    await api("/api/auth/me");
    const project = await api("/api/developer/projects");
    $("project").textContent = JSON.stringify(project.project, null, 2);
    await loadContent();
  } catch (error) {
    $("contentList").innerHTML = `<p class="error">${escapeHTML(error.message)}</p>`;
  }
}

async function loadContent() {
  const type = $("filter").value;
  const query = type ? "?type=" + encodeURIComponent(type) : "";
  const data = await api("/api/developer/content" + query);

  $("contentList").innerHTML = data.items.map(item => `
    <article class="item">
      <div>
        ${item.imageUrl ? `<img class="thumb" src="${escapeHTML(item.imageUrl)}" alt="">` : ""}
        <strong>${escapeHTML(item.title || "")}</strong>
        <small>${escapeHTML(item.type)} · ${item.published ? "Published" : "Unpublished"}</small>
      </div>
      <div class="actions">
        <button data-edit="${item.id}">Edit</button>
        <button data-delete="${item.id}">Delete</button>
      </div>
    </article>
  `).join("") || "<p>No content.</p>";

  document.querySelectorAll("[data-edit]").forEach(button => {
    button.addEventListener("click", () => {
      const item = data.items.find(value => value.id === button.dataset.edit);
      if (item) editItem(item);
    });
  });

  document.querySelectorAll("[data-delete]").forEach(button => {
    button.addEventListener("click", () => deleteItem(button.dataset.delete));
  });
}

function resetEditor() {
  $("contentId").value = "";
  $("imageKey").value = "";
  $("imageUrl").value = "";
  $("type").value = "opinion";
  $("title").value = "";
  $("slug").value = "";
  $("body").value = "";
  $("published").checked = false;
  $("image").value = "";
  $("imagePreview").innerHTML = "";
  $("removeImage").classList.add("hidden");
  $("editorMessage").textContent = "";
}

function showEditor() {
  $("editorPanel").classList.remove("hidden");
  window.scrollTo({top: document.body.scrollHeight, behavior:"smooth"});
}

function editItem(item) {
  showEditor();
  $("editorTitle").textContent = "Edit Content";
  $("contentId").value = item.id;
  $("imageKey").value = "";
  $("imageUrl").value = item.imageUrl || "";
  $("type").value = item.type;
  $("title").value = item.title || "";
  $("slug").value = item.slug || "";
  $("body").value = item.body;
  $("published").checked = item.published;
  $("image").value = "";

  if (item.imageUrl) {
    $("imagePreview").innerHTML = `<img class="preview" src="${escapeHTML(item.imageUrl)}" alt="">`;
    $("removeImage").classList.remove("hidden");
  } else {
    $("imagePreview").innerHTML = "";
    $("removeImage").classList.add("hidden");
  }
}

async function uploadImage(file) {
  const allowed = ["image/jpeg","image/png","image/webp","image/gif","image/avif"];
  const max = 950000;

  if (!allowed.includes(file.type)) throw new Error("Unsupported image type.");
  if (file.size > max) throw new Error("Image is too large.");

  const response = await fetch(API + "/api/developer/media", {
    method: "POST",
    credentials: "include",
    headers: {"Content-Type":file.type},
    body: file
  });

  const data = await response.json().catch(() => ({}));

  if (response.status === 401) {
    location.href = "./index.html";
    throw new Error("Unauthorized.");
  }

  if (!response.ok) throw new Error(data.error || "Image upload failed.");

  return data;
}

$("image").addEventListener("change", async () => {
  const file = $("image").files[0];
  if (!file) return;

  $("editorMessage").textContent = "Uploading image...";

  try {
    const uploaded = await uploadImage(file);
    $("imageKey").value = uploaded.key;
    $("imageUrl").value = uploaded.url;
    $("imagePreview").innerHTML = `<img class="preview" src="${escapeHTML(uploaded.url)}" alt="">`;
    $("removeImage").classList.remove("hidden");
    $("editorMessage").textContent = "Image uploaded.";
  } catch (error) {
    $("image").value = "";
    $("editorMessage").textContent = error.message;
  }
});

$("removeImage").addEventListener("click", async () => {
  const key = $("imageKey").value;
  if (key && !$("contentId").value) {
    try { await api("/api/developer/media/" + encodeURIComponent(key), {method:"DELETE"}); } catch {}
  } else if (key && $("contentId").value) {
    const current = await api("/api/developer/content?type=" + encodeURIComponent($("type").value));
    const item = current.items.find(value => value.id === $("contentId").value);
    if (!item || item.imageUrl !== $("imageUrl").value) {
      try { await api("/api/developer/media/" + encodeURIComponent(key), {method:"DELETE"}); } catch {}
    }
  }
  $("imageKey").value = "";
  $("imageUrl").value = "";
  $("image").value = "";
  $("imagePreview").innerHTML = "";
  $("removeImage").classList.add("hidden");
});

$("filter").addEventListener("change", loadContent);

$("newContent").addEventListener("click", () => {
  resetEditor();
  $("editorTitle").textContent = "New Content";
  showEditor();
});

$("cancel").addEventListener("click", () => {
  $("editorPanel").classList.add("hidden");
});

$("editor").addEventListener("submit", async event => {
  event.preventDefault();

  $("editorMessage").textContent = "";

  const id = $("contentId").value;

  const payload = {
    type: $("type").value,
    title: $("title").value,
    slug: $("slug").value,
    body: $("body").value,
    imageKey: $("imageKey").value || null,
    imageUrl: $("imageUrl").value || null,
    published: $("published").checked
  };

  try {
    await api(
      id
        ? "/api/developer/content/" + encodeURIComponent(id)
        : "/api/developer/content",
      {
        method: id ? "PUT" : "POST",
        body: JSON.stringify(payload)
      }
    );

    $("editorPanel").classList.add("hidden");
    await loadContent();
  } catch (error) {
    $("editorMessage").textContent = error.message;
  }
});

$("logout").addEventListener("click", async () => {
  try {
    await api("/api/auth/logout", {method:"POST"});
  } finally {
    location.href = "./index.html";
  }
});

load();
