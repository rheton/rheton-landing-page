(function () {
  "use strict";

  /* ---------------- mobile nav ---------------- */
  var navToggle = document.getElementById("navToggle");
  var mobileNav = document.getElementById("mobileNavPanel");

  function closeMobileNav() {
    mobileNav.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
  }

  if (navToggle && mobileNav) {
    navToggle.addEventListener("click", function (e) {
      e.stopPropagation();
      var open = mobileNav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    mobileNav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", closeMobileNav);
    });
    document.addEventListener("click", function (e) {
      if (!mobileNav.classList.contains("is-open")) return;
      if (e.target.closest("#navToggle") || e.target.closest("#mobileNavPanel")) return;
      closeMobileNav();
    });
  }

  /* ---------------- pricing toggle ---------------- */
  var billingTabs = document.getElementById("billingTabs");
  if (billingTabs) {
    var proAmount = document.getElementById("proAmount");
    var proUnit = document.getElementById("proUnit");
    var basePrice = parseFloat(proAmount.dataset.basePrice) || 0;
    var annualDiscount = parseFloat(billingTabs.closest("[data-annual-discount]").dataset.annualDiscount) || 0;
    var monthlyUnit = proUnit.dataset.monthlyUnit || "";
    var annualUnit = proUnit.dataset.annualUnit || monthlyUnit;
    billingTabs.querySelectorAll(".rh-tab").forEach(function (tab) {
      tab.addEventListener("click", function () {
        billingTabs.querySelectorAll(".rh-tab").forEach(function (t) { t.classList.remove("is-active"); });
        tab.classList.add("is-active");
        var annual = tab.dataset.billing === "annual";
        proAmount.textContent = "$" + (annual ? Math.round(basePrice * (1 - annualDiscount)) : basePrice);
        proUnit.textContent = annual ? annualUnit : monthlyUnit;
      });
    });
  }

  /* ---------------- cursor blink (code panel) ---------------- */
  var cursorEl = document.getElementById("codeCursor");
  if (cursorEl) {
    setInterval(function () {
      cursorEl.classList.toggle("is-on");
    }, 450);
  }

  /* ---------------- "How does it work?" animated walkthrough ---------------- */
  var howGrid = document.querySelector(".rh-how-grid");
  if (howGrid) {
    var BUGGY_CODE = "quicksort [] = []\nquicksort (x:xs) =\n  less ++ [x] ++ more\n  where\n  less = [a|a<-xs,a<x]\n  more = [a|a<-xs,a>x]\n\nmain = print $ quicksort\n  [5,3,8,1,9,2]";
    var FIXED_LINE5 = "  less = [a|a<-xs,a<=x]";
    var BUGGY_LINE5 = "  less = [a|a<-xs,a<x]";

    function highlightInto(container, code) {
      container.textContent = "";
      var regex = /(quicksort|where|main|\d+)/g;
      var lastIndex = 0, m;
      while ((m = regex.exec(code))) {
        if (m.index > lastIndex) container.appendChild(document.createTextNode(code.slice(lastIndex, m.index)));
        var word = m[0];
        var span = document.createElement("span");
        span.textContent = word;
        if (word === "where") { span.style.color = "#a832a8"; span.style.fontWeight = "600"; }
        else if (/\d/.test(word)) { span.style.color = "#3d4a8f"; span.style.fontWeight = "400"; }
        else { span.style.color = "#17181c"; span.style.fontWeight = "600"; }
        container.appendChild(span);
        lastIndex = m.index + word.length;
      }
      if (lastIndex < code.length) container.appendChild(document.createTextNode(code.slice(lastIndex)));
    }

    function timers() {
      var list = [];
      return {
        set: function (fn, ms) { list.push(setTimeout(fn, ms)); },
        clearAll: function () { list.forEach(clearTimeout); list = []; }
      };
    }

    function makeInterval(step, ms) {
      return setInterval(step, ms);
    }

    function triggerReflow(el) { void el.offsetWidth; }

    /* ---- stage 1: set up the session ---- */
    var stage1El = howGrid.querySelector('[data-stage="1"]');
    var addStageEl = stage1El.querySelector('[data-flash="adding"]');
    var stage2Reveal = stage1El.querySelector('[data-reveal="stage2"]');
    var stage3Reveal = stage1El.querySelector('[data-reveal="stage3"]');
    var stage1Timers = timers();

    function runSetupAnim(cb) {
      stage1Timers.clearAll();
      stage2Reveal.classList.remove("is-visible");
      stage3Reveal.classList.remove("is-visible");
      addStageEl.classList.remove("is-flashing");
      stage1Timers.set(function () { addStageEl.classList.add("is-flashing"); }, 300);
      stage1Timers.set(function () { stage2Reveal.classList.add("is-visible"); addStageEl.classList.remove("is-flashing"); }, 650);
      stage1Timers.set(function () { addStageEl.classList.add("is-flashing"); }, 1400);
      stage1Timers.set(function () { stage3Reveal.classList.add("is-visible"); addStageEl.classList.remove("is-flashing"); }, 1750);
      stage1Timers.set(function () { cb && cb(); }, 2200);
    }

    /* ---- stage 2: let the agent take over ---- */
    var stage2El = howGrid.querySelector('[data-stage="2"]');
    var codeCharsEl = document.getElementById("codeChars");
    var codeCursorEl = document.getElementById("codeCursor");
    var runPillEl = document.getElementById("runPill");
    var consoleOutEl = document.getElementById("consoleOut");
    var bug1El = stage2El.querySelector('[data-reveal="bug1"]');
    var bug2El = stage2El.querySelector('[data-reveal="bug2"]');
    var bug3El = stage2El.querySelector('[data-reveal="bug3"]');
    var stage2Timers = timers();
    var typeInterval, deleteInterval;

    function codeState() {
      return { codeChars: 0, fixingLine5: false, delChars: 0, fixChars: 0 };
    }
    var cs = codeState();

    function renderCode() {
      var raw;
      if (cs.fixingLine5) {
        var lines = BUGGY_CODE.split("\n");
        lines[4] = cs.delChars > 0 ? BUGGY_LINE5.slice(0, cs.delChars) : FIXED_LINE5.slice(0, cs.fixChars);
        raw = lines.join("\n");
      } else {
        raw = BUGGY_CODE.slice(0, cs.codeChars);
      }
      highlightInto(codeCharsEl, raw);
      var stillTyping = cs.fixingLine5
        ? (cs.delChars > 0 || cs.fixChars < FIXED_LINE5.length)
        : cs.codeChars < BUGGY_CODE.length;
      codeCursorEl.classList.toggle("is-typing", stillTyping);
    }

    function typeText(target, key, onDone) {
      clearInterval(typeInterval);
      typeInterval = setInterval(function () {
        var cur = cs[key];
        if (cur >= target.length) { clearInterval(typeInterval); onDone(); return; }
        cs[key] = Math.min(target.length, cur + 2);
        renderCode();
      }, 14);
    }

    function deleteText(key, onDone) {
      clearInterval(deleteInterval);
      deleteInterval = setInterval(function () {
        var cur = cs[key];
        if (cur <= 0) { clearInterval(deleteInterval); onDone(); return; }
        cs[key] = Math.max(0, cur - 2);
        renderCode();
      }, 22);
    }

    function runLiveSessionAnim(cb) {
      stage2Timers.clearAll();
      clearInterval(typeInterval); clearInterval(deleteInterval);
      cs = codeState();
      runPillEl.classList.remove("is-running");
      consoleOutEl.textContent = "";
      [bug1El, bug2El, bug3El].forEach(function (b) { b.classList.remove("is-visible"); });
      renderCode();

      typeText(BUGGY_CODE, "codeChars", function () {
        stage2Timers.set(function () { runPillEl.classList.add("is-running"); }, 400);
        stage2Timers.set(function () { runPillEl.classList.remove("is-running"); consoleOutEl.textContent = "[1,2,3,5,9,8]"; }, 800);
        stage2Timers.set(function () { bug1El.classList.add("is-visible"); }, 1600);
        stage2Timers.set(function () {
          cs.fixingLine5 = true;
          cs.delChars = BUGGY_LINE5.length;
          renderCode();
          deleteText("delChars", function () {
            typeText(FIXED_LINE5, "fixChars", function () {
              stage2Timers.set(function () { runPillEl.classList.add("is-running"); }, 400);
              stage2Timers.set(function () { runPillEl.classList.remove("is-running"); consoleOutEl.textContent = "[1,2,3,5,8,9]"; }, 800);
              stage2Timers.set(function () { bug2El.classList.add("is-visible"); }, 1500);
              stage2Timers.set(function () { bug3El.classList.add("is-visible"); }, 2300);
              stage2Timers.set(function () { cb && cb(); }, 2700);
            });
          });
        }, 2900);
      });
    }

    /* ---- stage 3: get the summary ---- */
    var stage3El = howGrid.querySelector('[data-stage="3"]');
    var sum1El = stage3El.querySelector('[data-reveal="sum1"]');
    var sum2El = stage3El.querySelector('[data-reveal="sum2"]');
    var sum3El = stage3El.querySelector('[data-reveal="sum3"]');
    var sum4El = stage3El.querySelector('[data-reveal="sum4"]');
    var sum5El = stage3El.querySelector('[data-reveal="sum5"]');
    var radarFillEl = document.getElementById("radarFill");
    var stage3Timers = timers();

    function runSummaryAnim() {
      stage3Timers.clearAll();
      [sum1El, sum2El, sum3El, sum4El, sum5El].forEach(function (e) { e.classList.remove("is-visible"); });
      radarFillEl.classList.remove("is-grown");
      stage3Timers.set(function () { sum1El.classList.add("is-visible"); }, 200);
      stage3Timers.set(function () { sum2El.classList.add("is-visible"); }, 600);
      stage3Timers.set(function () { sum3El.classList.add("is-visible"); }, 1000);
      stage3Timers.set(function () { sum4El.classList.add("is-visible"); }, 1400);
      stage3Timers.set(function () { sum5El.classList.add("is-visible"); }, 1800);
      stage3Timers.set(function () { radarFillEl.classList.add("is-grown"); }, 2100);
    }

    /* ---- arrows ---- */
    var arrow1El = document.getElementById("howArrow1");
    var arrow2El = document.getElementById("howArrow2");

    function pulseArrow(el, cb) {
      el.classList.add("is-active");
      setTimeout(function () { el.classList.remove("is-active"); cb && cb(); }, 700);
    }

    /* ---- scroll gating: stage2 waits on stage1 done, stage3 waits on stage2 done ---- */
    var stage1Done = false, stage2Done = false;
    var stage1Started = false, stage2Started = false, stage3Started = false;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        if (entry.target === stage1El && !stage1Started) {
          stage1Started = true;
          runSetupAnim(function () { pulseArrow(arrow1El, function () { stage1Done = true; maybeStartStage2(); }); });
        }
        if (entry.target === stage2El) maybeStartStage2();
        if (entry.target === stage3El) maybeStartStage3();
      });
    }, { rootMargin: "0px 0px -30% 0px", threshold: 0 });

    function maybeStartStage2() {
      if (stage2Started || !stage1Done) return;
      var rect = stage2El.getBoundingClientRect();
      var vh = window.innerHeight || document.documentElement.clientHeight;
      if (!(rect.top < vh * 0.7 && rect.bottom > 0)) return;
      stage2Started = true;
      runLiveSessionAnim(function () { pulseArrow(arrow2El, function () { stage2Done = true; maybeStartStage3(); }); });
    }

    function maybeStartStage3() {
      if (stage3Started || !stage2Done) return;
      var rect = stage3El.getBoundingClientRect();
      var vh = window.innerHeight || document.documentElement.clientHeight;
      if (!(rect.top < vh * 0.7 && rect.bottom > 0)) return;
      stage3Started = true;
      runSummaryAnim();
    }

    io.observe(stage1El);
    io.observe(stage2El);
    io.observe(stage3El);

    /* ---- replay buttons ---- */
    howGrid.querySelectorAll(".rh-replay").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var stage = btn.dataset.replay;
        if (stage === "1") runSetupAnim(function () {});
        if (stage === "2") runLiveSessionAnim(function () {});
        if (stage === "3") runSummaryAnim();
      });
    });
  }

  /* ---------------- "Beyond an agent" icon micro-animations ---------------- */
  var roundsIcons = document.getElementById("roundsIcons");
  if (roundsIcons) {
    var animatedEls = roundsIcons.querySelectorAll(".rh-icon-eye, .rh-icon-brain, .rh-wave-bar");
    var roundsIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        animatedEls.forEach(function (el) { el.classList.remove("is-visible"); });
        void roundsIcons.offsetWidth;
        requestAnimationFrame(function () {
          animatedEls.forEach(function (el) { el.classList.add("is-visible"); });
        });
      });
    }, { threshold: 0, rootMargin: "0px 0px -20% 0px" });
    roundsIo.observe(roundsIcons);
  }
})();
