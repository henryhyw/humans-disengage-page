/* ================================================================
   Project page: Humans Disengage, Reasoning Models Persist
   All charts read window.DATA (from data.js); D3 is the global.
   ================================================================ */

"use strict";
const D = window.DATA || {};
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

const COL = {
  human:     "#2a2a28",
  lrm:       "#cc785c",
  lrmDim:    "#e0b3a8",
  baseline:  "#807a6e",
  blue:      "#3c6f8f",
  line:      "#e3dccc",
  lineStrong:"#c8c0aa",
  mute:      "#807a6e",
  text:      "#2a2a28",
};

const fmtSigned = (v, d = 2) => (v >= 0 ? "+" : "") + v.toFixed(d);
const fmtNum    = (v, d = 2) => v.toFixed(d);

/* ------------------------------------------------------------------
   Tooltip helper (single global card, reused by all charts)
   ------------------------------------------------------------------ */
const Tip = (() => {
  let card = null;
  const ensure = () => {
    if (!card) {
      card = document.createElement("div");
      card.className = "tooltip-card";
      document.body.appendChild(card);
    }
    return card;
  };
  return {
    show(html, evt) {
      const c = ensure();
      c.innerHTML = html;
      const pad = 14;
      let x = evt.clientX + pad;
      let y = evt.clientY + pad;
      // keep on screen
      const w = c.offsetWidth || 200;
      const h = c.offsetHeight || 60;
      if (x + w > window.innerWidth - 8) x = evt.clientX - w - pad;
      if (y + h > window.innerHeight - 8) y = evt.clientY - h - pad;
      c.style.left = x + "px";
      c.style.top = y + "px";
      c.classList.add("visible");
    },
    hide() {
      if (card) card.classList.remove("visible");
    },
  };
})();

/* ------------------------------------------------------------------
   Top nav — scroll spy + burger
   ------------------------------------------------------------------ */
const Nav = {
  init() {
    const nav = $("#topnav");
    if (!nav) return;

    // scrolled state
    const onScroll = () => {
      nav.classList.toggle("scrolled", window.scrollY > 12);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    // burger
    const burger = $("#nav-burger");
    if (burger) {
      burger.addEventListener("click", () => {
        const open = nav.classList.toggle("open");
        burger.setAttribute("aria-expanded", String(open));
      });
      // close on link click (mobile)
      $$(".navlinks a").forEach((a) =>
        a.addEventListener("click", () => {
          nav.classList.remove("open");
          burger.setAttribute("aria-expanded", "false");
        })
      );
    }

    // scroll spy — highlight nav link for the currently-visible section
    const sections = $$("section[id], header.hero").map((el) => ({
      id: el.id || "top",
      el,
    }));
    const links = {};
    $$(".navlinks a").forEach((a) => {
      const href = a.getAttribute("href").replace(/^#/, "");
      links[href] = a;
    });
    if (!("IntersectionObserver" in window)) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            $$(".navlinks a").forEach((a) => a.classList.remove("active"));
            const a = links[e.target.id];
            if (a) a.classList.add("active");
          }
        });
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
    );
    sections.forEach((s) => obs.observe(s.el));
  },
};

/* ------------------------------------------------------------------
   BibTeX copy button
   ------------------------------------------------------------------ */
function initBibtex() {
  const btn = $("#bib-copy");
  const txt = $("#bib-text");
  if (!btn || !txt) return;
  btn.addEventListener("click", () => {
    const t = txt.textContent;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(t).then(showOK).catch(fallbackCopy);
    } else {
      fallbackCopy();
    }
    function fallbackCopy() {
      const ta = document.createElement("textarea");
      ta.value = t;
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        showOK();
      } catch (_) {}
      document.body.removeChild(ta);
    }
    function showOK() {
      btn.classList.add("ok");
      btn.textContent = "Copied";
      setTimeout(() => {
        btn.classList.remove("ok");
        btn.textContent = "Copy";
      }, 1400);
    }
  });
}

/* ------------------------------------------------------------------
   Reveal-on-scroll
   ------------------------------------------------------------------ */
function initReveal() {
  const els = $$(".reveal");
  if (!("IntersectionObserver" in window)) {
    els.forEach((el) => el.classList.add("visible"));
    return;
  }
  const obs = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add("visible");
          obs.unobserve(e.target);
        }
      }
    },
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
  );
  els.forEach((el) => obs.observe(el));
}

/* ------------------------------------------------------------------
   PHASE PLOT — scrollytelling: registration → allocation → quadrant
   ------------------------------------------------------------------ */
