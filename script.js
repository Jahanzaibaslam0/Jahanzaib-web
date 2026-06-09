const brandName = "ZilHajj Cattle Farm";

const mainNav = [
  { label: "Home", href: "index.html", pages: ["home"] },
  {
    label: "Animals",
    href: "animals.html",
    pages: ["animals", "cow", "buffalo", "goat", "sheep", "horse"],
  },
  { label: "Contact", href: "contact.html", pages: ["contact"] },
  { label: "Inquiry", href: "inquiry.html", pages: ["inquiry"] },
  { label: "Gallery", href: "gallery.html", pages: ["gallery", "images", "videos"] },
  { label: "Preferences", href: "preferences.html", pages: ["preferences"] },
  { label: "Admin", href: "admin.html", pages: ["admin"] },
];

const animalNav = [
  { label: "Cow", href: "cow.html", pages: ["cow"] },
  { label: "Buffalo", href: "buffalo.html", pages: ["buffalo"] },
  { label: "Goat", href: "goat.html", pages: ["goat"] },
  { label: "Sheep", href: "sheep.html", pages: ["sheep"] },
  { label: "Horse", href: "horse.html", pages: ["horse"] },
];

function readJson(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function esc(text) {
  const d = document.createElement("div");
  d.textContent = text;
  return d.innerHTML;
}

async function apiGetMedia(params = {}) {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && String(v).length) {
      q.set(k, String(v));
    }
  });
  const res = await fetch(`/api/media?${q.toString()}`);
  if (!res.ok) throw new Error("Could not fetch media");
  return res.json();
}

async function apiUploadMedia(formData) {
  const res = await fetch("/api/media", { method: "POST", body: formData });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Upload failed");
  return data;
}

async function apiDeleteMedia(id) {
  const res = await fetch(`/api/media/${encodeURIComponent(id)}`, { method: "DELETE" });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Delete failed");
  return data;
}

async function apiGetSubmissions(type) {
  const res = await fetch(`/api/${type}-submissions`);
  if (!res.ok) throw new Error(`Could not fetch ${type} submissions`);
  return res.json();
}

