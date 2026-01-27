// app.js — FINAL (breathing + entry + help + walkthrough with TRUE HOLE spotlight)

// -----------------------
// Elements
// -----------------------
const circle = document.getElementById("circle");
const circleWrap = document.querySelector(".circleWrap");

const phaseInCircle = document.getElementById("phaseInCircle");
const cycleProgressEl = document.getElementById("cycleProgress");

const startBtn = document.getElementById("startBtn");
const stopBtn  = document.getElementById("stopBtn");

const targetsWrap = document.getElementById("targets");
const showTargets = document.getElementById("showTargets");

const paceSlider  = document.getElementById("pace");
const paceVal     = document.getElementById("paceVal");

// Duration UI
const durButtons = Array.from(document.querySelectorAll(".durBtn"));
const durationCtrl = document.getElementById("durationCtrl");
const paceCtrl = document.getElementById("paceCtrl");

// Entry / Help UI
const entryOverlay = document.getElementById("entryOverlay");
const entryStartBtn = document.getElementById("entryStartBtn");
const entryHowBtn = document.getElementById("entryHowBtn");
const entryCloseX = document.getElementById("entryCloseX");

const helpOverlay = document.getElementById("helpOverlay");
const infoBtn = document.getElementById("infoBtn");
const helpCloseX = document.getElementById("helpCloseX");
const helpCloseBtn = document.getElementById("helpCloseBtn");

// Walkthrough UI
const wtOverlay = document.getElementById("wtOverlay");
const wtSpot = document.getElementById("wtSpot");
const wtCard = document.getElementById("wtCard");
const wtTitle = document.getElementById("wtTitle");
const wtBody = document.getElementById("wtBody");
const wtNextBtn = document.getElementById("wtNextBtn");
const wtSkipBtn = document.getElementById("wtSkipBtn");

const STORAGE_WT = "breathing_seenWalkthrough_v3";

// -----------------------
// Overlay helpers (Entry / Help)
// -----------------------
function openOverlay(el){
  el.classList.add("show");
  const focusable = el.querySelector(
    "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"
  );
  if (focusable) focusable.focus();
}
function closeOverlay(el){ el.classList.remove("show"); }
function overlayBackdropClose(e, el){
  if (e.target === el) closeOverlay(el);
}

// Session theme (binary)
function setSessionTheme(on){
  document.body.dataset.session = on ? "on" : "off";
}

// -----------------------
// Entry logic (ALWAYS show on load)
// -----------------------
(function initEntry(){
  openOverlay(entryOverlay);
})();

entryStartBtn.addEventListener("click", () => {
  // start without tutorial
  localStorage.setItem(STORAGE_WT, "1");
  closeOverlay(entryOverlay);
  startBtn.focus();
});

entryHowBtn.addEventListener("click", () => {
  closeOverlay(entryOverlay);
  startWalkthrough(); // explicit request => always show
});

entryCloseX.addEventListener("click", () => {
  localStorage.setItem(STORAGE_WT, "1");
  closeOverlay(entryOverlay);
  startBtn.focus();
});

entryOverlay.addEventListener("mousedown", (e) => overlayBackdropClose(e, entryOverlay));

// Help overlay
infoBtn.addEventListener("click", () => openOverlay(helpOverlay));
helpCloseX.addEventListener("click", () => closeOverlay(helpOverlay));
helpCloseBtn.addEventListener("click", () => closeOverlay(helpOverlay));
helpOverlay.addEventListener("mousedown", (e) => overlayBackdropClose(e, helpOverlay));

// Escape closes Entry/Help/Walkthrough
document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  if (entryOverlay.classList.contains("show")) closeOverlay(entryOverlay);
  if (helpOverlay.classList.contains("show")) closeOverlay(helpOverlay);
  if (wtOverlay.classList.contains("show")) endWalkthrough(true);
});

// -----------------------
// Walkthrough (spotlight + popover) — TRUE HOLE (no grey on circle)
// Requires CSS that defines .wtShade (top/left/right/bottom) inside .wtDim
// -----------------------
let wtStep = 0;
let wtFocusedEl = null;

