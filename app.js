/* Boss OS - one app for ghost.ai and Zoomies Studio. No libraries, no build step.
   Talks to Supabase with plain fetch (login + 3 database functions). Only the public key lives here. */
(function () {
  "use strict";
  if (window.top !== window.self) { document.documentElement.innerHTML = ""; try { window.top.location = window.self.location; } catch (e) {} return; }
  const CFG = window.OS_CONFIG;
  const BIZ = CFG.biz;                       // "ghost" | "zoomies"
  const NAME = BIZ === "ghost" ? "ghost.ai" : "Zoomies Studio";
  const KEY = "bossos.session";
  const $ = (s, r) => (r || document).querySelector(s);
  const esc = (v) => String(v == null ? "" : v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const nf = new Intl.NumberFormat("en-PK");
  const pkr = (n) => "Rs " + nf.format(Math.round(Number(n) || 0));
  const short = (n) => { n = Number(n) || 0; const a = Math.abs(n); return a >= 1e6 ? (n / 1e6).toFixed(1) + "M" : a >= 1e3 ? (n / 1e3).toFixed(a >= 1e4 ? 0 : 1) + "k" : String(Math.round(n)); };
  const delta = (now, prev) => { now = +now || 0; prev = +prev || 0; if (!prev) return now ? { t: "new", c: "up" } : { t: "-", c: "" }; const p = Math.round((now - prev) / prev * 100); return { t: (p >= 0 ? "+" : "") + p + "%", c: p >= 0 ? "up" : "down" }; };
  const ICON = {
    home: '<path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    cart: '<circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2 3h3l2.6 12.4a1 1 0 0 0 1 .8h9.2a1 1 0 0 0 1-.8L21 7H6"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.6-3.6 3.2-5.5 6.5-5.5s5.9 1.9 6.5 5.5"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.8c2 .6 3.2 2.3 3.6 5.2"/>',
    spark: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M18 6l-2.5 2.5M8.5 15.5L6 18"/>',
    cog: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    folder: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
    wallet: '<path d="M3 7a2 2 0 0 1 2-2h13v4"/><path d="M3 7v11a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-9a1 1 0 0 0-1-1H5a2 2 0 0 1-2-2z"/><circle cx="17" cy="14.5" r="1"/>',
    mega: '<path d="M3 11v2a1 1 0 0 0 1 1h3l8 4V6L7 10H4a1 1 0 0 0-1 1z"/><path d="M18 9a4 4 0 0 1 0 6"/>',
    refresh: '<path d="M20 11a8 8 0 0 0-14.9-3M4 5v4h4M4 13a8 8 0 0 0 14.9 3M20 19v-4h-4"/>',
    bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 8 3 8H3s3-1 3-8M10 20a2 2 0 0 0 4 0"/>',
    eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
    print: '<path d="M6 9V3h12v6M6 18H4a1 1 0 0 1-1-1v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6a1 1 0 0 1-1 1h-2"/><rect x="6" y="14" width="12" height="7"/>',
    dl: '<path d="M12 3v12M7 11l5 5 5-5M4 21h16"/>',
    cmd: '<path d="M9 6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3z"/>',
    out: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
  };
  const ico = (n) => '<svg viewBox="0 0 24 24">' + ICON[n] + "</svg>";

  /* ---------- Supabase over plain fetch ---------- */
  const H = (tok) => ({ apikey: CFG.key, Authorization: "Bearer " + (tok || CFG.key), "Content-Type": "application/json" });
  const readSession = () => { try { return JSON.parse(localStorage.getItem(KEY) || "null"); } catch (e) { return null; } };
  const writeSession = (s) => { try { s ? localStorage.setItem(KEY, JSON.stringify(s)) : localStorage.removeItem(KEY); } catch (e) {} };
  let session = readSession();

  async function auth(path, body) {
    const r = await fetch(CFG.url + "/auth/v1/" + path, { method: "POST", headers: H(), body: JSON.stringify(body) });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j.msg || j.error_description || j.message || "Login failed (" + r.status + ")");
    return j;
  }
  function keep(j) {
    if (!j.access_token) return null;
    session = { access_token: j.access_token, refresh_token: j.refresh_token, expires_at: Math.floor(Date.now() / 1000) + (j.expires_in || 3600) - 30, email: (j.user && j.user.email) || (session && session.email) || "" };
    writeSession(session); return session;
  }
  async function fresh() {
    if (!session) throw new Error("login");
    if (Date.now() / 1000 > session.expires_at) {
      try { keep(await auth("token?grant_type=refresh_token", { refresh_token: session.refresh_token })); }
      catch (e) { session = null; writeSession(null); throw new Error("login"); }
    }
    return session.access_token;
  }
  async function rpc(fn, args) {
    const tok = await fresh();
    const r = await fetch(CFG.url + "/rest/v1/rpc/" + fn, { method: "POST", headers: H(tok), body: JSON.stringify(args || {}) });
    const j = await r.json().catch(() => null);
    if (r.status === 401) { session = null; writeSession(null); throw new Error("login"); }
    if (!r.ok) throw new Error((j && (j.message || j.hint)) || "Server error " + r.status);
    return j;
  }

  /* ---------- charts (hand-drawn SVG) ---------- */
  function lineChart(el, rows, series, fmt) {
    const W = 640, Hh = 170, pl = 38, pr = 8, pt = 10, pb = 22;
    const max = Math.max(1, ...series.flatMap((s) => rows.map((r) => +r[s.k] || 0))) * 1.12;
    const x = (i) => pl + (rows.length < 2 ? 0 : i * (W - pl - pr) / (rows.length - 1));
    const y = (v) => pt + (Hh - pt - pb) * (1 - v / max);
    let g = "";
    for (let t = 0; t <= 3; t++) { const v = max * t / 3, yy = y(v); g += `<line x1="${pl}" x2="${W - pr}" y1="${yy}" y2="${yy}" class="gl"/><text x="${pl - 6}" y="${yy + 3}" text-anchor="end">${short(v)}</text>`; }
    const step = Math.ceil(rows.length / 6);
    rows.forEach((r, i) => { if (i % step === 0 || i === rows.length - 1) g += `<text x="${x(i)}" y="${Hh - 4}" text-anchor="middle">${esc(r.label)}</text>`; });
    series.forEach((s, si) => {
      const pts = rows.map((r, i) => [x(i), y(+r[s.k] || 0)]);
      const d = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
      const id = "gr" + si + Math.random().toString(36).slice(2, 6);
      g += `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${s.c}" stop-opacity=".28"/><stop offset="1" stop-color="${s.c}" stop-opacity="0"/></linearGradient></defs>`;
      if (si === 0) g += `<path d="${d} L${x(rows.length - 1)} ${Hh - pb} L${x(0)} ${Hh - pb}Z" fill="url(#${id})"/>`;
      g += `<path d="${d}" fill="none" stroke="${s.c}" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/>`;
      const hi = rows.reduce((b, r, i) => ((+r[s.k] || 0) > (+rows[b][s.k] || 0) ? i : b), 0);
      if (rows.length) g += `<circle cx="${pts[hi][0]}" cy="${pts[hi][1]}" r="4.5" fill="${s.c}" stroke="#000" stroke-opacity=".4"/>`;
    });
    el.innerHTML = `<svg class="chart" viewBox="0 0 ${W} ${Hh}" preserveAspectRatio="none">${g}<rect class="hit" x="0" y="0" width="${W}" height="${Hh}" fill="transparent"/></svg><div class="tip hidden"></div>`;
    hover(el, rows, series, x, W, fmt);
  }
  function barChart(el, rows, series, fmt) {
    const W = 640, Hh = 170, pl = 38, pr = 8, pt = 10, pb = 22;
    const max = Math.max(1, ...series.flatMap((s) => rows.map((r) => +r[s.k] || 0))) * 1.12;
    const y = (v) => pt + (Hh - pt - pb) * (1 - v / max);
    const slot = (W - pl - pr) / Math.max(1, rows.length), bw = Math.min(16, slot / (series.length + 0.8));
    let g = "";
    for (let t = 0; t <= 3; t++) { const v = max * t / 3, yy = y(v); g += `<line x1="${pl}" x2="${W - pr}" y1="${yy}" y2="${yy}" class="gl"/><text x="${pl - 6}" y="${yy + 3}" text-anchor="end">${short(v)}</text>`; }
    const xs = (i) => pl + slot * i + slot / 2;
    rows.forEach((r, i) => {
      g += `<text x="${xs(i)}" y="${Hh - 4}" text-anchor="middle">${esc(r.label)}</text>`;
      series.forEach((s, si) => { const v = +r[s.k] || 0, h = Math.max(0, Hh - pb - y(v)), bx = xs(i) - (series.length * bw + (series.length - 1) * 3) / 2 + si * (bw + 3); g += `<rect x="${bx}" y="${Hh - pb - h}" width="${bw}" height="${h}" rx="4" style="fill:${s.c}"/>`; });
    });
    el.innerHTML = `<svg class="chart" viewBox="0 0 ${W} ${Hh}" preserveAspectRatio="none">${g}<rect class="hit" x="0" y="0" width="${W}" height="${Hh}" fill="transparent"/></svg><div class="tip hidden"></div>`;
    hover(el, rows, series, xs, W, fmt);
  }
  function hover(el, rows, series, xf, W, fmt) {
    const hit = $(".hit", el), tip = $(".tip", el); if (!hit || !rows.length) return;
    const move = (ev) => {
      const b = hit.getBoundingClientRect(), px = (ev.clientX - b.left) / b.width * W;
      let bi = 0, bd = 1e9; rows.forEach((_, i) => { const d = Math.abs(xf(i) - px); if (d < bd) { bd = d; bi = i; } });
      const r = rows[bi]; tip.innerHTML = `<b>${esc(r.label)}</b><br>` + series.map((s) => `<span style="color:${s.c}">●</span> ${esc(s.n)}: ${(fmt || pkr)(r[s.k], s)}`).join("<br>");
      tip.style.left = (xf(bi) / W * b.width + hit.parentNode.getBoundingClientRect().left * 0 + 0) + "px"; tip.style.top = "26px"; tip.classList.remove("hidden");
    };
    hit.addEventListener("mousemove", move); hit.addEventListener("touchstart", (e) => move(e.touches[0]), { passive: true });
    hit.addEventListener("mouseleave", () => tip.classList.add("hidden"));
  }
  function ring(pct, label) {
    pct = Math.max(0, Math.min(100, pct)); const c = 2 * Math.PI * 46, d = c * pct / 100;
    return `<svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="46" fill="none" style="stroke:var(--track)" stroke-width="12"/><circle cx="60" cy="60" r="46" fill="none" stroke="var(--acc)" stroke-width="12" stroke-linecap="round" stroke-dasharray="${d} ${c}" transform="rotate(-90 60 60)"/><text x="60" y="58" text-anchor="middle" style="fill:var(--fg);font-size:22px;font-weight:700">${Math.round(pct)}%</text><text x="60" y="76" text-anchor="middle" style="font-size:10px">${esc(label)}</text></svg>`;
  }
  const bars = (rows, f) => { const m = Math.max(1, ...rows.map((r) => f(r).v)); return '<div class="bars">' + rows.map((r) => { const o = f(r); return `<div class="bar-row"><span>${esc(o.l)}</span><div class="tr"><i style="width:${Math.max(2, o.v / m * 100)}%"></i></div><span class="v num">${esc(o.t)}</span></div>`; }).join("") + "</div>"; };
  const TB = {}, SORT = {}, LIM = {};
  const plain = (h) => String(h).replace(/<[^>]*>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#39;/g, "'").replace(/&quot;/g, '"').trim();
  const numKey = (t) => { const m = String(t).replace(/,/g, "").match(/-?\d+(\.\d+)?/); return m && /^[^a-z]*$/i.test(String(t).replace(/Rs|rs/g, "")) ? parseFloat(m[0]) : null; };
  function sorted(id) {
    const t = TB[id], so = SORT[id]; let rows = t.rows.slice();
    if (so) { const c = t.cols[so.i], key = (r) => plain(c.f(r)); rows.sort((a, b) => { const x = key(a), y = key(b), nx = numKey(x), ny = numKey(y); const d = nx != null && ny != null ? nx - ny : x.localeCompare(y); return so.dir * d; }); }
    return rows;
  }
  const table = (cols, rows, empty, id) => {
    TB[id] = { cols, rows };
    if (!rows.length) return `<div class="empty">${esc(empty || "Nothing here yet.")}</div>`;
    const all = sorted(id), lim = LIM[id] || 10, show = all.slice(0, lim), so = SORT[id];
    return `<div class="tbar"><span>${rows.length} row${rows.length === 1 ? "" : "s"}</span><button class="btn ghost sm" data-csv="${id}">${ico("dl")} Export CSV</button></div>
      <div class="tbl-wrap"><table><thead><tr>${cols.map((c, i) => `<th class="${c.n ? "n" : ""} ${c.ns ? "" : "srt"}" ${c.ns ? "" : `data-sort="${id}:${i}"`}>${esc(c.h)}${so && so.i === i ? (so.dir > 0 ? " ▲" : " ▼") : ""}</th>`).join("")}</tr></thead><tbody>${show.map((r) => "<tr>" + cols.map((c) => `<td class="${c.n ? "n num" : ""} ${c.w ? "wrap" : ""}">${c.f(r)}</td>`).join("") + "</tr>").join("")}</tbody></table></div>
      ${all.length > lim ? `<div class="more"><button class="btn ghost sm" data-more="${id}">Show ${Math.min(10, all.length - lim)} more (${all.length - lim} left)</button></div>` : ""}`;
  };
  const pill = (s) => `<span class="pill ${esc(s)}">${esc(s)}</span>`;
  const spark = (a) => { if (!a || a.length < 2) return ""; const mx = Math.max(...a), mn = Math.min(...a), r = mx - mn || 1; const d = a.map((v, i) => (i ? "L" : "M") + (i / (a.length - 1) * 100).toFixed(1) + " " + (26 - (v - mn) / r * 22).toFixed(1)).join(" "); return `<svg class="spark" viewBox="0 0 100 28" preserveAspectRatio="none"><path d="${d}" fill="none" stroke="var(--acc)" stroke-width="2" vector-effect="non-scaling-stroke" stroke-linecap="round" stroke-linejoin="round"/></svg>`; };
  const kpi = (l, v, sm, cls, sp) => `<div class="box kpi ${cls || ""}"><div class="lbl">${esc(l)}</div><div class="val num">${v}</div><div class="sm">${sm || "&nbsp;"}</div>${spark(sp)}</div>`;
  const dsm = (d, txt) => `<span class="${d.c}">${d.t}</span> ${txt}`;
  const dayLabel = (s) => s.slice(5).replace("-", "/");
  const monLabel = (s) => ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][+s.slice(5) - 1];
  const greet = () => { const h = new Date().getUTCHours() + 5; const hh = h % 24; return hh < 12 ? "Good morning" : hh < 18 ? "Good afternoon" : "Good evening"; };
  const head = (t, p, right) => `<div class="head"><div><h1>${t}</h1><p>${p}</p></div>${right || ""}</div>`;
  const options = (a, sel) => a.map((o) => `<option ${o === sel ? "selected" : ""}>${esc(o)}</option>`).join("");
  const SRC = ["fiverr", "upwork", "instagram", "facebook", "whatsapp", "referral", "website", "walk-in", "other"];
  const SVC = ["website", "ordering system", "pos", "app", "branding", "other"];
  const CH = ["fiverr", "upwork", "instagram", "facebook", "whatsapp", "tiktok", "linkedin", "website", "other"];

  /* ---------- pages ---------- */
  const PAGES = {
    ghost: [["overview", "Overview", "home"], ["sales", "Sales", "cart"], ["users", "Users", "users"], ["insights", "Insights", "spark"], ["settings", "Settings", "cog"]],
    zoomies: [["overview", "Overview", "home"], ["leads", "Leads", "target"], ["projects", "Projects", "folder"], ["payments", "Payments", "wallet"], ["marketing", "Marketing", "mega"], ["insights", "Insights", "spark"], ["settings", "Settings", "cog"]],
  }[BIZ];
  let D = null, page = (location.hash || "#overview").slice(1), q = "";

  const R = {};
  /* ----- ghost ----- */
  R.ghost_overview = () => {
    const k = D.kpis, dr = delta(k.revenue_month, k.revenue_prev_month), nu = delta(k.new_7d, k.new_prev_7d);
    const conv = k.users ? k.paid_now / k.users * 100 : 0;
    return head(`${greet()}, Boss`, "Here is how ghost.ai is doing right now.") +
      `<div class="grid g-hero"><div class="box"><div class="box-top"><h3>ghost.ai card</h3><span class="tag">live</span></div><div class="hint">Everything is counted from the real database</div>
        <div class="plastic"><div class="brand"><span class="logo" style="width:22px;height:22px;border-radius:7px;font-size:12px">g</span> ghost.ai</div><div class="chip"></div><div class="pn">${String(k.users).padStart(4, "0")} •••• •••• ${String(k.paid_now).padStart(4, "0")}</div>
        <div class="row"><div><div style="opacity:.7">USERS</div><div class="big">${nf.format(k.users)}</div></div><div style="text-align:right"><div style="opacity:.7">PAID NOW</div><div class="big">${nf.format(k.paid_now)}</div></div></div></div></div>
        <div class="box money"><div class="box-top"><div><h3>Total income</h3><div class="val num">${pkr(k.revenue_total)}</div><div class="sm">${dsm(dr, "vs last month (" + pkr(k.revenue_month) + " this month)")}</div></div>${rangeCtl()}</div><div id="c1"></div></div></div>` +
      `<div class="grid g-4" style="margin-top:16px">${kpi("Users", nf.format(k.users), dsm(nu, "new this week (" + k.new_7d + ")"), "", D.daily.map((r) => r.total_users))}${kpi("Active this week", nf.format(k.active_7d), nf.format(k.active_1d) + " active today", "", D.daily.map((r) => r.new_users))}${kpi("Used the brain", nf.format(k.used_brain), nf.format(k.uses_today) + " uses today")}${kpi("Waiting payments", nf.format(k.pending), pkr(k.pending_pkr), k.pending ? "alert" : "")}</div>` +
      `<div class="grid g-2" style="margin-top:16px"><div class="box"><div class="box-top"><h3>Income by month</h3></div><div class="legend"><span><i style="background:var(--acc)"></i>Income</span><span><i style="background:var(--bar2)"></i>Orders x1000</span></div><div id="c2"></div></div>
        <div class="box"><h3>Free to paid</h3><div class="hint">Share of users on a paid plan</div><div class="ring">${ring(conv, "paid")}<div><div class="rv num">${k.pro} Pro</div><div class="sm" style="color:var(--mut)">${k.business} Business</div><div class="sm" style="color:var(--dim)">${k.pc_links} PCs linked</div></div></div></div></div>` +
      extras();
  };
  R.ghost_overview.after = () => {
    const daily = rng(D.daily).map((r) => ({ ...r, label: dayLabel(r.day) }));
    lineChart($("#c1"), daily, [{ k: "revenue", n: "Income", c: "#34e07a" }, { k: "new_users", n: "New users", c: "#9aa7a0" }], (v, s) => s.k === "new_users" ? nf.format(v) : pkr(v));
    barChart($("#c2"), D.monthly.map((r) => ({ ...r, label: monLabel(r.month), ord: r.orders * 1000 })), [{ k: "revenue", n: "Income", c: "#34e07a" }, { k: "ord", n: "Orders (x1000)", c: "var(--bar2)" }]);
  };
  R.ghost_sales = () => head("Sales", "Plans, orders and how people pay.") +
    `<div class="grid g-2e"><div class="box"><h3>Plans</h3><div class="hint">What sold, and what is waiting</div>${table([{ h: "Plan", f: (r) => esc(r.plan) }, { h: "Price", n: 1, f: (r) => pkr(r.price) }, { h: "Sold", n: 1, f: (r) => r.sold }, { h: "Waiting", n: 1, f: (r) => r.waiting }, { h: "Income", n: 1, f: (r) => pkr(r.revenue) }], D.plans, "", "plans")}</div>
     <div class="box"><h3>Payment methods</h3><div class="hint">Approved income per method</div>${D.methods.length ? bars(D.methods, (r) => ({ l: r.method, v: r.revenue, t: pkr(r.revenue) })) : '<div class="empty">No orders yet.</div>'}</div></div>
     <div class="box" style="margin-top:16px"><h3>Latest orders</h3><div class="hint">Payments are always approved by you, never automatically</div>${table([{ h: "#", f: (r) => r.no }, { h: "Placed", f: (r) => esc(r.placed) }, { h: "Plan", f: (r) => esc(r.plan) }, { h: "Method", f: (r) => esc(r.method || "-") }, { h: "Price", n: 1, f: (r) => pkr(r.price) }, { h: "Status", f: (r) => pill(r.status) }], D.orders.filter(match), "No orders yet. They will show here the moment someone buys.", "orders")}</div>`;
  R.ghost_users = () => head("Users", "Who uses the brain, by plan.") +
    `<div class="grid g-3">${D.usage.map((u) => kpi(u.plan[0].toUpperCase() + u.plan.slice(1) + " users", nf.format(u.users), nf.format(u.uses_month) + " uses this month - " + nf.format(u.uses_total) + " all time")).join("")}</div>
     <div class="box" style="margin-top:16px"><h3>Sign-ups, last 30 days</h3><div class="hint">New people per day and the running total</div><div id="c1"></div></div>`;
  R.ghost_users.after = () => lineChart($("#c1"), D.daily.map((r) => ({ ...r, label: dayLabel(r.day) })), [{ k: "total_users", n: "Total users", c: "#34e07a" }, { k: "new_users", n: "New", c: "#9aa7a0" }], (v) => nf.format(v));
  R.ghost_insights = () => {
    const k = D.kpis, m = D.monthly, best = m.reduce((b, r) => (r.revenue > (b.revenue || 0) ? r : b), {});
    const act = k.users ? Math.round(k.active_7d / k.users * 100) : 0, brain = k.users ? Math.round(k.used_brain / k.users * 100) : 0;
    return head("Insights", "Plain reading of the numbers.") +
      `<div class="grid g-3">${kpi("Weekly activity", act + "%", "of all users came back this week")}${kpi("Tried the brain", brain + "%", "of users used it at least once")}${kpi("Best month", best.month ? monLabel(best.month) : "-", best.month ? pkr(best.revenue) : "No income yet")}</div>
      <div class="box" style="margin-top:16px"><h3>What to look at</h3><div class="hint">Auto-written from your data</div><div class="bars" style="gap:12px">
       <div>${k.pending ? "⚠ " + k.pending + " payment(s) worth " + pkr(k.pending_pkr) + " are waiting for you." : "✓ No payment is waiting."}</div>
       <div>${k.used_brain < k.users ? (k.users - k.used_brain) + " user(s) never used the brain - a welcome message could help." : "✓ Every user has tried the brain."}</div>
       <div>${k.paid_now ? k.paid_now + " user(s) are on a paid plan right now." : "No paid users yet - the first sale is the next milestone."}</div></div></div>`;
  };
  /* ----- zoomies ----- */
  R.zoomies_overview = () => {
    const k = D.kpis, dr = delta(k.income_month, k.income_prev_month), win = k.won_all + k.lost_all ? Math.round(k.won_all / (k.won_all + k.lost_all) * 100) : 0;
    return head(`${greet()}, Boss`, "Here is how Zoomies Studio is doing right now.") +
      `<div class="grid g-hero"><div class="box"><div class="box-top"><h3>Studio card</h3><span class="tag">live</span></div><div class="hint">Open work and money owed to you</div>
        <div class="plastic"><div class="brand"><span class="logo" style="width:22px;height:22px;border-radius:7px;font-size:12px">Z</span> Zoomies Studio</div><div class="chip"></div><div class="pn">${String(k.active_projects).padStart(4, "0")} •••• •••• ${String(k.open_leads).padStart(4, "0")}</div>
        <div class="row"><div><div style="opacity:.7">TO COLLECT</div><div class="big">${short(k.owed_pkr)}</div></div><div style="text-align:right"><div style="opacity:.7">PIPELINE</div><div class="big">${short(k.pipeline_pkr)}</div></div></div></div></div>
        <div class="box money"><div class="box-top"><div><h3>Total income</h3><div class="val num">${pkr(k.income_all)}</div><div class="sm">${dsm(dr, "vs last month (" + pkr(k.income_month) + " this month)")}</div></div>${rangeCtl()}</div><div id="c1"></div></div></div>` +
      `<div class="grid g-4" style="margin-top:16px">${kpi("Open leads", nf.format(k.open_leads), pkr(k.pipeline_pkr) + " in the pipeline", "", D.daily.map((r) => r.leads))}${kpi("Active projects", nf.format(k.active_projects), k.late_projects ? '<span class="down">' + k.late_projects + " late</span>" : "none late", k.late_projects ? "alert" : "")}${kpi("Money to collect", pkr(k.owed_pkr), "on active + delivered work")}${kpi("Ad spend (month)", pkr(k.spend_month), nf.format(k.mkt_leads_month) + " leads from it", "", D.daily.map((r) => r.spend))}</div>` +
      `<div class="grid g-2" style="margin-top:16px"><div class="box"><h3>Income vs ad spend</h3><div class="legend"><span><i style="background:var(--acc)"></i>Income</span><span><i style="background:var(--bar2)"></i>Spend</span></div><div id="c2"></div></div>
        <div class="box"><h3>Win rate</h3><div class="hint">Won vs lost, all time</div><div class="ring">${ring(win, "won")}<div><div class="rv num">${k.won_all} won</div><div class="sm" style="color:var(--mut)">${k.lost_all} lost</div><div class="sm" style="color:var(--dim)">${k.won_month} won this month</div></div></div></div></div>` + extras();
  };
  R.zoomies_overview.after = () => {
    lineChart($("#c1"), rng(D.daily).map((r) => ({ ...r, label: dayLabel(r.day) })), [{ k: "income", n: "Income", c: "#a98bff" }, { k: "spend", n: "Spend", c: "#9aa7a0" }]);
    barChart($("#c2"), D.monthly.map((r) => ({ ...r, label: monLabel(r.month) })), [{ k: "income", n: "Income", c: "#a98bff" }, { k: "spend", n: "Spend", c: "var(--bar2)" }]);
  };
  const match = (r) => !q || JSON.stringify(Object.values(r)).toLowerCase().includes(q.toLowerCase());
  const STAT = ["new", "talking", "quoted", "won", "lost"], PST = ["active", "delivered", "paused", "cancelled"];
  R.zoomies_leads = () => head("Leads", "Everyone who asked about a job.") +
    `<div class="box"><h3>Add a lead</h3><form class="form" data-save="lead" style="margin-top:10px"><div class="field"><label>Name</label><input class="in" name="name" required></div><div class="field"><label>Where from</label><select class="in" name="source">${options(SRC, "fiverr")}</select></div><div class="field"><label>Service</label><select class="in" name="service">${options(SVC, "website")}</select></div><div class="field"><label>Value (Rs)</label><input class="in" name="value" type="number" min="0" value="0"></div><div class="field"><label>Next step</label><input class="in" name="next_step"></div><button class="btn pri">Add</button></form></div>
     <div class="box" style="margin-top:16px"><div class="box-top"><h3>All leads</h3><span class="tag">${D.leads.filter(match).length} shown</span></div>${table([{ h: "Name", f: (r) => esc(r.name) }, { h: "From", f: (r) => esc(r.source) }, { h: "Service", f: (r) => esc(r.service) }, { h: "Value", n: 1, f: (r) => pkr(r.value) }, { h: "Next step", w: 1, f: (r) => esc(r.next_step || "-") }, { h: "Added", f: (r) => esc(r.added) }, { h: "Status", ns: 1, f: (r) => `<select class="mini-sel" data-status="lead_status" data-id="${r.id}">${options(STAT, r.status)}</select>` }], D.leads.filter(match), "No leads yet. Add the first one above.", "leads")}</div>`;
  R.zoomies_projects = () => head("Projects", "Work you are doing and how much is paid.") +
    `<div class="box"><h3>Add a project</h3><form class="form" data-save="project" style="margin-top:10px"><div class="field"><label>Client</label><input class="in" name="client" required></div><div class="field"><label>Project</label><input class="in" name="name" required></div><div class="field"><label>Service</label><select class="in" name="service">${options(SVC, "website")}</select></div><div class="field"><label>Price (Rs)</label><input class="in" name="price" type="number" min="0" value="0"></div><div class="field"><label>Due date</label><input class="in" name="due" type="date"></div><button class="btn pri">Add</button></form></div>
     <div class="box" style="margin-top:16px"><h3>All projects</h3>${table([{ h: "Client", f: (r) => esc(r.client) }, { h: "Project", w: 1, f: (r) => esc(r.name) }, { h: "Price", n: 1, f: (r) => pkr(r.price) }, { h: "Paid", n: 1, f: (r) => pkr(r.paid) }, { h: "Left", n: 1, f: (r) => pkr(Math.max(0, r.price - r.paid)) }, { h: "Due", f: (r) => esc(r.due || "-") + (r.late ? ' <span class="pill late">late</span>' : "") }, { h: "Status", ns: 1, f: (r) => `<select class="mini-sel" data-status="project_status" data-id="${r.id}">${options(PST, r.status)}</select>` }], D.projects.filter(match), "No projects yet.", "projects")}</div>`;
  R.zoomies_payments = () => head("Payments", "Money received. You enter it yourself, nothing is automatic.") +
    `<div class="box"><h3>Add a payment</h3><form class="form" data-save="payment" style="margin-top:10px"><div class="field"><label>Project</label><select class="in" name="project_id" required>${D.projects.map((p) => `<option value="${p.id}">${esc(p.client)} - ${esc(p.name)}</option>`).join("")}</select></div><div class="field"><label>Amount (Rs)</label><input class="in" name="amount" type="number" min="1" required></div><div class="field"><label>Date</label><input class="in" name="day" type="date"></div><div class="field"><label>Method</label><input class="in" name="method" placeholder="JazzCash, bank..."></div><button class="btn pri">Add</button></form></div>
     <div class="box" style="margin-top:16px"><h3>Received</h3>${table([{ h: "Date", f: (r) => esc(r.day) }, { h: "Client", f: (r) => esc(r.client) }, { h: "Project", w: 1, f: (r) => esc(r.project) }, { h: "Method", f: (r) => esc(r.method || "-") }, { h: "Amount", n: 1, f: (r) => pkr(r.amount) }], D.payments.filter(match), "No payments yet.", "payments")}</div>`;
  R.zoomies_marketing = () => head("Marketing", "What you spent and what it brought.") +
    `<div class="box"><h3>Add marketing activity</h3><form class="form" data-save="marketing" style="margin-top:10px"><div class="field"><label>Channel</label><select class="in" name="channel">${options(CH, "instagram")}</select></div><div class="field"><label>Activity</label><input class="in" name="activity" required></div><div class="field"><label>Spend (Rs)</label><input class="in" name="spend" type="number" min="0" value="0"></div><div class="field"><label>Reach</label><input class="in" name="reach" type="number" min="0"></div><div class="field"><label>Clicks</label><input class="in" name="clicks" type="number" min="0"></div><div class="field"><label>Leads</label><input class="in" name="leads" type="number" min="0" value="0"></div><div class="field"><label>Date</label><input class="in" name="day" type="date"></div><button class="btn pri">Add</button></form></div>
     <div class="box" style="margin-top:16px"><h3>Log</h3>${table([{ h: "Date", f: (r) => esc(r.day) }, { h: "Channel", f: (r) => esc(r.channel) }, { h: "Activity", w: 1, f: (r) => esc(r.activity) }, { h: "Spend", n: 1, f: (r) => pkr(r.spend) }, { h: "Reach", n: 1, f: (r) => r.reach == null ? "-" : nf.format(r.reach) }, { h: "Clicks", n: 1, f: (r) => r.clicks == null ? "-" : nf.format(r.clicks) }, { h: "Leads", n: 1, f: (r) => r.leads }], D.marketing.filter(match), "Nothing logged yet.", "marketing")}</div>`;
  R.zoomies_insights = () => {
    const ch = D.channels.filter((c) => c.leads || c.spend), mon = D.monthly;
    return head("Insights", "Which channel is worth your time (last 90 days).") +
      `<div class="grid g-2e"><div class="box"><h3>Pipeline</h3><div class="hint">Leads and value per stage</div>${bars(D.pipeline, (r) => ({ l: r.stage, v: r.value, t: r.leads + " - " + short(r.value) }))}</div>
       <div class="box"><h3>Leads by channel</h3><div class="hint">How many came, how many you won</div>${ch.length ? bars(ch, (r) => ({ l: r.channel, v: r.leads, t: r.leads + " / " + r.won + " won" })) : '<div class="empty">No leads yet.</div>'}</div></div>
       <div class="box" style="margin-top:16px"><h3>Cost per lead</h3><div class="hint">Ad spend divided by leads, per channel</div>${table([{ h: "Channel", f: (r) => esc(r.channel) }, { h: "Spend", n: 1, f: (r) => pkr(r.spend) }, { h: "Leads", n: 1, f: (r) => r.leads }, { h: "Won", n: 1, f: (r) => r.won }, { h: "Cost per lead", n: 1, f: (r) => r.leads ? pkr(r.spend / r.leads) : "-" }], ch, "Not enough data yet.", "cpl")}</div>
       <div class="box" style="margin-top:16px"><h3>Leads and wins by month</h3><div class="legend"><span><i style="background:var(--acc)"></i>Leads</span><span><i style="background:var(--bar2)"></i>Won</span></div><div id="c1"></div></div>`;
  };
  R.zoomies_insights.after = () => barChart($("#c1"), D.monthly.map((r) => ({ ...r, label: monLabel(r.month) })), [{ k: "leads", n: "Leads", c: "#a98bff" }, { k: "won", n: "Won", c: "var(--bar2)" }], (v) => nf.format(v));
  R.settings = () => head("Settings", "Your account and where this runs.") +
    `<div class="grid g-2e"><div class="box"><h3>Account</h3><div class="hint">Only your own email can open this OS</div><div class="bars"><div>Signed in as <b>${esc(session && session.email)}</b></div><div><button class="btn ghost" data-act="logout">${ico("out")} Log out</button></div></div></div>
     <div class="box"><h3>Switch dashboard</h3><div class="hint">Same login for both</div><div class="bars"><a class="btn ghost" rel="noopener" href="${esc(CFG.ghostUrl || "../ghost/")}">ghost.ai</a><a class="btn ghost" rel="noopener" href="${esc(CFG.zoomiesUrl || "../zoomies/")}">Zoomies Studio</a></div></div></div>
     <div class="grid g-2e" style="margin-top:16px"><div class="box"><h3>Shortcuts</h3><div class="hint">Press when you are not typing</div><div class="bars" style="gap:8px"><div><kbd>Ctrl K</kbd> quick actions</div><div><kbd>/</kbd> search &nbsp; <kbd>R</kbd> refresh &nbsp; <kbd>P</kbd> hide amounts &nbsp; <kbd>T</kbd> light/dark</div><div><kbd>1</kbd>-<kbd>${PAGES.length}</kbd> jump to a page</div></div></div>
     <div class="box"><h3>Data and safety</h3><div class="hint">You are locked out after 15 minutes without use</div><div class="bars"><button class="btn ghost" data-act="json">${ico("dl")} Download all data (JSON)</button><button class="btn ghost" data-act="print">${ico("print")} Print this page</button></div></div></div>
     <div class="box" style="margin-top:16px"><h3>JARVIS</h3><div class="hint">JARVIS reads the same numbers. Say “open ${BIZ === "ghost" ? "ghost" : "zoomies"} dashboard” to open this page.</div></div>`;


  /* ---------- premium extras: range, goal, alerts, feed, palette, privacy, theme ---------- */
  const app = $("#app");
  let RANGE = 30;
  const rng = (a) => a.slice(-RANGE);
  const rangeCtl = () => `<div class="seg">${[7, 14, 30].map((n) => `<button data-range="${n}" class="${RANGE === n ? "on" : ""}">${n}d</button>`).join("")}</div>`;
  const store = { get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : v; } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} } };
  const goalTarget = () => { const v = +store.get("bossos.goal." + BIZ, 0); return v > 0 ? v : BIZ === "ghost" ? 50000 : 200000; };
  const goalVal = () => (BIZ === "ghost" ? D.kpis.revenue_month : D.kpis.income_month);
  function extras() {
    const val = goalVal(), tgt = goalTarget(), pct = Math.min(100, val / tgt * 100);
    const now = new Date(), dim = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate(), day = Math.max(1, now.getDate());
    const proj = val / day * dim, left = dim - now.getDate();
    const pace = proj >= tgt ? '<span class="up">on track</span>' : '<span class="warn">behind pace</span>';
    const f = feed();
    return `<div class="grid g-2" style="margin-top:16px"><div class="box goal"><div class="box-top"><div><h3>Monthly goal</h3><div class="hint">${BIZ === "ghost" ? "Income" : "Money received"} this month</div></div><button class="btn ghost sm" data-act="goal">Change goal</button></div>
      <div class="goalrow"><span class="num big">${pkr(val)}</span><span class="of">of ${pkr(tgt)}</span></div>
      <div class="meter"><i style="width:${pct}%"></i></div>
      <div class="gm"><span>${Math.round(pct)}% done</span><span>${left} day${left === 1 ? "" : "s"} left</span><span>Forecast <b class="num">${pkr(proj)}</b> - ${pace}</span></div></div>
     <div class="box"><div class="box-top"><h3>Recent activity</h3><span class="tag">${f.length}</span></div><div class="hint">Newest first</div>${f.length ? '<div class="feed">' + f.slice(0, 6).map((x) => `<div class="fi"><i class="dot ${x.c || ""}"></i><div><div>${esc(x.t)}</div><small>${esc(x.d)}</small></div></div>`).join("") + "</div>" : '<div class="empty">Nothing yet.</div>'}</div></div>`;
  }
  function feed() {
    if (BIZ === "ghost") return D.orders.slice(0, 8).map((o) => ({ t: `Order #${o.no}: ${o.plan} - ${pkr(o.price)} (${o.status})`, d: o.placed, c: o.status === "approved" ? "ok" : o.status === "pending" ? "warn" : "bad" }));
    const a = D.payments.map((p) => ({ t: `${p.client} paid ${pkr(p.amount)} for ${p.project}`, d: p.day, c: "ok" }));
    const b = D.leads.map((l) => ({ t: `Lead: ${l.name} (${l.service}, ${l.status})`, d: l.added, c: "" }));
    return a.concat(b).sort((x, y) => String(y.d).localeCompare(String(x.d)));
  }
  function alerts() {
    if (!D) return []; const k = D.kpis, out = [];
    if (BIZ === "ghost") {
      if (k.pending) out.push({ s: "warn", t: `${k.pending} payment(s) waiting for you (${pkr(k.pending_pkr)})`, p: "sales" });
      if (k.new_7d < k.new_prev_7d) out.push({ s: "warn", t: `Sign-ups slowed: ${k.new_7d} this week vs ${k.new_prev_7d} last week`, p: "users" });
      if (k.users && !k.active_1d) out.push({ s: "bad", t: "Nobody was active in the last 24 hours", p: "users" });
      if (k.users && k.used_brain < k.users) out.push({ s: "info", t: `${k.users - k.used_brain} user(s) never tried the brain`, p: "insights" });
    } else {
      if (k.late_projects) out.push({ s: "bad", t: `${k.late_projects} project(s) are past the due date`, p: "projects" });
      if (k.owed_pkr) out.push({ s: "warn", t: `${pkr(k.owed_pkr)} still to collect from clients`, p: "payments" });
      const quoted = D.leads.filter((l) => l.status === "quoted").length; if (quoted) out.push({ s: "info", t: `${quoted} quoted lead(s) - time to follow up`, p: "leads" });
      const nostep = D.leads.filter((l) => ["new", "talking", "quoted"].includes(l.status) && !l.next_step).length; if (nostep) out.push({ s: "info", t: `${nostep} open lead(s) have no next step`, p: "leads" });
      if (k.spend_month && !k.mkt_leads_month) out.push({ s: "warn", t: "You spent on ads this month but logged no leads from them", p: "marketing" });
    }
    return out;
  }
  const ACTIONS = () => {
    const a = PAGES.map((p, i) => ({ n: "Go to " + p[1], k: String(i + 1), f: () => go(p[0]) }));
    if (BIZ === "zoomies") [["Add a lead", "leads", "lead"], ["Add a project", "projects", "project"], ["Add a payment", "payments", "payment"], ["Log marketing", "marketing", "marketing"]].forEach(([n, pg, kind]) => a.push({ n, f: () => { go(pg); setTimeout(() => { const f = $(`form[data-save=${kind}] input,form[data-save=${kind}] select`); if (f) f.focus(); }, 60); } }));
    a.push({ n: "Refresh data", k: "R", f: () => load(true) }, { n: "Hide / show amounts (privacy)", k: "P", f: togglePriv }, { n: "Switch light / dark", k: "T", f: toggleTheme },
      { n: "Download all data (JSON)", f: dumpJson }, { n: "Print report", f: () => window.print() },
      { n: "Open " + (BIZ === "ghost" ? "Zoomies Studio" : "ghost.ai") + " dashboard", f: () => { location.href = BIZ === "ghost" ? (CFG.zoomiesUrl || "../zoomies/") : (CFG.ghostUrl || "../ghost/"); } }, { n: "Log out", f: logout });
    return a;
  };
  function openOv(html) { closeOv(); const d = document.createElement("div"); d.id = "ov"; d.innerHTML = html; document.body.appendChild(d); d.addEventListener("mousedown", (e) => { if (e.target === d) closeOv(); }); return d; }
  function closeOv() { const o = $("#ov"); if (o) o.remove(); }
  function palette() {
    const acts = ACTIONS(); let list = acts, sel = 0;
    const d = openOv(`<div class="pal"><input class="in" id="pq" placeholder="Type a command or page...  (Esc to close)" autocomplete="off"><div id="pl"></div></div>`);
    const draw2 = () => { $("#pl", d).innerHTML = list.length ? list.map((a, i) => `<button class="${i === sel ? "on" : ""}" data-i="${i}"><span>${esc(a.n)}</span>${a.k ? `<kbd>${a.k}</kbd>` : ""}</button>`).join("") : '<div class="empty">No match</div>'; };
    const run = (i) => { const a = list[i]; if (a) { closeOv(); a.f(); } };
    const q2 = $("#pq", d); q2.focus(); draw2();
    q2.addEventListener("input", () => { const t = q2.value.toLowerCase(); list = acts.filter((a) => a.n.toLowerCase().includes(t)); sel = 0; draw2(); });
    q2.addEventListener("keydown", (e) => { if (e.key === "ArrowDown") { sel = Math.min(list.length - 1, sel + 1); draw2(); e.preventDefault(); } else if (e.key === "ArrowUp") { sel = Math.max(0, sel - 1); draw2(); e.preventDefault(); } else if (e.key === "Enter") run(sel); });
    $("#pl", d).addEventListener("click", (e) => { const b = e.target.closest("[data-i]"); if (b) run(+b.dataset.i); });
  }
  function bell() {
    const a = alerts();
    openOv(`<div class="panel"><div class="box-top"><h3>Alerts</h3><button class="btn ghost sm" data-act="closeov">Close</button></div><div class="hint">Worked out from your live numbers</div>${a.length ? a.map((x) => `<button class="al ${x.s}" data-go="${x.p}"><i class="dot ${x.s === "info" ? "" : x.s === "warn" ? "warn" : "bad"}"></i><span>${esc(x.t)}</span></button>`).join("") : '<div class="empty">All clear. Nothing needs you right now.</div>'}</div>`);
  }
  function go(p) { closeOv(); if (PAGES.some((x) => x[0] === p)) { page = p; location.hash = p; q = ""; const s2 = $("#q"); if (s2) s2.value = ""; draw(); window.scrollTo(0, 0); } }
  function applyPriv() { document.body.classList.toggle("priv", store.get("bossos.priv", "0") === "1"); }
  function togglePriv() { store.set("bossos.priv", store.get("bossos.priv", "0") === "1" ? "0" : "1"); applyPriv(); toast(store.get("bossos.priv", "0") === "1" ? "Amounts hidden" : "Amounts shown"); }
  function applyTheme() { document.documentElement.dataset.theme = store.get("bossos.theme", "dark"); }
  function toggleTheme() { store.set("bossos.theme", store.get("bossos.theme", "dark") === "dark" ? "light" : "dark"); applyTheme(); draw(); }
  function logout() { session = null; writeSession(null); D = null; closeOv(); loginView("Logged out."); }
  const csvCell = (v) => { const t = plain(v); return /[",\n]/.test(t) ? '"' + t.replace(/"/g, '""') + '"' : t; };
  function save(name, text, type) { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([text], { type })); a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); }
  function exportCsv(id) { const t = TB[id]; if (!t) return; const rows = sorted(id); save(`${BIZ}-${id}-${new Date().toISOString().slice(0, 10)}.csv`, "﻿" + [t.cols.filter((c) => !c.ns).map((c) => csvCell(c.h)).join(",")].concat(rows.map((r) => t.cols.filter((c) => !c.ns).map((c) => csvCell(c.f(r))).join(","))).join("\r\n"), "text/csv"); toast("CSV downloaded"); }
  function dumpJson() { if (!D) return; save(`${BIZ}-all-data-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(D, null, 2), "application/json"); toast("Data downloaded"); }
  function countUp() {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    document.querySelectorAll("#view .kpi .val, #view .money .val").forEach((el) => {
      const m = el.textContent.match(/^(\D*)([\d,]+)(\D*)$/); if (!m) return; const end = +m[2].replace(/,/g, ""), t0 = performance.now();
      const step = (t) => { const p = Math.min(1, (t - t0) / 650), v = Math.round(end * (1 - Math.pow(1 - p, 3))); el.textContent = m[1] + nf.format(v) + m[3]; if (p < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step);
    });
  }
  let lastActive = Date.now();
  const LOCK_MS = 15 * 60 * 1000;
  ["mousemove", "keydown", "touchstart", "click"].forEach((ev) => window.addEventListener(ev, () => { lastActive = Date.now(); }, { passive: true }));
  setInterval(() => { if (session && Date.now() - lastActive > LOCK_MS) { session = null; writeSession(null); D = null; closeOv(); loginView("Locked after 15 minutes without use. Log in again."); } }, 20000);
  const typing = () => /^(INPUT|SELECT|TEXTAREA)$/.test((document.activeElement || {}).tagName || "");
  window.addEventListener("keydown", (e) => {
    if (!session || !D) return;
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); palette(); return; }
    if (e.key === "Escape") { closeOv(); return; }
    if (typing() || e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === "/") { e.preventDefault(); const s2 = $("#q"); if (s2) s2.focus(); }
    else if (e.key === "r") load(true); else if (e.key === "p") togglePriv(); else if (e.key === "t") toggleTheme();
    else if (/^[1-9]$/.test(e.key) && PAGES[+e.key - 1]) go(PAGES[+e.key - 1][0]);
  });
  function onClick(e) {
    const t = e.target;
    let b = t.closest("[data-p]"); if (b) return go(b.dataset.p);
    if ((b = t.closest("[data-go]"))) return go(b.dataset.go);
    if ((b = t.closest("[data-range]"))) { RANGE = +b.dataset.range; return draw(); }
    if ((b = t.closest("th[data-sort]"))) { const [id, i] = b.dataset.sort.split(":"), c = SORT[id]; SORT[id] = c && c.i === +i ? { i: +i, dir: -c.dir } : { i: +i, dir: 1 }; return draw(); }
    if ((b = t.closest("[data-more]"))) { LIM[b.dataset.more] = (LIM[b.dataset.more] || 10) + 10; return draw(); }
    if ((b = t.closest("[data-csv]"))) return exportCsv(b.dataset.csv);
    if ((b = t.closest("[data-act]"))) {
      const a = b.dataset.act;
      if (a === "logout") return logout();
      if (a === "closeov") return closeOv();
      if (a === "palette") return palette();
      if (a === "bell") return bell();
      if (a === "priv") return togglePriv();
      if (a === "theme") return toggleTheme();
      if (a === "print") return window.print();
      if (a === "json") return dumpJson();
      if (a === "goal") { const d = openOv(`<form class="panel" id="gf"><h3>Monthly goal</h3><div class="hint">How much ${BIZ === "ghost" ? "income" : "money received"} do you want this month? (Rs)</div><input class="in" name="g" type="number" min="1000" step="1000" value="${goalTarget()}" required><div style="display:flex;gap:8px;margin-top:12px"><button class="btn pri">Save</button><button type="button" class="btn ghost" data-act="closeov">Cancel</button></div></form>`); $("input", d).focus(); }
    }
  }
  app.addEventListener("click", onClick);
  app.addEventListener("submit", onSave); app.addEventListener("change", onStatus);
  document.body.addEventListener("click", (e) => { if (e.target.closest("#ov") && !e.target.closest("#app")) onClick(e); });
  document.body.addEventListener("submit", (e) => { const f = e.target.closest("#gf"); if (f) { e.preventDefault(); const v = +f.g.value; if (v > 0) { store.set("bossos.goal." + BIZ, String(v)); closeOv(); draw(); toast("Goal saved"); } } });
  applyTheme();

  /* ---------- shell ---------- */
  /* ---------- login: password + authenticator-app code (2-step), brute-force slowdown ---------- */
  const isSetup = () => /setup/.test(location.hash) || /[?&]setup/.test(location.search);
  const fails = () => { try { return JSON.parse(store.get("bossos.fails", "{}")); } catch (e) { return {}; } };
  const waitSecs = () => { const f = fails(); return f.n >= 5 ? Math.max(0, Math.ceil((f.until - Date.now()) / 1000)) : 0; };
  const failed = () => { const f = fails(), n = (f.n || 0) + 1; store.set("bossos.fails", JSON.stringify({ n, until: Date.now() + Math.min(900, 30 * Math.pow(2, Math.max(0, n - 5))) * 1000 })); };
  const clearFails = () => store.set("bossos.fails", "{}");
  async function userApi(method, path, body) {
    const r = await fetch(CFG.url + "/auth/v1/" + path, { method, headers: H(session && session.access_token), body: body ? JSON.stringify(body) : undefined });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j.msg || j.error_description || j.message || "Request failed (" + r.status + ")");
    return j;
  }
  const brandHead = () => `<div class="brand"><span class="logo">${BIZ === "ghost" ? "g" : "Z"}</span>${esc(NAME)} <span style="color:var(--dim);font-weight:500">OS</span></div>`;
  function card(inner) { app.innerHTML = `<div class="login"><form class="login-card" id="lf" autocomplete="off">${brandHead()}${inner}</form></div>`; return $("#lf"); }
  async function afterPassword() {
    const u = await userApi("GET", "user");
    const ok = (u.factors || []).find((f) => f.factor_type === "totp" && f.status === "verified");
    ok ? codeView(ok.id) : enrollView();
  }
  function codeView(factorId, msg) {
    const f = card(`<h1>Enter your code</h1><p>Open your authenticator app and type the 6 digits.</p><div class="field"><label>6-digit code</label><input class="in num" name="c" inputmode="numeric" pattern="[0-9]{6}" maxlength="6" autocomplete="one-time-code" required></div><button class="btn pri wide">Open dashboard</button><div class="msg ${msg ? "err" : ""}" id="lm">${esc(msg || "")}</div><div style="text-align:center"><button type="button" class="link" id="bk">Back</button></div>`);
    $("input", f).focus(); $("#bk").addEventListener("click", () => { session = null; writeSession(null); loginView(); });
    f.addEventListener("submit", async (e) => {
      e.preventDefault(); if (waitSecs()) return ($("#lm").textContent = "Too many tries. Wait " + waitSecs() + " seconds.");
      try { const ch = await userApi("POST", "factors/" + factorId + "/challenge", {}); keep(await userApi("POST", "factors/" + factorId + "/verify", { challenge_id: ch.id, code: f.c.value.trim() })); clearFails(); boot(); }
      catch (er) { failed(); codeView(factorId, "That code did not work. " + er.message); }
    });
  }
  async function enrollView(msg) {
    let en; try { en = await userApi("POST", "factors", { factor_type: "totp", friendly_name: "BossOS " + Date.now() }); } catch (e) { return loginView("Could not start 2-step setup: " + e.message, true); }
    const f = card(`<h1>Turn on 2-step login</h1><p>Scan this with Google Authenticator (or any authenticator app), then type the 6 digits. This protects your money numbers even if someone learns your password.</p><div style="text-align:center;background:#fff;border-radius:14px;padding:10px;width:max-content;margin:0 auto 12px"><img src="${esc(en.totp.qr_code)}" width="170" height="170" alt="QR code"></div><div class="hint" style="text-align:center;word-break:break-all">Cannot scan? Key: <span class="num">${esc(en.totp.secret)}</span></div><div class="field"><label>6-digit code</label><input class="in num" name="c" inputmode="numeric" pattern="[0-9]{6}" maxlength="6" autocomplete="one-time-code" required></div><button class="btn pri wide">Turn on and open</button><div class="msg ${msg ? "err" : ""}" id="lm">${esc(msg || "")}</div>`);
    f.addEventListener("submit", async (e) => {
      e.preventDefault();
      try { const ch = await userApi("POST", "factors/" + en.id + "/challenge", {}); keep(await userApi("POST", "factors/" + en.id + "/verify", { challenge_id: ch.id, code: f.c.value.trim() })); clearFails(); boot(); }
      catch (er) { $("#lm").className = "msg err"; $("#lm").textContent = "That code did not work. " + er.message; }
    });
  }
  function loginView(msg, err) {
    const f = card(`<h1>Welcome back, Boss</h1><p>Log in to see your business.</p>
      <div class="field"><label>Email</label><input class="in" name="email" type="email" autocomplete="username" required></div>
      <div class="field"><label>Password</label><input class="in" name="password" type="password" autocomplete="current-password" minlength="8" required></div>
      <button class="btn pri wide" id="go">Log in</button><div class="msg ${err ? "err" : ""}" id="lm">${esc(msg || "")}</div>
      ${isSetup() ? '<div style="text-align:center;color:var(--dim);font-size:12px">First time only: <button type="button" class="link" id="su">Create my account</button> (password 12+ characters)</div>' : ""}`);
    const m = $("#lm");
    const run = async (mode) => {
      const email = f.email.value.trim(), password = f.password.value;
      if (waitSecs()) { m.className = "msg err"; m.textContent = "Too many tries. Wait " + waitSecs() + " seconds."; return; }
      m.className = "msg"; m.textContent = "Please wait...";
      try {
        if (mode === "up") {
          if (password.length < 12) throw new Error("Use a password of 12 or more characters.");
          const j = await auth("signup", { email, password }); if (j.access_token) { keep(j); return afterPassword(); }
          m.textContent = "Account made. Open the email from Supabase, tap the confirm link, then log in here."; return;
        }
        keep(await auth("token?grant_type=password", { email, password })); await afterPassword();
      } catch (e) { failed(); m.className = "msg err"; m.textContent = e.message; }
    };
    f.addEventListener("submit", (e) => { e.preventDefault(); run("in"); });
    const su = $("#su"); if (su) su.addEventListener("click", () => { if (f.reportValidity()) run("up"); });
  }
  function shell() {
    app.innerHTML = `<div class="app"><aside class="side"><div class="brand"><span class="logo">${BIZ === "ghost" ? "g" : "Z"}</span><div>${esc(NAME)}<span class="sub">BUSINESS OS</span></div></div>
      <nav class="nav">${PAGES.map((p) => `<button data-p="${p[0]}">${ico(p[2])}<span>${p[1]}</span></button>`).join("")}</nav><div class="grow"></div>
      <div class="me"><div class="av">${esc((session.email || "B")[0].toUpperCase())}</div><div style="min-width:0"><div style="overflow:hidden;text-overflow:ellipsis">Boss</div><small>${esc(session.email || "")}</small></div></div></aside>
      <main class="main"><div class="top"><label class="search"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg><input id="q" placeholder="Search in this page"></label><button class="kbtn" data-act="palette">${ico("cmd")} Quick actions <kbd>Ctrl K</kbd></button><div class="sp"></div><span class="live"><i></i><span id="stamp">live</span></span><button class="chipbtn" data-act="bell" title="Alerts"><span id="bellN" class="badge hidden"></span>${ico("bell")}</button><button class="chipbtn" data-act="priv" title="Hide amounts (P)">${ico("eye")}</button><button class="chipbtn" data-act="theme" title="Light / dark (T)">${ico("moon")}</button><button class="chipbtn" data-act="print" title="Print report">${ico("print")}</button><button class="chipbtn" id="rf" title="Refresh (R)">${ico("refresh")}</button><button class="chipbtn" data-act="logout" title="Log out">${ico("out")}</button></div><div id="view">${skel()}</div></main></div>`;
    $("#q").addEventListener("input", (e) => { q = e.target.value; draw(true); });
    $("#rf").addEventListener("click", () => load(true));
  }
  const skel = () => '<div class="skel"><i style="height:34px;width:40%"></i><div class="grid g-hero"><i style="height:300px"></i><i style="height:300px"></i></div><div class="grid g-4"><i style="height:110px"></i><i style="height:110px"></i><i style="height:110px"></i><i style="height:110px"></i></div></div>';
  let lastPage = "";
  function draw(keepFocus) {
    if (!D) return; const v = $("#view"); if (!v) return;
    if (!PAGES.some((p) => p[0] === page)) page = "overview";
    document.querySelectorAll(".nav button").forEach((b) => b.classList.toggle("on", b.dataset.p === page));
    const fn = page === "settings" ? R.settings : R[BIZ + "_" + page];
    v.innerHTML = fn().replace(/<script type="x\/after">1<\/script>/, "");
    if (fn.after) fn.after();
    const bn = $("#bellN"); if (bn) { const n = alerts().length; bn.textContent = n; bn.classList.toggle("hidden", !n); }
    if (!keepFocus && page !== lastPage) { countUp(); } lastPage = page;
    if (keepFocus) { const s = $("#q"); s.focus(); s.setSelectionRange(s.value.length, s.value.length); }
  }
  async function load(spin) {
    const b = $("#rf"); if (spin && b) b.classList.add("spin");
    try { D = await rpc(BIZ === "ghost" ? "os_ghost" : "os_zoomies"); const s = $("#stamp"); if (s) s.textContent = "updated " + new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }); draw(); }
    catch (e) { if (e.message === "login") return loginView("Please log in again."); toast(e.message.includes("not allowed") ? "This email is not allowed to open the OS." : e.message); if (/not allowed/.test(e.message)) { session = null; writeSession(null); loginView("This email is not allowed.", true); } }
    finally { if (b) b.classList.remove("spin"); }
  }
  function toast(t) { const d = document.createElement("div"); d.className = "toast"; d.textContent = t; document.body.appendChild(d); setTimeout(() => d.remove(), 2800); }
  async function onSave(e) {
    const f = e.target.closest("form[data-save]"); if (!f) return; e.preventDefault();
    const d = {}; new FormData(f).forEach((v, k) => { if (String(v).trim() !== "") d[k] = String(v).trim(); });
    const btn = $("button", f); btn.disabled = true;
    try { await rpc("os_zoomies_save", { kind: f.dataset.save, d }); toast("Saved"); await load(); } catch (er) { toast(er.message); } finally { btn.disabled = false; }
  }
  async function onStatus(e) {
    const s = e.target.closest("select[data-status]"); if (!s) return;
    try { await rpc("os_zoomies_save", { kind: s.dataset.status, d: { id: s.dataset.id, status: s.value } }); toast("Updated"); await load(); } catch (er) { toast(er.message); }
  }
  let timer = null;
  function boot() { shell(); load(); clearInterval(timer); timer = setInterval(() => { if (!document.hidden && session) load(); }, 60000); }
  window.addEventListener("hashchange", () => { if (!session && !$("input[name=c]") && !$("img[alt=\"QR code\"]")) { loginView(); return; } const p = (location.hash || "#overview").slice(1); if (p !== page && PAGES.some((x) => x[0] === p)) { page = p; draw(); } });
  document.documentElement.dataset.biz = BIZ; document.title = NAME + " OS";
  session ? boot() : loginView();
})();