const PhasePlot = {
  step: 1,  // 1: x-only · 2: add y-axis & points fly up · 3: quadrant reveal
  _gen: 0,
  _refs: null,
  _foot: [
    "<strong>Step 1 of 3 ·</strong> Each model's <em>cross-item ρ</em> with human RT — looks aligned: most thinking LRMs are positively correlated with humans across items.",
    "<strong>Step 2 of 3 ·</strong> Now add the <em>within-agent allocation d</em>. Points fly up — every thinking LRM ends in the upper half (more deliberation on wrong trials).",
    "<strong>Step 3 of 3 ·</strong> The matched human reference (dashed) sits at the bottom. Registration is shared; allocation is not. Two diagnostics that previous work conflated.",
  ],
  init() {
    const container = $("#phase-chart");
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const margin = { top: 28, right: 36, bottom: 60, left: 64 };
    const W = Math.max(560, rect.width - margin.left - margin.right);
    const H = 420;

    const pts = (D.phasePlot || []).filter((p) => p.rho != null);
    const humanD = (D.phasePlot.find((p) => p.kind === "human") || { d: -0.1 }).d;

    d3.select(container).selectAll("*").remove();
    const svg = d3
      .select(container)
      .append("svg")
      .attr("viewBox", `0 0 ${W + margin.left + margin.right} ${H + margin.top + margin.bottom}`)
      .attr("preserveAspectRatio", "xMidYMid meet");
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear().domain([-0.1, 0.4]).range([0, W]);
    const y = d3.scaleLinear().domain([-0.6, 3.6]).range([H, 0]);

    // axes
    g.append("g")
      .attr("class", "axis axis-x")
      .attr("transform", `translate(0,${H})`)
      .call(d3.axisBottom(x).ticks(6).tickFormat(d3.format(".2f")));
    const yAxisG = g.append("g").attr("class", "axis axis-y").call(d3.axisLeft(y).ticks(5));

    // grid (light)
    g.append("g")
      .attr("class", "grid grid-x")
      .attr("transform", `translate(0,${H})`)
      .call(d3.axisBottom(x).ticks(6).tickSize(-H).tickFormat(""));
    const yGridG = g.append("g")
      .attr("class", "grid grid-y")
      .call(d3.axisLeft(y).ticks(5).tickSize(-W).tickFormat(""));

    // reference lines: x=0, y=0
    g.append("line")
      .attr("x1", x(0))
      .attr("x2", x(0))
      .attr("y1", 0)
      .attr("y2", H)
      .attr("stroke", COL.lineStrong)
      .attr("stroke-width", 0.8);
    g.append("line")
      .attr("x1", 0)
      .attr("x2", W)
      .attr("y1", y(0))
      .attr("y2", y(0))
      .attr("stroke", COL.lineStrong)
      .attr("stroke-width", 0.8);

    // human horizontal reference (dashed)
    const humanRefLine = g.append("line")
      .attr("class", "human-ref")
      .attr("x1", 0)
      .attr("x2", W)
      .attr("y1", y(humanD))
      .attr("y2", y(humanD))
      .attr("stroke", COL.human)
      .attr("stroke-dasharray", "4,4")
      .attr("stroke-width", 1.1)
      .attr("opacity", 0.7);
    const humanRefText = g.append("text")
      .attr("class", "human-ref-text")
      .attr("x", 6)
      .attr("y", y(humanD) - 6)
      .attr("font-family", "var(--font-mono)")
      .attr("font-size", 10.5)
      .attr("fill", COL.human)
      .text(`human  d = ${fmtSigned(humanD)}`);

    // axis labels
    g.append("text")
      .attr("class", "xlabel")
      .attr("x", W / 2)
      .attr("y", H + 44)
      .attr("text-anchor", "middle")
      .attr("font-family", "var(--font-body)")
      .attr("font-size", 12.5)
      .attr("fill", COL.mute)
      .text("Cross-item alignment  (Spearman ρ : LRM trace length vs human RT)");
    const yLabel = g.append("text")
      .attr("class", "ylabel")
      .attr("transform", "rotate(-90)")
      .attr("x", -H / 2)
      .attr("y", -44)
      .attr("text-anchor", "middle")
      .attr("font-family", "var(--font-body)")
      .attr("font-size", 12.5)
      .attr("fill", COL.mute)
      .text("Within-agent allocation  (Cohen's d on log deliberation, wrong − right)");

    // quadrant annotation
    const quadrantText = g.append("text")
      .attr("class", "quadrant-text")
      .attr("x", W - 8)
      .attr("y", 18)
      .attr("text-anchor", "end")
      .attr("font-family", "var(--font-display)")
      .attr("font-style", "italic")
      .attr("font-size", 13)
      .attr("fill", COL.lrm)
      .attr("opacity", 0.7)
      .text("aligned · over-deliberating");

    // points
    const offsets = {
      "Qwen-QwQ-32B":      [10, -10],
      "GLM-4.5-Air-FP8":   [10, -10],
      "DeepSeek-R1":       [10, -10],
      "gpt-oss-120b":      [10, 14],
      "gpt-oss-20b":       [12, -18],
      "Qwen3-235B-Thinking": [-12, -10],
      "DeepSeek-V3":       [10, 14],
    };

    const dot = g
      .selectAll("g.dot")
      .data(pts)
      .join("g")
      .attr("class", "dot")
      .attr("transform", (d) => `translate(${x(d.rho)},${y(d.d)})`);

    const circles = dot
      .append("circle")
      .attr("r", 0)  // start collapsed for replay
      .attr("fill", (d) =>
        d.kind === "non-thinking" ? COL.baseline : d.underpowered ? "white" : COL.lrm
      )
      .attr("stroke", (d) => (d.kind === "non-thinking" ? "black" : COL.lrm))
      .attr("stroke-width", 1.5)
      .style("cursor", "pointer");

    const labels = dot
      .append("text")
      .attr("x", (d) => (offsets[d.agent] ? offsets[d.agent][0] : 11))
      .attr("y", (d) => (offsets[d.agent] ? offsets[d.agent][1] : -8))
      .attr("text-anchor", (d) => (offsets[d.agent] && offsets[d.agent][0] < 0 ? "end" : "start"))
      .attr("font-family", "var(--font-mono)")
      .attr("font-size", 11)
      .attr("fill", COL.text)
      .attr("opacity", 0)
      .text((d) => d.short);

    // hover tooltip via global Tip
    dot
      .on("pointerenter", function (evt, d) {
        const kind = d.kind === "non-thinking" ? "non-thinking baseline" : d.underpowered ? "thinking LRM (underpowered)" : "thinking LRM";
        const html = `<strong>${d.short}</strong>` +
          `<div class="tip-row"><span class="tip-label">cross-item ρ</span><span>${fmtSigned(d.rho, 3)}</span></div>` +
          `<div class="tip-row"><span class="tip-label">within-agent d</span><span>${fmtSigned(d.d, 2)}</span></div>` +
          `<div class="tip-row"><span class="tip-label">model class</span><span>${kind}</span></div>`;
        Tip.show(html, evt);
      })
      .on("pointermove", (evt, d) => {
        const kind = d.kind === "non-thinking" ? "non-thinking baseline" : d.underpowered ? "thinking LRM (underpowered)" : "thinking LRM";
        const html = `<strong>${d.short}</strong>` +
          `<div class="tip-row"><span class="tip-label">cross-item ρ</span><span>${fmtSigned(d.rho, 3)}</span></div>` +
          `<div class="tip-row"><span class="tip-label">within-agent d</span><span>${fmtSigned(d.d, 2)}</span></div>` +
          `<div class="tip-row"><span class="tip-label">model class</span><span>${kind}</span></div>`;
        Tip.show(html, evt);
      })
      .on("pointerleave", () => Tip.hide());

    // Store refs for setStep
    PhasePlot._refs = {
      dot, circles, labels, pts, x, y, H,
      yAxisG, yGridG, yLabel,
      humanRef: humanRefLine, humanRefText, quadrantText,
    };

    // Animated entry on init / replay (full reveal)
    function animateIn() {
      circles.attr("r", 0);
      labels.attr("opacity", 0);
      circles
        .transition("phase-r")
        .delay((d, i) => 80 + i * 70)
        .duration(420)
        .ease(d3.easeBackOut.overshoot(1.4))
        .attr("r", (d) => (d.kind === "non-thinking" ? 8 : 7));
      labels
        .transition("phase-lab")
        .delay((d, i) => 240 + i * 70)
        .duration(280)
        .attr("opacity", 1);
    }
    PhasePlot._animateIn = () => {
      // re-run from current step
      if (PhasePlot.step === 1) PhasePlot.setStep(1, true);
      else if (PhasePlot.step === 2) PhasePlot.setStep(2, true);
      else PhasePlot.setStep(3, true);
    };

    // Initial step rendering
    PhasePlot.setStep(PhasePlot.step, true);

    // Wire up the toggle buttons
    if (!PhasePlot._wired) {
      $$("#phase-step-toggle .btn-mini").forEach((btn) => {
        btn.addEventListener("click", () => {
          const s = parseInt(btn.dataset.step, 10);
          $$("#phase-step-toggle .btn-mini").forEach((b) => b.classList.remove("active"));
          btn.classList.add("active");
          PhasePlot.setStep(s, false);
        });
      });
      PhasePlot._wired = true;
    }

    // legend
    const legend = g.append("g").attr("transform", `translate(8, ${H - 6})`);
    const items = [
      { c: COL.lrm,      fill: COL.lrm,    stroke: COL.lrm,    label: "thinking LRM (well-powered)" },
      { c: "white",      fill: "white",    stroke: COL.lrm,    label: "thinking LRM (underpowered)" },
      { c: COL.baseline, fill: COL.baseline,stroke: "black",   label: "non-thinking (V3)" },
    ];
    let xx = 0;
    items.forEach((it) => {
      const G = legend.append("g").attr("transform", `translate(${xx},0)`);
      G.append("circle").attr("r", 5).attr("fill", it.fill).attr("stroke", it.stroke).attr("stroke-width", 1.4);
      const t = G.append("text")
        .attr("x", 10)
        .attr("y", 4)
        .attr("font-family", "var(--font-mono)")
        .attr("font-size", 11)
        .attr("fill", COL.mute)
        .text(it.label);
      xx += 14 + t.node().getBBox().width + 22;
    });
  },
  // Scrollytelling step controller. step ∈ {1,2,3}
  setStep(step, instant) {
    PhasePlot.step = step;
    if (!PhasePlot._refs) return;
    const { dot, circles, labels, pts, x, y, yAxisG, yGridG, yLabel,
            humanRef, humanRefText, quadrantText } = PhasePlot._refs;

    const dur = instant ? 0 : 700;

    // Update foot text
    const foot = $("#phase-foot");
    if (foot) foot.innerHTML = PhasePlot._foot[step - 1];

    // Highlight active toggle button
    $$("#phase-step-toggle .btn-mini").forEach((b) => {
      b.classList.toggle("active", parseInt(b.dataset.step, 10) === step);
    });

    // Helpers
    const showSel = (sel, op) => sel.transition("phase-step").duration(dur).attr("opacity", op);
    const X_AXIS_Y = y(0);  // y-position when only x-axis shown

    if (step === 1) {
      // Only x-axis. Points are on the x-axis line (y = 0).
      showSel(yAxisG, 0);
      showSel(yGridG, 0);
      showSel(yLabel, 0);
      showSel(humanRef, 0);
      showSel(humanRefText, 0);
      showSel(quadrantText, 0);

      dot
        .transition("phase-step-dot")
        .duration(dur)
        .ease(d3.easeCubicOut)
        .attr("transform", (d) => `translate(${x(d.rho)},${X_AXIS_Y})`);
      circles
        .transition("phase-step-c")
        .duration(dur)
        .attr("r", (d) => (d.kind === "non-thinking" ? 8 : 7));
      labels
        .transition("phase-step-l")
        .duration(dur * 0.5)
        .attr("opacity", 0)
        .transition("phase-step-l2")
        .duration(dur * 0.5)
        .attr("opacity", 1)
        .attr("y", -12);  // labels above the axis
    } else if (step === 2) {
      // Reveal y-axis, points fly up to their real (rho, d) positions.
      showSel(yAxisG, 1);
      showSel(yGridG, 1);
      showSel(yLabel, 1);
      showSel(humanRef, 0);
      showSel(humanRefText, 0);
      showSel(quadrantText, 0);

      circles.attr("r", (d) => (d.kind === "non-thinking" ? 8 : 7));
      dot
        .transition("phase-step-dot")
        .delay((d, i) => i * 60)
        .duration(700)
        .ease(d3.easeBackOut.overshoot(1.1))
        .attr("transform", (d) => `translate(${x(d.rho)},${y(d.d)})`);
      // labels follow circles
      labels
        .transition("phase-step-l")
        .delay((d, i) => i * 60 + 300)
        .duration(400)
        .attr("opacity", 1)
        .attr("y", (d) => {
          const off = { "Qwen-QwQ-32B": -10, "GLM-4.5-Air-FP8": -10, "DeepSeek-R1": -10,
            "gpt-oss-120b": 14, "gpt-oss-20b": -18, "Qwen3-235B-Thinking": -10,
            "DeepSeek-V3": 14 };
          return (off[d.agent] != null ? off[d.agent] : -8);
        });
    } else {
      // Full reveal: human ref + quadrant annotation
      showSel(yAxisG, 1);
      showSel(yGridG, 1);
      showSel(yLabel, 1);
      circles.attr("r", (d) => (d.kind === "non-thinking" ? 8 : 7));
      dot
        .transition("phase-step-dot")
        .duration(dur)
        .attr("transform", (d) => `translate(${x(d.rho)},${y(d.d)})`);
      labels.attr("opacity", 1);
      showSel(humanRef, 0.7);
      showSel(humanRefText, 1);
      showSel(quadrantText, 0.7);
    }
  },
};

