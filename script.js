/* Memex launch site — interactions */

/* ──────────────────────────────────────────────────────────
   EDIT THESE before you publish.
   Leave a value as "" to hide that link (Product Hunt / GitHub)
   or keep the default Chrome Web Store link.
   ────────────────────────────────────────────────────────── */
const CONFIG = {
  chrome: "",   // ← paste your Chrome Web Store listing URL when it is live (until then Chrome visitors see "coming soon")
  edge: "https://microsoftedge.microsoft.com/addons/detail/memex-%E2%80%94-clipboard-notes-/ollkkbmnilbkkajcifkpmfknhabolhdl",
  producthunt: "",                                  // ← your Product Hunt launch URL (shows the button when set)
  github: "",                                       // ← your GitHub repo URL (shows the footer link when set)
  contactEmail: ""                                  // ← support email shown on the privacy page (hidden when empty)
};

(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const esc = (t) => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");


  /* ── Browser detection → store buttons ── */
  const detectBrowser = () => {
    const ua = navigator.userAgent || "";
    const uad = navigator.userAgentData;
    if (uad && uad.brands && uad.brands.length) {
      const names = uad.brands.map((b) => b.brand);
      if (names.some((n) => /Microsoft Edge/i.test(n))) return "edge";
      if (names.some((n) => /Google Chrome/i.test(n)) && !names.some((n) => /Brave|Opera|Vivaldi|Arc|Samsung/i.test(n))) return "chrome";
      return "other";
    }
    if (/Edg\//.test(ua) || /EdgA\//.test(ua) || /EdgiOS\//.test(ua)) return "edge";
    if (/Chrome\/|CriOS\//.test(ua) && !/OPR\/|Opera|Vivaldi|SamsungBrowser|YaBrowser|Brave/i.test(ua) && !navigator.brave) return "chrome";
    return "other";
  };
  const browser = detectBrowser();
  document.documentElement.dataset.browser = browser;
  $$("[data-store-group]").forEach((g) => {
    const c = $('[data-store="chrome"]', g), e = $('[data-store="edge"]', g);
    const full = g.hasAttribute("data-full");
    const wire = (a, url, ready) => {
      if (url) { a.href = url; a.target = "_blank"; a.rel = "noopener"; }
      else { a.removeAttribute("href"); a.setAttribute("aria-disabled", "true"); a.classList.add("is-soon"); a.removeAttribute("target"); a.addEventListener("click", (ev) => ev.preventDefault()); }
    };
    wire(c, CONFIG.chrome); wire(e, CONFIG.edge);
    const tail = full ? " — it’s free" : "";
    if (!CONFIG.chrome) $("[data-lbl]", c).textContent = "Chrome — coming soon";
    if (browser === "chrome") { e.hidden = true; }
    else if (browser === "edge") { c.hidden = true; $("[data-lbl]", e).textContent = "Get Memex for Edge" + tail; }
    else { $("[data-lbl]", e).textContent = "Get for Edge" + tail; }
  });

  /* ── Links from CONFIG ── */
  $$("[data-link]").forEach((a) => {
    const url = CONFIG[a.dataset.link];
    if (url) { a.href = url; a.hidden = false; if (/^https?:/.test(url)) { a.target = "_blank"; a.rel = "noopener"; } }
  });
  const mail = $("#contactLine");
  if (mail) { if (CONFIG.contactEmail) { $("#contactMail").href = "mailto:" + CONFIG.contactEmail; $("#contactMail").textContent = CONFIG.contactEmail; mail.hidden = false; } }
  const yr = $("#yr"); if (yr) yr.textContent = new Date().getFullYear();

  /* ── Nav ── */
  const nav = $("#nav");
  const menuBtn = $("#menuBtn"), menu = $("#mobileMenu");
  const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 24);
  onScroll(); window.addEventListener("scroll", onScroll, { passive: true });
  const setMenu = (open) => {
    menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
    menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    menu.hidden = !open;
    document.body.style.overflow = open ? "hidden" : "";
  };
  menuBtn.addEventListener("click", () => setMenu(menu.hidden));
  $$("a", menu).forEach((a) => a.addEventListener("click", () => setMenu(false)));
  window.addEventListener("keydown", (e) => { if (e.key === "Escape" && !menu.hidden) setMenu(false); });
  window.addEventListener("resize", () => { if (window.innerWidth > 1000 && !menu.hidden) setMenu(false); });

  const links = $$(".nav-pill a");
  const sections = links.map((a) => $(a.getAttribute("href"))).filter(Boolean);
  if ("IntersectionObserver" in window) {
    const spy = new IntersectionObserver((es) => {
      es.forEach((e) => { if (e.isIntersecting) links.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id)); });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach((s) => spy.observe(s));
  }

  /* ── Intro ── */
  const hero = $(".hero");
  Promise.race([document.fonts ? document.fonts.ready : Promise.resolve(), sleep(900)]).then(() => {
    requestAnimationFrame(() => hero.classList.add("ready"));
  });

  /* ── Reveal on scroll ── */
  const revealEls = $$("[data-reveal], .install");
  if ("IntersectionObserver" in window && !reduced) {
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    revealEls.forEach((el) => io.observe(el));
  } else revealEls.forEach((el) => el.classList.add("in"));

  /* ── Count-up numbers ── */
  $$("[data-count]").forEach((el) => {
    const target = Number(el.dataset.count);
    if (!target || reduced || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver((es) => {
      if (!es[0].isIntersecting) return;
      io.disconnect();
      const t0 = performance.now(), dur = 1500;
      const tick = (t) => {
        const p = Math.min(1, (t - t0) / dur), eased = 1 - Math.pow(1 - p, 4);
        el.textContent = Math.round(target * eased).toLocaleString("en-US");
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.6 });
    io.observe(el);
  });

  /* ── Statement: words light up with scroll ── */
  const st = $("#statementText");
  if (st) {
    const text = st.textContent.trim();
    const emFrom = text.indexOf("Memex keeps");
    st.setAttribute("aria-label", text);
    st.innerHTML = text.split(/(\s+)/).map((tok, i, arr) => {
      if (/^\s+$/.test(tok)) return " ";
      const before = arr.slice(0, i).join("").length;
      return `<span class="w${before >= emFrom ? " em" : ""}" aria-hidden="true">${esc(tok)}</span>`;
    }).join("");
    const words = $$(".w", st);
    const update = () => {
      if (reduced) return words.forEach((w) => w.classList.add("on"));
      const r = st.getBoundingClientRect(), vh = window.innerHeight;
      const p = Math.min(1, Math.max(0, (vh * 0.82 - r.top) / (r.height + vh * 0.25)));
      const n = Math.round(p * words.length * 1.08);
      words.forEach((w, i) => w.classList.toggle("on", i < n));
    };
    update(); window.addEventListener("scroll", update, { passive: true }); window.addEventListener("resize", update);
  }

  /* ── Parallax for floating cards ── */
  const floaters = $$("[data-speed]");
  if (!reduced && floaters.length) {
    let ticking = false;
    const run = () => {
      ticking = false;
      const y = window.scrollY;
      if (y > 1800) return;
      floaters.forEach((el) => el.style.setProperty("--py", (y * Number(el.dataset.speed || 0)).toFixed(1) + "px"));
    };
    window.addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(run); } }, { passive: true });
  }

  /* ── Magnetic buttons ── */
  if (!reduced && window.matchMedia("(hover: hover)").matches) {
    $$(".magnetic").forEach((b) => {
      b.addEventListener("pointermove", (e) => {
        const r = b.getBoundingClientRect();
        b.style.transform = `translate(${((e.clientX - r.left) / r.width - 0.5) * 10}px, ${((e.clientY - r.top) / r.height - 0.5) * 8}px)`;
      });
      b.addEventListener("pointerleave", () => { b.style.transform = ""; });
    });
  }

  /* ═══════════════ Live demo ═══════════════ */
  const panel = $("#panel"), browserBody = $(".browser-body");
  if (!panel) return;
  const tabs = $$(".p-tab", panel), views = $$(".p-view", panel);
  const slot = $("#newClipSlot"), clipsScroll = $("#clipsScroll");
  const copyBtn = $("#demoCopy"), cursor = $("#fakeCursor"), pToast = $("#pToast");
  const searchInput = $("#demoSearch"), searchOut = $("#searchOut");

  const CODE_PREVIEW = 'import { z } from "zod";\nimport { sleep } from "./util";\n\n// Retry policy used by every API call\nexport const retryPolicy = {\n  attempts: 5,…';
  const CODE_FULL = 'import { z } from "zod";\nimport { sleep } from "./util";\n\n// Retry policy used by every API call\nexport const retryPolicy = {\n  attempts: 5,\n  backoffMs: 250,\n  jitter: true,\n};\n\nexport async function parseConfig(raw: string) {\n  const schema = z.object({\n    apiUrl: z.string().url(),\n    timeoutMs: z.number().default(8000),\n  });\n  return schema.parse(JSON.parse(raw));\n}\n// … 1,230 more lines, all saved';
  const DATA = [
    { kind: "clips", id: "c-new", text: CODE_FULL + " retryPolicy backoff", meta: "Github · just now · 38,412 chars", needsClip: true },
    { kind: "clips", id: "c-link", text: "https://developer.chrome.com/docs/extensions/reference/api/sidePanel", meta: "Chrome · 12m ago" },
    { kind: "clips", id: "c-npm", text: "npm install --save-dev vitest", meta: "Npmjs · 1h ago" },
    { kind: "clips", id: "c-prompt", text: "Summarise this changelog for a customer email. Keep it under 120 words and lead with what changed for them.", meta: "Claude · 3h ago" },
    { kind: "notes", id: "n-launch", title: "Launch checklist", text: "Before Product Hunt: record the 30-second demo, write the first comment, line up three early reviews. pnpm build && pnpm test", meta: "just now" }
  ];

  let runToken = 0, toastTimer;
  const popToast = (msg) => {
    pToast.textContent = msg; pToast.classList.add("show");
    clearTimeout(toastTimer); toastTimer = setTimeout(() => pToast.classList.remove("show"), 1500);
  };
  const showView = (name) => {
    tabs.forEach((t) => { const on = t.dataset.view === name; t.classList.toggle("active", on); t.setAttribute("aria-selected", on ? "true" : "false"); });
    views.forEach((v) => v.classList.toggle("active", v.dataset.pview === name));
    if (name === "search") { ensureClip(); renderSearch(searchInput.value.trim()); }
  };
  tabs.forEach((t) => t.addEventListener("click", () => { runToken++; hideCursor(); showView(t.dataset.view); }));

  const hasClip = () => !!$("#newClip");
  function addClip(animate = true) {
    if (hasClip()) return;
    const el = document.createElement("article");
    el.className = "pc" + (animate ? " new" : "");
    el.id = "newClip"; el.dataset.id = "c-new";
    el.innerHTML = `
      <div class="pc-text code-text" id="newClipText">${esc(CODE_PREVIEW)}</div>
      <button class="pc-expand" type="button" id="newClipExpand">Show full clip</button>
      <div class="pc-foot"><span class="pill">Github</span><span class="tm">just now</span><span class="pc-badge">code</span><span class="pc-meta">1,248 lines · 38,412 chars</span><span class="grow"></span><button class="cb copy" data-copy type="button">Copy</button></div>`;
    slot.prepend(el);
    clipsScroll.scrollTo({ top: 0 });
    let open = false;
    $("#newClipExpand").addEventListener("click", (e) => {
      open = !open;
      $("#newClipText").textContent = open ? CODE_FULL : CODE_PREVIEW;
      e.currentTarget.textContent = open ? "Show less" : "Show full clip";
    });
  }
  function ensureClip() { addClip(false); }
  function resetDemo() {
    const old = $("#newClip"); if (old) old.remove();
    copyBtn.classList.remove("done", "press");
    copyBtn.querySelector("span").textContent = "Copy";
    pToast.classList.remove("show");
  }
  function commitCopy() {
    copyBtn.classList.add("done");
    copyBtn.querySelector("span").textContent = "Copied";
    if (!hasClip()) { showView("clips"); addClip(true); }
    popToast("Saved · 38,412 characters");
  }

  /* fake cursor helpers */
  const rel = (el) => {
    const a = el.getBoundingClientRect(), b = browserBody.getBoundingClientRect();
    return { x: a.left - b.left + a.width / 2 - 4, y: a.top - b.top + a.height / 2 - 3 };
  };
  const moveCursor = (x, y, instant) => {
    cursor.style.transition = instant ? "none" : "";
    cursor.style.transform = `translate(${x}px, ${y}px)`;
    if (instant) void cursor.offsetWidth;
  };
  const hideCursor = () => cursor.classList.remove("show");

  async function playDemo() {
    const my = ++runToken;
    const alive = () => my === runToken;
    showView("clips"); resetDemo();
    if (reduced) { commitCopy(); return; }
    const small = window.matchMedia("(max-width: 760px)").matches;
    const t = rel(copyBtn);
    moveCursor(t.x - (small ? 60 : 200), t.y + (small ? 70 : 170), true);
    cursor.classList.add("show");
    await sleep(500); if (!alive()) return;
    moveCursor(t.x, t.y);
    await sleep(1150); if (!alive()) return;
    cursor.classList.remove("click"); void cursor.offsetWidth; cursor.classList.add("click");
    copyBtn.classList.add("press");
    await sleep(160); if (!alive()) return;
    copyBtn.classList.remove("press");
    commitCopy();
    await sleep(900); if (!alive()) return;
    const nb = $("#newClip .cb.copy");
    if (nb) { const p = rel(nb); moveCursor(p.x + 60, p.y + 50); }
    await sleep(700); if (!alive()) return;
    hideCursor();
  }
  copyBtn.addEventListener("click", () => { runToken++; hideCursor(); commitCopy(); });

  /* copy buttons inside panel (visual only: the demo never touches your real clipboard) */
  panel.addEventListener("click", (e) => {
    const b = e.target.closest("[data-copy]");
    if (!b) return;
    const old = b.textContent; b.textContent = "Copied"; b.classList.add("ok"); popToast("Copied");
    setTimeout(() => { b.textContent = old; b.classList.remove("ok"); }, 1200);
  });

  /* search tab */
  const tokens = (q) => q.toLowerCase().split(/\s+/).filter(Boolean);
  const hl = (text, tk) => {
    if (!tk.length) return esc(text);
    const re = new RegExp("(" + tk.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|") + ")", "gi");
    return text.split(re).map((p, i) => (i % 2 ? `<mark>${esc(p)}</mark>` : esc(p))).join("");
  };
  const snippet = (text, tk) => {
    const lower = text.toLowerCase(); let idx = -1;
    tk.forEach((t) => { const i = lower.indexOf(t); if (i !== -1 && (idx === -1 || i < idx)) idx = i; });
    if (idx < 0) idx = 0;
    const s = Math.max(0, idx - 50), e = Math.min(text.length, idx + 130);
    return (s > 0 ? "…" : "") + text.slice(s, e).replace(/\s+/g, " ").trim() + (e < text.length ? "…" : "");
  };
  function renderSearch(q) {
    if (!q) {
      searchOut.innerHTML = `<div class="p-hints"><p>Try a search:</p><button type="button" data-q="retry policy">retry policy</button><button type="button" data-q="vitest">vitest</button><button type="button" data-q="launch">launch</button><button type="button" data-q="changelog">changelog</button></div>`;
      return;
    }
    const tk = tokens(q);
    const res = DATA.filter((d) => (!d.needsClip || hasClip()) && tk.every((t) => ((d.title || "") + " " + d.text).toLowerCase().includes(t)));
    if (!res.length) { searchOut.innerHTML = `<div class="p-hints"><p>No results for “${esc(q)}”. Try another word.</p></div>`; return; }
    searchOut.innerHTML = `<div class="p-label">${res.length} result${res.length > 1 ? "s" : ""}</div>` + res.map((d) => `
      <div class="pr" data-kind="${d.kind}" data-id="${d.id}" tabindex="0" role="button" aria-label="Open ${d.kind === "notes" ? "note" : "clip"}">
        ${d.title ? `<div class="pr-title">${hl(d.title, tk)}</div>` : ""}
        <div class="pr-text">${hl(snippet(d.text, tk), tk)}</div>
        <div class="pc-foot"><span class="pc-meta">${esc(d.meta)}</span><span class="grow"></span>
          <button class="cb copy" data-copy type="button">Copy</button>
          <button class="cb go" data-go type="button" aria-label="Jump to it"><svg viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></button>
        </div></div>`).join("");
  }
  const jump = (kind, id) => {
    showView(kind === "notes" ? "notes" : "clips");
    requestAnimationFrame(() => {
      const el = $(`[data-pview="${kind === "notes" ? "notes" : "clips"}"] [data-id="${id}"]`);
      if (!el) return;
      const sc = el.closest(".p-scroll");
      sc.scrollTo({ top: Math.max(0, el.offsetTop - 44), behavior: "smooth" });
      el.classList.remove("flash"); void el.offsetWidth; el.classList.add("flash");
    });
  };
  searchInput.addEventListener("input", () => renderSearch(searchInput.value.trim()));
  searchOut.addEventListener("click", (e) => {
    const hint = e.target.closest("[data-q]");
    if (hint) { searchInput.value = hint.dataset.q; renderSearch(hint.dataset.q); return; }
    if (e.target.closest("[data-copy]")) return; // handled by panel listener
    const row = e.target.closest(".pr");
    if (!row) return;
    const sel = window.getSelection(); if (sel && !sel.isCollapsed && row.contains(sel.anchorNode)) return;
    jump(row.dataset.kind, row.dataset.id);
  });
  searchOut.addEventListener("keydown", (e) => {
    const row = e.target.closest(".pr");
    if (row && e.target === row && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); jump(row.dataset.kind, row.dataset.id); }
  });
  renderSearch("");

  /* autoplay once when the demo scrolls into view */
  const stage = $("#demo");
  let played = false;
  const start = () => { if (played) return; played = true; setTimeout(playDemo, 1700); };
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((es) => { if (es[0].isIntersecting) { io.disconnect(); start(); } }, { threshold: 0.35 });
    io.observe(stage);
  } else start();
})();