const walkthroughSteps = [
  { title:"Breathing circle", target:".circleWrap", body:"Follow the circle. When it expands, inhale. When it contracts, exhale.", align:"center" },
  { title:"Pace", target:"#paceCtrl", body:"Pace controls how slow your breathing feels. Lower values feel quicker. Higher values feel slower and deeper.", align:"left" },
  { title:"Duration", target:"#durationCtrl", body:"Choose how long you want the session to last (1 / 3 / 5 / 10 minutes).", align:"left" },
  { title:"Help", target:"#infoBtn", body:"Need a reminder later? Tap “?” anytime.", align:"right" }
];

function clearWtFocus(){
  if (!wtFocusedEl) return;
  wtFocusedEl.classList.remove("wtFocus", "wtFocusPos");
  wtFocusedEl = null;
}

function applyWtFocus(el){
  clearWtFocus();
  wtFocusedEl = el;

  // Always lift via z-index
  wtFocusedEl.classList.add("wtFocus");

  // Only add position:relative if the element is "static"
  const pos = window.getComputedStyle(wtFocusedEl).position;
  if (pos === "static") wtFocusedEl.classList.add("wtFocusPos");
}

function clamp(n, a, b){ return Math.max(a, Math.min(b, n)); }

const wtDim = document.querySelector(".wtDim");
let wtShades = null;

function ensureShades(){
  if (wtShades) return;

  const mk = () => {
    const d = document.createElement("div");
    d.className = "wtShade";
    wtDim.appendChild(d);
    return d;
  };

  wtShades = {
    top: mk(),
    left: mk(),
    right: mk(),
    bottom: mk()
  };
}

function layoutShades(spotLeft, spotTop, spotW, spotH){
  ensureShades();
  const W = window.innerWidth;
  const H = window.innerHeight;

  const x1 = spotLeft;
  const y1 = spotTop;
  const x2 = spotLeft + spotW;
  const y2 = spotTop + spotH;

  // top
  wtShades.top.style.left = "0px";
  wtShades.top.style.top = "0px";
  wtShades.top.style.width = `${W}px`;
  wtShades.top.style.height = `${Math.max(0, y1)}px`;

  // bottom
  wtShades.bottom.style.left = "0px";
  wtShades.bottom.style.top = `${Math.max(0, y2)}px`;
  wtShades.bottom.style.width = `${W}px`;
  wtShades.bottom.style.height = `${Math.max(0, H - y2)}px`;

  // left
  wtShades.left.style.left = "0px";
  wtShades.left.style.top = `${Math.max(0, y1)}px`;
  wtShades.left.style.width = `${Math.max(0, x1)}px`;
  wtShades.left.style.height = `${Math.max(0, spotH)}px`;

  // right
  wtShades.right.style.left = `${Math.max(0, x2)}px`;
  wtShades.right.style.top = `${Math.max(0, y1)}px`;
  wtShades.right.style.width = `${Math.max(0, W - x2)}px`;
  wtShades.right.style.height = `${Math.max(0, spotH)}px`;
}