/* ------------------------------------------------------------------
   PER-AGENT GAP — H-ARC horizontal bars (Fig 2a equivalent)
   ------------------------------------------------------------------ */
const PerAgentGap = {
  init() {
    const container = $("#gap-chart");
    if (!container) return;
    const rect = container.getBoundingClientRect();

    // Pull all H-ARC agents (LRMs + human), sort ascending by d so human is at top
    const rows = (D.crossParadigm || [])
      .filter((r) => r.paradigm === "H-ARC")
      .sort((a, b) => a.d - b.d);

    const margin = { top: 20, right: 90, bottom: 50, left: 90 };
    const W = Math.max(560, rect.width - margin.left - margin.right);
    const rowH = 36;
    const H = rows.length * rowH + 20;

    d3.select(container).selectAll("*").remove();
    const svg = d3
      .select(container)
      .append("svg")
      .attr("viewBox", `0 0 ${W + margin.left + margin.right} ${H + margin.top + margin.bottom}`)
      .attr("preserveAspectRatio", "xMidYMid meet");
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear().domain([-0.6, 3.5]).range([0, W]);
    const y = d3.scaleBand().domain(rows.map((r) => r.agent)).range([0, H]).padding(0.28);

    // axes
    g.append("g")
      .attr("class", "axis")
      .attr("transform", `translate(0,${H})`)
      .call(d3.axisBottom(x).ticks(6));
    g.append("g")
      .attr("class", "axis")
      .call(d3.axisLeft(y).tickFormat((id) => {
        const r = rows.find((x) => x.agent === id);
        return r ? r.short + (r.underpowered ? "*" : "") : id;
      }));

    // zero reference
    g.append("line")
      .attr("x1", x(0))
      .attr("x2", x(0))
      .attr("y1", 0)
      .attr("y2", H)
      .attr("stroke", COL.lineStrong)
      .attr("stroke-width", 0.8);

    // bars — start at zero width, animate to full
    const bars = g
      .selectAll("rect.bar")
      .data(rows)
      .join("rect")
      .attr("class", "bar")
      .attr("x", x(0))
      .attr("y", (d) => y(d.agent))
      .attr("width", 0)
      .attr("height", y.bandwidth())
      .attr("fill", (d) =>
        d.agent_type === "human" ? COL.human : d.underpowered ? COL.lrmDim : COL.lrm
      )
      .attr("stroke", "black")
      .attr("stroke-width", 0.5)
      .style("cursor", "pointer");

    // value labels
    const dlabels = g
      .selectAll("text.dlabel")
      .data(rows)
      .join("text")
      .attr("class", "dlabel")
      .attr("x", x(0))
      .attr("y", (d) => y(d.agent) + y.bandwidth() / 2 + 4)
      .attr("text-anchor", (d) => (d.d >= 0 ? "start" : "end"))
      .attr("font-family", "var(--font-mono)")
      .attr("font-size", 11.5)
      .attr("fill", COL.text)
      .attr("opacity", 0)
      .text((d) => `d = ${fmtSigned(d.d)}`);

    // tooltip on bars
    bars
      .on("pointerenter pointermove", (evt, d) => {
        const cls = d.agent_type === "human" ? "matched human" : d.underpowered ? "thinking LRM (underpowered)" : "thinking LRM";
        const html =
          `<strong>${d.short}</strong>` +
          `<div class="tip-row"><span class="tip-label">Cohen's d</span><span>${fmtSigned(d.d)}</span></div>` +
          `<div class="tip-row"><span class="tip-label">n right · wrong</span><span>${d.n_right} · ${d.n_wrong}</span></div>` +
          `<div class="tip-row"><span class="tip-label">class</span><span>${cls}</span></div>`;
        Tip.show(html, evt);
      })
      .on("pointerleave", () => Tip.hide());

    // x-axis label
    g.append("text")
      .attr("x", W / 2)
      .attr("y", H + 38)
      .attr("text-anchor", "middle")
      .attr("font-family", "var(--font-body)")
      .attr("font-size", 12.5)
      .attr("fill", COL.mute)
      .text("Within-agent Cohen's d  (log deliberation: wrong − right)");

    function animateIn() {
      bars
        .attr("x", x(0))
        .attr("width", 0);
      dlabels.attr("opacity", 0).attr("x", x(0));
      bars
        .transition()
        .delay((d, i) => 80 + i * 90)
        .duration(620)
        .ease(d3.easeCubicOut)
        .attr("x", (d) => (d.d >= 0 ? x(0) : x(d.d)))
        .attr("width", (d) => Math.abs(x(d.d) - x(0)));
      dlabels
        .transition()
        .delay((d, i) => 80 + i * 90 + 420)
        .duration(220)
        .attr("opacity", 1)
        .attr("x", (d) => (d.d >= 0 ? x(d.d) + 8 : x(d.d) - 8));
    }
    animateIn();
    PerAgentGap._animateIn = animateIn;
  },
};

/* ------------------------------------------------------------------
   PARADIGM CHART — switchable H-ARC / INTUIT / Cortes / ALL
   ------------------------------------------------------------------ */
