(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  const storageKeys = {
    theme: "kurdana_theme",
    profile: "kurdana_profile",
    posts: "kurdana_posts"
  };

  const toast = (message) => {
    const el = $("#toast");
    el.textContent = message;
    el.classList.add("show");
    clearTimeout(window.__toastTimer);
    window.__toastTimer = setTimeout(() => el.classList.remove("show"), 2400);
  };

  const openModal = (id) => {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.classList.add("show");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
  };

  const closeModal = (id) => {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.classList.remove("show");
    modal.setAttribute("aria-hidden", "true");
    if (!$$(".modal-layer.show").length && !$("#zhirDrawer").classList.contains("show")) {
      document.body.classList.remove("modal-open");
    }
  };

  // Theme
  const savedTheme = localStorage.getItem(storageKeys.theme);
  if (savedTheme === "dark") document.body.classList.add("dark");

  $("#themeToggle").addEventListener("click", () => {
    document.body.classList.toggle("dark");
    localStorage.setItem(storageKeys.theme, document.body.classList.contains("dark") ? "dark" : "light");
  });

  // Mobile sidebar
  const sidebar = $("#sidebar");
  const overlay = $("#mobileOverlay");

  const closeSidebar = () => {
    sidebar.classList.remove("open");
    overlay.classList.remove("show");
  };

  $("#mobileMenu").addEventListener("click", () => {
    sidebar.classList.add("open");
    overlay.classList.add("show");
  });

  $("#mobileClose").addEventListener("click", closeSidebar);
  overlay.addEventListener("click", closeSidebar);

  $$("[data-scroll]").forEach((link) => {
    link.addEventListener("click", () => {
      closeSidebar();
      $$(".side-link").forEach((el) => el.classList.remove("active"));
      link.classList.add("active");
    });
  });

  $$("[data-scroll-target]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.scrollTarget;
      document.querySelector(target)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  // Language menu
  $("#languageMain").addEventListener("click", () => $("#languageMenu").classList.toggle("show"));

  $$("#languageMenu button").forEach(btn => {
    btn.addEventListener("click", () => {
      const labels = { ku: "کوردی", en: "English", ar: "العربية" };
      $("#languageMain span:first-child").textContent = labels[btn.dataset.lang];
      $("#languageMenu").classList.remove("show");
      toast(`زمان: ${labels[btn.dataset.lang]}`);
    });
  });

  // Auth / profile
  $("#openProfile").addEventListener("click", () => openModal("profileModal"));
  $("#topProfile").addEventListener("click", () => {
    const profile = loadProfile();
    if (profile) updateProfileUI(profile);
    openModal(profile ? "profileModal" : "authModal");
  });

  $$(".modal-x").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.closeModal;
      if (id) closeModal(id);
    });
  });

  $$(".modal-layer").forEach(layer => {
    layer.addEventListener("click", (event) => {
      if (event.target === layer) closeModal(layer.id);
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    $$(".modal-layer.show").forEach(m => closeModal(m.id));
    if ($("#zhirDrawer").classList.contains("show")) closeZhir();
    closeSidebar();
  });

  // Registration
  $$(".auth-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      $$(".auth-tab").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      if (tab.dataset.authTab === "login") {
        toast("چوونەژوورەوە لەم وەشانەدا تەنیا Demo ـیە.");
      }
    });
  });

  $("#googleAuth").addEventListener("click", () => toast("Google Sign-In لە قۆناغی API ـەکەدا جێبەجێ دەکرێت."));
  $("#appleAuth").addEventListener("click", () => toast("Apple ID لە قۆناغی API ـەکەدا جێبەجێ دەکرێت."));

  const loadProfile = () => {
    try { return JSON.parse(localStorage.getItem(storageKeys.profile) || "null"); }
    catch { return null; }
  };

  const saveProfile = (profile) => localStorage.setItem(storageKeys.profile, JSON.stringify(profile));

  const updateProfileUI = (profile) => {
    const name = profile?.name || "میوانی Kurdana";
    $("#profileName").textContent = name;
    $("#profileSummary").textContent = profile
      ? `${profile.roleLabel} · ${profile.interestLabel}`
      : "هێشتا هەژمارێک دروست نەکراوە.";
    $("#profileAvatarLarge").textContent = (name.trim()[0] || "K").toUpperCase();
    const posts = loadPosts();
    $("#statPosts").textContent = String(posts.length);

    if (profile) {
      $(".profile-chip-text").textContent = name;
      $(".avatar").textContent = (name.trim()[0] || "K").toUpperCase();
    }
  };

  $("#registerForm").addEventListener("submit", (event) => {
    event.preventDefault();

    const role = $("input[name='role']:checked")?.value || "general";
    const interest = $("input[name='interest']:checked")?.value || "both";
    const roleLabels = { student: "خوێندکار", teacher: "مامۆستا", general: "کەسی ئاسایی" };
    const interestLabels = { language: "زمانەوانی", literature: "ئەدەبیات", both: "هەردووکیان" };

    const profile = {
      name: $("#regName").value.trim(),
      email: $("#regEmail").value.trim(),
      phone: $("#regPhone").value.trim(),
      role,
      roleLabel: roleLabels[role],
      interest,
      interestLabel: interestLabels[interest],
      createdAt: new Date().toISOString()
    };

    saveProfile(profile);
    updateProfileUI(profile);
    closeModal("authModal");
    toast("پڕۆفایلەکەت بە سەرکەوتوویی دروست کرا.");
    openModal("profileModal");
  });

  // Publish
  $("#openPublish").addEventListener("click", () => openModal("publishModal"));
  $("#communityPublish").addEventListener("click", () => openModal("publishModal"));

  const normalizeKurdishText = (text) => {
    return text
      .normalize("NFC")
      .replace(/\u0640/g, "")
      .replace(/ي/g, "ی")
      .replace(/ى/g, "ی")
      .replace(/ئ/g, "ئ")
      .replace(/ك/g, "ک")
      .replace(/ە/g, "ە")
      .replace(/\u200c/g, " ")
      .replace(/\u200b/g, "")
      .replace(/[ \t]+/g, " ")
      .replace(/\s+\n/g, "\n")
      .trim();
  };

  $("#normalizeText").addEventListener("click", () => {
    const body = $("#postBody");
    body.value = normalizeKurdishText(body.value);
    updatePublishPreview();
    toast("دەقەکە پاک و یەکخراوە.");
  });

  const updatePublishPreview = () => {
    const title = $("#postTitle").value.trim();
    const body = $("#postBody").value.trim();
    $("#publishPreview").textContent = title
      ? `${title} — ${body ? body.slice(0, 120) + (body.length > 120 ? "…" : "") : "بێ دەق"}`
      : "پێشبینینی بابەت لێرە دەردەکەوێت.";
  };

  $("#postTitle").addEventListener("input", updatePublishPreview);
  $("#postBody").addEventListener("input", updatePublishPreview);

  const loadPosts = () => {
    try { return JSON.parse(localStorage.getItem(storageKeys.posts) || "[]"); }
    catch { return []; }
  };

  $("#publishForm").addEventListener("submit", (event) => {
    event.preventDefault();

    const section = $("input[name='section']:checked")?.value || "language";
    const type = $("input[name='postType']:checked")?.value || "article";
    const sectionLabel = { language: "زمان و ڕێزمان", literature: "ئەدەبیات" };
    const typeLabel = { article: "وتار", poem: "شیعر", research: "توێژینەوە" };

    const posts = loadPosts();
    posts.unshift({
      title: $("#postTitle").value.trim(),
      body: normalizeKurdishText($("#postBody").value.trim()),
      section,
      sectionLabel: sectionLabel[section],
      type,
      typeLabel: typeLabel[type],
      createdAt: new Date().toISOString()
    });
    localStorage.setItem(storageKeys.posts, JSON.stringify(posts.slice(0, 30)));

    updateProfileUI(loadProfile());
    toast(`«${$("#postTitle").value.trim()}» بڵاوکرایەوە لە ${sectionLabel[section]}.`);
    $("#publishForm").reset();
    updatePublishPreview();
    closeModal("publishModal");
    openModal("profileModal");
  });

  // Books carousel
  const booksScroller = $("#booksScroller");
  $("#booksPrev").addEventListener("click", () => booksScroller.scrollBy({ left: -460, behavior: "smooth" }));
  $("#booksNext").addEventListener("click", () => booksScroller.scrollBy({ left: 460, behavior: "smooth" }));

  // Search demo
  $("#searchForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const q = $("#globalSearch").value.trim();
    if (!q) {
      toast("تکایە وشەیەک بۆ گەڕان بنووسە.");
      return;
    }
    toast(`گەڕان بۆ «${q}» — ئەمەی ئێستا Demo ـی Frontend ـە.`);
  });

  $$("#quickFilters button").forEach(btn => {
    btn.addEventListener("click", () => {
      $("#globalSearch").value = btn.dataset.filter;
      toast(`فلتەر: ${btn.dataset.filter}`);
    });
  });

  $$(".card-action").forEach(btn => {
    btn.addEventListener("click", () => {
      const map = {
        language: "بەشی زمان و ڕێزمان لە قۆناغی دواتردا بە شێوەی ورد پڕ دەکرێت.",
        literature: "بەشی ئەدەبیات لە قۆناغی دواتردا بە لقەکانی خۆی پڕ دەکرێت.",
        dictionary: "فەرهەنگ پێش جێبەجێکردنی تەواو، پێویستی بە دیزاین و پێکهاتەی وردتری هەیە.",
        library: "کتێبخانە لە دواتر بە سیستەمی کتێب و PDF فراوان دەکرێت."
      };
      toast(map[btn.dataset.demo] || "بەشەکە لە قۆناغی دواتردا فراوان دەکرێت.");
    });
  });

  // Zhir
  const zhirDrawer = $("#zhirDrawer");
  const zhirMessages = $("#zhirMessages");

  const openZhir = () => {
    zhirDrawer.classList.add("show");
    zhirDrawer.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    setTimeout(() => $("#zhirInput").focus(), 120);
  };

  const closeZhir = () => {
    zhirDrawer.classList.remove("show");
    zhirDrawer.setAttribute("aria-hidden", "true");
    if (!$$(".modal-layer.show").length) document.body.classList.remove("modal-open");
  };

  $$(".zhir-open").forEach(btn => btn.addEventListener("click", openZhir));
  $("#closeZhir").addEventListener("click", closeZhir);

  const zhirReply = (question) => {
    const q = question.toLowerCase();
    if (q.includes("unicode") || q.includes("یونیکۆد")) {
      return "Unicode سیستەمێکی یەکگرتووە بۆ نووسین و هەڵگرتنی پیتەکان. لە Kurdana ـدا ئامانج ئەوەیە دەقی کۆن بۆ شێوەیەکی ستاندارد نزیک بکرێتەوە.";
    }
    if (q.includes("فاعل") || q.includes("بەرکار")) {
      return "فاعل ئەو کەس یان شتەیە کە کاری ڕستەکە دەکات؛ بەرکار ئەوەیە کە کاری لەسەر دەکرێت. بۆ نموونە: «نووسەر کتێبەکەی نووسی»؛ «نووسەر» فاعیلە و «کتێبەکەی» بەرکارە.";
    }
    if (q.includes("شیعر") || q.includes("ئەدەب")) {
      return "شیعری کوردی ژانر و شێوازی جۆراوجۆری هەیە؛ لە شعرە کۆنەکانی کلاسیک تا نوێکارییەکانی شعرە نوێ. Zhir لە داهاتوودا دەتوانێت لەسەر ژانر، شێواز و سەرچاوەکان وردتر بێت.";
    }
    return "لە وەشانی Frontend ـی ئێستادا ئەم وەڵامە نموونەییە. دواتر Zhir بە بنکەدراوە و API ـی تایبەتی پەیوەست دەکرێت بۆ وەڵامی پڕۆفیشناڵتر.";
  };

  const addZhirMessage = (text, role) => {
    const div = document.createElement("div");
    div.className = `zhir-message ${role}`;
    div.textContent = text;
    zhirMessages.appendChild(div);
    zhirMessages.scrollTop = zhirMessages.scrollHeight;
  };

  $("#zhirForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const q = $("#zhirInput").value.trim();
    if (!q) return;
    addZhirMessage(q, "user");
    $("#zhirInput").value = "";
    setTimeout(() => addZhirMessage(zhirReply(q), "bot"), 350);
  });

  $$("#zhirDrawer [data-prompt]").forEach(btn => {
    btn.addEventListener("click", () => {
      $("#zhirInput").value = btn.dataset.prompt;
      $("#zhirForm").requestSubmit();
    });
  });

  // Notifications / bookmarks / settings demo
  $("#openNotifications").addEventListener("click", () => toast("هیچ ئاگادارییەکی نوێ نییە."));
  $("#openBookmarks").addEventListener("click", () => toast("نیشانکراوەکان لە قۆناغی هەژماری دواتردا چالاک دەکرێن."));
  $("#openSettings").addEventListener("click", () => toast("ڕێکخستنە سەرەکییەکان: دۆخی ڕوون/تاریک و زمان."));

  // Initial profile
  const existing = loadProfile();
  if (existing) updateProfileUI(existing);

  // Close language menu when clicking elsewhere
  document.addEventListener("click", (event) => {
    if (!event.target.closest(".language-switcher")) $("#languageMenu").classList.remove("show");
  });
})();
