(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  const storageKeys = {
    theme: "kurdana_theme",
    profile: "kurdana_profile",
    posts: "kurdana_posts"
  };

  const toast = (message) => {
    const el = document.querySelector("#toast");
    if (!el) return;
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
    if (!document.querySelector(".modal-layer.show") && !document.querySelector("#zhirDrawer.show")) {
      document.body.classList.remove("modal-open");
    }
  };

  window.KurdanaCore = {
    $, $$, toast, storageKeys, openModal, closeModal
  };

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

  // Export the data/utility functions for app.js.
  window.KurdanaCore.loadProfile = loadProfile;
  window.KurdanaCore.updateProfileUI = updateProfileUI;
  window.KurdanaCore.loadPosts = loadPosts;
  window.KurdanaCore.normalizeKurdishText = normalizeKurdishText;
})();
