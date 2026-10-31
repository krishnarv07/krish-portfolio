/* ===== ACCESSIBLE RESPONSIVE NAVIGATION ===== */
const menuToggle = document.querySelector(".menu-toggle");
const mobileMenu = document.querySelector(".mobile-menu");

(() => {
  if (!menuToggle || !mobileMenu) return;
  const menuLinks = [...mobileMenu.querySelectorAll("a")];
  const desktopQuery = matchMedia("(min-width: 901px)");

  const setMenuOpen = (open, returnFocus = false) => {
    mobileMenu.classList.toggle("open", open);
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    if (!open && returnFocus) menuToggle.focus();
  };

  menuToggle.addEventListener("click", () => {
    setMenuOpen(menuToggle.getAttribute("aria-expanded") !== "true");
  });

  menuLinks.forEach((link) => link.addEventListener("click", () => setMenuOpen(false)));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && mobileMenu.classList.contains("open")) {
      setMenuOpen(false, true);
    }
  });
  document.addEventListener("pointerdown", (event) => {
    if (mobileMenu.classList.contains("open") && !mobileMenu.contains(event.target) && !menuToggle.contains(event.target)) {
      setMenuOpen(false);
    }
  });
  desktopQuery.addEventListener?.("change", (event) => { if (event.matches) setMenuOpen(false); });
})();