const ParadigmChart = {
  current: "H-ARC",
  _gen: 0,
  init() {
    if (!$("#paradigm-chart")) return;
    this.render();
    $$("#paradigm-toggle .btn-mini").forEach((btn) => {
      btn.addEventListener("click", () => {
        $$("#paradigm-toggle .btn-mini").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        ParadigmChart.current = btn.dataset.paradigm;
        ParadigmChart.render();
      });
    });
  },
  // Foot text for each paradigm
  _notes: {
    "H-ARC":  "Visual abstraction · 5 thinking LRMs in within-agent summary · primary paradigm. 4 well-powered models in d = 1.47–3.13.",
    "INTUIT": "Intuitive physics · clean cross-paradigm replication · all 6 thinking LRMs at d > 0, matched humans at d = +0.07.",
    "Cortes": "Binary relational reasoning · boundary case · agent-type contrast preserved, but the LRM-only within-item slope reverses sign once item identity is fixed.",
    "ALL":    "All three paradigms side-by-side. Agent-type contrast is shared. H-ARC magnitudes are larger; Cortes runs at small n; INTUIT replicates cleanly.",
  },
  _xDomain: {
    "H-ARC":  [-0.6, 3.5],
    "INTUIT": [-0.4, 1.8],
    "Cortes": [-0.55, 2.4],
    "ALL":    [-0.6, 3.5],
  },
  render() {
    const paradigm = this.current;
    const container = $("#paradigm-chart");
    const foot = $("#paradigm-foot");
    if (!container) return;

    if (foot) foot.textContent = this._notes[paradigm] || "";

    if (paradigm === "ALL") {
      this._renderAll(container);
    } else {
      this._renderSingle(container, paradigm);
    }
  },
  _renderSingle(container, paradigm) {
    const rect = container.getBoundingClientRect();
    const rows = (D.crossParadigm || [])
      .filter((r) => r.paradigm === paradigm)
      .sort((a, b) => a.d - b.d);

    const margin = { top: 16, right: 90, bottom: 50, left: 90 };
    const W = Math.max(560, rect.width - margin.left - margin.right);
    const rowH = 32;
    const H = rows.length * rowH + 16;

    d3.select(container).selectAll("*").remove();
    const svg = d3
      .select(container)
      .append("svg")
      .attr("viewBox", `0 0 ${W + margin.left + margin.right} ${H + margin.top + margin.bottom}`)
      .attr("preserveAspectRatio", "xMidYMid meet");
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear().domain(this._xDomain[paradigm]).range([0, W]);
    const y = d3.scaleBand().domain(rows.map((r) => r.agent)).range([0, H]).padding(0.32);

    g.append("g")
      .attr("class", "axis")
      .attr("transform", `translate(0,${H})`)
      .call(d3.axisBottom(x).ticks(6));
    g.append("g")
      .attr("class", "axis")
      .call(d3.axisLeft(y).tickFormat((id) => {
        const r = rows.find((x) => x.agent === id);
        return r ? r.short + (r.underpowered ? "*" : "") : id;
      }));

    g.append("line")
      .attr("x1", x(0)).attr("x2", x(0))
      .attr("y1", 0).attr("y2", H)
      .attr("stroke", COL.lineStrong).attr("stroke-width", 0.8);

    const bars = g.selectAll("rect.bar")
      .data(rows)
      .join("rect")
      .attr("class", "bar")
      .attr("x", x(0))
      .attr("y", (d) => y(d.agent))
      .attr("width", 0)
      .attr("height", y.bandwidth())
      .attr("fill", (d) =>
        d.agent_type === "human" ? COL.human : d.underpowered ? COL.lrmDim : COL.lrm
      )
      .attr("stroke", "black")
      .attr("stroke-width", 0.4)
      .style("cursor", "pointer");

    const dlabels = g.selectAll("text.dlabel")
      .data(rows)
      .join("text")
      .attr("class", "dlabel")
      .attr("x", x(0))
      .attr("y", (d) => y(d.agent) + y.bandwidth() / 2 + 4)
      .attr("text-anchor", (d) => (d.d >= 0 ? "start" : "end"))
      .attr("font-family", "var(--font-mono)")
      .attr("font-size", 11)
      .attr("fill", COL.text)
      .attr("opacity", 0)
      .text((d) => `d = ${fmtSigned(d.d)}`);

    // tooltip
    bars
      .on("pointerenter pointermove", (evt, d) => {
        const cls = d.agent_type === "human" ? "matched human" : d.underpowered ? "thinking LRM (underpowered)" : "thinking LRM";
        const html =
          `<strong>${d.short}</strong>` +
          `<div class="tip-row"><span class="tip-label">paradigm</span><span>${d.paradigm}</span></div>` +
          `<div class="tip-row"><span class="tip-label">Cohen's d</span><span>${fmtSigned(d.d)}</span></div>` +
          `<div class="tip-row"><span class="tip-label">n right · wrong</span><span>${d.n_right} · ${d.n_wrong}</span></div>` +
          `<div class="tip-row"><span class="tip-label">class</span><span>${cls}</span></div>`;
        Tip.show(html, evt);
      })
      .on("pointerleave", () => Tip.hide());

    g.append("text")
      .attr("x", W / 2).attr("y", H + 38)
      .attr("text-anchor", "middle")
      .attr("font-family", "var(--font-body)")
      .attr("font-size", 12.5)
      .attr("fill", COL.mute)
      .text("Cohen's d  (wrong − right log t)");

    const gen = ++ParadigmChart._gen;
    function animateIn() {
      bars.attr("x", x(0)).attr("width", 0);
      dlabels.attr("opacity", 0).attr("x", x(0));
      bars
        .transition("paradigm-bars")
        .delay((d, i) => 80 + i * 70)
        .duration(560)
        .ease(d3.easeCubicOut)
        .attr("x", (d) => (d.d >= 0 ? x(0) : x(d.d)))
        .attr("width", (d) => Math.abs(x(d.d) - x(0)));
      dlabels
        .transition("paradigm-labels")
        .delay((d, i) => 80 + i * 70 + 380)
        .duration(200)
        .attr("opacity", 1)
        .attr("x", (d) => (d.d >= 0 ? x(d.d) + 8 : x(d.d) - 8));
    }
    animateIn();
    ParadigmChart._animateIn = () => {
      if (ParadigmChart.current === "ALL") {
        ParadigmChart.render();
      } else {
        animateIn();
      }
    };
  },
  _renderAll(container) {
    d3.select(container).selectAll("*").remove();
    const wrap = d3.select(container)
      .append("div")
      .style("display", "grid")
      .style("grid-template-columns", "repeat(3, 1fr)")
      .style("gap", "16px");

    const paradigms = ["H-ARC", "INTUIT", "Cortes"];
    const allRows = D.crossParadigm || [];
    const xDomain = [
      d3.min(allRows, (r) => Math.min(0, r.d)) - 0.05,
      d3.max(allRows, (r) => r.d) + 0.2,
    ];

    const subAnimators = [];

    paradigms.forEach((paradigm) => {
      const col = wrap.append("div");
      col.append("div")
        .style("font-family", "var(--font-mono)")
        .style("font-size", "11px")
        .style("letter-spacing", "0.18em")
        .style("text-transform", "uppercase")
        .style("color", "var(--accent)")
        .style("text-align", "center")
        .style("margin-bottom", "6px")
        .text(paradigm);

      const rows = allRows.filter((r) => r.paradigm === paradigm).sort((a, b) => a.d - b.d);
      const margin = { top: 8, right: 30, bottom: 36, left: 90 };
      const W = 240;
      const rowH = 26;
      const H = rows.length * rowH + 8;

      const svg = col.append("svg")
        .attr("viewBox", `0 0 ${W + margin.left + margin.right} ${H + margin.top + margin.bottom}`)
        .attr("preserveAspectRatio", "xMidYMid meet");
      const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

      const x = d3.scaleLinear().domain(xDomain).range([0, W]);
      const y = d3.scaleBand().domain(rows.map((r) => r.agent)).range([0, H]).padding(0.32);

      g.append("g")
        .attr("class", "axis")
        .attr("transform", `translate(0,${H})`)
        .call(d3.axisBottom(x).ticks(4));
      g.append("g")
        .attr("class", "axis")
        .call(d3.axisLeft(y).tickFormat((id) => {
          const r = rows.find((x) => x.agent === id);
          return r ? r.short + (r.underpowered ? "*" : "") : id;
        }));

      g.append("line")
        .attr("x1", x(0)).attr("x2", x(0))
        .attr("y1", 0).attr("y2", H)
        .attr("stroke", COL.lineStrong).attr("stroke-width", 0.8);

      const bars = g.selectAll("rect.bar")
        .data(rows)
        .join("rect")
        .attr("class", "bar")
        .attr("x", x(0))
        .attr("y", (d) => y(d.agent))
        .attr("width", 0)
        .attr("height", y.bandwidth())
        .attr("fill", (d) =>
          d.agent_type === "human" ? COL.human : d.underpowered ? COL.lrmDim : COL.lrm
        )
        .attr("stroke", "black")
        .attr("stroke-width", 0.4)
        .style("cursor", "pointer");

      bars
        .on("pointerenter pointermove", (evt, d) => {
          const cls = d.agent_type === "human" ? "matched human" : d.underpowered ? "thinking LRM (underpowered)" : "thinking LRM";
          const html =
            `<strong>${d.short}</strong>` +
            `<div class="tip-row"><span class="tip-label">paradigm</span><span>${d.paradigm}</span></div>` +
            `<div class="tip-row"><span class="tip-label">Cohen's d</span><span>${fmtSigned(d.d)}</span></div>` +
            `<div class="tip-row"><span class="tip-label">n right · wrong</span><span>${d.n_right} · ${d.n_wrong}</span></div>` +
            `<div class="tip-row"><span class="tip-label">class</span><span>${cls}</span></div>`;
          Tip.show(html, evt);
        })
        .on("pointerleave", () => Tip.hide());

      g.append("text")
        .attr("x", W / 2).attr("y", H + 28)
        .attr("text-anchor", "middle")
        .attr("font-family", "var(--font-body)")
        .attr("font-size", 11)
        .attr("fill", COL.mute)
        .text("d (wrong − right)");

      subAnimators.push(() => {
        bars.attr("x", x(0)).attr("width", 0);
        bars
          .transition("paradigm-all")
          .delay((d, i) => 40 + i * 60)
          .duration(500)
          .ease(d3.easeCubicOut)
          .attr("x", (d) => (d.d >= 0 ? x(0) : x(d.d)))
          .attr("width", (d) => Math.abs(x(d.d) - x(0)));
      });
    });

    subAnimators.forEach((fn) => fn());
    ParadigmChart._animateIn = () => subAnimators.forEach((fn) => fn());
  },
};

