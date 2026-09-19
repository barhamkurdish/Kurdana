/*
 * Zhir / Kurdana — storage.js
 * Local browser storage only. No UI or API code belongs here.
 */
(function () {
  'use strict';

  const PLAN_CONFIG = Object.freeze({
    'ژیر Lite': { monthly: 1000, daily: 200, level: 'ئاسایی', responseLabel: 'وەڵامی ئاسایی', responseIntro: 'بە شێوەیەکی ڕوون و کورت وەڵام دەدەم.', streamDelay: 28 },
    'ژیر Plus': { monthly: 4000, daily: 400, price: 10000, level: 'باشتر', responseLabel: 'وەڵامی باشتر', responseIntro: 'وەڵامێکی ڕێکخراو و وردتر بۆت ئامادە دەکەم.', streamDelay: 24 },
    'ژیر Pro Plus': { monthly: 6000, daily: 800, price: 20000, level: 'پڕۆفیشنال', responseLabel: 'وەڵامی پێشکەوتوو', responseIntro: 'بە شێوەیەکی قووڵتر و پیشەییتر هەموو خاڵەکان دەخەمەڕوو.', streamDelay: 20 }
  });

  const KEYS = Object.freeze({
    credits: 'zhir-credits-v2',
    plan: 'zhir-selected-plan',
    theme: 'zhir-theme',
    creditIntro: 'zhir-credit-intro-seen',
    profile: 'zhir-profile',
    history: 'zhir-chat-history-v1',
    messages: 'zhir-current-chat-v1'
  });

  const todayKey = () => new Date().toISOString().slice(0, 10);
  const monthKey = () => new Date().toISOString().slice(0, 7);
  const activePlan = () => {
    const saved = localStorage.getItem(KEYS.plan) || 'ژیر Lite';
    return PLAN_CONFIG[saved] ? saved : 'ژیر Lite';
  };

  const loadCredits = () => {
    const plan = activePlan();
    const config = PLAN_CONFIG[plan] || PLAN_CONFIG['ژیر Lite'];
    let data;
    try { data = JSON.parse(localStorage.getItem(KEYS.credits) || 'null'); } catch (_) { data = null; }
    if (!data) data = { plan, monthlyBalance: config.monthly, dailyBalance: config.daily, month: monthKey(), day: todayKey() };
    if (data.plan !== plan) {
      data.plan = plan; data.monthlyBalance = config.monthly; data.dailyBalance = config.daily; data.month = monthKey(); data.day = todayKey();
    }
    if (data.month !== monthKey()) { data.monthlyBalance = config.monthly; data.month = monthKey(); }
    if (data.day !== todayKey()) { data.dailyBalance = config.daily; data.day = todayKey(); }
    localStorage.setItem(KEYS.credits, JSON.stringify(data));
    return data;
  };

  const saveCredits = (data) => localStorage.setItem(KEYS.credits, JSON.stringify(data));

  const getHistory = () => {
    try {
      const value = JSON.parse(localStorage.getItem(KEYS.history) || '[]');
      return Array.isArray(value) ? value : [];
    } catch (_) { return []; }
  };
  const saveHistory = (items) => localStorage.setItem(KEYS.history, JSON.stringify(Array.isArray(items) ? items : []));
  const addHistory = (title) => {
    const clean = String(title || '').trim();
    if (!clean) return;
    const items = getHistory().filter((item) => item.title !== clean);
    items.unshift({ title: clean, createdAt: new Date().toISOString() });
    saveHistory(items.slice(0, 50));
  };
  const clearHistory = () => localStorage.removeItem(KEYS.history);

  const getCurrentMessages = () => {
    try {
      const value = JSON.parse(localStorage.getItem(KEYS.messages) || '[]');
      return Array.isArray(value) ? value : [];
    } catch (_) { return []; }
  };
  const saveCurrentMessages = (items) => localStorage.setItem(KEYS.messages, JSON.stringify(Array.isArray(items) ? items.slice(-40) : []));
  const appendCurrentMessage = (role, text) => {
    const items = getCurrentMessages();
    items.push({ role, text: String(text || ''), createdAt: new Date().toISOString() });
    saveCurrentMessages(items);
  };
  const clearCurrentMessages = () => localStorage.removeItem(KEYS.messages);

  window.ZHIR_STORAGE = Object.freeze({
    KEYS, PLAN_CONFIG, todayKey, monthKey, activePlan, loadCredits, saveCredits,
    getHistory, saveHistory, addHistory, clearHistory,
    getCurrentMessages, saveCurrentMessages, appendCurrentMessage, clearCurrentMessages
  });
})();
