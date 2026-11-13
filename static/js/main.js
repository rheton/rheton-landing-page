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

  /* ---------------- pricing: live Plus prices and plan minutes ---------------- */
  // Plus's prices (live from Stripe) and each plan's minutes come from
  // rheton's public plus-prices function. Until they load (or if they
  // can't), the cards keep the fallback written into the page, and the
  // billing toggle stays hidden.
  var pricingSection = document.getElementById("pricing");
  var billingTabs = document.getElementById("billingTabs");
  var priceEl = pricingSection && pricingSection.querySelector("[data-live-price]");
  if (priceEl && billingTabs && window.fetch) {
    var amountEl = priceEl.querySelector(".rh-plan-amount");
    var unitEl = priceEl.querySelector(".rh-plan-unit");
    // Same unit wording as the app's Subscription page.
    var UNITS = { month: "/ month", quarter: "/ 3 months" };

    // Same formatting as the app's Budget page (formatPrice in
    // frontend/src/lib/billing.ts): whole amounts drop the cents.
    function formatPrice(plan) {
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: plan.currency.toUpperCase(),
        minimumFractionDigits: plan.unit_amount % 100 === 0 ? 0 : 2,
      }).format(plan.unit_amount / 100);
    }

    priceEl.classList.add("is-loading");
    fetch(pricingSection.dataset.pricesUrl)
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .then(function (data) {
        if (data.minutes) {
          pricingSection.querySelectorAll("[data-minutes-key]").forEach(function (el) {
            var n = data.minutes[el.dataset.minutesKey];
            if (typeof n === "number") el.textContent = pricingSection.dataset.minutesLabel.replace("{n}", n);
          });
        }

        var plans = {};
        (data.plans || []).forEach(function (p) {
          if (p.unit_amount !== null && UNITS[p.interval]) plans[p.interval] = p;
        });
        if (!plans.month) throw new Error("no monthly price");

        function show(interval) {
          var plan = plans[interval];
          amountEl.textContent = formatPrice(plan);
          unitEl.textContent = UNITS[interval];
          billingTabs.querySelectorAll(".rh-tab").forEach(function (t) {
            t.classList.toggle("is-active", t.dataset.interval === interval);
          });
        }

        if (plans.quarter) {
          var quarterTab = billingTabs.querySelector('[data-interval="quarter"]');
          var savings = Math.round((1 - plans.quarter.unit_amount / (plans.month.unit_amount * 3)) * 100);
          if (savings > 0) {
            quarterTab.textContent = quarterTab.dataset.label + " (" +
              quarterTab.dataset.savingsLabel.replace("{n}", savings) + ")";
          }
          billingTabs.querySelectorAll(".rh-tab").forEach(function (tab) {
            tab.addEventListener("click", function () { show(tab.dataset.interval); });
          });
          billingTabs.hidden = false;
        }
        // Like the Subscription page, lead with the 3-month plan.
        show(plans.quarter ? "quarter" : "month");
      })
      .catch(function () { /* keep the fallback */ })
      .then(function () { priceEl.classList.remove("is-loading"); });
  }

  /* ---------------- cursor blink (code and terminal panels) ---------------- */
  setInterval(function () {
    document.querySelectorAll(".rh-cursor").forEach(function (el) { el.classList.toggle("is-on"); });
  }, 450);

  /* ---------------- "How does it work?" animated walkthrough ---------------- */
  // One grid per track (Real-World Engineering, Algorithmic), each with the
  // same three stages. Stages 1 (setup) and 3 (summary) animate the same way
  // on both; stage 2 (the live session) is each track's own. Only the
  // visible grid runs; switching tracks stops it and replays from stage 1.

  function timers() {
    var list = [];
    return {
      set: function (fn, ms) { list.push(setTimeout(fn, ms)); },
      clearAll: function () { list.forEach(clearTimeout); list = []; }
    };
  }

  // Colors the words that match `regex` and puts the result in container.
  function highlightInto(container, code, regex, styleFor) {
    container.textContent = "";
    var lastIndex = 0, m;
    regex.lastIndex = 0;
    while ((m = regex.exec(code))) {
      if (m.index > lastIndex) container.appendChild(document.createTextNode(code.slice(lastIndex, m.index)));
      var span = document.createElement("span");
      span.textContent = m[0];
      var style = styleFor(m[0]);
      span.style.color = style[0];
      span.style.fontWeight = style[1];
      container.appendChild(span);
      lastIndex = m.index + m[0].length;
    }
    if (lastIndex < code.length) container.appendChild(document.createTextNode(code.slice(lastIndex)));
  }

  // Grows state[key] by 2 characters per tick up to target.length (or
  // shrinks it to 0 with grow = false), calling render after each step.
  function makeTyper() {
    var handle;
    return {
      run: function (state, key, target, grow, ms, render, onDone) {
        clearInterval(handle);
        handle = setInterval(function () {
          var cur = state[key];
          if (grow ? cur >= target : cur <= 0) { clearInterval(handle); onDone(); return; }
          state[key] = grow ? Math.min(target, cur + 2) : Math.max(0, cur - 2);
          render();
        }, ms);
      },
      stop: function () { clearInterval(handle); }
    };
  }

  /* ---- stage 2, Algorithmic: write quicksort, catch the bug, fix it ---- */
  function algorithmicLiveSession(el) {
    var BUGGY_CODE = "quicksort [] = []\nquicksort (x:xs) =\n  less ++ [x] ++ more\n  where\n  less = [a|a<-xs,a<x]\n  more = [a|a<-xs,a>x]\n\nmain = print $ quicksort\n  [5,3,8,1,9,2]";
    var FIXED_LINE5 = "  less = [a|a<-xs,a<=x]";
    var BUGGY_LINE5 = "  less = [a|a<-xs,a<x]";
    var codeEl = el.querySelector('[data-role="code"]');
    var cursorEl = el.querySelector('[data-role="cursor"]');
    var runEl = el.querySelector('[data-role="run"]');
    var outEl = el.querySelector('[data-role="out"]');
    var bubbles = el.querySelectorAll(".rh-chat-bubble");
    var t = timers(), typer = makeTyper();
    var cs;

    function render() {
      var raw;
      if (cs.fixingLine5) {
        var lines = BUGGY_CODE.split("\n");
        lines[4] = cs.delChars > 0 ? BUGGY_LINE5.slice(0, cs.delChars) : FIXED_LINE5.slice(0, cs.fixChars);
        raw = lines.join("\n");
      } else {
        raw = BUGGY_CODE.slice(0, cs.codeChars);
      }
      highlightInto(codeEl, raw, /(quicksort|where|main|\d+)/g, function (w) {
        if (w === "where") return ["#a832a8", "600"];
        if (/\d/.test(w)) return ["#3d4a8f", "400"];
        return ["#17181c", "600"];
      });
      var stillTyping = cs.fixingLine5
        ? (cs.delChars > 0 || cs.fixChars < FIXED_LINE5.length)
        : cs.codeChars < BUGGY_CODE.length;
      cursorEl.classList.toggle("is-typing", stillTyping);
    }

    function reset() {
      t.clearAll(); typer.stop();
      cs = { codeChars: 0, fixingLine5: false, delChars: 0, fixChars: 0 };
      runEl.classList.remove("is-running");
      outEl.textContent = "";
      bubbles.forEach(function (b) { b.classList.remove("is-visible"); });
      render();
    }

    function run(cb) {
      reset();
      typer.run(cs, "codeChars", BUGGY_CODE.length, true, 14, render, function () {
        t.set(function () { runEl.classList.add("is-running"); }, 400);
        t.set(function () { runEl.classList.remove("is-running"); outEl.textContent = "[1,2,3,5,9,8]"; }, 800);
        t.set(function () { bubbles[0].classList.add("is-visible"); }, 1600);
        t.set(function () {
          cs.fixingLine5 = true;
          cs.delChars = BUGGY_LINE5.length;
          render();
          typer.run(cs, "delChars", 0, false, 22, render, function () {
            typer.run(cs, "fixChars", FIXED_LINE5.length, true, 14, render, function () {
              t.set(function () { runEl.classList.add("is-running"); }, 400);
              t.set(function () { runEl.classList.remove("is-running"); outEl.textContent = "[1,2,3,5,8,9]"; }, 800);
              t.set(function () { bubbles[1].classList.add("is-visible"); }, 1500);
              t.set(function () { bubbles[2].classList.add("is-visible"); }, 2300);
              t.set(function () { cb && cb(); }, 2700);
            });
          });
        }, 2900);
      });
    }

    return { run: run, reset: reset };
  }

  /* ---- Real-World Engineering: a debugging exercise in an editor-style workspace ---- */
  // The repo, test output and fix are feature-flag-env's own (see
  // how-engineering.html). The interviewer reacts only to what the
  // candidate says, never to the screen, like the real exercise.
  var WS_FILES = {
    "flags/sources.py": [
      '"""Where flag values come from. Each source returns only the flags it sets.',
      '',
      '- defaults (flags/defaults.py) -- every flag',
      '- a per-environment JSON file (config/flags.<env>.json) -- checked in, so a',
      '  change goes through review',
      '- FLAG_<NAME> environment variables -- for an operator to flip a flag on one',
      '  deploy without a code change, e.g. FLAG_NEW_CHECKOUT=false',
      '"""',
      '',
      'from __future__ import annotations',
      '',
      'import json',
      'from collections.abc import Mapping',
      'from pathlib import Path',
      '',
      'from flags.defaults import DEFAULTS',
      '',
      'ENV_PREFIX = "FLAG_"',
      '',
      '',
      'def defaults_source() -> dict[str, object]:',
      '    return dict(DEFAULTS)',
      '',
      '',
      'def file_source(path: Path) -> dict[str, object]:',
      '    """Flags set in a JSON object file. A missing file sets nothing (not',
      '    every environment overrides anything)."""',
      '    if not path.exists():',
      '        return {}',
      '    data = json.loads(path.read_text())',
      '    if not isinstance(data, dict):',
      '        raise ValueError(f"{path}: expected a JSON object")',
      '    return {name: value for name, value in data.items() if name in DEFAULTS}',
      '',
      '',
      'def _coerce(name: str, raw: str) -> object:',
      '    """Convert an environment variable\'s text to the flag\'s type."""',
      '    flag_type = type(DEFAULTS[name])',
      '    try:',
      '        return flag_type(raw.strip())',
      '    except ValueError:',
      '        raise ValueError(',
      '            f"{ENV_PREFIX}{name.upper()}={raw!r} isn\'t a valid {flag_type.__name__}"',
      '        ) from None',
      '',
      '',
      'def env_source(environ: Mapping[str, str]) -> dict[str, object]:',
      '    """Flags set by FLAG_<NAME> variables. Variables for flags that don\'t',
      '    exist are ignored, so a stale variable can\'t break a deploy."""',
      '    values = {}',
      '    for key, raw in environ.items():',
      '        if not key.startswith(ENV_PREFIX):',
      '            continue',
      '        name = key[len(ENV_PREFIX) :].lower()',
      '        if name in DEFAULTS:',
      '            values[name] = _coerce(name, raw)',
      '    return values'
    ],
    "tests/test_checkout.py": [
      '"""Ops runbook: if the new checkout misbehaves in production, set',
      'FLAG_NEW_CHECKOUT=false on the deploy to fall back to the legacy flow."""',
      '',
      'import pytest',
      '',
      'from flags import load_flags',
      'from shop.checkout import CartTooLarge, plan_checkout',
      '',
      '',
      'def test_production_uses_the_new_checkout_by_default():',
      '    plan = plan_checkout(load_flags("production", environ={}), cart_items=3)',
      '    assert plan.flow == "v2"',
      '    assert plan.shipping_options == ("standard", "express")',
      '',
      '',
      'def test_cart_limit_comes_from_production_config():',
      '    flags = load_flags("production", environ={})',
      '    plan_checkout(flags, cart_items=100)',
      '    with pytest.raises(CartTooLarge):',
      '        plan_checkout(flags, cart_items=101)',
      '',
      '',
      '@pytest.mark.parametrize("value", ["false", "False", "0", "no", "off"])',
      'def test_kill_switch_falls_back_to_legacy_checkout(value):',
      '    flags = load_flags("production", environ={"FLAG_NEW_CHECKOUT": value})',
      '    assert plan_checkout(flags, cart_items=3).flow == "legacy"',
      '',
      '',
      'def test_express_shipping_can_be_switched_off():',
      '    flags = load_flags("production", environ={"FLAG_EXPRESS_SHIPPING": "false"})',
      '    assert plan_checkout(flags, cart_items=3).shipping_options == ("standard",)',
      '',
      '',
      'def test_garbage_kill_switch_value_is_rejected():',
      '    with pytest.raises(ValueError):',
      '        load_flags("production", environ={"FLAG_NEW_CHECKOUT": "nope"})'
    ]
  };

  var WS_FAILED_RUN = [
    ["rh-t-dim", "========================= short test summary info =========================="],
    ["rh-t-fail", "FAILED tests/test_checkout.py::test_kill_switch_falls_back_to_legacy_checkout[false]"],
    ["rh-t-fail", "FAILED tests/test_checkout.py::test_kill_switch_falls_back_to_legacy_checkout[False]"],
    ["rh-t-fail", "FAILED tests/test_checkout.py::test_kill_switch_falls_back_to_legacy_checkout[0]"],
    ["rh-t-fail", "FAILED tests/test_checkout.py::test_kill_switch_falls_back_to_legacy_checkout[no]"],
    ["rh-t-fail", "FAILED tests/test_checkout.py::test_kill_switch_falls_back_to_legacy_checkout[off]"],
    ["rh-t-fail", "FAILED tests/test_checkout.py::test_express_shipping_can_be_switched_off - As..."],
    ["rh-t-fail", "FAILED tests/test_checkout.py::test_garbage_kill_switch_value_is_rejected - F..."],
    ["rh-t-fail rh-t-bold", "7 failed, 12 passed in 0.04s"]
  ];
  var WS_PASSED_RUN = [
    ["", "...................                                                      [100%]"],
    ["rh-t-pass rh-t-bold", "19 passed in 0.03s"]
  ];

  // Typed at the end of the blank line above _coerce, onto fresh lines.
  var WS_HELPER =
    '\n\n_TRUE = {"true", "1", "yes", "on"}\n' +
    '_FALSE = {"false", "0", "no", "off"}\n' +
    '\n\n' +
    'def _parse_bool(text: str) -> bool:\n' +
    '    # bool(text) would be True for any non-empty string, "false" included.\n' +
    '    lowered = text.lower()\n' +
    '    if lowered in _TRUE:\n' +
    '        return True\n' +
    '    if lowered in _FALSE:\n' +
    '        return False\n' +
    '    raise ValueError(text)\n';

  function escapeHtml(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  // A small Python highlighter, close enough for a demo. `state.inDoc`
  // carries an open triple-quoted string from one line to the next.
  var PY_TOKENS = /(#.*$)|("""[^]*?"""|"""[^]*$|f?"(?:[^"\\]|\\.)*"?|'(?:[^'\\]|\\.)*'?)|\b(return|if|else|try|except|raise|from|import|for|continue|with|in|is|not|and|or)\b|\b(def|class|None|True|False|as)\b|\b(type|bool|str|dict|object|isinstance|len|ValueError|Path|Mapping|CartTooLarge)\b|((?:^|(?<=def ))[A-Za-z_]\w*(?=\())|(@[\w.]+)|\b(\d+)\b/g;
  var PY_CLASSES = [null, "c", "s", "k", "kw", "b", "fn", "fn", "n"];

  function highlightPy(text, state) {
    var out = "", rest = text;
    if (state.inDoc) {
      var end = text.indexOf('"""');
      if (end === -1) return '<span class="rh-py-s">' + escapeHtml(text) + "</span>";
      out = '<span class="rh-py-s">' + escapeHtml(text.slice(0, end + 3)) + "</span>";
      rest = text.slice(end + 3);
      state.inDoc = false;
    }
    var last = 0, m;
    PY_TOKENS.lastIndex = 0;
    while ((m = PY_TOKENS.exec(rest))) {
      if (m[0] === "") { PY_TOKENS.lastIndex++; continue; }
      var group = 1;
      while (m[group] === undefined) group++;
      out += escapeHtml(rest.slice(last, m.index)) +
        '<span class="rh-py-' + PY_CLASSES[group] + '">' + escapeHtml(m[0]) + "</span>";
      last = m.index + m[0].length;
      if (group === 2 && /^"""/.test(m[0]) && (m[0].length < 6 || !/"""$/.test(m[0]))) state.inDoc = true;
    }
    return out + escapeHtml(rest.slice(last));
  }

  function workspaceWalkthrough(trackEl) {
    var root = trackEl.querySelector("[data-workspace]");
    var role = function (r) { return root.querySelector('[data-role="' + r + '"]'); };
    var tabsEl = role("tabs"), linesEl = role("lines"), termEl = role("term");
    var transcriptEl = role("transcript"), waveEl = role("wave");
    var testsStatusEl = role("tests-status");
    var editorEl = linesEl.parentNode;
    var LINE_PX = 18; // .rh-vs-line height
    var t = timers(), typer = makeTyper();
    var docs, open, active, termLines;

    function doc() { return docs[active]; }

    function renderEditor() {
      editorEl.classList.toggle("is-empty", !active);
      tabsEl.innerHTML = open.map(function (path) {
        var name = path.split("/").pop();
        return '<span class="rh-vs-tab' + (path === active ? " is-active" : "") + '">' + name + "</span>";
      }).join("");
      root.querySelectorAll(".rh-vs-row[data-file]").forEach(function (row) {
        row.classList.toggle("is-active", row.dataset.file === active);
      });
      if (!active) { linesEl.innerHTML = ""; return; }
      var d = doc(), state = { inDoc: false };
      linesEl.innerHTML = d.lines.map(function (text, i) {
        return '<div class="rh-vs-line' + (i === d.hl ? " is-hl" : "") + (i === d.cursor.l ? " is-cur" : "") + '"><span class="rh-vs-ln">' + (i + 1) + '</span><span class="rh-vs-code">' + highlightPy(text, state) + "</span></div>";
      }).join("") + '<span class="rh-vs-caret" style="top:' + d.cursor.l * LINE_PX + "px;left:calc(var(--rh-vs-gutter) + " + d.cursor.c + 'ch)"></span>';
      // Keep the cursor's line in view, a few lines from either edge.
      var visible = Math.max(6, Math.floor(editorEl.clientHeight / LINE_PX));
      if (d.cursor.l < d.top + 3) d.top = Math.max(0, d.cursor.l - 3);
      if (d.cursor.l > d.top + visible - 4) d.top = d.cursor.l - visible + 4;
      linesEl.style.transform = "translateY(" + -d.top * LINE_PX + "px)";
    }

    function renderTerm() {
      termEl.innerHTML = termLines.map(function (l) {
        return '<div class="' + l[0] + '">' + l[1] + "</div>";
      }).join("");
    }

    function promptLine(cmd, typing) {
      return ["", '<span class="rh-t-prompt">feature-flag-env $</span> ' + escapeHtml(cmd) + (typing ? '<span class="rh-vs-term-caret"></span>' : "")];
    }

    /* script actions: each takes `next` and calls it when it's done */

    function openFile(path, line) {
      return function (next) {
        if (open.indexOf(path) === -1) open.push(path);
        active = path;
        var d = doc();
        d.cursor = { l: line, c: d.lines[line].search(/\S|$/) };
        d.hl = line;
        renderEditor();
        next();
      };
    }

    // Puts the cursor on the line `find` (or `lineOffset` lines from it), at
    // column `col` or its "end".
    function moveTo(find, col, lineOffset) {
      return function (next) {
        var d = doc();
        var l = d.lines.indexOf(find) + (lineOffset || 0);
        if (col === "end") col = d.lines[l].length;
        d.cursor = { l: l, c: col };
        d.hl = -1;
        renderEditor();
        next();
      };
    }

    function type(text) {
      return function (next) {
        var d = doc(), state = { i: 0 };
        d.hl = -1;
        typer.run(state, "i", text.length, true, 18, function () {
          // makeTyper advances 2 characters per tick; insert what's new.
          while (d.typed < state.i) {
            var ch = text[d.typed++], line = d.lines[d.cursor.l];
            if (ch === "\n") {
              d.lines.splice(d.cursor.l + 1, 0, line.slice(d.cursor.c));
              d.lines[d.cursor.l] = line.slice(0, d.cursor.c);
              d.cursor = { l: d.cursor.l + 1, c: 0 };
            } else {
              d.lines[d.cursor.l] = line.slice(0, d.cursor.c) + ch + line.slice(d.cursor.c);
              d.cursor.c++;
            }
          }
          renderEditor();
        }, function () { d.typed = 0; next(); });
      };
    }

    function erase(count) {
      return function (next) {
        var d = doc(), state = { n: count };
        typer.run(state, "n", 0, false, 40, function () {
          var line = d.lines[d.cursor.l], remove = (count - state.n) - (d.erased || 0);
          d.lines[d.cursor.l] = line.slice(0, d.cursor.c - remove) + line.slice(d.cursor.c);
          d.cursor.c -= remove;
          d.erased = count - state.n;
          renderEditor();
        }, function () { d.erased = 0; next(); });
      };
    }

    function runTests(output, status, statusClass) {
      return function (next) {
        var cmd = "pytest -q", state = { i: 0 };
        termLines.push(promptLine("", true));
        renderTerm();
        typer.run(state, "i", cmd.length, true, 70, function () {
          termLines[termLines.length - 1] = promptLine(cmd.slice(0, state.i), true);
          renderTerm();
        }, function () {
          termLines[termLines.length - 1] = promptLine(cmd, false);
          output.forEach(function (line, i) {
            t.set(function () {
              termLines.push([line[0], escapeHtml(line[1])]);
              renderTerm();
              if (i === output.length - 1) {
                testsStatusEl.textContent = status;
                testsStatusEl.className = "rh-vs-tests " + statusClass;
                t.set(next, 300);
              }
            }, 350 + i * 60);
          });
        });
      };
    }

    function say(who, text) {
      return function (next) {
        var msg = document.createElement("div");
        msg.className = "rh-vs-msg " + (who === "iv" ? "is-iv" : "is-you");
        msg.innerHTML = "<p>" + escapeHtml(text) + "</p>";
        transcriptEl.appendChild(msg);
        void msg.offsetWidth;
        msg.classList.add("is-in");
        var speakMs = Math.min(4200, 600 + text.length * 32);
        if (who === "iv") {
          waveEl.classList.add("is-speaking");
          t.set(function () { waveEl.classList.remove("is-speaking"); }, speakMs);
        }
        t.set(next, speakMs);
      };
    }

    function wait(ms) { return function (next) { t.set(next, ms); }; }

    var SCRIPT = [
      wait(500),
      say("iv", "Last night the checkout kill switch didn't work. On-call set FLAG_NEW_CHECKOUT=false and customers still got the new flow. The tests reproduce it. Have a look."),
      say("you", "Okay. I'll run the tests first."),
      runTests(WS_FAILED_RUN, "7 failed", "is-fail"),
      wait(500),
      openFile("tests/test_checkout.py", 25),
      wait(700),
      say("you", "Every kill switch value fails, and so does the express shipping switch. Both come in from the environment as text."),
      say("iv", "Good read. Where does that text become a boolean?"),
      wait(300),
      openFile("flags/sources.py", 39),
      wait(900),
      say("you", "Here. It calls bool(\"false\"), and any non-empty string is True. \"nope\" too."),
      moveTo("def _coerce(name: str, raw: str) -> object:", "end", -2),
      wait(300),
      type(WS_HELPER),
      wait(300),
      moveTo("    flag_type = type(DEFAULTS[name])", "end"),
      type("\n    parse = _parse_bool if flag_type is bool else flag_type"),
      wait(250),
      moveTo("        return flag_type(raw.strip())", 24),
      erase(9),
      type("parse"),
      wait(600),
      runTests(WS_PASSED_RUN, "19 passed", "is-pass"),
      wait(600),
      say("iv", "All green. Why does the fix parse the text instead of just checking for \"false\"?"),
      say("you", "So \"0\", \"no\" and \"off\" work too, and anything unknown fails loudly instead of turning the flag on."),
      say("iv", "This failed during a real incident. What would you change beyond the fix?")
    ];

    function reset() {
      t.clearAll(); typer.stop();
      docs = {};
      Object.keys(WS_FILES).forEach(function (path) {
        docs[path] = { lines: WS_FILES[path].slice(), cursor: { l: 0, c: 0 }, top: 0, hl: -1, typed: 0, erased: 0 };
      });
      open = []; active = null; termLines = [];
      transcriptEl.innerHTML = "";
      waveEl.classList.remove("is-speaking");
      testsStatusEl.textContent = ""; testsStatusEl.className = "rh-vs-tests";
      renderEditor(); renderTerm();
    }

    function play() {
      reset();
      var i = 0;
      (function next() { if (i < SCRIPT.length) SCRIPT[i++](next); })();
    }

    var started = false;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !started) { started = true; play(); }
      });
    }, { rootMargin: "0px 0px -35% 0px", threshold: 0 });

    trackEl.querySelector(".rh-replay").addEventListener("click", function () { started = true; play(); });
    reset();

    return {
      start: function () { io.disconnect(); reset(); started = false; io.observe(root); },
      stop: function () { io.disconnect(); reset(); }
    };
  }

  // The three-stage walkthrough (setup, live session, summary) used by the
  // Algorithmic track.
  function howWalkthrough(grid, liveSession) {
    var stageEls = [1, 2, 3].map(function (n) { return grid.querySelector('[data-stage="' + n + '"]'); });
    var arrowEls = [1, 2].map(function (n) { return grid.querySelector('[data-arrow="' + n + '"]'); });
    var t = timers();
    var live = liveSession(stageEls[1]);

    /* stage 1: set up the session */
    var addStageEl = stageEls[0].querySelector('[data-flash="adding"]');
    var reveal2 = stageEls[0].querySelector('[data-reveal="stage2"]');
    var reveal3 = stageEls[0].querySelector('[data-reveal="stage3"]');
    var t1 = timers();

    function runSetup(cb) {
      t1.clearAll();
      reveal2.classList.remove("is-visible");
      reveal3.classList.remove("is-visible");
      addStageEl.classList.remove("is-flashing");
      t1.set(function () { addStageEl.classList.add("is-flashing"); }, 300);
      t1.set(function () { reveal2.classList.add("is-visible"); addStageEl.classList.remove("is-flashing"); }, 650);
      t1.set(function () { addStageEl.classList.add("is-flashing"); }, 1400);
      t1.set(function () { reveal3.classList.add("is-visible"); addStageEl.classList.remove("is-flashing"); }, 1750);
      t1.set(function () { cb && cb(); }, 2200);
    }

    /* stage 3: get the summary */
    var sumEls = [1, 2, 3, 4, 5].map(function (n) { return stageEls[2].querySelector('[data-reveal="sum' + n + '"]'); });
    var radarFillEl = stageEls[2].querySelector("[data-radar-fill]");
    var t3 = timers();

    function runSummary() {
      t3.clearAll();
      sumEls.forEach(function (e) { e.classList.remove("is-visible"); });
      radarFillEl.classList.remove("is-grown");
      sumEls.forEach(function (e, i) { t3.set(function () { e.classList.add("is-visible"); }, 200 + 400 * i); });
      t3.set(function () { radarFillEl.classList.add("is-grown"); }, 2100);
    }

    function pulseArrow(el, cb) {
      el.classList.add("is-active");
      t.set(function () { el.classList.remove("is-active"); cb && cb(); }, 700);
    }

    /* scroll gating: stage 2 waits on stage 1 done, stage 3 on stage 2 done */
    var done1, done2, started1, started2, started3;

    function inView(el) {
      var rect = el.getBoundingClientRect();
      var vh = window.innerHeight || document.documentElement.clientHeight;
      return rect.top < vh * 0.7 && rect.bottom > 0;
    }

    function maybeStart2() {
      if (started2 || !done1 || !inView(stageEls[1])) return;
      started2 = true;
      live.run(function () { pulseArrow(arrowEls[1], function () { done2 = true; maybeStart3(); }); });
    }

    function maybeStart3() {
      if (started3 || !done2 || !inView(stageEls[2])) return;
      started3 = true;
      runSummary();
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        if (entry.target === stageEls[0] && !started1) {
          started1 = true;
          runSetup(function () { pulseArrow(arrowEls[0], function () { done1 = true; maybeStart2(); }); });
        }
        if (entry.target === stageEls[1]) maybeStart2();
        if (entry.target === stageEls[2]) maybeStart3();
      });
    }, { rootMargin: "0px 0px -30% 0px", threshold: 0 });

    grid.querySelectorAll(".rh-replay").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var stage = btn.dataset.replay;
        if (stage === "1") runSetup(function () {});
        if (stage === "2") live.run(function () {});
        if (stage === "3") runSummary();
      });
    });

    function stop() {
      io.disconnect();
      t.clearAll(); t1.clearAll(); t3.clearAll(); live.reset();
      arrowEls.forEach(function (a) { a.classList.remove("is-active"); });
    }

    return {
      // Starts the walkthrough over: from stage 1, as each stage scrolls in.
      start: function () {
        stop();
        done1 = done2 = started1 = started2 = started3 = false;
        stageEls.forEach(function (s) { io.observe(s); });
      },
      stop: stop
    };
  }

  var TRACK_WALKTHROUGHS = {
    algorithmic: function (el) { return howWalkthrough(el.querySelector(".rh-how-grid"), algorithmicLiveSession); },
    engineering: workspaceWalkthrough
  };
  var howTracks = document.querySelectorAll(".rh-how-track[data-track]");
  var howTabs = document.getElementById("howTracks");
  if (howTracks.length) {
    var walkthroughs = {};
    howTracks.forEach(function (el) { walkthroughs[el.dataset.track] = TRACK_WALKTHROUGHS[el.dataset.track](el); });
    var visibleTrack = Array.prototype.find.call(howTracks, function (el) { return !el.hidden; });
    walkthroughs[visibleTrack.dataset.track].start();

    if (howTabs) {
      howTabs.querySelectorAll(".rh-tab").forEach(function (tab) {
        tab.addEventListener("click", function () {
          var track = tab.dataset.track;
          howTabs.querySelectorAll(".rh-tab").forEach(function (other) {
            var on = other === tab;
            other.classList.toggle("is-active", on);
            other.setAttribute("aria-selected", on ? "true" : "false");
          });
          howTracks.forEach(function (el) {
            var show = el.dataset.track === track;
            if (!show && !el.hidden) walkthroughs[el.dataset.track].stop();
            el.hidden = !show;
          });
          walkthroughs[track].start();
        });
      });
    }
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