/* ------------------------------------------------------------------
   MECHANISM 7a — human engagement decomposition (Fig 4a)
   ------------------------------------------------------------------ */
const MechHuman = {
  init() {
    const container = $("#mech-a-chart");
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const margin = { top: 16, right: 30, bottom: 56, left: 175 };
    const W = Math.max(320, rect.width - margin.left - margin.right);
    const H = 180;

    const m = D.mediation || {};
    const rows = [
      { label: "Raw slope",                  b: m.no_actions?.beta,   ci: [m.no_actions?.ci_lo, m.no_actions?.ci_hi],   accent: "dark" },
      { label: "Controlling for actions",    b: m.with_actions?.beta, ci: [m.with_actions?.ci_lo, m.with_actions?.ci_hi], accent: "blue" },
    ].filter((r) => r.b != null);

    d3.select(container).selectAll("*").remove();
    const svg = d3
      .select(container)
      .append("svg")
      .attr("viewBox", `0 0 ${W + margin.left + margin.right} ${H + margin.top + margin.bottom}`)
      .attr("preserveAspectRatio", "xMidYMid meet");
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear().domain([0, 0.4]).range([0, W]);
    const y = d3.scaleBand().domain(rows.map((r) => r.label)).range([0, H]).padding(0.35);

    g.append("g")
      .attr("class", "axis")
      .attr("transform", `translate(0,${H})`)
      .call(d3.axisBottom(x).ticks(5));
    g.append("g").attr("class", "axis").call(d3.axisLeft(y));

    g.append("line")
      .attr("x1", x(0)).attr("x2", x(0))
      .attr("y1", 0).attr("y2", H)
      .attr("stroke", COL.lineStrong).attr("stroke-width", 0.8);

    const bars = g.selectAll("rect.bar")
      .data(rows)
      .join("rect")
      .attr("class", "bar")
      .attr("x", x(0))
      .attr("y", (d) => y(d.label))
      .attr("width", 0)
      .attr("height", y.bandwidth())
      .attr("fill", (d) => (d.accent === "blue" ? COL.blue : COL.human))
      .attr("opacity", 0.92)
      .style("cursor", "pointer");

    // CI whiskers — drawn after bars; will fade in
    const whisk = g.append("g").attr("class", "whiskers").attr("opacity", 0);
    rows.forEach((r) => {
      const yc = y(r.label) + y.bandwidth() / 2;
      whisk.append("line")
        .attr("x1", x(r.ci[0])).attr("x2", x(r.ci[1]))
        .attr("y1", yc).attr("y2", yc)
        .attr("stroke", "black").attr("stroke-width", 1.1);
      whisk.append("line")
        .attr("x1", x(r.ci[0])).attr("x2", x(r.ci[0]))
        .attr("y1", yc - 4).attr("y2", yc + 4)
        .attr("stroke", "black").attr("stroke-width", 1.1);
      whisk.append("line")
        .attr("x1", x(r.ci[1])).attr("x2", x(r.ci[1]))
        .attr("y1", yc - 4).attr("y2", yc + 4)
        .attr("stroke", "black").attr("stroke-width", 1.1);
    });

    // beta labels
    const blabs = g.selectAll("text.blab")
      .data(rows)
      .join("text")
      .attr("class", "blab")
      .attr("x", x(0))
      .attr("y", (d) => y(d.label) + y.bandwidth() / 2 + 4)
      .attr("font-family", "var(--font-mono)")
      .attr("font-size", 11.5)
      .attr("font-weight", 600)
      .attr("fill", COL.text)
      .attr("opacity", 0)
      .text((d) => `β = ${fmtNum(d.b, 3)}`);

    // tooltip
    bars
      .on("pointerenter pointermove", (evt, d) => {
        const html =
          `<strong>${d.label}</strong>` +
          `<div class="tip-row"><span class="tip-label">β</span><span>${fmtNum(d.b, 3)}</span></div>` +
          `<div class="tip-row"><span class="tip-label">95% CI</span><span>[${fmtNum(d.ci[0], 3)}, ${fmtNum(d.ci[1], 3)}]</span></div>`;
        Tip.show(html, evt);
      })
      .on("pointerleave", () => Tip.hide());

    g.append("text")
      .attr("x", W / 2).attr("y", H + 40)
      .attr("text-anchor", "middle")
      .attr("font-family", "var(--font-body)")
      .attr("font-size", 12)
      .attr("fill", COL.mute)
      .text("Within-item correctness slope on human log RT (H-ARC)");

    function animateIn() {
      bars.attr("width", 0);
      blabs.attr("opacity", 0).attr("x", x(0));
      whisk.attr("opacity", 0);
      bars
        .transition("mech-a-bars")
        .delay((d, i) => 60 + i * 140)
        .duration(620)
        .ease(d3.easeCubicOut)
        .attr("width", (d) => x(d.b) - x(0));
      whisk
        .transition("mech-a-whisk")
        .delay(420)
        .duration(360)
        .attr("opacity", 1);
      blabs
        .transition("mech-a-lab")
        .delay((d, i) => 60 + i * 140 + 440)
        .duration(220)
        .attr("opacity", 1)
        .attr("x", (d) => x(d.ci[1]) + 8);
    }
    animateIn();
    MechHuman._animateIn = animateIn;

    const pct = D.headline?.mediation_pct || 48;
    const el = $("#med-pct");
    if (el) el.textContent = pct + "%";
  },
};

/* ------------------------------------------------------------------
   MECHANISM 7b — LRM trace content (Fig 4b)
   ------------------------------------------------------------------ */