/* ===== APPROACH ===== */
(() => {
  const root = document.querySelector("[data-approach]");
  if (!root) return;
  const $ = (s) => root.querySelector(s);
  const tabs = [...root.querySelectorAll(".approach-tab")];
  const panels = [...root.querySelectorAll(".ap-panel")];
  const bar = $(".approach-bar i");
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let cur = 0;

  /* radar: 10 heuristics, scores 0–1 (edit these to match your review) */
  const axes = [["Visibility of|status", .8], ["Real-world|match", .75], ["User control|& freedom", .6], ["Consistency|& standards", .5], ["Error|prevention", .45], ["Recognition|not recall", .3], ["Flexibility &|efficiency", .5], ["Aesthetic &|minimalism", .7], ["Error|recovery", .35], ["Help &|documentation", .4]];
  const cx = 200, cy = 160, R = 90;
  const pt = (i, r) => { const a = -Math.PI / 2 + (i * 2 * Math.PI) / axes.length; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r]; };
  const ring = (k) => axes.map((_, i) => pt(i, R * k).map((n) => n.toFixed(1)).join(",")).join(" ");
  let h = [.33, .66, 1].map((k) => `<polygon class="rd-ring" points="${ring(k)}"/>`).join("");
  axes.forEach(([t, v], i) => {
    const [x, y] = pt(i, R), [lx, ly] = pt(i, R + 14);
    const a = lx < cx - 8 ? "end" : lx > cx + 8 ? "start" : "middle";
    const [l1, l2] = t.split("|");
    const y1 = a === "middle" ? (ly < cy ? ly - 11 : ly + 10) : ly - 2.5;
    const ln = (s, yy) => `<tspan x="${lx.toFixed(1)}" y="${yy.toFixed(1)}">${s}</tspan>`;
    h += `<line class="rd-axis" data-i="${i}" x1="${cx}" y1="${cy}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}"/><text data-i="${i}" data-tip="${t.replace("|", " ")}: ${Math.round(v * 100)}/100" text-anchor="${a}">${ln(l1, y1)}${ln(l2, y1 + 13)}</text>`;
  });
  h += `<polygon class="rd-shape" points="${axes.map(([, v], i) => pt(i, R * v).map((n) => n.toFixed(1)).join(",")).join(" ")}"/>`;
  axes.forEach(([t, v], i) => { const [x, y] = pt(i, R * v); h += `<circle class="rd-dot" data-i="${i}" data-tip="${t.replace("|", " ")}: ${Math.round(v * 100)}/100" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3" style="--d:${(0.5 + i * 0.07).toFixed(2)}s"/>`; });
  $("#radar").innerHTML = h;

  /* Hick's law curve + slider (a, b are illustrative) */
  const f = (n) => 0.2 + 0.18 * Math.log2(n + 1);
  const X = (n) => 20 + ((n - 2) / 18) * 300;
  const Y = (n) => 130 - ((f(n) - f(2)) / (f(20) - f(2))) * 105;
  let d = "";
  for (let n = 2; n <= 20; n += 0.5) d += (d ? "L" : "M") + X(n).toFixed(1) + "," + Y(n).toFixed(1);
  $("#hick").innerHTML = `<line class="rd-axis" x1="20" y1="130" x2="320" y2="130"/><line class="rd-axis" x1="20" y1="10" x2="20" y2="130"/><path class="hk-curve" pathLength="1" d="${d}"/><line class="hk-g" id="hk-gx"/><line class="hk-g" id="hk-gy"/><circle class="hk-halo" id="hk-h" r="9"/><circle class="hk-dot" id="hk-d" r="5"/><text x="26" y="16">decision time</text><text x="320" y="146" text-anchor="end">number of choices</text>`;
  const hn = $("#hick-n"), ho = $("#hick-out"), hd = $("#hk-d"), hh = $("#hk-h"), gx = $("#hk-gx"), gy = $("#hk-gy");
  const upd = () => {
    const n = +hn.value, p = Math.round((f(n) / f(4) - 1) * 100);
    [hd, hh].forEach((c) => { c.setAttribute("cx", X(n)); c.setAttribute("cy", Y(n)); });
    gx.setAttribute("x1", X(n)); gx.setAttribute("x2", X(n)); gx.setAttribute("y1", Y(n)); gx.setAttribute("y2", 130);
    gy.setAttribute("x1", 20); gy.setAttribute("x2", X(n)); gy.setAttribute("y1", Y(n)); gy.setAttribute("y2", Y(n));
    ho.textContent = `${n} choices ≈ ${f(n).toFixed(2)}s` + (n === 4 ? "" : ` (${p > 0 ? "+" : ""}${p}% vs 4 choices)`);
  };
  hn.addEventListener("input", upd); upd();
  /* hover over the curve to scrub the number of choices */
  const hs = $("#hick");
  hs.style.touchAction = "pan-y";
  hs.addEventListener("pointermove", (e) => {
    const r = hs.getBoundingClientRect(), x = ((e.clientX - r.left) / r.width) * 340;
    hn.value = Math.round(Math.min(20, Math.max(2, 2 + ((x - 20) / 300) * 18)));
    upd();
  });

  /* task-time dots on a 100–400s axis */
  /* Task completion times in seconds, read off the "Task performed" chart (6 novice, 8 expert users per task).
     Replace with your raw numbers if you have them. The chart clips at 360s, so Task 3's slowest novice (360) is a lower bound. */
  const TASKS = {
    1: { n: [180, 206, 236, 288, 318, 393], e: [104, 123, 129, 134, 141, 145, 153, 158] },
    2: { n: [103, 110, 116, 125, 136, 145], e: [70, 77, 81, 87, 94, 100, 106, 112] },
    3: { n: [200, 240, 267, 297, 305, 360], e: [145, 150, 158, 163, 168, 178, 185, 195] },
    4: { n: [162, 184, 196, 208, 228, 232], e: [88, 97, 106, 110, 117, 126, 130, 137] },
  };
  const pc = (t) => ((t - 40) / 360) * 100;
  const med = (a) => { const s = [...a].sort((x, y) => x - y), m = s.length >> 1; return s.length % 2 ? s[m] : Math.round((s[m - 1] + s[m]) / 2); };
  const dotRows = [...root.querySelectorAll(".dots")];
  dotRows.forEach((el, g) => {
    const r = document.createElement("span");
    r.className = "rng";
    el.appendChild(r);
    TASKS[1][g ? "e" : "n"].forEach((_, k) => {
      const i = document.createElement("i");
      i.style.setProperty("--k", k);
      el.appendChild(i);
    });
  });
  const taskRows = [...root.querySelectorAll(".tlx")];
  taskRows.forEach((r) => {
    r.dataset.tip = `${r.children[0].textContent}: ${r.querySelector("b").dataset.count} · ${r.querySelector("em").textContent} workload`;
  });
  $(".meter").dataset.tip = "Overall 54.17 vs the 50 benchmark";

  /* show the completion-time plot for the chosen task */
  const cap = $("#task-cap"), note = $("#task-note");
  const setTask = (k) => {
    const d = TASKS[k];
    dotRows.forEach((el, g) => {
      const arr = d[g ? "e" : "n"], lo = Math.min(...arr), hi = Math.max(...arr), r = el.querySelector(".rng");
      r.style.left = `calc(${pc(lo)}% - 12px)`;
      r.style.width = `calc(${pc(hi) - pc(lo)}% + 24px)`;
      r.dataset.tip = `Spread: ${hi - lo}s (${lo}s to ${hi}s)`;
      el.querySelectorAll("i").forEach((i, j) => { i.style.left = pc(arr[j]) + "%"; i.dataset.tip = `${arr[j]}s`; });
    });
    const mn = med(d.n), me = med(d.e), sn = Math.max(...d.n) - Math.min(...d.n), se = Math.max(...d.e) - Math.min(...d.e);
    cap.textContent = `Task ${k}: completion time in seconds`;
    note.textContent = `Median: novice ${mn}s, expert ${me}s (${(mn / me).toFixed(1)}× longer). Spread: novice ${sn}s, expert ${se}s. A wide spread signals uncertainty and extra effort; a tight cluster shows a path learned through experience.`;
    taskRows.forEach((r, j) => { r.classList.toggle("is-sel", j + 1 === k); r.setAttribute("aria-pressed", j + 1 === k); });
  };
  taskRows.forEach((r, j) => {
    r.tabIndex = 0;
    r.setAttribute("role", "button");
    const pick = () => setTask(j + 1);
    r.addEventListener("pointerenter", pick);
    r.addEventListener("click", pick);
    r.addEventListener("focus", pick);
    r.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(); } });
  });
  setTask(1);

  /* count-up numbers */
  const count = (p) => p.querySelectorAll("[data-count]").forEach((el) => {
    const to = +el.dataset.count, dec = (el.dataset.count.split(".")[1] || "").length;
    if (still) return;
    const t0 = performance.now();
    const step = (t) => {
      const k = Math.min((t - t0) / 1200, 1);
      el.textContent = (to * (1 - Math.pow(1 - k, 3))).toFixed(dec);
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });


  /* hover: radar axis highlight */
  const rd = $("#radar");
  const clearHl = () => { rd.classList.remove("hl"); rd.querySelectorAll(".on").forEach((n) => n.classList.remove("on")); };
  rd.addEventListener("pointerover", (e) => {
    const el = e.target.closest("[data-i]");
    clearHl();
    if (!el) return;
    rd.classList.add("hl");
    rd.querySelectorAll(`[data-i="${el.dataset.i}"]`).forEach((n) => n.classList.add("on"));
  });
  rd.addEventListener("pointerleave", clearHl);

  /* hover: card spotlight + shared tooltip */
  const tip = document.createElement("div");
  tip.className = "ap-tip";
  document.body.appendChild(tip);
  const hideTip = () => { tip.style.opacity = 0; };
  const move = (e) => {
    const c = e.target.closest(".ap-card");
    if (c) {
      const b = c.getBoundingClientRect();
      c.style.setProperty("--mx", e.clientX - b.left + "px");
      c.style.setProperty("--my", e.clientY - b.top + "px");
    }
    const t = e.target.closest("[data-tip]");
    if (!t) return hideTip();
    tip.textContent = t.dataset.tip;
    tip.style.left = e.clientX + "px";
    tip.style.top = e.clientY + "px";
    tip.style.opacity = 1;
  };
  root.addEventListener("pointermove", move);
  root.addEventListener("pointerdown", move);
  root.addEventListener("pointerleave", hideTip);
  addEventListener("scroll", hideTip, { passive: true });

  /* tabs */
  const go = (i) => {
    cur = i;
    tabs.forEach((t, j) => {
      const on = i === j;
      t.classList.toggle("active", on);
      t.setAttribute("aria-selected", on);
      t.tabIndex = on ? 0 : -1;
      panels[j].classList.toggle("active", on);
    });
    bar.style.width = (i + 1) * 25 + "%";
    if (root.classList.contains("play")) count(panels[i]);
  };
  tabs.forEach((t, i) => {
    t.addEventListener("click", () => go(i));
    t.addEventListener("keydown", (e) => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      const n = (i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length;
      go(n); tabs[n].focus();
    });
  });

  /* start animations when the section scrolls into view */
  new IntersectionObserver(([e], o) => {
    if (!e.isIntersecting) return;
    root.classList.add("play");
    count(panels[cur]);
    o.disconnect();
  }, { threshold: 0.15 }).observe(root);
})();

