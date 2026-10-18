/**
 * OpenRouter OAuth PKCE Integration for FlickIDE
 * Allows users to 1-click connect their Google account without copying or pasting API keys.
 */

const PKCE_VERIFIER_STORAGE_KEY = "flickide_openrouter_pkce_verifier";

function generateRandomString(length = 48): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
  const array = new Uint8Array(length);
  if (typeof window !== "undefined" && window.crypto) {
    window.crypto.getRandomValues(array);
  }
  return Array.from(array, (byte) => chars[byte % chars.length]).join("");
}

async function sha256Base64Url(plain: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  const hash = await window.crypto.subtle.digest("SHA-256", data);
  const bytes = new Uint8Array(hash);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/**
 * Initiates the OpenRouter OAuth PKCE flow
 * Redirects the user to OpenRouter's Google authentication page.
 */
export async function initiateOpenRouterOAuth(): Promise<void> {
  if (typeof window === "undefined") return;

  try {
    const codeVerifier = generateRandomString(48);
    const codeChallenge = await sha256Base64Url(codeVerifier);

    localStorage.setItem(PKCE_VERIFIER_STORAGE_KEY, codeVerifier);

    // Build callback URL using current origin and pathname (e.g., https://localhost/ or https://flickide.app/)
    const callbackUrl = window.location.origin + window.location.pathname;

    const authUrl = `https://openrouter.ai/auth?callback_url=${encodeURIComponent(
      callbackUrl
    )}&code_challenge=${codeChallenge}&code_challenge_method=S256`;

    window.location.href = authUrl;
  } catch (err) {
    console.error("Failed to initiate OpenRouter OAuth flow:", err);
    throw err;
  }
}

export interface OAuthCallbackResult {
  success: boolean;
  apiKey?: string;
  error?: string;
}

/**
 * Checks the current URL for an OpenRouter authorization code (?code=...)
 * If present, exchanges it for an API key using the saved code_verifier.
 */
export async function handleOpenRouterCallback(): Promise<OAuthCallbackResult | null> {
  if (typeof window === "undefined") return null;

  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get("code");

  if (!code) return null;

  const codeVerifier = localStorage.getItem(PKCE_VERIFIER_STORAGE_KEY);

  // Clean the URL query params so they don't linger in browser history
  const cleanUrl = window.location.pathname + window.location.hash;
  window.history.replaceState({}, document.title, cleanUrl);

  try {
    const response = await fetch("https://openrouter.ai/api/v1/auth/keys", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code,
        code_verifier: codeVerifier || undefined,
        code_challenge_method: "S256",
      }),
    });

    const data = await response.json();

    // Clean up stored verifier
    localStorage.removeItem(PKCE_VERIFIER_STORAGE_KEY);

    if (!response.ok || !data.key) {
      const errMsg = data?.error?.message || data?.error || "Failed to exchange OpenRouter code for API key";
      return { success: false, error: errMsg };
    }

    return {
      success: true,
      apiKey: data.key,
    };
  } catch (err: any) {
    localStorage.removeItem(PKCE_VERIFIER_STORAGE_KEY);
    return {
      success: false,
      error: err?.message || "Network error while connecting to OpenRouter",
    };
  }
}