function showWalkthroughStep(i){
  wtStep = i;
  const step = walkthroughSteps[i];
  const el = document.querySelector(step.target);

  if (!el){
    if (i < walkthroughSteps.length - 1) return showWalkthroughStep(i + 1);
    return endWalkthrough(false);
  }

  // Safety lift; real hole already prevents greying, but keep it.
  applyWtFocus(el);

  wtTitle.textContent = step.title;
  wtBody.textContent = step.body;

  const r = el.getBoundingClientRect();

  const pad = 10;
  const spotLeft = clamp(r.left - pad, 10, window.innerWidth - 10);
  const spotTop  = clamp(r.top - pad, 10, window.innerHeight - 10);
  const spotW    = clamp(r.width + pad * 2, 24, window.innerWidth - 20);
  const spotH    = clamp(r.height + pad * 2, 24, window.innerHeight - 20);

  wtSpot.style.left = `${spotLeft}px`;
  wtSpot.style.top  = `${spotTop}px`;
  wtSpot.style.width  = `${spotW}px`;
  wtSpot.style.height = `${spotH}px`;

  // True “hole”
  layoutShades(spotLeft, spotTop, spotW, spotH);

  // Card positioning
  const cardW = Math.min(300, window.innerWidth - 28);
  const gap = 12;

  const cardRect = wtCard.getBoundingClientRect();
  const cardH = cardRect.height || 140;

  const belowY = spotTop + spotH + gap;
  const aboveY = spotTop - cardH - gap;

  let cardLeft;
  if (step.align === "right"){
    // align to spotlight right edge
    cardLeft = Math.round((spotLeft + spotW) - cardW);
    cardLeft = clamp(cardLeft, 14, window.innerWidth - cardW - 14);
  } else if (step.align === "left"){
    // align to spotlight left edge
    cardLeft = Math.round(spotLeft);
    cardLeft = clamp(cardLeft, 14, window.innerWidth - cardW - 14);
  } else {
    // center align
    const cx = spotLeft + spotW / 2;
    cardLeft = Math.round(cx - cardW / 2);
    cardLeft = clamp(cardLeft, 14, window.innerWidth - cardW - 14);
  }

  let cardTop;
  if (belowY + cardH + 14 <= window.innerHeight){
    cardTop = belowY;
  } else if (aboveY >= 14){
    cardTop = aboveY;
  } else {
    cardTop = Math.max(14, window.innerHeight - cardH - 14);
  }

  wtCard.style.left = `${cardLeft}px`;
  wtCard.style.top  = `${cardTop}px`;

  wtNextBtn.textContent = (i === walkthroughSteps.length - 1) ? "Done" : "Got it";
}

function startWalkthrough(){
  // Don't start over running session or on top of Help/Entry
  if (running) return;
  if (helpOverlay.classList.contains("show") || entryOverlay.classList.contains("show")) return;

  wtOverlay.classList.add("show");
  wtOverlay.setAttribute("aria-hidden", "false");

  ensureShades();

  requestAnimationFrame(() => {
    showWalkthroughStep(0);
    wtNextBtn.focus();
  });

  window.addEventListener("resize", onWalkthroughRelayout, { passive: true });
  window.addEventListener("scroll", onWalkthroughRelayout, { passive: true });
}

function endWalkthrough(skipped){
  wtOverlay.classList.remove("show");
  wtOverlay.setAttribute("aria-hidden", "true");

  // Mark as seen (completed or skipped)
  localStorage.setItem(STORAGE_WT, "1");

  window.removeEventListener("resize", onWalkthroughRelayout);
  window.removeEventListener("scroll", onWalkthroughRelayout);

  clearWtFocus();
  startBtn.focus();
}

function onWalkthroughRelayout(){
  if (!wtOverlay.classList.contains("show")) return;
  clearTimeout(window.__wtT);
  window.__wtT = setTimeout(() => showWalkthroughStep(wtStep), 60);
}

wtNextBtn.addEventListener("click", () => {
  if (wtStep >= walkthroughSteps.length - 1){
    endWalkthrough(false);
  } else {
    showWalkthroughStep(wtStep + 1);
    wtNextBtn.focus();
  }
});

wtSkipBtn.addEventListener("click", () => endWalkthrough(true));

// Keep walkthrough inert on background clicks
wtOverlay.addEventListener("mousedown", () => {});

// -----------------------
// Breathing protocol parameters
// -----------------------
const exhaleRatio = 1.5;

// Duration
let sessionMinutes = 1;
let sessionMs = sessionMinutes * 60_000;

// Scale range
const minScale = 0.78;
const maxScale = 1.48;

// Easing
function easeInOut(t){
  return 0.5 - 0.5 * Math.cos(Math.PI * t);
}

// Phase UI
function setPhaseUI(label){
  phaseInCircle.textContent = label;
  phaseInCircle.classList.remove("phase-ready", "phase-active", "phase-finishing");

  if (label === "Ready" || label === "Done"){
    phaseInCircle.classList.add("phase-ready");
  } else if (label === "Finishing…"){
    phaseInCircle.classList.add("phase-finishing");
  } else {
    phaseInCircle.classList.add("phase-active");
  }
}

function setScale(s){ circle.style.transform = `scale(${s.toFixed(4)})`; }

// Glow modulation
function setGlowFromScale(s){
  const x = (s - minScale) / (maxScale - minScale);
  const clamped = Math.max(0, Math.min(1, x));
  const glow = 0.14 + 0.12 * clamped; // 0.14..0.26
  document.documentElement.style.setProperty("--glow", glow.toFixed(3));
}