/* ===== PAGE MOTION ===== */
(() => {
  const sel = ".section-heading, .featured-card, .more-work, .experience-item, .about-image, .about-copy > :not(.about-facts), .about-facts > div, .contact-section > *";
  const items = [...document.querySelectorAll(sel)];
  items.forEach((el) => {
    const sibs = [...el.parentElement.children].filter((c) => c.matches(sel));
    const k = sibs.indexOf(el);
    el.style.setProperty("--rd", (el.matches(".featured-card") ? k % 2 : Math.min(k, 5)) * 0.09 + "s");
    el.classList.add("reveal");
  });
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add("in");
      io.unobserve(e.target);
    }), { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    items.forEach((el) => io.observe(el));
  } else items.forEach((el) => el.classList.add("in"));

  /* scroll progress line + header state */
  const line = document.createElement("div");
  line.className = "scroll-line";
  document.body.appendChild(line);
  const header = document.querySelector(".site-header");
  let busy = false;
  const onScroll = () => {
    if (busy) return;
    busy = true;
    requestAnimationFrame(() => {
      const max = document.documentElement.scrollHeight - innerHeight;
      line.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
      header.classList.toggle("scrolled", scrollY > 8);
      busy = false;
    });
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* highlight the nav link for the section in view */
  const links = [...document.querySelectorAll('.nav-links a[href^="#"], .mobile-menu a[href^="#"]')];
  const byId = new Map();
  links.forEach((link) => {
    const id = link.getAttribute("href").slice(1);
    if (!byId.has(id)) byId.set(id, []);
    byId.get(id).push(link);
  });
  const spy = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    links.forEach((l) => l.classList.remove("is-active"));
    (byId.get(e.target.id) || []).forEach((link) => link.classList.add("is-active"));
  }), { rootMargin: "-45% 0px -50% 0px" });
  document.querySelectorAll("main section[id]").forEach((s) => spy.observe(s));
})();