async function apiPostSubmission(type, payload) {
  const res = await fetch(`/api/${type}-submissions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `Could not submit ${type}`);
  return data;
}

function renderLayout() {
  const page = document.body?.dataset?.page || "";
  const h = document.getElementById("siteHeader");
  const f = document.getElementById("siteFooter");
  if (h) {
    const mainLinks = mainNav
      .map((item) => `<li><a class="${item.pages.includes(page) ? "active" : ""}" href="${item.href}">${item.label}</a></li>`)
      .join("");
    const animalLinks = animalNav
      .map((item) => `<li><a class="${item.pages.includes(page) ? "active" : ""}" href="${item.href}">${item.label}</a></li>`)
      .join("");
    h.innerHTML = `<header class="site-header">
      <div class="brand-bar">
        <div class="container brand-bar-inner">
          <img class="brand-logo" src="assets/logo.png" alt="${brandName} logo" onerror="this.style.display='none'" />
          <div class="brand-text">
            <h1 class="logo">${brandName}</h1>
            <p class="brand-tagline">Premium Cattle Care &amp; Sales &mdash; Karachi</p>
          </div>
        </div>
      </div>
      <div class="nav-bar">
        <div class="container nav-wrap">
          <ul class="nav-links" id="mainNavLinks">${mainLinks}</ul>
          <button class="hamburger" id="hamburgerBtn" aria-label="Toggle menu" aria-expanded="false">&#9776;</button>
        </div>
      </div>
      <div class="animal-nav-wrap">
        <div class="container">
          <ul class="animal-nav-links">${animalLinks}</ul>
        </div>
      </div>
    </header>`;

    const hamburger = document.getElementById("hamburgerBtn");
    const navLinks = document.getElementById("mainNavLinks");
    if (hamburger && navLinks) {
      hamburger.addEventListener("click", () => {
        const open = navLinks.classList.toggle("open");
        hamburger.setAttribute("aria-expanded", String(open));
        hamburger.innerHTML = open ? "&#10005;" : "&#9776;";
      });
    }
  }
  if (f) {
    f.innerHTML = `<footer class="site-footer">
      <div class="container footer-grid">
        <section class="footer-block">
          <h3>Get In Touch</h3>
          <p>&#128222; &nbsp;+92 310 2087472</p>
          <p>&#9993; &nbsp;info@zilhajjcattlefarm.com</p>
          <p>&#128205; &nbsp;ZillHajj Cattle Farm Near Abdullah Hotel, FarmHouses Area, Gadab, Karachi.</p>
        </section>
        <section class="footer-block">
          <h3>Follow the Farm</h3>
          <div class="social-links footer-social-links">
            <a href="https://www.facebook.com/share/17ihyXCZZD/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer">&#128337; Facebook</a>
            <a href="https://www.tiktok.com/@zillhajjcattlefarm?_r=1&_t=ZS-972newqKjEQ" target="_blank" rel="noopener noreferrer">&#127774; TikTok</a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer">&#9654; YouTube</a>
            <a href="https://wa.me/923102087472" target="_blank" rel="noopener noreferrer">&#128172; WhatsApp</a>
          </div>
        </section>
        <section class="footer-block">
          <h3>Find Us</h3>
          <div class="footer-map-wrap">
            <iframe
              title="Farm Footer Map"
              src="https://www.google.com/maps?q=Abdullah+Hotel+FarmHouses+Area+Gadab+Karachi&output=embed"
              loading="lazy"
              referrerpolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </section>
      </div>
      <div class="container footer-copy">
        <p>&#127807; &nbsp;&copy; ${new Date().getFullYear()} <strong style="color:#c9a96e">${brandName}</strong>. All rights reserved. &nbsp;&#127807;</p>
      </div>
    </footer>`;
  }
}

function mediaCard(item) {
  const media =
    item.type === "video"
      ? `<video controls preload="metadata"><source src="${esc(item.url)}" type="${esc(item.mimeType || "video/mp4")}" /></video>`
      : `<img src="${esc(item.url)}" alt="${esc(item.title)}" />`;
  return `<article class="media-card">${media}<p class="media-title">${esc(item.title)} <small>(${esc(item.category || "General")})</small></p></article>`;
}

async function renderMedia(targetId, type, category = "All") {
  const target = document.getElementById(targetId);
  if (!target) return;
  try {
    const items = await apiGetMedia({ type, category });
    target.innerHTML = items.length ? items.map(mediaCard).join("") : '<p class="empty">No media found.</p>';
  } catch {
    target.innerHTML = '<p class="empty">Could not load media.</p>';
  }
}

async function renderPreview(targetId, type, limit) {
  const target = document.getElementById(targetId);
  if (!target) return;
  try {
    const items = await apiGetMedia({ type, limit });
    target.innerHTML = items.length ? items.map(mediaCard).join("") : '<p class="empty">No media found.</p>';
  } catch {
    target.innerHTML = '<p class="empty">Could not load media.</p>';
  }
}

function setupGalleryFilters() {
  const imgFilter = document.getElementById("imagesCategoryFilter");
  if (imgFilter instanceof HTMLSelectElement) {
    renderMedia("imagesGrid", "image", imgFilter.value).catch(() => {});
    imgFilter.addEventListener("change", () => renderMedia("imagesGrid", "image", imgFilter.value).catch(() => {}));
  } else {
    renderMedia("imagesGrid", "image", "All").catch(() => {});
  }

  const vidFilter = document.getElementById("videosCategoryFilter");
  if (vidFilter instanceof HTMLSelectElement) {
    renderMedia("videosGrid", "video", vidFilter.value).catch(() => {});
    vidFilter.addEventListener("change", () => renderMedia("videosGrid", "video", vidFilter.value).catch(() => {}));
  } else {
    renderMedia("videosGrid", "video", "All").catch(() => {});
  }

  const animal = document.body?.dataset?.animal || "";
  if (animal) {
    renderMedia("animalImagesGrid", "image", animal).catch(() => {});
    renderMedia("animalVideosGrid", "video", animal).catch(() => {});
  }
  renderPreview("galleryImagesPreview", "image", 6).catch(() => {});
  renderPreview("galleryVideosPreview", "video", 4).catch(() => {});
}

function setupPreferences() {
  const form = document.getElementById("galleryItemForm");
  const list = document.getElementById("galleryManageList");
  const status = document.getElementById("galleryFormStatus");
  if (!form || !list) return;

  async function renderList() {
    try {
      const items = await apiGetMedia({});
      list.innerHTML = items.length
        ? items
            .map(
              (x) => `<article class="entry-card">
            <p><strong>${esc(x.title)}</strong></p>
            <p>${esc(x.type)} | ${esc(x.category || "General")}</p>
            <p class="muted">${esc(x.filePath || "")}</p>
            <button class="btn btn-danger remove-item" data-id="${esc(x.id)}" type="button">Remove</button>
          </article>`
            )
            .join("")
        : '<p class="empty">No media found.</p>';
    } catch {
      list.innerHTML = '<p class="empty">Could not load library.</p>';
    }
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const type = String(fd.get("type") || "");
    const category = String(fd.get("category") || "General");
    const title = String(fd.get("title") || "").trim();
    const file = fd.get("file");
    if (!title || !(file instanceof File) || !file.size) {
      if (status) status.textContent = "Please select file and title.";
      return;
    }
    if (type === "image" && !file.type.startsWith("image/")) {
      if (status) status.textContent = "Choose a valid image file.";
      return;
    }
    if (type === "video" && !file.type.startsWith("video/")) {
      if (status) status.textContent = "Choose a valid video file.";
      return;
    }
    try {
      await apiUploadMedia(fd);
      form.reset();
      if (status) status.textContent = "Uploaded successfully.";
      await renderList();
    } catch (error) {
      if (status) status.textContent = error.message || "Upload failed.";
    }
  });

  list.addEventListener("click", async (e) => {
    const target = e.target;
    if (!(target instanceof HTMLElement) || !target.classList.contains("remove-item")) return;
    const id = target.getAttribute("data-id");
    if (!id) return;
    try {
      await apiDeleteMedia(id);
      await renderList();
    } catch (error) {
      if (status) status.textContent = error.message || "Delete failed.";
    }
  });

  renderList().catch(() => {});
}

function setupInquiryPrefill() {
  const form = document.getElementById("inquiryForm");
  if (!form) return;
  const s = form.querySelector('select[name="interest"]');
  if (!(s instanceof HTMLSelectElement)) return;
  const animal = new URLSearchParams(window.location.search).get("animal");
  if (animal) s.value = animal;
}

function renderEntries(list, entries, fields) {
  list.innerHTML = entries.length
    ? entries
        .map((entry) => {
          const body = fields.map((f) => `<p><strong>${f.label}:</strong> ${esc(String(entry[f.key] || "-"))}</p>`).join("");
          return `<article class="entry-card">${body}</article>`;
        })
        .join("")
    : '<p class="empty">No entries yet.</p>';
}

function setupFormList(formId, listId, storageKey, fields, apiType) {
  const form = document.getElementById(formId);
  const list = document.getElementById(listId);
  if (!form || !list) return;

  const render = async () => {
    if (apiType) {
      try {
        const entries = await apiGetSubmissions(apiType);
        renderEntries(list, entries, fields);
        return;
      } catch {
        // fall through to local storage fallback
      }
    }
    const entries = readJson(storageKey).slice().reverse();
    renderEntries(list, entries, fields);
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const payload = {};
    fields.forEach((f) => {
      payload[f.key] = String(fd.get(f.key) || "");
    });
    try {
      if (apiType) {
        await apiPostSubmission(apiType, payload);
      } else {
        const entries = readJson(storageKey);
        entries.push(payload);
        writeJson(storageKey, entries);
      }
      form.reset();
      await render();
    } catch {
      const entries = readJson(storageKey);
      entries.push(payload);
      writeJson(storageKey, entries);
      form.reset();
      await render();
    }
  });

  render().catch(() => {});
}

async function setupAdminPage() {
  const contactEl = document.getElementById("adminContactEntries");
  const inquiryEl = document.getElementById("adminInquiryEntries");
  if (!contactEl || !inquiryEl) return;

  const contactFields = [
    { key: "name", label: "Name" },
    { key: "phone", label: "Phone" },
    { key: "email", label: "Email" },
    { key: "message", label: "Message" },
    { key: "createdAt", label: "Created At" },
  ];
  const inquiryFields = [
    { key: "name", label: "Name" },
    { key: "phone", label: "Phone" },
    { key: "interest", label: "Interested In" },
    { key: "budget", label: "Budget (PKR)" },
    { key: "message", label: "Message" },
    { key: "createdAt", label: "Created At" },
  ];

  try {
    const [contacts, inquiries] = await Promise.all([
      apiGetSubmissions("contact"),
      apiGetSubmissions("inquiry"),
    ]);
    renderEntries(contactEl, contacts, contactFields);
    renderEntries(inquiryEl, inquiries, inquiryFields);
  } catch {
    contactEl.innerHTML = '<p class="empty">Could not load contact results.</p>';
    inquiryEl.innerHTML = '<p class="empty">Could not load inquiry results.</p>';
  }
}

async function setupHomeSlider() {
  const track = document.getElementById("sliderTrack");
  const prevBtn = document.getElementById("sliderPrev");
  const nextBtn = document.getElementById("sliderNext");
  if (!track || !prevBtn || !nextBtn) return;

  let items = [];
  try {
    items = await apiGetMedia({ type: "image", limit: 20 });
  } catch {
    track.innerHTML = '<p class="empty" style="padding:40px;text-align:center;">Could not load slider images.</p>';
    return;
  }

  if (!items.length) {
    track.innerHTML = '<p class="empty" style="padding:40px;text-align:center;">No images uploaded yet.</p>';
    return;
  }

  let index = 0;
  track.innerHTML = items
    .map(
      (item, i) => `<article class="slide ${i === 0 ? "active" : ""}">
        <img src="${esc(item.url)}" alt="${esc(item.title)}" loading="lazy" />
        <div class="slide-caption">${esc(item.title)} &mdash; ${esc(item.category || "General")}</div>
      </article>`
    )
    .join("");

  const slider = track.closest(".home-slider");
  const slides = Array.from(track.querySelectorAll(".slide"));

  /* Dots container */
  const dotsWrap = document.createElement("div");
  dotsWrap.className = "slider-dots";
  items.forEach((_, i) => {
    const dot = document.createElement("button");
    dot.className = "slider-dot" + (i === 0 ? " active" : "");
    dot.setAttribute("aria-label", `Slide ${i + 1}`);
    dotsWrap.appendChild(dot);
  });
  slider.appendChild(dotsWrap);

  const dots = Array.from(dotsWrap.querySelectorAll(".slider-dot"));

  const show = (nextIndex) => {
    slides[index].classList.remove("active");
    dots[index].classList.remove("active");
    index = (nextIndex + slides.length) % slides.length;
    slides[index].classList.add("active");
    dots[index].classList.add("active");
  };

  dots.forEach((dot, i) => dot.addEventListener("click", () => show(i)));
  prevBtn.addEventListener("click", () => show(index - 1));
  nextBtn.addEventListener("click", () => show(index + 1));

  const autoPlay = setInterval(() => show(index + 1), 4500);

  /* Pause autoplay on hover */
  slider.addEventListener("mouseenter", () => clearInterval(autoPlay));
}

renderLayout();
setupGalleryFilters();
setupPreferences();
setupInquiryPrefill();
setupHomeSlider().catch(() => {});
setupFormList("contactForm", "contactEntries", "contactEntries", [
  { key: "name", label: "Name" },
  { key: "phone", label: "Phone" },
  { key: "email", label: "Email" },
  { key: "message", label: "Message" },
], "contact");
setupFormList("inquiryForm", "inquiryEntries", "inquiryEntries", [
  { key: "name", label: "Name" },
  { key: "phone", label: "Phone" },
  { key: "interest", label: "Interested In" },
  { key: "budget", label: "Budget (PKR)" },
  { key: "message", label: "Message" },
], "inquiry");
setupAdminPage().catch(() => {});