// -----------------------
// Rings config (responsive)
// -----------------------
let baseCirclePx = 180;
const inhaleRingsN = 4;
const exhaleRingsN = 6;

function updateBaseCirclePx(){
  const w = circleWrap.getBoundingClientRect().width;
  if (Number.isFinite(w) && w > 0) baseCirclePx = w;
}
function scaleToRingDiameter(scale){
  return baseCirclePx * scale;
}

updateBaseCirclePx();
window.addEventListener("resize", () => {
  clearTimeout(window.__ringResizeT);
  window.__ringResizeT = setTimeout(() => {
    updateBaseCirclePx();
    if (running && (state === "inhale" || state === "exhale")){
      buildRingsForPhase(state);
      updateRingActivation(lastScale, state);
    }
  }, 120);
});

// Uniform spacing inside bounds
function targetScales(phase){
  const n = (phase === "inhale") ? inhaleRingsN : exhaleRingsN;
  const scales = [];
  for (let k = 1; k <= n; k++){
    const t = k / (n + 1);
    if (phase === "inhale") scales.push(minScale + (maxScale - minScale) * t);
    else scales.push(maxScale - (maxScale - minScale) * t);
  }
  return scales;
}

let rings = [];
function buildRingsForPhase(phase){
  targetsWrap.innerHTML = "";
  rings = [];
  for (const s of targetScales(phase)){
    const el = document.createElement("div");
    el.className = "targetRing";
    const d = scaleToRingDiameter(s);
    el.style.width  = `${d.toFixed(1)}px`;
    el.style.height = `${d.toFixed(1)}px`;
    targetsWrap.appendChild(el);
    rings.push({ el, targetScale: s });
  }
}

function updateRingActivation(currentScale, phase){
  const reached = (phase === "inhale")
    ? (t) => currentScale >= t - 1e-6
    : (t) => currentScale <= t + 1e-6;

  for (const r of rings){
    r.el.classList.toggle("active", reached(r.targetScale));
  }
}

// Show/hide rings
showTargets.addEventListener("change", () => {
  targetsWrap.style.display = showTargets.checked ? "block" : "none";
});

// Pace mapping
const inhaleAnchorsSec = [2.5, 3.0, 3.5, 4.0, 4.5, 5.0];

function inhaleSecFromSlider(){
  const idx = Number(paceSlider.value);
  return inhaleAnchorsSec[Math.max(0, Math.min(5, idx))];
}
function exhaleSecFromInhale(inhaleSec){
  return inhaleSec * exhaleRatio;
}

// Estimate cycles (finish on exhale)
function totalCyclesEstimate(){
  const inhaleSec = inhaleSecFromSlider();
  const exhaleSec = exhaleSecFromInhale(inhaleSec);
  const cycleSec  = inhaleSec + exhaleSec;
  const totalSec  = sessionMs / 1000;
  return Math.max(1, Math.floor(totalSec / cycleSec));
}

function setCycleProgress(done, total){
  cycleProgressEl.textContent = `Cycles: ${done} / ${total}`;
}

function updatePaceLabel(){
  paceVal.textContent = String(paceSlider.value);
}

paceSlider.addEventListener("input", () => {
  updatePaceLabel();
  if (!running){
    setCycleProgress(0, totalCyclesEstimate());
  }
});

// Duration buttons
function setDurationMinutes(min){
  sessionMinutes = min;
  sessionMs = sessionMinutes * 60_000;
}

function setActiveDurationButton(btn){
  durButtons.forEach(b => {
    const active = (b === btn);
    b.classList.toggle("active", active);
    b.setAttribute("aria-pressed", active ? "true" : "false");
  });
}

durButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    if (running) return;
    const min = Number(btn.dataset.min);
    setDurationMinutes(min);
    setActiveDurationButton(btn);
    setCycleProgress(0, totalCyclesEstimate());
  });
});

function setDurationControlsEnabled(enabled){
  durButtons.forEach(b => b.disabled = !enabled);
}

// -----------------------
// Run state
// -----------------------
let running = false;
let rafId = null;