/* ===== MOBILE EXPERIENCE ACCORDION ===== */
(() => {
  const items = [...document.querySelectorAll(".experience-item")];
  if (!items.length) return;

  const mq = matchMedia("(max-width: 900px)");

  const sync = () => {
    if (mq.matches) {
      // Mobile: only one experience item may be open at a time.
      // This also fixes the desktop -> mobile resize case where all items
      // may already have the `open` class.
      let active = items.find((item) => item.classList.contains("open")) || items[0];
      items.forEach((item) => {
        const isActive = item === active;
        item.classList.toggle("open", isActive);
        const button = item.querySelector(".experience-summary");
        if (button) button.setAttribute("aria-expanded", isActive);
      });
    } else {
      // Desktop: preserve the original fully expanded experience layout.
      items.forEach((item) => item.classList.add("open"));
      items.forEach((item) => {
        const button = item.querySelector(".experience-summary");
        if (button) button.setAttribute("aria-expanded", "true");
      });
    }
  };

  items.forEach((item) => {
    const button = item.querySelector(".experience-summary");
    if (!button) return;

    button.addEventListener("click", () => {
      if (!mq.matches) return;

      const willOpen = !item.classList.contains("open");
      items.forEach((other) => {
        other.classList.remove("open");
        const otherButton = other.querySelector(".experience-summary");
        if (otherButton) otherButton.setAttribute("aria-expanded", "false");
      });

      if (willOpen) {
        item.classList.add("open");
        button.setAttribute("aria-expanded", "true");
      }
    });
  });

  mq.addEventListener?.("change", sync);
  sync();
})();

