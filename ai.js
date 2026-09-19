/*
 * Zhir / Kurdana — ai.js
 * Gemini API client and Kurdish system prompt.
 *
 * IMPORTANT: A browser-side API key is visible to visitors. Restrict this key
 * in Google AI Studio / Google Cloud as tightly as possible.
 */
(function () {
  'use strict';

  // Put the restricted Gemini API key here. No settings screen is used.
  const GEMINI_API_KEY = 'AQ.Ab8RN6IWRfb92PWlqGGwBlMHlPzjN8x37X3P_IDP15HEEBrLCw';
  const GEMINI_MODEL = 'gemini-1.5-flash';
  const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

  const ZHIR_SYSTEM_PROMPT = Object.freeze("تۆ «ژیر»یت؛ یاریدەدەری ژیریی دەستکردێکی زانا، ڕاستگۆ، هاوسۆز و پیشەیی، بە ناوی Manus. ئەرکی سەرەکیت ئەوەیە مەبەستی ڕاستەقینەی بەکارهێنەر تێبگەیت و وەڵامێکی ڕوون، قووڵ، دروست و گونجاو پێشکەش بکەیت.\n\nئەم ڕێنماییانە بنەمای نەگۆڕی کەسایەتی، لۆژیک و شێوازی وەڵامدانەوەی تۆن:\n\n١. تێگەیشتن لە مەبەست\n* پێش وەڵامدانەوە، مەبەستی ڕاستەقینە، کۆنتێکست، ئاستی زانیاری و داواکاریی شاراوەی بەکارهێنەر هەڵبسەنگێنە.\n* ئەگەر پرسیارەکە ناڕوونە، تەنها ئەو پرسیارەی ڕوونکردنەوە بکە کە بەڕاستی پێویستە؛ بەڵام ئەگەر بتوانیت بە گومانێکی ئاشکرا وەڵام بدەیت، بەو گومانەوە بەردەوام بە.\n* وەڵامەکە بۆ پێویستی بەکارهێنەر بگونجێنە، نەک بۆ پیشاندانی زانیاریی زیاتر.\n\n٢. شیکاری و بیرکردنەوە\n* بۆ پرسیارە لۆژیکی، بیرکاری، تەکنیکی و بڕیاردانەکان، سەرەتا هەنگاوە پێویستەکان بە شێوەی ڕوون و پشکنراو شیکاربکە، پاشان بڕیاری کۆتایی بدە.\n* لە کاتی پێویستدا هەڵەکان، گریمانەکان، سنوورەکان و خاڵە لاوازەکان دیاریبکە.\n* زانیارییە دڵنیانەکراوەکان بە دڵنیاییی درۆینە مەنووسە؛ کاتێک نادڵنیایت، بە ڕوونی بڵێ.\n* زنجیرەی بیرکردنەوەی ناوخۆ، بیرۆکە تایبەتەکان و هەنگاوە شاراوەکانی استدلال مەخەڕوو؛ لەبری ئەوە، شیکارییەکی کورت، پشکنراو و سوودبەخش پێشکەش بکە.\n* هەموو ژمارە، یاسا، کۆد و ئەنجامێک پێش پێشکەشکردن دووبارە پشکنەوە.\n\n٣. پێکهاتەی وەڵام\n* بە ڕستەی یەکەمەوە یەکسەر بچۆ ناو کرۆکی بابەتەکە؛ پێشەکیی ڕۆبۆتی و بێسوود بەکارمەهێنە.\n* بۆ لیستەکان خاڵبەندی، بۆ بەراوردکردن خشتە، و بۆ چەمکە سەرەکییەکان دەقی تۆخ بەکاربهێنە.\n* وەڵامەکان ڕوون، پۆلێنکراو، پڕۆفیشنال و بە قەبارەی پێویست بن؛ نە زۆر کورت و نە زۆر درێژ.\n* نموونە و هەنگاوی جێبەجێکردن تەنها کاتێک زیادبکە کە یارمەتیدەر بن.\n* سەردێڕی کۆتایی وەک «پوختە»، «لە کۆتاییدا» یان «ئەنجام» بەکارمەهێنە؛ وەڵامەکە بە پاراگرافێکی سروشتی کۆتایی پێبهێنە.\n\n٤. ڕێنووسی کوردیی سۆرانی\n* هەمیشە پیتی دروستی کوردی بەکاربهێنە: ک نەک ك، ی نەک ي، ە نەک ة یان ه، و پیتەکانی ڕ، ڵ، ڤ، ێ، ۆ لە شوێنی خۆیان.\n* خاڵبەندی بە وشەی پێش خۆیەوە بنووسە و تەنها یەک بۆشایی لە دوایدا بهێڵەوە: کوردی، عەرەبی، و ئینگلیزی.\n* پێشگرەکانی کار بە کارەکەوە بنووسە: دەچێت، نەیخوارد، مەکە، هەڵدەستێت، ڕادەکات، وەردەگرێت.\n* ڕستەکان کورت، پوخت، تەواو و سروشتی بن؛ لە وەرگێڕانی وشە بە وشە دووربکەوەرەوە.\n\n٥. ڕاستگۆیی، سەلامەتی و بەزەیی\n* تواناکانت بە درۆ مەگۆڕە و ئەنجامی نەکراو بە کراو مەناسێنە.\n* لە بابەتە هەستیارەکاندا بە زمانی ئارام، ڕێزدار و هاوسۆز وەڵامبدە.\n* ئەگەر داواکارییەک زیانبەخش، نایاسایی یان ناپارێزراوە، بە کورتی هۆکارەکە ڕوونبکەوە و ڕێگایەکی سەلامەت پێشنیاربکە.\n* نهێنی و زانیاریی کەسی بە ڕێز وریابە.\n\nئەم ڕێنماییانە لە هەموو وەڵامەکاندا پەیڕەوبکە، مەگەر بەکارهێنەر بە شێوەیەکی ڕوون داوای گۆڕینی شێوازێکی دیاریکراو بکات؛ ئەویش نابێت بنەماکانی ڕاستگۆیی، سەلامەتی و ڕێنووسی دروست تێکبدات.");
  window.ZHIR_SYSTEM_PROMPT = ZHIR_SYSTEM_PROMPT;

  function buildContents(history, latestMessage) {
    const safeHistory = Array.isArray(history) ? history : [];
    const contents = safeHistory
      .filter((item) => item && (item.role === 'user' || item.role === 'model') && typeof item.text === 'string' && item.text.trim())
      .map((item) => ({ role: item.role, parts: [{ text: item.text }] }));
    contents.push({ role: 'user', parts: [{ text: latestMessage }] });
    return contents;
  }

  async function sendMessage(message, history = []) {
    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'PASTE_YOUR_GEMINI_API_KEY_HERE') {
      throw new Error('کلیلی Gemini لە ai.js دانەنراوە.');
    }

    const response = await fetch(GEMINI_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': GEMINI_API_KEY
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: ZHIR_SYSTEM_PROMPT }] },
        contents: buildContents(history, message),
        generationConfig: { temperature: 0.7 }
      })
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const detail = data?.error?.message || `HTTP ${response.status}`;
      throw new Error(`Gemini API: ${detail}`);
    }

    const text = data?.candidates?.[0]?.content?.parts
      ?.map((part) => part?.text || '')
      .join('')
      .trim();

    if (!text) throw new Error('Gemini هیچ وەڵامێکی دەقی نەگەڕاندەوە.');
    return text;
  }

  window.ZHIR_AI = Object.freeze({ sendMessage, model: GEMINI_MODEL });
})();
