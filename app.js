import "./script.js";

(() => {
  const core = window.KurdanaCore;
  const { $, $$, toast, openModal, closeModal } = core;

  if (!core) {
    console.error("KurdanaCore is not available.");
    return;
  }

  // Theme
  const savedTheme = localStorage.getItem(core.storageKeys.theme);
  if (savedTheme === "dark") document.body.classList.add("dark");

  const themeToggle = $("#themeToggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      document.body.classList.toggle("dark");
      localStorage.setItem(
        core.storageKeys.theme,
        document.body.classList.contains("dark") ? "dark" : "light"
      );
    });
  }

  // Mobile sidebar
  const sidebar = $("#sidebar");
  const overlay = $("#mobileOverlay");

  const closeSidebar = () => {
    sidebar?.classList.remove("open");
    overlay?.classList.remove("show");
  };

  $("#mobileMenu")?.addEventListener("click", () => {
    sidebar?.classList.add("open");
    overlay?.classList.add("show");
  });

  $("#mobileClose")?.addEventListener("click", closeSidebar);
  overlay?.addEventListener("click", closeSidebar);

  $$("[data-scroll]").forEach((link) => {
    link.addEventListener("click", () => {
      closeSidebar();
      $$(".side-link").forEach((el) => el.classList.remove("active"));
      link.classList.add("active");
    });
  });

  // Simple section routing: keeps the SPA on one HTML page.
  const routeTo = (target) => {
    const element = document.querySelector(target);
    if (element) element.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  $$("[data-scroll-target]").forEach((btn) => {
    btn.addEventListener("click", () => routeTo(btn.dataset.scrollTarget));
  });

  // Language switcher
  $("#languageMain")?.addEventListener("click", () => $("#languageMenu")?.classList.toggle("show"));

  $$("#languageMenu button").forEach((btn) => {
    btn.addEventListener("click", () => {
      const labels = { ku: "کوردی", en: "English", ar: "العربية" };
      $("#languageMain span:first-child").textContent = labels[btn.dataset.lang];
      $("#languageMenu").classList.remove("show");
      toast(`زمان: ${labels[btn.dataset.lang]}`);
      document.documentElement.lang = btn.dataset.lang === "ku" ? "ku" : btn.dataset.lang;
      document.documentElement.dir = btn.dataset.lang === "ar" ? "rtl" : "ltr";
    });
  });

  document.addEventListener("click", (event) => {
    if (!event.target.closest(".language-switcher")) {
      $("#languageMenu")?.classList.remove("show");
    }
  });

  // Profile and authentication entry points
  $("#openProfile")?.addEventListener("click", () => {
    const profile = core.loadProfile();
    if (profile) core.updateProfileUI(profile);
    openModal(profile ? "profileModal" : "authModal");
  });

  $("#topProfile")?.addEventListener("click", () => {
    const profile = core.loadProfile();
    if (profile) core.updateProfileUI(profile);
    openModal(profile ? "profileModal" : "authModal");
  });

  $$(".modal-x").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.closeModal;
      if (id) closeModal(id);
    });
  });

  $$(".modal-layer").forEach((layer) => {
    layer.addEventListener("click", (event) => {
      if (event.target === layer) closeModal(layer.id);
    });
  });

  // Section-specific handlers
  $("#openNotifications")?.addEventListener("click", () => toast("هیچ ئاگادارییەکی نوێ نییە."));
  $("#openBookmarks")?.addEventListener("click", () => toast("نیشانکراوەکان لە قۆناغی هەژماری دواتردا چالاک دەکرێن."));
  $("#openSettings")?.addEventListener("click", () => toast("ڕێکخستن: دۆخی ڕوون/تاریک و زمان."));

  // Community / publish entry
  $("#openPublish")?.addEventListener("click", () => openModal("publishModal"));
  $("#communityPublish")?.addEventListener("click", () => openModal("publishModal"));

  // Books carousel
  const booksScroller = $("#booksScroller");
  $("#booksPrev")?.addEventListener("click", () => booksScroller?.scrollBy({ left: -460, behavior: "smooth" }));
  $("#booksNext")?.addEventListener("click", () => booksScroller?.scrollBy({ left: 460, behavior: "smooth" }));

  // Search demo
  $("#searchForm")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const q = $("#globalSearch").value.trim();
    if (!q) {
      toast("تکایە وشەیەک بۆ گەڕان بنووسە.");
      return;
    }
    toast(`گەڕان بۆ «${q}» — ئەمەی ئێستا Demo ـی Frontend ـە.`);
  });

  $$("#quickFilters button").forEach((btn) => {
    btn.addEventListener("click", () => {
      $("#globalSearch").value = btn.dataset.filter;
      toast(`فلتەر: ${btn.dataset.filter}`);
    });
  });

  $$(".card-action").forEach((btn) => {
    if (btn.classList.contains("reader-launch")) return;

    btn.addEventListener("click", () => {
      const map = {
        language: "بەشی زمان و ڕێزمان لە قۆناغی دواتردا بە شێوەی ورد پڕ دەکرێت.",
        literature: "بەشی ئەدەبیات لە قۆناغی دواتردا بە لقەکانی خۆی پڕ دەکرێت.",
        dictionary: "فەرهەنگ پێش جێبەجێکردنی تەواو، پێویستی بە دیزاین و پێکهاتەی وردتری هەیە.",
        library: "کتێبخانە لە قۆناغی دواتر بە سیستەمی کتێب و PDF فراوان دەکرێت."
      };
      toast(map[btn.dataset.demo] || "بەشەکە لە قۆناغی دواتردا فراوان دەکرێت.");
    });
  });

  // Restore profile UI at startup.
  const existingProfile = core.loadProfile();
  if (existingProfile) core.updateProfileUI(existingProfile);

  // Close everything with Escape.
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    $$(".modal-layer.show").forEach((modal) => closeModal(modal.id));
    window.KurdanaReader?.close?.();
    document.querySelector("#zhirDrawer")?.classList.remove("show");
    document.querySelector("#zhirDrawer")?.setAttribute("aria-hidden", "true");
    closeSidebar();
  });

  // Reader-launch buttons are wired in reader.js.
})();