/* ===== MOBILE: swipe dots (Work, About) ===== */
(() => {
  document.querySelectorAll(".featured-grid, .about-facts").forEach((sc) => {
    let kids = [...sc.children].filter((child) => !child.hidden);
    if (kids.length < 2) return;
    const dots = document.createElement("div");
    dots.className = "swipe-dots";
    dots.setAttribute("aria-hidden", "true");
    sc.after(dots);
    let dotEls = [];
    const rebuildDots = () => {
      kids = [...sc.children].filter((child) => !child.hidden);
      dots.replaceChildren();
      kids.forEach(() => dots.appendChild(document.createElement("i")));
      dotEls = [...dots.children];
      dots.hidden = kids.length < 2;
      dots.style.display = kids.length < 2 ? "none" : "";
    };
    const update = () => {
      kids = [...sc.children].filter((child) => !child.hidden);
      if (!kids.length) return;
      const pad = parseFloat(getComputedStyle(sc).paddingLeft) || 0;
      let best = 0, bd = Infinity;
      kids.forEach((k, i) => {
        const d = Math.abs(k.offsetLeft - pad - sc.scrollLeft);
        if (d < bd) { bd = d; best = i; }
      });
      dotEls.forEach((el, i) => el.classList.toggle("on", i === best));
    };
    rebuildDots();
    sc.addEventListener("scroll", update, { passive: true });
    sc.addEventListener("portfolio:filterchange", () => { rebuildDots(); requestAnimationFrame(update); });
    addEventListener("resize", update);
    update();
  });
})();

/* ===== MOBILE APPROACH: pill switcher + foldable methods ===== */
(() => {
  const LABELS = [
    ["Journey", "3 questions"],
    ["Heuristics", "Walkthrough"],
    ["Hick's law", "Outputs"],
    ["UMUX", "Time & workload"],
  ];
  /* cards that must share one frame (indexes within the panel) */
  const GROUPS = { 3: [[0], [1, 2]] };

  document.querySelectorAll(".ap-panel").forEach((panel, p) => {
    const vis = panel.querySelector(".ap-visual");
    const cards = vis ? [...vis.querySelectorAll(":scope > .ap-card")] : [];
    const groups = GROUPS[p] || cards.map((_, i) => [i]);

    if (groups.length > 1) {
      groups.forEach((g) => {
        if (g.length < 2) return;
        cards[g[0]].classList.add("grp-a");
        cards[g[g.length - 1]].classList.add("grp-b");
      });
      const seg = document.createElement("div");
      seg.className = "ap-seg";
      const btns = groups.map((g, i) => {
        const b = document.createElement("button");
        b.type = "button";
        b.textContent = (LABELS[p] || [])[i] || `View ${i + 1}`;
        b.addEventListener("click", () => show(i));
        seg.appendChild(b);
        return b;
      });
      const show = (i) => {
        cards.forEach((c, j) => c.classList.toggle("is-on", groups[i].includes(j)));
        btns.forEach((b, j) => { b.classList.toggle("on", j === i); b.setAttribute("aria-pressed", j === i); });
      };
      vis.before(seg);
      vis.classList.add("seg-ready");
      show(0);
    }

    const list = panel.querySelector(".ap-list");
    if (list) {
      const n = list.children.length;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "ap-more";
      btn.setAttribute("aria-expanded", "false");
      btn.innerHTML = `<b>How I do it · ${n} methods</b><span aria-hidden="true">+</span>`;
      btn.addEventListener("click", () => {
        const open = list.classList.toggle("open");
        btn.setAttribute("aria-expanded", open);
      });
      list.before(btn);
      list.classList.add("fold");
    }
  });
})();


