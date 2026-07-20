/* Five Year Anniversary - Tokyo — interactions. No dependencies. */
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

  /* ---- Tap-to-zoom lightbox for flagged photos --------------------------- */
  var zoomables = document.querySelectorAll("img[data-zoom]");
  if (zoomables.length) {
    var lightbox = document.createElement("div");
    lightbox.className = "lightbox";
    lightbox.setAttribute("role", "dialog");
    lightbox.setAttribute("aria-modal", "true");
    lightbox.setAttribute("aria-hidden", "true");
    lightbox.innerHTML =
      '<button class="lightbox__close" type="button" aria-label="Close zoomed photo">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>' +
      "</button>" +
      '<img class="lightbox__img" src="" alt="">' +
      '<span class="lightbox__hint">Tap anywhere to close</span>';
    document.body.appendChild(lightbox);

    var lightboxImg = lightbox.querySelector(".lightbox__img");
    var lightboxClose = lightbox.querySelector(".lightbox__close");
    var lastFocused = null;
    var lockedScrollY = 0;

    // iOS Safari mispositions position:fixed overlays if the page is simply
    // frozen with overflow:hidden while scrolled — pin the body in place at
    // its current scroll offset instead, then restore it on close.
    function lockScroll() {
      lockedScrollY = window.scrollY || window.pageYOffset || 0;
      document.body.style.top = "-" + lockedScrollY + "px";
      document.documentElement.classList.add("lightbox-locked");
    }
    function unlockScroll() {
      document.documentElement.classList.remove("lightbox-locked");
      document.body.style.top = "";
      window.scrollTo(0, lockedScrollY);
    }

    function openLightbox(img) {
      lastFocused = document.activeElement;
      lightboxImg.src = img.currentSrc || img.src;
      lightboxImg.alt = img.getAttribute("alt") || "";
      lightbox.classList.add("is-open");
      lightbox.setAttribute("aria-hidden", "false");
      lockScroll();
      lightboxClose.focus();
    }
    function closeLightbox() {
      lightbox.classList.remove("is-open");
      lightbox.setAttribute("aria-hidden", "true");
      unlockScroll();
      lightboxImg.src = "";
      if (lastFocused && lastFocused.focus) lastFocused.focus();
    }

    zoomables.forEach(function (img) {
      img.setAttribute("tabindex", "0");
      img.setAttribute("role", "button");
      img.setAttribute("aria-label", (img.getAttribute("alt") || "Photo") + " — tap to zoom in");
      img.addEventListener("click", function () { openLightbox(img); });
      img.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openLightbox(img);
        }
      });
    });
    lightbox.addEventListener("click", closeLightbox);
    lightboxClose.addEventListener("click", function (e) {
      e.stopPropagation();
      closeLightbox();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && lightbox.classList.contains("is-open")) closeLightbox();
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