const MechLRM = {
  init() {
    const container = $("#mech-b-chart");
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const margin = { top: 16, right: 80, bottom: 56, left: 165 };
    const W = Math.max(320, rect.width - margin.left - margin.right);

    // Show 3 features: H-ARC hedging, Cortes repetition, Cortes TTR
    const want = [
      { paradigm: "H-ARC",  feature: "hedge_density_per1k_chars", label: "H-ARC: hedging" },
      { paradigm: "Cortes", feature: "repetition_rate",           label: "Cortes: 5-gram rep." },
      { paradigm: "Cortes", feature: "type_token_ratio",          label: "Cortes: TTR" },
    ];
    const tc = D.traceContent || [];
    const rows = want
      .map((w) => {
        const r = tc.find((x) => x.paradigm === w.paradigm && x.feature === w.feature);
        return r ? { label: w.label, b: r.beta, ci: [r.ci_lo, r.ci_hi], p: r.p } : null;
      })
      .filter(Boolean);

    const H = rows.length * 40 + 16;

    d3.select(container).selectAll("*").remove();
    const svg = d3
      .select(container)
      .append("svg")
      .attr("viewBox", `0 0 ${W + margin.left + margin.right} ${H + margin.top + margin.bottom}`)
      .attr("preserveAspectRatio", "xMidYMid meet");
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const xmin = Math.min(0, d3.min(rows, (r) => r.ci[0])) - 0.05;
    const xmax = Math.max(0, d3.max(rows, (r) => r.ci[1])) + 0.05;
    const x = d3.scaleLinear().domain([xmin, xmax]).range([0, W]);
    const y = d3.scaleBand().domain(rows.map((r) => r.label)).range([0, H]).padding(0.35);

    g.append("g")
      .attr("class", "axis")
      .attr("transform", `translate(0,${H})`)
      .call(d3.axisBottom(x).ticks(5));
    g.append("g").attr("class", "axis").call(d3.axisLeft(y));

    g.append("line")
      .attr("x1", x(0)).attr("x2", x(0))
      .attr("y1", 0).attr("y2", H)
      .attr("stroke", COL.lineStrong).attr("stroke-width", 0.8);

    // CI whiskers (line + caps) — start collapsed at center for animation
    const whiskerGroups = rows.map((r) => {
      const yc = y(r.label) + y.bandwidth() / 2;
      const wg = g.append("g").attr("class", "whisker-grp").attr("opacity", 0);
      const line = wg.append("line")
        .attr("x1", x(r.b)).attr("x2", x(r.b))
        .attr("y1", yc).attr("y2", yc)
        .attr("stroke", COL.lrm).attr("stroke-width", 1.5);
      const capL = wg.append("line")
        .attr("x1", x(r.b)).attr("x2", x(r.b))
        .attr("y1", yc - 4).attr("y2", yc + 4)
        .attr("stroke", COL.lrm).attr("stroke-width", 1.5);
      const capR = wg.append("line")
        .attr("x1", x(r.b)).attr("x2", x(r.b))
        .attr("y1", yc - 4).attr("y2", yc + 4)
        .attr("stroke", COL.lrm).attr("stroke-width", 1.5);
      const pt = wg.append("circle")
        .attr("cx", x(r.b)).attr("cy", yc).attr("r", 0)
        .attr("fill", COL.lrm).attr("stroke", "black").attr("stroke-width", 0.6)
        .style("cursor", "pointer");
      pt
        .on("pointerenter pointermove", (evt) => {
          const html =
            `<strong>${r.label}</strong>` +
            `<div class="tip-row"><span class="tip-label">β</span><span>${fmtNum(r.b, 3)}</span></div>` +
            `<div class="tip-row"><span class="tip-label">95% CI</span><span>[${fmtNum(r.ci[0], 3)}, ${fmtNum(r.ci[1], 3)}]</span></div>` +
            `<div class="tip-row"><span class="tip-label">p</span><span>${r.p < 0.001 ? "< .001" : r.p.toFixed(3)}</span></div>`;
          Tip.show(html, evt);
        })
        .on("pointerleave", () => Tip.hide());
      return { line, capL, capR, pt, r, yc };
    });

    // p-value labels
    const plabs = g.selectAll("text.plab")
      .data(rows)
      .join("text")
      .attr("class", "plab")
      .attr("x", (d) => x(d.b))
      .attr("y", (d) => y(d.label) + y.bandwidth() / 2 + 4)
      .attr("font-family", "var(--font-mono)")
      .attr("font-size", 11)
      .attr("fill", COL.mute)
      .attr("opacity", 0)
      .text((d) => (d.p < 0.001 ? `p < .001` : `p = ${d.p.toFixed(3)}`));

    g.append("text")
      .attr("x", W / 2).attr("y", H + 40)
      .attr("text-anchor", "middle")
      .attr("font-family", "var(--font-body)")
      .attr("font-size", 12)
      .attr("fill", COL.mute)
      .text("Length-controlled coefficient on correctness β");

    function animateIn() {
      whiskerGroups.forEach((wg, i) => {
        const { line, capL, capR, pt, r } = wg;
        // reset
        line.attr("x1", x(r.b)).attr("x2", x(r.b));
        capL.attr("x1", x(r.b)).attr("x2", x(r.b));
        capR.attr("x1", x(r.b)).attr("x2", x(r.b));
        pt.attr("r", 0);
        wg.line.node().parentNode && d3.select(wg.line.node().parentNode).attr("opacity", 1);

        const delay = 80 + i * 130;
        line.transition("mech-b-line")
          .delay(delay).duration(500).ease(d3.easeCubicOut)
          .attr("x1", x(r.ci[0])).attr("x2", x(r.ci[1]));
        capL.transition("mech-b-cap")
          .delay(delay).duration(500).ease(d3.easeCubicOut)
          .attr("x1", x(r.ci[0])).attr("x2", x(r.ci[0]));
        capR.transition("mech-b-cap")
          .delay(delay).duration(500).ease(d3.easeCubicOut)
          .attr("x1", x(r.ci[1])).attr("x2", x(r.ci[1]));
        pt.transition("mech-b-pt")
          .delay(delay + 200).duration(360).ease(d3.easeBackOut.overshoot(1.4))
          .attr("r", 5);
      });
      plabs.attr("opacity", 0).attr("x", (d) => x(d.b));
      plabs
        .transition("mech-b-plab")
        .delay((d, i) => 80 + i * 130 + 500)
        .duration(220)
        .attr("opacity", 1)
        .attr("x", (d) => x(d.ci[1]) + 8);
    }
    animateIn();
    MechLRM._animateIn = animateIn;
  },
};

/* ------------------------------------------------------------------
   CORTES CIs — bootstrap intervals (Fig S3)
   ------------------------------------------------------------------ */
const CortesCI = {
  init() {
    const container = $("#ci-chart");
    if (!container) return;
    const rect = container.getBoundingClientRect();

    const rows = (D.cortesCI || [])
      .slice()
      .sort((a, b) => a.d - b.d);

    const margin = { top: 16, right: 120, bottom: 50, left: 90 };
    const W = Math.max(560, rect.width - margin.left - margin.right);
    const rowH = 30;
    const H = rows.length * rowH + 16;

    d3.select(container).selectAll("*").remove();
    const svg = d3
      .select(container)
      .append("svg")
      .attr("viewBox", `0 0 ${W + margin.left + margin.right} ${H + margin.top + margin.bottom}`)
      .attr("preserveAspectRatio", "xMidYMid meet");
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const xmin = Math.min(-0.05, d3.min(rows, (r) => r.ci_low));
    const xmax = d3.max(rows, (r) => r.ci_high) + 0.4;
    const x = d3.scaleLinear().domain([xmin, xmax]).range([0, W]);
    const y = d3.scaleBand().domain(rows.map((r) => r.agent)).range([0, H]).padding(0.32);

    g.append("g")
      .attr("class", "axis")
      .attr("transform", `translate(0,${H})`)
      .call(d3.axisBottom(x).ticks(6));
    g.append("g")
      .attr("class", "axis")
      .call(d3.axisLeft(y).tickFormat((id) => {
        const r = rows.find((x) => x.agent === id);
        return r ? r.short : id;
      }));

    g.append("line")
      .attr("x1", x(0)).attr("x2", x(0))
      .attr("y1", 0).attr("y2", H)
      .attr("stroke", COL.lineStrong).attr("stroke-width", 0.8);

    const groups = rows.map((r) => {
      const yc = y(r.agent) + y.bandwidth() / 2;
      const c = r.agent_type === "LRM" ? COL.lrm : COL.baseline;
      const gg = g.append("g").attr("class", "ci-grp");
      const line = gg.append("line")
        .attr("x1", x(r.d)).attr("x2", x(r.d))
        .attr("y1", yc).attr("y2", yc)
        .attr("stroke", COL.mute).attr("stroke-width", 1.4);
      const capL = gg.append("line")
        .attr("x1", x(r.d)).attr("x2", x(r.d))
        .attr("y1", yc - 4).attr("y2", yc + 4)
        .attr("stroke", COL.mute).attr("stroke-width", 1.4);
      const capR = gg.append("line")
        .attr("x1", x(r.d)).attr("x2", x(r.d))
        .attr("y1", yc - 4).attr("y2", yc + 4)
        .attr("stroke", COL.mute).attr("stroke-width", 1.4);
      const pt = gg.append("circle")
        .attr("cx", x(r.d)).attr("cy", yc).attr("r", 0)
        .attr("fill", c).attr("stroke", "black").attr("stroke-width", 0.6)
        .style("cursor", "pointer");
      const nlab = gg.append("text")
        .attr("x", x(r.d))
        .attr("y", yc + 4)
        .attr("font-family", "var(--font-mono)")
        .attr("font-size", 10.5)
        .attr("fill", COL.mute)
        .attr("opacity", 0)
        .text(`n_wrong = ${r.n_wrong}`);
      // tooltip on point AND on line
      const showTip = (evt) => {
        const excludesZero = r.ci_low > 0;
        const html =
          `<strong>${r.short}</strong>` +
          `<div class="tip-row"><span class="tip-label">Cohen's d</span><span>${fmtSigned(r.d)}</span></div>` +
          `<div class="tip-row"><span class="tip-label">95% CI</span><span>[${fmtSigned(r.ci_low)}, ${fmtSigned(r.ci_high)}]</span></div>` +
          `<div class="tip-row"><span class="tip-label">n_wrong</span><span>${r.n_wrong}</span></div>` +
          `<div class="tip-row"><span class="tip-label">excludes 0</span><span>${excludesZero ? "yes" : "no"}</span></div>`;
        Tip.show(html, evt);
      };
      pt.on("pointerenter pointermove", showTip).on("pointerleave", () => Tip.hide());
      // expand hitbox by listening on the group too
      gg.style("cursor", "pointer")
        .on("pointerenter pointermove", showTip)
        .on("pointerleave", () => Tip.hide());
      return { line, capL, capR, pt, nlab, r, yc };
    });

    g.append("text")
      .attr("x", W / 2).attr("y", H + 38)
      .attr("text-anchor", "middle")
      .attr("font-family", "var(--font-body)")
      .attr("font-size", 12.5)
      .attr("fill", COL.mute)
      .text("Cortes Cohen's d with 95% bootstrap CI");

    function animateIn() {
      groups.forEach((gp, i) => {
        const { line, capL, capR, pt, nlab, r } = gp;
        line.attr("x1", x(r.d)).attr("x2", x(r.d));
        capL.attr("x1", x(r.d)).attr("x2", x(r.d));
        capR.attr("x1", x(r.d)).attr("x2", x(r.d));
        pt.attr("r", 0);
        nlab.attr("opacity", 0).attr("x", x(r.d));
        const delay = 60 + i * 100;
        line.transition("ci-line").delay(delay).duration(500).ease(d3.easeCubicOut)
          .attr("x1", x(r.ci_low)).attr("x2", x(r.ci_high));
        capL.transition("ci-cap").delay(delay).duration(500).ease(d3.easeCubicOut)
          .attr("x1", x(r.ci_low)).attr("x2", x(r.ci_low));
        capR.transition("ci-cap").delay(delay).duration(500).ease(d3.easeCubicOut)
          .attr("x1", x(r.ci_high)).attr("x2", x(r.ci_high));
        pt.transition("ci-pt").delay(delay + 200).duration(340).ease(d3.easeBackOut.overshoot(1.4))
          .attr("r", 5);
        nlab.transition("ci-lab").delay(delay + 500).duration(220)
          .attr("opacity", 1).attr("x", x(r.ci_high) + 8);
      });
    }
    animateIn();
    CortesCI._animateIn = animateIn;
  },
};