/* ===== PROJECT DISCOVERY: CATEGORY FILTER + LOAD MORE ===== */
(() => {
  const toolbar = document.querySelector(".project-filters");
  const grid = document.querySelector(".featured-grid");
  const status = document.getElementById("projectFilterStatus");
  const reset = document.getElementById("projectResetFilters");
  const loadMoreWrap = document.getElementById("loadMoreWrap");
  const loadMoreButton = document.getElementById("loadMoreProjects");
  const loadMoreLabel = loadMoreButton?.querySelector(".load-more-label");
  const loadMoreIcon = loadMoreButton?.querySelector(".load-more-icon");
  if (!toolbar || !grid || !status) return;

  const buttons = [...toolbar.querySelectorAll("[data-filter]")];
  const cards = [...grid.querySelectorAll(".featured-card[data-category]")];
  const labels = { all: "all", ecommerce: "e-commerce", product: "product UX", website: "website UX" };
  const extraCards = cards.filter((card) => card.classList.contains("is-load-more"));
  const defaultCards = cards.filter((card) => !card.classList.contains("is-load-more"));
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let activeFilter = "all";
  let expanded = false;

  const applyFilters = () => {
    let shown = 0;
    buttons.forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.filter === activeFilter)));
    cards.forEach((card) => {
      const categoryMatch = activeFilter === "all" || card.dataset.category === activeFilter;
      const hiddenByLoadMore = activeFilter === "all" && !expanded && card.classList.contains("is-load-more");
      const visible = categoryMatch && !hiddenByLoadMore;
      card.hidden = !visible;
      if (visible) shown += 1;
      if (visible) card.classList.add("in");
    });

    if (activeFilter === "all") {
      status.textContent = expanded ? `Showing all ${shown} selected projects` : `Showing ${shown} of ${cards.length} selected projects`;
    } else {
      const categoryText = labels[activeFilter] || activeFilter;
      status.textContent = `Showing ${shown} ${categoryText} ${shown === 1 ? "project" : "projects"}`;
    }

    if (reset) reset.hidden = activeFilter === "all";
    if (loadMoreWrap) loadMoreWrap.hidden = activeFilter !== "all";
    if (loadMoreButton) loadMoreButton.setAttribute("aria-expanded", String(expanded));
    if (loadMoreLabel) loadMoreLabel.textContent = expanded ? "Show fewer projects" : `Load more projects (${extraCards.length})`;
    if (loadMoreIcon) loadMoreIcon.textContent = expanded ? "↑" : "↓";
    grid.scrollTo({ left: 0, behavior: reducedMotion ? "auto" : "smooth" });
    grid.dispatchEvent(new Event("portfolio:filterchange"));
  };

  buttons.forEach((button) => button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    // Return to the curated four-card view when navigating back to All Work.
    if (activeFilter === "all") expanded = false;
    applyFilters();
  }));
  reset?.addEventListener("click", () => { activeFilter = "all"; expanded = false; applyFilters(); });
  loadMoreButton?.addEventListener("click", () => {
    expanded = !expanded;
    applyFilters();
    if (!expanded) grid.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
  });
  applyFilters();
})();

