(function () {
  const LOCAL_KEY = "yaroslav-site-local-links-v1";

  function loadLocalLinks() {
    try {
      const raw = localStorage.getItem(LOCAL_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  function saveLocalLinks(data) {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(data));
  }

  function todayStamp() {
    const d = new Date();
    return d.toLocaleDateString("ru-RU", { day: "2-digit", month: "long", year: "numeric" });
  }

  function renderTicker() {
    const track = document.getElementById("tickerTrack");
    const items = SITE_DATA.ticker || [];
    const html = items.map((t) => `<span class="ticker__item">${escapeHtml(t)}</span>`).join("");
    // duplicate for seamless loop
    track.innerHTML = html + html;
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function renderSections() {
    const grid = document.getElementById("sectionsGrid");
    const local = loadLocalLinks();
    grid.innerHTML = "";

    SITE_DATA.sections.forEach((section, i) => {
      const localItems = local[section.id] || [];
      const card = document.createElement("article");
      card.className = "section-card";
      card.id = section.id;

      const num = String(i + 1).padStart(2, "0");

      const allItems = [...section.items, ...localItems.map((it) => ({ ...it, isLocal: true }))];

      const itemsHtml = allItems.length
        ? allItems
            .map(
              (item) => `
          <li>
            <a href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer">
              <span class="link-label">${escapeHtml(item.label)}${item.isLocal ? '<span class="local-tag">локально</span>' : ""}</span>
              ${item.note ? `<span class="link-note">${escapeHtml(item.note)}</span>` : ""}
            </a>
          </li>`
            )
            .join("")
        : `<li class="empty">Пока пусто</li>`;

      card.innerHTML = `
        <div class="section-card__head">
          <h2>${escapeHtml(section.title)}</h2>
          <span class="section-card__num">${num}</span>
        </div>
        ${section.note ? `<p class="section-card__note">${escapeHtml(section.note)}</p>` : ""}
        <ul class="link-list">${itemsHtml}</ul>
      `;

      grid.appendChild(card);
    });
  }

  function openQuickAdd() {
    const sectionTitles = SITE_DATA.sections.map((s, i) => `${i + 1}. ${s.title}`).join("\n");
    const choice = prompt(`В какой раздел добавить ссылку?\n${sectionTitles}\n\nВведи номер раздела:`);
    if (!choice) return;
    const idx = parseInt(choice, 10) - 1;
    const section = SITE_DATA.sections[idx];
    if (!section) {
      alert("Такого раздела нет.");
      return;
    }
    const label = prompt("Название ссылки:");
    if (!label) return;
    const url = prompt("URL (адрес ссылки):");
    if (!url) return;
    const note = prompt("Пометка (необязательно):") || "";

    const local = loadLocalLinks();
    local[section.id] = local[section.id] || [];
    local[section.id].push({ label, url, note });
    saveLocalLinks(local);
    renderSections();
  }

  document.getElementById("todayStamp").textContent = todayStamp();
  document.getElementById("tagline").textContent = SITE_DATA.tagline;
  renderTicker();
  renderSections();
  document.getElementById("quickAddBtn").addEventListener("click", openQuickAdd);
})();
