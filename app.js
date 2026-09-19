/* Zhir / Kurdana — app.js */
const root = document.documentElement;
    const themeBtn = document.getElementById('themeBtn');
    const menuBtn = document.getElementById('menuBtn');
    const sidebar = document.getElementById('sidebar');
    const scrim = document.getElementById('scrim');
    const composerForm = document.getElementById('composerForm');
    const userInput = document.getElementById('userInput');
    const micBtn = document.getElementById('micBtn');
    const sendBtn = document.getElementById('sendBtn');
    const attachBtn = document.getElementById('attachBtn');
    const fileInput = document.getElementById('fileInput');
    const messagesStream = document.getElementById('messagesStream');
    const welcomeBox = document.getElementById('welcomeBox');
    const chatContainer = document.getElementById('chatContainer');
    const newChatBtn = document.getElementById('newChatBtn');
    const historyList = document.getElementById('historyList');
    const historySearch = document.querySelector('.history-search input');
    const profileBtn = document.getElementById('profileBtn');
    const settingsBtn = document.getElementById('settingsBtn');
    const profileModal = document.getElementById('profileModal');
    const profileClose = document.getElementById('profileClose');
    const profileCancel = document.getElementById('profileCancel');
    const profileSave = document.getElementById('profileSave');
    const profileName = document.getElementById('profileName');
    const profileEmail = document.getElementById('profileEmail');
    const profileNamePreview = document.getElementById('profileNamePreview');
    const profileEmailPreview = document.getElementById('profileEmailPreview');
    const profileAvatar = document.getElementById('profileAvatar');
    const creditMeter = document.getElementById('creditMeter');
    const creditValue = document.getElementById('creditValue');
    const creditToast = document.createElement('div');
    creditToast.className = 'credit-toast';
    document.body.appendChild(creditToast);
    const { PLAN_CONFIG, KEYS, activePlan, loadCredits, saveCredits, getHistory, addHistory: persistHistory, getCurrentMessages, appendCurrentMessage, clearCurrentMessages } = window.ZHIR_STORAGE;
    const activeResponseProfile = () => PLAN_CONFIG[activePlan()] || PLAN_CONFIG['ژیر Lite'];

    const renderCredits = () => {
      const data = loadCredits();
      creditValue.textContent = data.dailyBalance.toLocaleString('en-US');
      creditMeter.setAttribute('title', `${activePlan()} | ڕۆژانە: ${data.dailyBalance.toLocaleString('en-US')} | مانگانە: ${data.monthlyBalance.toLocaleString('en-US')}`);
      creditMeter.classList.toggle('low', data.dailyBalance > 0 && data.dailyBalance <= Math.ceil((PLAN_CONFIG[activePlan()] || PLAN_CONFIG['ژیر Lite']).daily * .2));
      creditMeter.classList.toggle('empty', data.dailyBalance <= 0 || data.monthlyBalance <= 0);
      creditMeter.classList.toggle('compact', localStorage.getItem(KEYS.creditIntro) === '1' && !creditMeter.classList.contains('revealed'));
    };
    const showCreditToast = (message) => { creditToast.textContent = message; creditToast.classList.add('show'); clearTimeout(showCreditToast.timer); showCreditToast.timer = setTimeout(() => creditToast.classList.remove('show'), 2600); };
    const revealCredits = () => {
      const data = loadCredits();
      creditMeter.classList.remove('compact'); creditMeter.classList.add('revealed');
      showCreditToast(`${activePlan()} — ڕۆژانە: ${data.dailyBalance.toLocaleString('en-US')} | مانگانە: ${data.monthlyBalance.toLocaleString('en-US')}`);
      clearTimeout(revealCredits.timer); revealCredits.timer = setTimeout(() => { creditMeter.classList.remove('revealed'); renderCredits(); }, 2600);
    };
    creditMeter.addEventListener('click', revealCredits);
    creditMeter.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); revealCredits(); } });
    const creditCostForText = (text) => text.length <= 120 ? 1 : text.length <= 500 ? 2 : 5;
    const spendCredits = (amount, label) => {
      const data = loadCredits();
      if (data.dailyBalance < amount || data.monthlyBalance < amount) { renderCredits(); showCreditToast(`کردیت بەس نییە بۆ ${label} | ڕۆژانە: ${data.dailyBalance} | مانگانە: ${data.monthlyBalance}`); return false; }
      data.dailyBalance -= amount; data.monthlyBalance -= amount; saveCredits(data); localStorage.setItem(KEYS.creditIntro, '1'); creditMeter.classList.add('compact'); renderCredits(); showCreditToast(`-${amount} لە هەردوو کردیت بۆ ${label}`); return true;
    };
    const setActivePlan = (plan, paymentStatus = 'demo-paid') => {
      if (!PLAN_CONFIG[plan]) return;
      localStorage.setItem(KEYS.plan, plan);
      localStorage.removeItem(KEYS.creditIntro);
      const creditData = loadCredits(); creditData.paymentStatus = paymentStatus; creditData.activatedAt = new Date().toISOString(); saveCredits(creditData);
      renderCredits();
      showCreditToast(`${plan} چالاک کرا — ${PLAN_CONFIG[plan].level}`);
    };
    renderCredits();

    const planSwitcher = document.getElementById('planSwitcher');
    const planTrigger = document.getElementById('planTrigger');
    const savedPlan = activePlan();
    if (PLAN_CONFIG[savedPlan]) { planTrigger.querySelector('span:last-child').textContent = savedPlan; document.querySelectorAll('.plan-option').forEach((item) => { const selected = item.dataset.plan === savedPlan; item.classList.toggle('selected', selected); item.setAttribute('aria-checked', String(selected)); }); }

    const upgradeModal = document.getElementById('upgradeModal');
    const upgradeClose = document.getElementById('upgradeClose');
    const checkoutModal = document.getElementById('checkoutModal');
    const checkoutClose = document.getElementById('checkoutClose');
    const checkoutBack = document.getElementById('checkoutBack');
    const checkoutPay = document.getElementById('checkoutPay');
    const paymentMethods = document.querySelectorAll('.payment-method');
    const cardPaymentFields = document.getElementById('cardPaymentFields');
    const fastpayPaymentFields = document.getElementById('fastpayPaymentFields');
    const fibPaymentFields = document.getElementById('fibPaymentFields');
    const selectedPaymentMethod = () => document.querySelector('input[name="paymentMethod"]:checked')?.value || 'card';
    const updatePaymentFields = (method) => { cardPaymentFields.hidden = method !== 'card'; fastpayPaymentFields.hidden = method !== 'fastpay'; fibPaymentFields.hidden = method !== 'fib'; };
    paymentMethods.forEach((method) => method.addEventListener('click', () => { paymentMethods.forEach((item) => item.classList.remove('selected')); method.classList.add('selected'); const input = method.querySelector('input'); input.checked = true; updatePaymentFields(input.value); }));
    updatePaymentFields('card');
    document.getElementById('cardNumber').addEventListener('input', (event) => { const digits = event.target.value.replace(/\D/g, '').slice(0, 16); event.target.value = digits.replace(/(.{4})/g, '$1 ').trim(); });
    document.getElementById('cardExpiry').addEventListener('input', (event) => { const digits = event.target.value.replace(/\D/g, '').slice(0, 4); event.target.value = digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits; });
    document.querySelectorAll('[data-qr-provider]').forEach((qrButton) => qrButton.addEventListener('click', async () => { const provider = qrButton.dataset.qrProvider; const reference = `ZH-${provider.toUpperCase()}-${Date.now().toString().slice(-6)}`; qrButton.classList.add('active'); const label = qrButton.querySelector('span'); label.textContent = `${provider} QR چالاک کرا — reference: ${reference}`; try { await navigator.clipboard.writeText(reference); showCreditToast(`reference ـی ${provider} کۆپی کرا`); } catch (_) { showCreditToast(`QR ـی ${provider} بۆ دێمۆ چالاک کرا`); } }));
    const checkoutPlan = document.getElementById('checkoutPlan');
    const checkoutMonthly = document.getElementById('checkoutMonthly');
    const checkoutDaily = document.getElementById('checkoutDaily');
    const checkoutPrice = document.getElementById('checkoutPrice');
    let checkoutSelectedPlan = null;
    const openUpgradeModal = () => { planSwitcher.classList.remove('open'); planTrigger.setAttribute('aria-expanded', 'false'); upgradeModal.classList.add('open'); upgradeClose.focus(); };
    const closeUpgradeModals = () => { upgradeModal.classList.remove('open'); checkoutModal.classList.remove('open'); };
    const openCheckout = (planName) => { const plan = PLAN_CONFIG[planName]; if (!plan || planName === 'ژیر Lite') return; checkoutSelectedPlan = planName; checkoutPlan.textContent = planName; checkoutMonthly.textContent = plan.monthly.toLocaleString('en-US'); checkoutDaily.textContent = plan.daily.toLocaleString('en-US'); checkoutPrice.textContent = `${plan.price.toLocaleString('en-US')} د.ع — مانگانە (دێمۆ)`; upgradeModal.classList.remove('open'); checkoutModal.classList.add('open'); checkoutPay.disabled = false; checkoutPay.textContent = 'پارەدان بە شێوەی مانگانە'; checkoutPay.focus(); };
    document.querySelectorAll('.plan-option').forEach((button) => button.addEventListener('click', () => {
      const planName = button.dataset.plan;
      if (planName === 'ژیر Lite') { setActivePlan(planName); planTrigger.querySelector('span:last-child').textContent = planName; planSwitcher.classList.remove('open'); planTrigger.setAttribute('aria-expanded', 'false'); return; }
      openUpgradeModal();
    }));
    document.querySelectorAll('[data-plan-card]').forEach((card) => card.addEventListener('click', () => openCheckout(card.dataset.planCard)));
    document.querySelectorAll('.upgrade-cta').forEach((button) => button.addEventListener('click', openUpgradeModal));
    planTrigger.addEventListener('click', () => { if (upgradeModal.classList.contains('open') || checkoutModal.classList.contains('open')) return; const open = planSwitcher.classList.toggle('open'); planTrigger.setAttribute('aria-expanded', String(open)); });
    upgradeClose.addEventListener('click', () => upgradeModal.classList.remove('open'));
    checkoutClose.addEventListener('click', closeUpgradeModals);
    checkoutBack.addEventListener('click', () => { checkoutModal.classList.remove('open'); upgradeModal.classList.add('open'); });
    checkoutModal.addEventListener('click', (event) => { if (event.target === checkoutModal) checkoutModal.classList.remove('open'); });
    upgradeModal.addEventListener('click', (event) => { if (event.target === upgradeModal) upgradeModal.classList.remove('open'); });
    checkoutPay.addEventListener('click', () => { if (!checkoutSelectedPlan) return; const method = selectedPaymentMethod(); const required = method === 'card' ? [document.getElementById('cardholderName'), document.getElementById('cardNumber'), document.getElementById('cardExpiry'), document.getElementById('cardCvv')] : [document.getElementById(method === 'fastpay' ? 'fastpayNumber' : 'fibNumber')]; const missing = required.some((field) => !field.value.trim()); if (missing) { showCreditToast('تکایە خانەکانی پارەدانی دێمۆ پڕ بکەرەوە'); required.find((field) => !field.value.trim())?.focus(); return; } checkoutPay.disabled = true; checkoutPay.textContent = 'لە پشکنین‌دایە...'; setTimeout(() => { setActivePlan(checkoutSelectedPlan); planTrigger.querySelector('span:last-child').textContent = checkoutSelectedPlan; document.querySelectorAll('.plan-option').forEach((item) => { const selected = item.dataset.plan === checkoutSelectedPlan; item.classList.toggle('selected', selected); item.setAttribute('aria-checked', String(selected)); }); checkoutModal.classList.remove('open'); showCreditToast(`پیرۆزە — ${checkoutSelectedPlan} لە دێمۆدا چالاک کرا`); }, 900); });
    document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeUpgradeModals(); });

    if (localStorage.getItem(KEYS.theme) === 'dark') root.classList.add('dark');
    themeBtn.addEventListener('click', () => {
      root.classList.toggle('dark');
      localStorage.setItem(KEYS.theme, root.classList.contains('dark') ? 'dark' : 'light');
    });

    function addHistoryItem(title, persist = true) {
      const item = document.createElement('button');
      item.type = 'button';
      item.className = 'history-item';
      item.dataset.title = title;
      item.textContent = title.length > 34 ? `${title.slice(0, 34)}…` : title;
      item.addEventListener('click', () => { userInput.focus(); });
      historyList.prepend(item);
      if (persist) persistHistory(title);
    }

    getHistory().slice().reverse().forEach((entry) => addHistoryItem(entry.title, false));

    historySearch.addEventListener('input', () => {
      const query = historySearch.value.trim().toLocaleLowerCase();
      historyList.querySelectorAll('.history-item').forEach((item) => {
        item.hidden = query && !item.dataset.title.toLocaleLowerCase().includes(query);
      });
    });

    attachBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', () => {
      const file = fileInput.files && fileInput.files[0];
      if (!file) return;
      if (!spendCredits(10, 'هاوپێچکردنی فایل')) { fileInput.value = ''; return; }
      welcomeBox.style.display = 'none';
      appendUserMessage(`فایل: ${file.name}`);
      addHistoryItem(file.name);
      fileInput.value = '';
    });

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    let recognition = null;
    if (SpeechRecognition) {
      recognition = new SpeechRecognition();
      recognition.lang = 'ckb-IQ';
      recognition.interimResults = true;
      recognition.onstart = () => micBtn.classList.add('recording');
      recognition.onend = () => micBtn.classList.remove('recording');
      recognition.onresult = (event) => {
        userInput.value = Array.from(event.results).map((result) => result[0].transcript).join('');
        userInput.dispatchEvent(new Event('input', { bubbles: true }));
      };
    }
    micBtn.addEventListener('click', () => {
      if (!recognition) { window.alert('ناوچەکەت پشتگیری لە نووسینی دەنگی ناکات.'); return; }
      if (!spendCredits(5, 'دەنگ')) return;
      try { recognition.start(); } catch (_) { recognition.stop(); }
    });

    const savedProfile = JSON.parse(localStorage.getItem(KEYS.profile) || 'null');
    if (savedProfile) { profileName.value = savedProfile.name; profileEmail.value = savedProfile.email; }
    const refreshProfilePreview = () => {
      const name = profileName.value.trim() || 'بەکارهێنەر';
      profileNamePreview.textContent = name;
      profileEmailPreview.textContent = profileEmail.value.trim() || 'user@example.com';
      profileAvatar.textContent = name.charAt(0);
    };
    profileName.addEventListener('input', refreshProfilePreview);
    profileEmail.addEventListener('input', refreshProfilePreview);
    profileBtn.addEventListener('click', () => { refreshProfilePreview(); profileModal.classList.add('open'); profileName.focus(); });
    const closeProfile = () => profileModal.classList.remove('open');
    profileClose.addEventListener('click', closeProfile);
    profileCancel.addEventListener('click', closeProfile);
    profileModal.addEventListener('click', (event) => { if (event.target === profileModal) closeProfile(); });
    profileSave.addEventListener('click', () => {
      localStorage.setItem(KEYS.profile, JSON.stringify({ name: profileName.value.trim() || 'بەکارهێنەر', email: profileEmail.value.trim() || 'user@example.com' }));
      refreshProfilePreview();
      closeProfile();
    });
    const apiKeyModal = document.getElementById('apiKeyModal');
    const apiKeyClose = document.getElementById('apiKeyClose');
    const apiKeyInput = document.getElementById('apiKeyInput');
    const apiKeySave = document.getElementById('apiKeySave');
    const apiKeyClear = document.getElementById('apiKeyClear');
    const closeApiKeyModal = () => apiKeyModal.classList.remove('open');
    settingsBtn.addEventListener('click', () => {
      apiKeyInput.value = window.ZHIR_AI.getApiKey();
      apiKeyModal.classList.add('open');
      apiKeyInput.focus();
    });
    apiKeyClose.addEventListener('click', closeApiKeyModal);
    apiKeyModal.addEventListener('click', (event) => { if (event.target === apiKeyModal) closeApiKeyModal(); });
    apiKeySave.addEventListener('click', () => {
      const key = apiKeyInput.value.trim();
      if (!key) { showCreditToast('تکایە کلیلەکە بنووسە'); apiKeyInput.focus(); return; }
      window.ZHIR_AI.saveApiKey(key);
      closeApiKeyModal();
      showCreditToast('Gemini API Key پاشەکەوت کرا');
    });
    apiKeyClear.addEventListener('click', () => {
      window.ZHIR_AI.clearApiKey();
      apiKeyInput.value = '';
      showCreditToast('Gemini API Key سڕایەوە');
    });

    function toggleMenu(open) { sidebar.classList.toggle('open', open); }
    menuBtn.addEventListener('click', () => toggleMenu(true));
    scrim.addEventListener('click', () => toggleMenu(false));

    // بەڕێوەبردنی ئەنیمەیشنی دوگمەکان لە کاتی نووسیندا
    userInput.addEventListener('input', () => {
      userInput.style.setProperty('height', '24px', 'important');
      userInput.style.setProperty('height', Math.min(userInput.scrollHeight, 174) + 'px', 'important');
      userInput.scrollTop = userInput.scrollHeight;
      
      if (userInput.value.trim().length > 0) {
        micBtn.classList.add('hidden'); 
        sendBtn.classList.add('visible');
      } else {
        micBtn.classList.remove('hidden'); 
        sendBtn.classList.remove('visible');
      }
    });

    userInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); composerForm.requestSubmit(); }
    });

    // لە کاتی scroll ـی چاتدا focus لەسەر خانەکە لادەبرێت؛ کلیکێکی نوێ دووبارە دەیگەڕێنێتەوە.
    let chatScrollTimer;
    chatContainer.addEventListener('scroll', () => {
      clearTimeout(chatScrollTimer);
      chatScrollTimer = setTimeout(() => {
        if (document.activeElement === userInput) {
          userInput.blur();
          if (document.activeElement && document.activeElement !== userInput) document.activeElement.blur?.();
        }
      }, 80);
    }, { passive: true });
    userInput.addEventListener('pointerdown', () => { userInput.focus({ preventScroll: true }); }, { passive: true });

    // لە مۆبایلدا layout بە بەرزی visual viewport ڕێکدەخرێت تا Chat Box لەسەر کیبۆرد بمێنێتەوە.
    const syncKeyboardViewport = () => {
      if (!window.visualViewport || window.innerWidth > 768) return;
      const viewportHeight = Math.round(window.visualViewport.height);
      const keyboardOpen = window.innerHeight - viewportHeight > 100;
      document.documentElement.style.setProperty('--keyboard-viewport-height', `${viewportHeight}px`);
      document.documentElement.classList.toggle('keyboard-active', keyboardOpen);
    };
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', syncKeyboardViewport, { passive: true });
      window.visualViewport.addEventListener('scroll', syncKeyboardViewport, { passive: true });
      window.addEventListener('resize', syncKeyboardViewport, { passive: true });
      userInput.addEventListener('focus', syncKeyboardViewport);
      userInput.addEventListener('blur', () => setTimeout(syncKeyboardViewport, 120));
      syncKeyboardViewport();
    }

    function appendUserMessage(text) {
      const bubble = document.createElement('div');
      bubble.className = `message-bubble user`;
      bubble.innerHTML = `<div class="user-avatar-placeholder"></div><div class="message-content-wrapper"><div class="text-content">${text.replace(/\n/g, '<br>')}</div></div>`;
      messagesStream.appendChild(bubble);
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    function streamAssistantMessage(text, profile = activeResponseProfile()) {
      const bubble = document.createElement('div');
      bubble.className = `message-bubble assistant`;
      const actionButtons = `<div class="action-bar" id="actionBar-${Date.now()}"><button class="copy-action" aria-label="کۆپیکردن" title="کۆپیکردن"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2h2"/></svg></button><button class="like-action" aria-label="لایک" title="لایک"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M7 10v10H4V10h3zM7 20h9.2a2 2 0 001.9-1.4l1.8-5.4A2 2 0 0018 10h-4l.7-3.2A2.3 2.3 0 0012.5 4L7 10v10z"/></svg></button><button class="dislike-action" aria-label="دیس لایک" title="دیس لایک"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17 14V4h3v10h-3zM17 4H7.8a2 2 0 00-1.9 1.4l-1.8 5.4A2 2 0 006 13h4l-.7 3.2A2.3 2.3 0 0011.5 19L17 14V4z"/></svg></button></div>`;
      bubble.innerHTML = `<div class="assistant-avatar"><span class="brand-mark" aria-label="نیشانەی ژیر"></span></div><div class="message-content-wrapper"><div class="assistant-name">ژیر <span class="response-tier">${profile.responseLabel}</span></div><div class="text-content" id="textContent-${Date.now()}"></div>${actionButtons}</div>`;
      messagesStream.appendChild(bubble);
      
      const textElement = bubble.querySelector('.text-content');
      textElement.classList.add('streaming');
      const actionBar = bubble.querySelector('.action-bar');
      actionBar.querySelector('.copy-action').addEventListener('click', async () => {
        let copied = false;
        try { await navigator.clipboard.writeText(text); copied = true; } catch (_) {}
        if (!copied) {
          const helper = document.createElement('textarea');
          helper.value = text;
          helper.setAttribute('readonly', '');
          helper.style.cssText = 'position:fixed;opacity:0;pointer-events:none;';
          document.body.appendChild(helper);
          helper.select();
          try { copied = document.execCommand('copy'); } catch (_) {}
          helper.remove();
        }
        const btn = actionBar.querySelector('.copy-action');
        if (copied) {
          btn.classList.add('copied');
          btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 4 4L19 6"/></svg>';
          btn.setAttribute('aria-label', 'کۆپی کرا');
          setTimeout(() => { btn.classList.remove('copied'); btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 00-2-2H6a2 2 0 00-2 2v8a2 2 0 002 2h2"/></svg>'; btn.setAttribute('aria-label', 'کۆپیکردن'); }, 1200);
        }
      });
      actionBar.querySelector('.like-action').addEventListener('click', (e) => {
        const active = e.currentTarget.classList.toggle('active');
        e.currentTarget.innerHTML = active ? '<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.2"><path d="M7 10v10H4V10h3zM7 20h9.2a2 2 0 001.9-1.4l1.8-5.4A2 2 0 0018 10h-4l.7-3.2A2.3 2.3 0 0012.5 4L7 10v10z"/></svg>' : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M7 10v10H4V10h3zM7 20h9.2a2 2 0 001.9-1.4l1.8-5.4A2 2 0 0018 10h-4l.7-3.2A2.3 2.3 0 0012.5 4L7 10v10z"/></svg>';
        const dislike = actionBar.querySelector('.dislike-action');
        dislike.classList.remove('active');
        dislike.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17 14V4h3v10h-3zM17 4H7.8a2 2 0 00-1.9 1.4l-1.8 5.4A2 2 0 006 13h4l-.7 3.2A2.3 2.3 0 0011.5 19L17 14V4z"/></svg>';
      });
      actionBar.querySelector('.dislike-action').addEventListener('click', (e) => {
        const active = e.currentTarget.classList.toggle('active');
        e.currentTarget.innerHTML = active ? '<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.2"><path d="M17 14V4h3v10h-3zM17 4H7.8a2 2 0 00-1.9 1.4l-1.8 5.4A2 2 0 006 13h4l-.7 3.2A2.3 2.3 0 0011.5 19L17 14V4z"/></svg>' : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17 14V4h3v10h-3zM17 4H7.8a2 2 0 00-1.9 1.4l-1.8 5.4A2 2 0 006 13h4l-.7 3.2A2.3 2.3 0 0011.5 19L17 14V4z"/></svg>';
        const like = actionBar.querySelector('.like-action');
        like.classList.remove('active');
        like.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M7 10v10H4V10h3zM7 20h9.2a2 2 0 001.9-1.4l1.8-5.4A2 2 0 0018 10h-4l.7-3.2A2.3 2.3 0 0012.5 4L7 10v10z"/></svg>';
      });
      let i = 0;
      const interval = setInterval(() => {
        textElement.innerHTML += text.charAt(i) === '\n' ? '<br>' : text.charAt(i);
        chatContainer.scrollTop = chatContainer.scrollHeight;
        i++;
        if (i >= text.length) { clearInterval(interval); textElement.classList.remove('streaming'); actionBar.classList.add('show'); }
      }, profile.streamDelay || 25);
    }

    composerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const val = userInput.value.trim();
      if (!val) return;
      const responseProfile = activeResponseProfile();
      const messageCost = creditCostForText(val);
      if (!spendCredits(messageCost, val.length <= 120 ? 'نامەی کورت' : val.length <= 500 ? 'وەڵامی ئاسایی' : 'گفتوگۆی درێژ')) return;

      welcomeBox.style.display = 'none';
      appendUserMessage(val);
      addHistoryItem(val);
      appendCurrentMessage('user', val);
      userInput.value = '';
      userInput.style.height = '24px';
      micBtn.classList.remove('hidden');
      sendBtn.classList.remove('visible');
      sendBtn.disabled = true;

      const thinkingBubble = document.createElement('div');
      thinkingBubble.className = `message-bubble assistant`;
      thinkingBubble.innerHTML = `<div class="thinking-anim"><span class="brand-mark" aria-label="نیشانەی ژیر"></span></div><div class="message-content-wrapper"><div class="assistant-name">ژیر <span class="response-tier">${responseProfile.responseLabel}</span></div><div class="thinking-text">${responseProfile.responseIntro}<span class="thinking-dots"><i>·</i><i>·</i><i>·</i></span></div></div>`;
      messagesStream.appendChild(thinkingBubble);
      chatContainer.scrollTop = chatContainer.scrollHeight;

      try {
        const responseText = await window.ZHIR_AI.sendMessage(getCurrentMessages());
        thinkingBubble.remove();
        streamAssistantMessage(responseText, responseProfile);
        appendCurrentMessage('model', responseText);
      } catch (error) {
        thinkingBubble.remove();
        const message = error?.message || 'هەڵەیەک لە پەیوەندی بە ژیر ڕوویدا.';
        streamAssistantMessage(`ببورە، ${message}`, responseProfile);
      } finally {
        sendBtn.disabled = false;
      }
    });

    newChatBtn.addEventListener('click', () => {
      messagesStream.innerHTML = '';
      welcomeBox.style.display = 'block';
      toggleMenu(false);
      clearCurrentMessages();
    });