/* ===== PROJECT QUICK VIEW DIALOG ===== */
(() => {
  const dialog = document.getElementById("projectDialog");
  const titleEl = document.getElementById("projectDialogTitle");
  const kickerEl = document.getElementById("projectDialogKicker");
  const introEl = document.getElementById("projectDialogIntro");
  const sectionsEl = document.getElementById("projectDialogSections");
  const footerEl = document.getElementById("projectDialogFooter");
  const closeBtn = document.getElementById("projectDialogClose");
  if (!dialog || !titleEl || !kickerEl || !introEl || !sectionsEl || !footerEl) return;

  const projects = {
    bhima: {
      kicker: "01 / E-COMMERCE · UX/UI",
      title: "Bhima Jewellery",
      intro: "Improving an e-commerce journey that spans discovery, product evaluation, cart, checkout, and customer communication.",
      sections: [
        { title: "Experience areas", items: ["Product discovery and product detail pages", "Cart, checkout, and customer journeys", "Responsive web interfaces"] },
        { title: "Design work", items: ["Competitor analysis and user flows", "Design system and transactional communication", "Retail and E-Gold scheme integration"] },
        { title: "Complexity behind the UI", items: ["Pimcore catalogue structure", "Joining customer-facing experiences with catalogue and scheme rules"] },
        { title: "What this project shows", items: ["Working across a connected commerce journey", "Making complex product and account states easier to navigate"] }
      ],
      links: [{ label: "Visit live site", href: "https://mybhima.com/" }],
      note: "Project scope is described from the portfolio summary; no unverified conversion metrics are claimed."
    },
    egold: {
      kicker: "02 / PRODUCT JOURNEY",
      title: "E-Gold Journey",
      intro: "A scheme-management experience focused on making status, maturity, eligibility, and redemption clearer to understand.",
      sections: [
        { title: "The user need", items: ["Understand whether a scheme is active or mature", "Know what action is available at each state", "Understand eligibility before attempting redemption"] },
        { title: "Journey work", items: ["Mapped scheme states and edge cases", "Clarified maturity and redemption paths", "Structured scheme information around clear next steps"] },
        { title: "UX focus", items: ["Information architecture and user journey mapping", "Reducing ambiguity across active, completed, and historical states"] },
        { title: "Public artifacts", items: ["A dedicated public case-study URL is not connected to this portfolio card yet", "The overview here stays focused on the scope described on this site"] }
      ],
      links: [],
      note: "This is a concise portfolio overview, not a claim of measured business impact."
    },
    zepto: {
      kicker: "03 / PRODUCT UX · CASE STUDY",
      title: "Zepto UX Case Study",
      intro: "A UX evaluation and redesign exercise exploring usability problems, cognitive load, and clearer task flows.",
      sections: [
        { title: "Evaluation", items: ["Reviewing the existing experience and usability issues", "Using heuristic review and cognitive walkthroughs", "Examining where users need to make decisions"] },
        { title: "Redesign focus", items: ["Reworking key flows", "Applying Hick’s Law as a lens on choice complexity", "Considering clarity and task effort"] },
        { title: "Validation methods", items: ["Usability testing", "NASA-TLX to examine perceived workload", "Reviewing novice and expert task patterns"] },
        { title: "What is shown", items: ["The linked Behance case study contains the public project presentation", "No additional success metrics are invented in this overview"] }
      ],
      links: [{ label: "Open Behance case study", href: "https://www.behance.net/gallery/241273799/Zepto-Redesign-UX-Case-Study" }],
      note: "The methods listed reflect the case-study summary already presented on the portfolio."
    },
    dahnay: {
      kicker: "04 / WEBSITE UX · LOGISTICS",
      title: "DahNAY Logistics",
      intro: "Structuring a complex logistics website so visitors can distinguish services from solutions and reach practical shipment-planning information.",
      sections: [
        { title: "Information architecture", items: ["Researching the logistics domain", "Creating a clearer separation between services and solutions", "Making page structure easier to scan"] },
        { title: "Useful interaction", items: ["Designing a CBM calculator for shipment planning", "Organising dimensional inputs around a specific task"] },
        { title: "UX priorities", items: ["Clear labels and content hierarchy", "Making a specialist service easier to understand", "Connecting information architecture with a practical utility"] },
        { title: "Project lens", items: ["Logistics website UX", "Content strategy and utility design"] }
      ],
      links: [{ label: "Visit DahNAY website", href: "https://dahnay.com/" }],
      note: "The project overview describes the work scope shown on this site without adding unsupported outcome claims."
    },
    decide: {
      kicker: "05 / PRODUCT · MOBILE APP UX",
      title: "Decide",
      intro: "Designing a mobile experience that helps people overcome indecision and make everyday choices easier, from picking a restaurant or movie to planning a weekend trip.",
      sections: [
        { title: "The user need", items: ["Help people move forward when everyday decisions feel difficult", "Support choices such as restaurants, movies, and weekend plans"] },
        { title: "Interaction design", items: ["Combine personalized suggestions with a spinning-wheel decision tool", "Make choosing feel simpler and more engaging"] },
        { title: "Design process", items: ["Research, define, ideate, wireframes, and user flows", "Branding, UI design, and user testing"] },
        { title: "Methods and focus", items: ["Mobile app design", "Interaction design and usability testing"] }
      ],
      links: [{ label: "Open Behance case study", href: "https://www.behance.net/gallery/229957453/Decide-A-Smart-Decision-Making-App-UIX-Project" }],
      note: "This overview uses the project description and methods supplied for the portfolio; no unverified outcomes are claimed."
    },
    megaming: {
      kicker: "06 / PRODUCT · MOBILE APP UX",
      title: "MEGAMING",
      intro: "Designing a gaming-focused streaming experience where players can explore gameplay, watch live streams, share content, and connect with other gaming enthusiasts.",
      sections: [
        { title: "Core experience", items: ["Explore gameplay and gaming content", "Watch live streams and share content", "Connect with other gaming enthusiasts"] },
        { title: "Interface direction", items: ["Dark-mode user interface", "Engaging content layouts", "Clear and intuitive mobile navigation"] },
        { title: "Interaction focus", items: ["Interactive mobile experiences", "Community-oriented features", "Streaming UX and UI design"] },
        { title: "Project lens", items: ["Mobile app design", "Interaction design and community experience"] }
      ],
      links: [{ label: "Open Behance case study", href: "https://www.behance.net/gallery/202205421/MEGAMING-Streaming_Platform" }],
      note: "This overview reflects the supplied project description without adding unverified metrics or outcomes."
    }
  };

  let lastTrigger = null;
  const buildSection = (section) => {
    const block = document.createElement("section");
    block.className = "project-detail-block";
    const heading = document.createElement("h3");
    heading.textContent = section.title;
    const list = document.createElement("ul");
    section.items.forEach((item) => { const li = document.createElement("li"); li.textContent = item; list.appendChild(li); });
    block.append(heading, list);
    return block;
  };
  const openProject = (key, trigger) => {
    const project = projects[key];
    if (!project) return;
    lastTrigger = trigger;
    kickerEl.textContent = project.kicker;
    titleEl.textContent = project.title;
    introEl.textContent = project.intro;
    sectionsEl.replaceChildren(...project.sections.map(buildSection));
    footerEl.replaceChildren();
    const note = document.createElement("p");
    note.className = "project-dialog-note";
    note.textContent = project.note;
    footerEl.appendChild(note);
    if (project.links.length) {
      const links = document.createElement("div");
      links.className = "project-dialog-links";
      project.links.forEach((item) => {
        const a = document.createElement("a");
        a.href = item.href; a.target = "_blank"; a.rel = "noopener";
        a.textContent = item.label + " ↗";
        links.appendChild(a);
      });
      footerEl.appendChild(links);
    }
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
    closeBtn?.focus();
  };
  document.querySelectorAll("[data-project-open]").forEach((button) => {
    button.addEventListener("click", () => openProject(button.dataset.projectOpen, button));
  });
  closeBtn?.addEventListener("click", () => dialog.close ? dialog.close() : dialog.removeAttribute("open"));
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close ? dialog.close() : dialog.removeAttribute("open");
  });
  dialog.addEventListener("close", () => { if (lastTrigger && document.contains(lastTrigger)) lastTrigger.focus(); });
  dialog.addEventListener("cancel", () => { /* Native Escape handling is intentionally retained. */ });
})();