/* ------------------------------------------------------------------
   TRACE EXPLORER — side-by-side LRM right vs wrong trace
   ------------------------------------------------------------------ */
const TraceExplorer = {
  init() {
    const grid = $("#trace-grid");
    if (!grid) return;
    const ex = D.traceExamples;
    if (!ex) return;

    // Hedge / repetition patterns (subset of analysis/19_trace_content.py)
    const HEDGE = [
      "wait", "hmm", "hmmm", "huh", "actually", "perhaps",
      "let me reconsider", "let me recheck", "let me re-check",
      "let me reexamine", "let me re-examine",
      "but wait", "no wait", "on second thought",
      "hold on", "check again", "look again",
      "not sure", "unsure", "maybe", "might be", "could be",
      "i think", "i guess",
    ];
    // Sort longer first so "let me reconsider" matches before "wait"
    HEDGE.sort((a, b) => b.length - a.length);
    const hedgeRx = new RegExp("\\b(" + HEDGE.map((h) => h.replace(/[-]/g, "\\-?")).join("|") + ")\\b", "gi");

    // Mark a repeated short phrase ("Wait maybe the X and Y digits…")
    // simple: highlight every line that starts with "Wait maybe"
    function annotate(text) {
      // Escape HTML
      let html = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      // Highlight hedges
      html = html.replace(hedgeRx, (m) =>
        `<mark class="hedge" title="hedge token (paper feature: hedge_density_per1k_chars)">${m}</mark>`
      );
      // Highlight repeated probe pattern: "Wait maybe the Nth digit..." opener
      html = html.replace(/(Wait\s+maybe\s+(?:the\s+)?[^.\n]{0,80}?digit[^.\n]{0,40}?)(?=[.\n])/gi,
        (m) => `<mark class="repeat" title="repeated 5-gram-style probe (paper feature: repetition_rate)">${m}</mark>`
      );
      return html;
    }

    function statBlock(t) {
      return `
        <div><span>tokens</span><span class="v">${t.tokens.toLocaleString()}</span></div>
        <div><span>hedges</span><span class="v">${t.hedges}</span></div>
        <div><span>repetition rate</span><span class="v">${t.repetition_rate.toFixed(2)}</span></div>
      `;
    }

    function cardHtml(side, t) {
      return `
        <div class="trace-card ${side}" data-side="${side}">
          <div class="trace-head">
            <span>${ex.model} · item ${t.item} · ${ex.paradigm}</span>
            <span class="verdict ${side}">${t.verdict}</span>
          </div>
          <div class="trace-stats">${statBlock(t)}</div>
          <div class="trace-text">${annotate(t.text)}</div>
        </div>
      `;
    }

    grid.innerHTML = cardHtml("right", ex.right) + cardHtml("wrong", ex.wrong);
  },
};

/* ------------------------------------------------------------------
   TRUNCATION SIMULATOR — section 09 interactive widget
   Two predicted accuracy curves under competing policies.
   ------------------------------------------------------------------ */
const Truncation = {
  // Toy curves. Baseline accuracy at f=1 (no truncation) is ~0.65 for both.
  // length-on-uncertainty: extra tokens are rumination, so accuracy is roughly
  //   flat above f ≈ 0.5 (the "useful" part of reasoning happened early).
  // useful-search: each token bought information, so accuracy degrades
  //   roughly linearly with f.
  curves: {
    uncer: (f) => 0.65 - 0.18 * Math.pow(Math.max(0, 0.4 - f) / 0.4, 1.8),
    useful: (f) => 0.18 + 0.47 * f,
  },
  init() {
    const container = $("#trunc-chart");
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const margin = { top: 18, right: 36, bottom: 50, left: 56 };
    const W = Math.max(560, rect.width - margin.left - margin.right);
    const H = 280;

    d3.select(container).selectAll("*").remove();
    const svg = d3.select(container)
      .append("svg")
      .attr("viewBox", `0 0 ${W + margin.left + margin.right} ${H + margin.top + margin.bottom}`)
      .attr("preserveAspectRatio", "xMidYMid meet");
    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear().domain([0, 1]).range([0, W]);
    const y = d3.scaleLinear().domain([0, 0.75]).range([H, 0]);

    // axes
    g.append("g").attr("class", "axis").attr("transform", `translate(0,${H})`)
      .call(d3.axisBottom(x).ticks(6).tickFormat(d3.format(".1f")));
    g.append("g").attr("class", "axis").call(d3.axisLeft(y).ticks(5).tickFormat(d3.format(".0%")));

    // grid
    g.append("g").attr("class", "grid").attr("transform", `translate(0,${H})`)
      .call(d3.axisBottom(x).ticks(6).tickSize(-H).tickFormat(""));
    g.append("g").attr("class", "grid")
      .call(d3.axisLeft(y).ticks(5).tickSize(-W).tickFormat(""));

    // Divergence band (f = 0.5 to 0.8)
    g.append("rect")
      .attr("x", x(0.5)).attr("y", 0)
      .attr("width", x(0.8) - x(0.5)).attr("height", H)
      .attr("fill", "var(--accent)")
      .attr("opacity", 0.06);
    g.append("text")
      .attr("x", (x(0.5) + x(0.8)) / 2)
      .attr("y", 14)
      .attr("text-anchor", "middle")
      .attr("font-family", "var(--font-mono)")
      .attr("font-size", 10.5)
      .attr("fill", COL.lrm)
      .attr("opacity", 0.85)
      .text("most discriminating");

    // Sample curves
    const F = d3.range(0, 1.001, 0.01);
    const lineGen = (fn) => d3.line()
      .x((f) => x(f))
      .y((f) => y(fn(f)))
      .curve(d3.curveMonotoneX);

    // Uncertainty curve
    g.append("path")
      .datum(F)
      .attr("class", "trunc-uncer")
      .attr("fill", "none")
      .attr("stroke", COL.lrm)
      .attr("stroke-width", 2.2)
      .attr("d", lineGen(Truncation.curves.uncer));
    g.append("text")
      .attr("x", x(0.05) + 4).attr("y", y(Truncation.curves.uncer(0.05)) - 8)
      .attr("font-family", "var(--font-mono)").attr("font-size", 11)
      .attr("fill", COL.lrm)
      .text("length-on-uncertainty");

    // Useful-search curve
    g.append("path")
      .datum(F)
      .attr("class", "trunc-useful")
      .attr("fill", "none")
      .attr("stroke", COL.blue)
      .attr("stroke-width", 2.2)
      .attr("stroke-dasharray", "6,4")
      .attr("d", lineGen(Truncation.curves.useful));
    g.append("text")
      .attr("x", x(0.05) + 4).attr("y", y(Truncation.curves.useful(0.05)) + 18)
      .attr("font-family", "var(--font-mono)").attr("font-size", 11)
      .attr("fill", COL.blue)
      .text("useful-search");

    // Vertical f-line (interactive)
    const vline = g.append("line")
      .attr("class", "trunc-vline")
      .attr("x1", x(1)).attr("x2", x(1))
      .attr("y1", 0).attr("y2", H)
      .attr("stroke", COL.text)
      .attr("stroke-width", 1.4)
      .attr("opacity", 0.5);

    const ptU = g.append("circle")
      .attr("r", 6)
      .attr("fill", "white")
      .attr("stroke", COL.lrm)
      .attr("stroke-width", 2.2)
      .attr("cx", x(1)).attr("cy", y(Truncation.curves.uncer(1)));
    const ptF = g.append("circle")
      .attr("r", 6)
      .attr("fill", "white")
      .attr("stroke", COL.blue)
      .attr("stroke-width", 2.2)
      .attr("cx", x(1)).attr("cy", y(Truncation.curves.useful(1)));

    // axis labels
    g.append("text").attr("x", W / 2).attr("y", H + 38)
      .attr("text-anchor", "middle").attr("font-family", "var(--font-body)")
      .attr("font-size", 12.5).attr("fill", COL.mute)
      .text("Truncation fraction  f  (= thinking-budget retained)");
    g.append("text").attr("transform", "rotate(-90)")
      .attr("x", -H / 2).attr("y", -42)
      .attr("text-anchor", "middle").attr("font-family", "var(--font-body)")
      .attr("font-size", 12.5).attr("fill", COL.mute)
      .text("Predicted accuracy");

    // Wire the slider
    const slider = $("#trunc-slider");
    const fEl = $("#trunc-f");
    const aU = $("#trunc-acc-uncer");
    const aF = $("#trunc-acc-useful");

    const update = (val) => {
      const f = val / 100;
      const accU = Truncation.curves.uncer(f);
      const accF = Truncation.curves.useful(f);
      vline.attr("x1", x(f)).attr("x2", x(f));
      ptU.attr("cx", x(f)).attr("cy", y(accU));
      ptF.attr("cx", x(f)).attr("cy", y(accF));
      if (fEl) fEl.textContent = f.toFixed(2);
      if (aU)  aU.textContent  = (accU * 100).toFixed(0) + "%";
      if (aF)  aF.textContent  = (accF * 100).toFixed(0) + "%";
    };

    if (slider) {
      slider.value = "100";
      update(100);
      slider.addEventListener("input", (e) => update(parseInt(e.target.value, 10)));
    }
  },
};

