/* =========================================================
   /api/gemini.js — ژیر / Kurdana
   Secure server-side Gemini proxy for Vercel
   ========================================================= */

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/";

function sendJson(res, status, body) {
  res.status(status).json(body);
}

function extractText(data) {
  const candidates =
    data && Array.isArray(data.candidates) ? data.candidates : [];

  for (const candidate of candidates) {
    const parts =
      candidate &&
      candidate.content &&
      Array.isArray(candidate.content.parts)
        ? candidate.content.parts
        : [];

    const text = parts
      .map(function (part) {
        return part && typeof part.text === "string" ? part.text : "";
      })
      .join("\n")
      .trim();

    if (text) return text;
  }

  return "";
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return sendJson(res, 405, {
      error: "تەنها POST ڕێگەپێدراوە."
    });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return sendJson(res, 500, {
      error: "کلیلی Gemini لە سێرڤەر ڕێک نەخراوە."
    });
  }

  const body = req.body || {};
  const model =
    typeof body.model === "string" && body.model.trim()
      ? body.model.trim()
      : "gemini-3.6-flash";

  const systemInstruction =
    typeof body.systemInstruction === "string"
      ? body.systemInstruction.trim()
      : "";

  const messages = Array.isArray(body.messages) ? body.messages : [];

  if (!messages.length) {
    return sendJson(res, 400, {
      error: "هیچ نامەیەکی دروست نەنێردراوە."
    });
  }

  const contents = messages
    .map(function (message) {
      if (!message || typeof message.text !== "string") return null;

      const role = message.role === "model" ? "model" : "user";
      const text = message.text.trim();

      if (!text) return null;

      return {
        role: role,
        parts: [{ text: text }]
      };
    })
    .filter(Boolean);

  while (
    contents.length &&
    contents[contents.length - 1].role === "model"
  ) {
    contents.pop();
  }

  if (!contents.length) {
    return sendJson(res, 400, {
      error: "هیچ ناوەڕۆکی دروستی بۆ Gemini نەنێردراوە."
    });
  }

  const payload = {
    contents: contents
  };

  if (systemInstruction) {
    payload.system_instruction = {
      parts: [{ text: systemInstruction }]
    };
  }

  let response;

  try {
    response = await fetch(
      GEMINI_API_URL + encodeURIComponent(model) + ":generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        },
        body: JSON.stringify(payload)
      }
    );
  } catch (_) {
    return sendJson(res, 502, {
      error: "پەیوەندی لە سێرڤەرەوە بە Gemini API نەکرا."
    });
  }

  let data = {};

  try {
    data = await response.json();
  } catch (_) {
    data = {};
  }

  if (!response.ok) {
    const message =
      data && data.error && typeof data.error.message === "string"
        ? data.error.message
        : "Gemini API HTTP " + String(response.status);

    return sendJson(res, response.status, { error: message });
  }

  const text = extractText(data);

  if (!text) {
    return sendJson(res, 502, {
      error: "Gemini هیچ وەڵامێکی دەقی نەگەڕاندەوە."
    });
  }

  return sendJson(res, 200, { text: text });
}