/* ===== CONTACT: COPY EMAIL ===== */
(() => {
  const button = document.querySelector("[data-copy-email]");
  const status = document.getElementById("contactCopyStatus");
  if (!button || !status) return;
  const email = button.dataset.copyEmail;
  let resetLabel = "Copy email ⧉";

  const showFeedback = (message, temporaryLabel) => {
    status.textContent = message;
    if (temporaryLabel) button.innerHTML = `${temporaryLabel} <span aria-hidden="true">✓</span>`;
    window.clearTimeout(showFeedback.timer);
    showFeedback.timer = window.setTimeout(() => {
      button.innerHTML = resetLabel;
      status.textContent = "";
    }, 2600);
  };

  button.addEventListener("click", async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(email);
      } else {
        const field = document.createElement("textarea");
        field.value = email;
        field.setAttribute("readonly", "");
        field.style.position = "fixed";
        field.style.opacity = "0";
        document.body.appendChild(field);
        field.select();
        const copied = document.execCommand("copy");
        field.remove();
        if (!copied) throw new Error("Clipboard unavailable");
      }
      showFeedback("Email address copied to clipboard.", "Copied");
    } catch (_) {
      showFeedback(`Copy unavailable. Email: ${email}`, "Email shown");
    }
  });
})();

/* ===== BACK TO TOP ===== */
(() => {
  const link = document.querySelector(".back-to-top");
  if (!link) return;
  let scheduled = false;
  const update = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      link.classList.toggle("is-visible", window.scrollY > 560);
      scheduled = false;
    });
  };
  window.addEventListener("scroll", update, { passive: true });
  update();
})();
