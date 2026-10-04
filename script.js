const menuToggle = document.querySelector(".menu-toggle");
const mobileMenu = document.querySelector(".mobile-menu");

menuToggle.addEventListener("click", () => {
  const isOpen = mobileMenu.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", isOpen);
});

document.querySelectorAll(".mobile-menu a").forEach((link) => {
  link.addEventListener("click", () => {
    mobileMenu.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  });
});

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
  const links = [...document.querySelectorAll('.nav-links a[href^="#"]')];
  const byId = new Map(links.map((a) => [a.getAttribute("href").slice(1), a]));
  const spy = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    links.forEach((l) => l.classList.remove("is-active"));
    const a = byId.get(e.target.id);
    if (a) a.classList.add("is-active");
  }), { rootMargin: "-45% 0px -50% 0px" });
  document.querySelectorAll("main section[id]").forEach((s) => spy.observe(s));
})();

/* ===== WHOLE PROJECT CARD CLICK ===== */
(() => {
  const cards = document.querySelectorAll(".featured-card");

  cards.forEach((card) => {
    const link = card.querySelector(".project-link");
    if (!link) return;

    card.classList.add("is-clickable");
    card.setAttribute("tabindex", "0");
    card.setAttribute("role", "link");

    const openProject = () => link.click();

    card.addEventListener("click", (event) => {
      // Let the existing arrow/link handle its own click.
      if (event.target.closest("a")) return;
      openProject();
    });

    card.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      openProject();
    });
  });
})();
