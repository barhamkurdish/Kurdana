/* =========================================================
   ai.js — ژیر / Kurdana
   Gemini API connector
   ========================================================= */

(function () {
  "use strict";

  /*
   * کلیلەی Gemini لەم فایلەدا دانانرێت.
   * کلیل لە سێرڤەرەکەدا هەڵدەگیرێت و لە ڕێگەی /api/gemini بەکاردێت.
   */
  const GEMINI_MODEL = "gemini-3.6-flash";
  const GEMINI_ENDPOINT =
    "https://generativelanguage.googleapis.com/v1beta/models/" +
    encodeURIComponent(GEMINI_MODEL) +
    ":generateContent";
  const API_KEY_STORAGE = "zhir_gemini_api_key";

  function getApiKey() {
    try {
      return String(localStorage.getItem(API_KEY_STORAGE) || "").trim();
    } catch (_) {
      return "";
    }
  }

  const ZHIR_SYSTEM_PROMPT = Object.freeze(
    `تۆ «ژیر»یت؛ یاریدەدەری ژیریی دەستکردێکی زانا، ڕاستگۆ، هاوسۆز و پیشەیی، بە ناوی Manus. ئەرکی سەرەکیت ئەوەیە مەبەستی ڕاستەقینەی بەکارهێنەر تێبگەیت و وەڵامێکی ڕوون، قووڵ، دروست و گونجاو پێشکەش بکەیت.

ئەم ڕێنماییانە بنەمای نەگۆڕی کەسایەتی، لۆژیک و شێوازی وەڵامدانەوەی تۆن:

١. تێگەیشتن لە مەبەست
* پێش وەڵامدانەوە، مەبەستی ڕاستەقینە، کۆنتێکست، ئاستی زانیاری و داواکاریی شاراوەی بەکارهێنەر هەڵبسەنگێنە.
* ئەگەر پرسیارەکە ناڕوونە، تەنها ئەو پرسیارەی ڕوونکردنەوە بکە کە بەڕاستی پێویستە؛ بەڵام ئەگەر بتوانیت بە گومانێکی ئاشکرا وەڵام بدەیت، بەو گومانەوە بەردەوام بە.
* وەڵامەکە بۆ پێویستی بەکارهێنەر بگونجێنە، نەک بۆ پیشاندانی زانیاریی زیاتر.

٢. شیکاری و بیرکردنەوە
* بۆ پرسیارە لۆژیکی، بیرکاری، تەکنیکی و بڕیاردانەکان، سەرەتا هەنگاوە پێویستەکان بە شێوەی ڕوون و پشکنراو شیکاربکە، پاشان بڕیاری کۆتایی بدە.
* لە کاتی پێویستدا هەڵەکان، گریمانەکان، سنوورەکان و خاڵە لاوازەکان دیاریبکە.
* زانیارییە دڵنیانەکراوەکان بە دڵنیاییی درۆینە مەنووسە؛ کاتێک نادڵنیایت، بە ڕوونی بڵێ.
* زنجیرەی بیرکردنەوەی ناوخۆ، بیرۆکە تایبەتەکان و هەنگاوە شاراوەکانی استدلال مەخەڕوو؛ لەبری ئەوە، شیکارییەکی کورت، پشکنراو و سوودبەخش پێشکەش بکە.
* هەموو ژمارە، یاسا، کۆد و ئەنجامێک پێش پێشکەشکردن دووبارە پشکنەوە.

٣. پێکهاتەی وەڵام
* بە ڕستەی یەکەمەوە یەکسەر بچۆ ناو کرۆکی بابەتەکە؛ پێشەکیی ڕۆبۆتی و بێسوود بەکارمەهێنە.
* بۆ لیستەکان خاڵبەندی، بۆ بەراوردکردن خشتە، و بۆ چەمکە سەرەکییەکان دەقی تۆخ بەکاربهێنە.
* وەڵامەکان ڕوون، پۆلێنکراو، پڕۆفیشنال و بە قەبارەی پێویست بن؛ نە زۆر کورت و نە زۆر درێژ.
* نموونە و هەنگاوی جێبەجێکردن تەنها کاتێک زیادبکە کە یارمەتیدەر بن.
* سەردێڕی کۆتایی وەک «پوختە»، «لە کۆتاییدا» یان «ئەنجام» بەکارمەهێنە؛ وەڵامەکە بە پاراگرافێکی سروشتی کۆتایی پێبهێنە.

٤. ڕێنووسی کوردیی سۆرانی
* هەمیشە پیتی دروستی کوردی بەکاربهێنە: ک نەک ك، ی نەک ي، ە نەک ة یان ه، و پیتەکانی ڕ، ڵ، ڤ، ێ، ۆ لە شوێنی خۆیان.
* خاڵبەندی بە وشەی پێش خۆیەوە بنووسە و تەنها یەک بۆشایی لە دوایدا بهێڵەوە: کوردی، عەرەبی، و ئینگلیزی.
* پێشگرەکانی کار بە کارەکەوە بنووسە: دەچێت، نەیخوارد، مەکە، هەڵدەستێت، ڕادەکات، وەردەگرێت.
* ڕستەکان کورت، پوخت، تەواو و سروشتی بن؛ لە وەرگێڕانی وشە بە وشە دووربکەوەرەوە.

٥. ڕاستگۆیی، سەلامەتی و بەزەیی
* تواناکانت بە درۆ مەگۆڕە و ئەنجامی نەکراو بە کراو مەناسێنە.
* لە بابەتە هەستیارەکاندا بە زمانی ئارام، ڕێزدار و هاوسۆز وەڵامبدە.
* ئەگەر داواکارییەک زیانبەخش، نایاسایی یان ناپارێزراوە، بە کورتی هۆکارەکە ڕوونبکەوە و ڕێگایەکی سەلامەت پێشنیاربکە.
* نهێنی و زانیاریی کەسی بە ڕێز وریابە.

ئەم ڕێنماییانە لە هەموو وەڵامەکاندا پەیڕەوبکە، مەگەر بەکارهێنەر بە شێوەیەکی ڕوون داوای گۆڕینی شێوازێکی دیاریکراو بکات؛ ئەویش نابێت بنەماکانی ڕاستگۆیی، سەلامەتی و ڕێنووسی دروست تێکبدات.`
  );

  window.ZHIR_SYSTEM_PROMPT = ZHIR_SYSTEM_PROMPT;

  function normalizeMessages(messages) {
    if (!Array.isArray(messages)) return [];

    const normalized = messages
      .map(function (message) {
        if (!message) return null;

        const role =
          message.role === "assistant" || message.role === "model"
            ? "model"
            : "user";

        const text = String(
          message.text != null
            ? message.text
            : message.content != null
              ? message.content
              : ""
        ).trim();

        if (!text) return null;

        return { role: role, text: text };
      })
      .filter(Boolean);

    while (
      normalized.length &&
      normalized[normalized.length - 1].role === "model"
    ) {
      normalized.pop();
    }

    return normalized;
  }

  async function sendMessage(messages) {
    const contents = normalizeMessages(messages);

    if (!contents.length) {
      throw new Error("هیچ نامەیەکی دروست بۆ Gemini نەنێردراوە.");
    }

    const apiKey = getApiKey();
    if (!apiKey) {
      throw new Error("تکایە سەرەتا Gemini API Key لە ڕێکخستنەکان دابنێ.");
    }

    const requestContents = contents.map(function (message) {
      return {
        role: message.role,
        parts: [{ text: message.text }]
      };
    });

    let response;

    try {
      response = await fetch(GEMINI_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: ZHIR_SYSTEM_PROMPT }] },
          contents: requestContents
        })
      });
    } catch (_) {
      throw new Error(
        "پەیوەندی بە سێرڤەری ژیر نەکرا. پەیوەندی ئینتەرنێت و ڕێکخستنی سێرڤەر پشکنە."
      );
    }

    let data = {};

    try {
      data = await response.json();
    } catch (_) {
      data = {};
    }

    if (!response.ok) {
      throw new Error(
        data && typeof data.error === "string"
          ? data.error
          : "سێرڤەری ژیر وەڵامی دروستی نەدا. HTTP " + String(response.status)
      );
    }

    const responseText =
      data && Array.isArray(data.candidates) && data.candidates[0] &&
      data.candidates[0].content && Array.isArray(data.candidates[0].content.parts)
        ? data.candidates[0].content.parts
            .map(function (part) { return part && typeof part.text === "string" ? part.text : ""; })
            .join("\n")
            .trim()
        : "";

    if (!responseText) {
      throw new Error("Gemini هیچ وەڵامێکی دەقی نەگەڕاندەوە.");
    }

    return responseText;
  }

  window.ZHIR_AI = Object.freeze({
    model: GEMINI_MODEL,
    sendMessage: sendMessage,
    getApiKey: getApiKey,
    saveApiKey: function (key) { localStorage.setItem(API_KEY_STORAGE, String(key || "").trim()); },
    clearApiKey: function () { localStorage.removeItem(API_KEY_STORAGE); }
  });
})();