let state = "idle";
let stateStart = 0;

let cyclesDone = 0;
let totalCyclesPlanned = totalCyclesEstimate();

let sessionStart = 0;
let finishRequested = false;

let lastScale = minScale;

function step(now){
  if (!running) return;

  if (!finishRequested && (now - sessionStart >= sessionMs)){
    finishRequested = true;
    if (state === "inhale"){
      setPhaseUI("Finishing…");
    }
  }

  const inhaleSec = inhaleSecFromSlider();
  const exhaleSec = exhaleSecFromInhale(inhaleSec);

  if (state === "inhale"){
    const t = Math.min(1, (now - stateStart) / (inhaleSec * 1000));
    const e = easeInOut(t);
    const currentScale = minScale + (maxScale - minScale) * e;

    lastScale = currentScale;
    setScale(currentScale);
    setGlowFromScale(currentScale);
    updateRingActivation(currentScale, "inhale");

    if (t >= 1){
      state = "exhale";
      stateStart = now;
      setPhaseUI("Exhale");
      buildRingsForPhase("exhale");
      updateRingActivation(maxScale, "exhale");
      lastScale = maxScale;
    }
  } else if (state === "exhale"){
    const t = Math.min(1, (now - stateStart) / (exhaleSec * 1000));
    const e = easeInOut(t);
    const currentScale = maxScale - (maxScale - minScale) * e;

    lastScale = currentScale;
    setScale(currentScale);
    setGlowFromScale(currentScale);
    updateRingActivation(currentScale, "exhale");

    if (t >= 1){
      cyclesDone += 1;
      setCycleProgress(cyclesDone, totalCyclesPlanned);

      if (finishRequested){
        stop(true);
        return;
      }

      state = "inhale";
      stateStart = now;
      setPhaseUI("Inhale");
      buildRingsForPhase("inhale");
      updateRingActivation(minScale, "inhale");
      lastScale = minScale;
    }
  }

  rafId = requestAnimationFrame(step);
}

function start(){
  if (
    entryOverlay.classList.contains("show") ||
    helpOverlay.classList.contains("show") ||
    wtOverlay.classList.contains("show")
  ) return;

  if (running) return;

  running = true;
  setSessionTheme(true);

  // lock controls
  paceSlider.disabled = true;
  setDurationControlsEnabled(false);

  updateBaseCirclePx();

  setScale(minScale);
  setGlowFromScale(minScale);
  lastScale = minScale;

  cyclesDone = 0;
  totalCyclesPlanned = totalCyclesEstimate();
  setCycleProgress(0, totalCyclesPlanned);

  finishRequested = false;

  startBtn.disabled = true;
  stopBtn.disabled = false;

  const now = performance.now();
  sessionStart = now;

  state = "inhale";
  stateStart = now;
  setPhaseUI("Inhale");

  buildRingsForPhase("inhale");
  updateRingActivation(minScale, "inhale");

  targetsWrap.style.display = showTargets.checked ? "block" : "none";
  rafId = requestAnimationFrame(step);
}

function stop(completed=false){
  running = false;
  if (rafId) cancelAnimationFrame(rafId);
  rafId = null;

  setSessionTheme(false);

  // unlock controls
  paceSlider.disabled = false;
  setDurationControlsEnabled(true);

  startBtn.disabled = false;
  stopBtn.disabled = true;

  state = "idle";
  setScale(minScale);
  setGlowFromScale(minScale);
  lastScale = minScale;

  targetsWrap.innerHTML = "";

  if (!completed){
    setCycleProgress(0, totalCyclesEstimate());
  }

  setPhaseUI(completed ? "Done" : "Ready");
}

startBtn.addEventListener("click", start);
stopBtn.addEventListener("click", () => stop(false));

// Init
setSessionTheme(false);
updateBaseCirclePx();

setScale(minScale);
setGlowFromScale(minScale);
lastScale = minScale;

updatePaceLabel();
targetsWrap.style.display = showTargets.checked ? "block" : "none";

const defaultBtn = durButtons.find(b => Number(b.dataset.min) === 1);
if (defaultBtn) setActiveDurationButton(defaultBtn);

setPhaseUI("Ready");
setCycleProgress(0, totalCyclesEstimate());
