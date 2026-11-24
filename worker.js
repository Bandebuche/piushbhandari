/**
 * ============================================================================
 * CLOUDFLARE WORKER - EDGE COMPUTE & ASSET PROXY
 * Support Student Data & Analytics Dashboard
 * ============================================================================
 */

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycby6bmjmxAkzy2aT5CGcKL30FiefsU8ITOi_EVUG4cYsGM1_BZakNiQI6oj0cNQlf9wj/exec";
const TARGET_SPREADSHEET_ID = "1hP5XQ9EtMVQ5qRM0FW2GG8WQkYtXLwFisx7eh96ibz0";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Max-Age": "86400"
        }
      });
    }

    // 1. Edge Compute Health & Diagnostics Endpoint
    if (url.pathname === "/api/health") {
      return new Response(JSON.stringify({
        status: "ok",
        platform: "Cloudflare Workers Edge Compute",
        colo: request.cf?.colo || "local-edge",
        city: request.cf?.city || "edge",
        country: request.cf?.country || "IN",
        edgeTimestamp: new Date().toISOString()
      }), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }

    // 2. Edge Compute - Leads Query with Cloudflare Edge Caching (15s TTL)
    if (url.pathname === "/api/leads") {
      const cacheKey = new Request(url.toString(), request);
      const cache = caches.default;
      const forceRefresh = url.searchParams.get("force") === "true";

      if (!forceRefresh) {
        const cached = await cache.match(cacheKey);
        if (cached) {
          return cached;
        }
      }

      try {
        const targetUrl = `${GOOGLE_SCRIPT_URL}?action=read&spreadsheetId=${TARGET_SPREADSHEET_ID}&limit=100`;
        const res = await fetch(targetUrl);
        const data = await res.json();

        const response = new Response(JSON.stringify(data), {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Cache-Control": "public, max-age=15, s-maxage=30",
            "X-Cloudflare-Compute": "true",
            "X-Edge-Colo": request.cf?.colo || "edge"
          }
        });

        ctx.waitUntil(cache.put(cacheKey, response.clone()));
        return response;
      } catch (err) {
        return new Response(JSON.stringify({ status: "error", message: err.message }), {
          status: 500,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
        });
      }
    }

    // 3. Edge Compute - Submit Lead (Proxy to Google Sheets Backend)
    if (url.pathname === "/api/submit" && request.method === "POST") {
      try {
        const body = await request.json();

        // Edge Validation
        if (!body.name || !body.category) {
          return new Response(JSON.stringify({ status: "error", message: "Name and Category are required" }), {
            status: 400,
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
          });
        }

        const payload = {
          action: "create",
          spreadsheetId: TARGET_SPREADSHEET_ID,
          name: String(body.name).trim(),
          phone: String(body.phone || body.number || "").trim(),
          email: String(body.email || body.gmail || "").trim(),
          category: String(body.category).trim(),
          query: String(body.query || "").trim(),
          typingTime: body.typingTime || new Date().toISOString(),
          assignedBy: body.assignedBy || "Sachin"
        };

        const res = await fetch(GOOGLE_SCRIPT_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        const data = await res.json();

        // Invalidate leads edge cache
        try {
          const cache = caches.default;
          const leadsUrl = new URL("/api/leads", request.url);
          ctx.waitUntil(cache.delete(new Request(leadsUrl.toString())));
        } catch (e) {}

        return new Response(JSON.stringify(data), {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      } catch (err) {
        return new Response(JSON.stringify({ status: "error", message: err.message }), {
          status: 500,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
        });
      }
    }

    // 4. Default: Serve Static Assets via Cloudflare Assets Binding
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return new Response("Not Found", { status: 404 });
  }
};
