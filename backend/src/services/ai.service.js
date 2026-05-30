const fs = require("fs");
const path = require("path");
const axios = require("axios");
const FormData = require("form-data");
const env = require("../config/env");

const fallbackClassification = {
  category: "Autre",
  confidence: 0,
  model: "AI service unavailable",
  language: "unknown",
  extracted_text_length: 0
};

function fallback(message = "AI service unavailable.") {
  return {
    ...fallbackClassification,
    status: "error",
    message
  };
}

function normalizeClassification(payload) {
  return {
    category: payload.category || "Autre",
    confidence: Number(payload.confidence || 0),
    model: payload.model || fallbackClassification.model,
    language: payload.language || "unknown",
    extracted_text_length: Number(payload.extracted_text_length || 0),
    status: payload.status || "success",
    message: payload.message || null
  };
}

function getClassifyUrls() {
  const baseUrl = (env.AI_SERVICE_URL || "http://127.0.0.1:8001").replace(/\/+$/, "");
  const urls = [`${baseUrl}/classify`];

  if (baseUrl.includes("localhost")) {
    urls.push(`${baseUrl.replace("localhost", "127.0.0.1")}/classify`);
  } else if (baseUrl.includes("127.0.0.1")) {
    urls.push(`${baseUrl.replace("127.0.0.1", "localhost")}/classify`);
  }

  return [...new Set(urls)];
}

function isValidSuccessPayload(payload) {
  return (
    payload &&
    payload.status === "success" &&
    Boolean(payload.category) &&
    payload.confidence !== undefined &&
    payload.confidence !== null
  );
}

async function postFileToAiService(filePath, classifyUrl) {
  const form = new FormData();
  form.append("file", fs.createReadStream(filePath), {
    filename: path.basename(filePath)
  });

  return axios.post(classifyUrl, form, {
    headers: form.getHeaders(),
    timeout: env.AI_SERVICE_TIMEOUT_MS,
    maxBodyLength: Infinity,
    maxContentLength: Infinity,
    proxy: false,
    validateStatus: () => true
  });
}

async function classifyDocument(filePath) {
  console.log("[AI] File path:", filePath);

  try {
    if (!fs.existsSync(filePath)) {
      throw new Error(`Uploaded file not found at path: ${filePath}`);
    }

    const classifyUrls = getClassifyUrls();
    let lastErrorMessage = "AI service unavailable.";

    for (const classifyUrl of classifyUrls) {
      try {
        console.log("[AI] Calling AI service:", classifyUrl);

        const response = await postFileToAiService(filePath, classifyUrl);
        console.log("[AI] HTTP status:", response.status);
        console.log("[AI] Response:", response.data);

        if (response.status < 200 || response.status >= 300) {
          lastErrorMessage = `AI service returned HTTP ${response.status}.`;
          console.error("[AI] Invalid HTTP status, using fallback:", response.data);
          continue;
        }

        const aiPayload = response.data || {};

        if (!isValidSuccessPayload(aiPayload)) {
          lastErrorMessage =
            aiPayload.message || "AI service returned an invalid classification response.";
          console.error("[AI] Invalid AI response, using fallback:", aiPayload);
          continue;
        }

        return normalizeClassification(aiPayload);
      } catch (error) {
        lastErrorMessage = error.message || "AI service unavailable.";
        console.error("[AI] Classification failed:", error.message);
        console.error("[AI] Error response:", error.response?.data);

        if (error.code === "ECONNABORTED" || String(error.message).includes("timeout")) {
          break;
        }
      }
    }

    return fallback(lastErrorMessage);
  } catch (error) {
    console.error("[AI] Classification failed:", error.message);
    console.error("[AI] Error response:", error.response?.data);
    return fallback(error.message || "AI service unavailable.");
  }
}

module.exports = {
  classifyDocument
};
