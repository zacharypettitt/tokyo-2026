/* Our Tokyo — interactions. No dependencies. */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Mobile nav toggle ------------------------------------------------ */
  var toggle = document.querySelector(".nav__toggle");
  var links = document.getElementById("nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    // Close the menu when a link is chosen (mobile).
    links.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        links.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
    // Close on Escape.
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && links.classList.contains("is-open")) {
        links.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.focus();
      }
    });
  }

  /* ---- Reveal on scroll ------------------------------------------------- */
  var revealables = document.querySelectorAll(".reveal");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealables.forEach(function (el) { el.classList.add("is-in"); });
  } else {
    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          obs.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    revealables.forEach(function (el) { io.observe(el); });
  }

  /* ---- Neighborhood filter chips (Sights / Food) ------------------------ */
  var filterGroup = document.querySelector("[data-filter-group]");
  if (filterGroup) {
    var chips = filterGroup.querySelectorAll(".chip");
    var cards = document.querySelectorAll("[data-card]");
    function applyFilter(value) {
      cards.forEach(function (card) {
        var tags = (card.getAttribute("data-tags") || "").split(" ");
        var show = value === "all" || tags.indexOf(value) !== -1;
        card.classList.toggle("is-hidden", !show);
      });
    }
    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        chips.forEach(function (c) { c.setAttribute("aria-pressed", "false"); });
        chip.setAttribute("aria-pressed", "true");
        applyFilter(chip.getAttribute("data-filter"));
      });
    });
  }

  /* ---- Timeline <details>: open on desktop, closed on mobile ------------ */
  var timelineDetails = document.querySelectorAll("details[data-day]");
  if (timelineDetails.length) {
    var mq = window.matchMedia("(min-width: 721px)");
    function syncDetails(e) {
      timelineDetails.forEach(function (d) { d.open = e.matches; });
    }
    // Only auto-toggle on breakpoint crossings, so a user's manual open/close
    // within a breakpoint is preserved.
    syncDetails(mq);
    if (mq.addEventListener) mq.addEventListener("change", syncDetails);
    else if (mq.addListener) mq.addListener(syncDetails);
  }
})();