/* ------------------------------------------------------------------
   Animated headline counters
   ------------------------------------------------------------------ */
const Counters = {
  init() {
    const els = $$(".ct[data-counter]");
    if (!els.length) return;
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => { el.textContent = parseFloat(el.dataset.counter).toFixed(+el.dataset.decimals || 2); });
      return;
    }
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          Counters._animate(e.target);
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.4 });
    els.forEach((el) => obs.observe(el));
  },
  _animate(el) {
    const target = parseFloat(el.dataset.counter);
    const decimals = +el.dataset.decimals || 2;
    const dur = 900;
    const start = performance.now();
    function tick(now) {
      const t = Math.min(1, (now - start) / dur);
      // ease-out cubic
      const ease = 1 - Math.pow(1 - t, 3);
      el.textContent = (target * ease).toFixed(decimals);
      if (t < 1) requestAnimationFrame(tick);
      else el.textContent = target.toFixed(decimals);
    }
    requestAnimationFrame(tick);
  },
};

/* ------------------------------------------------------------------
   Reading progress bar
   ------------------------------------------------------------------ */
const ProgressBar = {
  init() {
    const fill = $("#progress-fill");
    if (!fill) return;
    const onScroll = () => {
      const doc = document.documentElement;
      const top = window.scrollY;
      const max = doc.scrollHeight - window.innerHeight;
      const pct = max > 0 ? Math.min(100, Math.max(0, (top / max) * 100)) : 0;
      fill.style.width = pct + "%";
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
  },
};

/* ------------------------------------------------------------------
   Cross-chart hover link — hover model name highlights it across all charts
   ------------------------------------------------------------------ */
const HoverLink = {
  init() {
    // Match a bar/dot/label across all SVGs by data-agent
    // We need to add data-agent attributes during render — handled by mutating
    // existing selections via querySelector after the fact.
    // Simpler: rebind on every chart re-render via a setTimeout after boot.
    setTimeout(() => HoverLink._bind(), 600);
  },
  _bind() {
    // Walk all SVG elements with a corresponding data binding (D3 __data__)
    // and attach data-agent attribute where possible.
    document.querySelectorAll("svg circle, svg rect.bar, svg g.dot").forEach((el) => {
      const d = el.__data__;
      if (d && d.agent) {
        el.setAttribute("data-agent", d.agent);
      }
    });

    let active = null;
    const setActive = (agent) => {
      if (active === agent) return;
      active = agent;
      document.querySelectorAll("[data-agent]").forEach((el) => {
        if (!agent) {
          el.style.opacity = "";
        } else {
          el.style.opacity = (el.getAttribute("data-agent") === agent) ? "1" : "0.18";
        }
      });
    };

    document.querySelectorAll("[data-agent]").forEach((el) => {
      el.addEventListener("pointerenter", () => setActive(el.getAttribute("data-agent")));
      el.addEventListener("pointerleave", () => setActive(null));
    });
  },
};

/* ------------------------------------------------------------------
   Replay button wiring
   ------------------------------------------------------------------ */
function initReplayButtons() {
  const bindReplay = (sel, mod) => {
    const btn = document.querySelector(sel);
    if (!btn) return;
    btn.addEventListener("click", () => {
      if (mod && typeof mod._animateIn === "function") mod._animateIn();
    });
  };
  bindReplay("#phase-replay", PhasePlot);
  bindReplay("#gap-replay",   PerAgentGap);
}

/* ------------------------------------------------------------------
   Boot — crash-resistant
   ------------------------------------------------------------------ */
let _navInited = false;
let _bibInited = false;
let _replayInited = false;
let _progInited = false;
let _countInited = false;
let _traceInited = false;
let _hoverInited = false;
function boot() {
  if (typeof d3 === "undefined") {
    console.error("[boot] D3 not loaded; skipping chart init.");
    return;
  }
  if (!window.DATA) {
    console.error("[boot] window.DATA not loaded; skipping chart init.");
    return;
  }
  const safe = (label, fn) => {
    try {
      fn();
    } catch (e) {
      console.error(`[boot] ${label} failed:`, e);
    }
  };
  // One-shot inits (don't re-bind on resize)
  if (!_navInited)    { safe("Nav",         () => Nav.init());          _navInited = true; }
  if (!_bibInited)    { safe("Bibtex",      () => initBibtex());        _bibInited = true; }
  if (!_progInited)   { safe("ProgressBar", () => ProgressBar.init());  _progInited = true; }
  if (!_countInited)  { safe("Counters",    () => Counters.init());     _countInited = true; }
  if (!_traceInited)  { safe("TraceExpl",   () => TraceExplorer.init());_traceInited = true; }

  safe("Reveal",      initReveal);
  safe("PhasePlot",   () => PhasePlot.init());
  safe("PerAgentGap", () => PerAgentGap.init());
  safe("ParadigmChart", () => ParadigmChart.init());
  safe("MechHuman",   () => MechHuman.init());
  safe("MechLRM",     () => MechLRM.init());
  safe("CortesCI",    () => CortesCI.init());
  safe("Truncation",  () => Truncation.init());

  // Replay buttons depend on modules being initialised
  if (!_replayInited) { safe("Replay",  () => initReplayButtons()); _replayInited = true; }
  if (!_hoverInited)  { safe("HoverLink", () => HoverLink.init()); _hoverInited = true; }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}

// Re-render on resize (debounced)
let resizeT;
window.addEventListener("resize", () => {
  clearTimeout(resizeT);
  resizeT = setTimeout(boot, 220);
});
