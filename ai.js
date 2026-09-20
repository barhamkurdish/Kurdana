/* =========================================================
   ai.js — ژیر / Kurdana
   Gemini API connector
   ========================================================= */

(function () {
  "use strict";

  /*
   * =======================================================
   * 1) تەنها لێرە کلیلی Gemini دابنێ
   * =======================================================
   *
   * نموونە:
   * const GEMINI_API_KEY = "AIza....";
   *
   * کلیلی ڕاستەقینەکەت لە نێوان هەمان هێڵەی خوارەوە دابنێ.
   * =======================================================
   */
  const GEMINI_API_KEY = "Ab8RN6IWRfb92PWlqGGwBlMHlPzjN8x37X3P_IDP15HEEBrLCw";

  /*
   * Gemini 3.6 Flash
   * ئەم مۆدێلە بۆ generateContent بەکاردێت.
   */
  const GEMINI_MODEL = "gemini-3.6-flash";

  const GEMINI_ENDPOINT =
    "https://generativelanguage.googleapis.com/v1beta/models/" +
    encodeURIComponent(GEMINI_MODEL) +
    ":generateContent";

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

        return {
          role: role,
          parts: [{ text: text }]
        };
      })
      .filter(Boolean);

    /*
     * Gemini 3.6 generateContent نابێت بە model turn کۆتایی بێت.
     * ئەگەر history بە model کۆتایی هاتبێت، لای دەبەین.
     */
    while (
      normalized.length &&
      normalized[normalized.length - 1].role === "model"
    ) {
      normalized.pop();
    }

    return normalized;
  }

  function extractText(data) {
    const candidates =
      data &&
      Array.isArray(data.candidates)
        ? data.candidates
        : [];

    for (const candidate of candidates) {
      const parts =
        candidate &&
        candidate.content &&
        Array.isArray(candidate.content.parts)
          ? candidate.content.parts
          : [];

      const text = parts
        .map(function (part) {
          return part && typeof part.text === "string"
            ? part.text
            : "";
        })
        .join("\n")
        .trim();

      if (text) return text;
    }

    return "";
  }

  function apiErrorMessage(data, status) {
    if (
      data &&
      data.error &&
      typeof data.error.message === "string"
    ) {
      return data.error.message;
    }

    return "Gemini API HTTP " + String(status || "error");
  }

  async function sendMessage(messages) {
    if (
      !GEMINI_API_KEY ||
      GEMINI_API_KEY === "PASTE_YOUR_GEMINI_API_KEY_HERE"
    ) {
      throw new Error(
        "کلیلی Gemini لە ai.js دانەنراوە. لە سەرەتای فایلەکە GEMINI_API_KEY پڕبکەرەوە."
      );
    }

    const contents = normalizeMessages(messages);

    if (!contents.length) {
      throw new Error("هیچ نامەیەکی دروست بۆ Gemini نەنێردراوە.");
    }

    const payload = {
      system_instruction: {
        parts: [{ text: ZHIR_SYSTEM_PROMPT }]
      },
      contents: contents
    };

    let response;

    try {
      response = await fetch(GEMINI_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": GEMINI_API_KEY
        },
        body: JSON.stringify(payload)
      });
    } catch (networkError) {
      throw new Error(
        "پەیوەندی بە Gemini API نەکرا. ئینتەرنێت و ڕێکخستنی API پشکنە."
      );
    }

    let data = {};

    try {
      data = await response.json();
    } catch (_) {
      data = {};
    }

    if (!response.ok) {
      throw new Error(apiErrorMessage(data, response.status));
    }

    const text = extractText(data);

    if (!text) {
      throw new Error(
        "Gemini هیچ وەڵامێکی دەقی نەگەڕاندەوە."
      );
    }

    return text;
  }

  window.ZHIR_AI = Object.freeze({
    model: GEMINI_MODEL,
    sendMessage: sendMessage
  });
})();
