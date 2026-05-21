// Core utilities and deep linking logic

// 1. Base62 Character Set
const BASE62_CHARS = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

export function generateShortCode(length: number = 5): string {
  let result = '';
  const randomBytes = new Uint8Array(length);
  
  if (typeof globalThis !== 'undefined' && globalThis.crypto) {
    globalThis.crypto.getRandomValues(randomBytes);
  } else {
    // Fallback
    for (let i = 0; i < length; i++) {
      randomBytes[i] = Math.floor(Math.random() * 256);
    }
  }

  for (let i = 0; i < length; i++) {
    const index = randomBytes[i] % BASE62_CHARS.length;
    result += BASE62_CHARS[index];
  }
  return result;
}

/**
 * Appends the LINE-specific parameter to exit the in-app Webview and open in default Safari/Chrome.
 */
export function appendLineEscapeParam(url: string): string {
  try {
    const parsed = new URL(url);
    parsed.searchParams.set('openExternalBrowser', '1');
    return parsed.toString();
  } catch {
    // Fallback if URL is malformed or relative
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}openExternalBrowser=1`;
  }
}

/**
 * Parses standard Thai app URLs and attempts to translate them into native mobile app protocols.
 */
export function mapUrlToNativeScheme(urlStr: string): string | null {
  try {
    const url = new URL(urlStr);
    const host = url.hostname.toLowerCase();
    const path = url.pathname;

    // Instagram Deep Linking
    if (host.includes('instagram.com')) {
      // Check if it's a post/reel or profile
      if (path.startsWith('/p/') || path.startsWith('/reel/')) {
        const parts = path.split('/').filter(Boolean);
        const mediaId = parts[1];
        if (mediaId) {
          return `instagram://media?id=${mediaId}`;
        }
      }
      const username = path.split('/').filter(Boolean)[0];
      if (username && username !== 'explore' && username !== 'developer') {
        return `instagram://user?username=${username}`;
      }
      return 'instagram://';
    }

    // TikTok Deep Linking
    if (host.includes('tiktok.com')) {
      // Matches tiktok://
      return `snssdk1128://`; // General Android/iOS TikTok app scheme
    }

    // Shopee Deep Linking (Thailand / General)
    if (host.includes('shopee.co.th') || host.includes('shopee.com')) {
      return `shopee://`; // Generic shopee scheme triggers native app landing
    }

    // Lazada Deep Linking
    if (host.includes('lazada.co.th') || host.includes('lazada.com')) {
      return `lazada://`; // Generic lazada scheme triggers app landing
    }

    // LINE Deep Linking
    if (host.includes('line.me')) {
      // e.g., https://line.me/ti/p/@myuser -> line://ti/p/@myuser
      // e.g., https://line.me/R/ti/p/@myuser -> line://ti/p/@myuser (R/ is custom redirect)
      const linePath = path.replace(/^\/R/, ''); // Strip out the /R if present
      return `line:/${linePath}${url.search}`;
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Builds a fast, professional HTML/JS redirect template.
 * Attempts to launch the native app via its URI protocol,
 * falling back to the standard web URL after 1.5 seconds if the app is not installed.
 */
export function buildDeepLinkHtml(targetUrl: string, nativeScheme: string): string {
  // Safe JSON encoding to avoid script injections
  const safeTargetUrl = JSON.stringify(targetUrl);
  const safeNativeScheme = JSON.stringify(nativeScheme);

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>กำลังวาร์ป...</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Prompt:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body {
      margin: 0;
      padding: 0;
      width: 100vw;
      height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background-color: #FCFAF6;
      color: #1e293b;
      font-family: 'Prompt', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      overflow: hidden;
    }
    .container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      animation: fadeIn 0.4s ease-out;
    }
    .spinner {
      width: 56px;
      height: 56px;
      border: 4px solid rgba(16, 185, 129, 0.1);
      border-top: 4px solid #10b981;
      border-radius: 50%;
      animation: spin 0.8s cubic-bezier(0.5, 0.1, 0.1, 0.9) infinite;
      margin-bottom: 28px;
      box-shadow: 0 0 15px rgba(16, 185, 129, 0.08);
    }
    .text {
      font-size: 18px;
      font-weight: 600;
      color: #10b981;
      text-align: center;
      padding: 0 20px;
    }
    .subtext {
      font-size: 13px;
      color: #64748b;
      margin-top: 8px;
      text-align: center;
      padding: 0 30px;
      max-width: 280px;
      line-height: 1.6;
    }
    .brand {
      position: fixed;
      bottom: 24px;
      font-size: 11px;
      color: #94a3b8;
      font-weight: 500;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="spinner"></div>
    <div class="text">กำลังวาร์ปคุณเข้าสู่แอป...</div>
    <div class="subtext">ระบบกำลังเปิดแอปพลิเคชันอย่างรวดเร็ว หากไม่เปิดขึ้นมาอัตโนมัติ จะนำทางผ่านเว็บบราวเซอร์ทันที</div>
  </div>
  <div class="brand">QRCup — คิวอาร์โค้ดอัจฉริยะ</div>

  <script>
    (function() {
      var targetUrl = ${safeTargetUrl};
      var nativeScheme = ${safeNativeScheme};
      var start = Date.now();

      // 1. Attempt to open the native application
      window.location.href = nativeScheme;

      // 2. Set timeout fallback to the web URL
      var fallback = setTimeout(function() {
        // If the user's browser is still active and visible (app not installed or failed to launch)
        if (Date.now() - start < 2000) {
          window.location.href = targetUrl;
        }
      }, 1500);

      // 3. Fallback on page visibility change (safeguard)
      window.addEventListener('blur', function() {
        // Browser lost focus, app likely launched successfully!
        // We cancel further redirection so if they come back, they don't get redirected again.
        clearTimeout(fallback);
      });
    })();
  </script>
</body>
</html>`;
}
