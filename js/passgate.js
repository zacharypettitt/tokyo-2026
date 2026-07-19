(function () {
  var STORAGE_KEY = "tokyo2026_unlocked";
  var HASH = "616b4f88764930c69f443aa2b496438b198504f777c53ec29ef8c6e1886efdc9";

  function sha256Hex(str) {
    var enc = new TextEncoder().encode(str);
    return crypto.subtle.digest("SHA-256", enc).then(function (buf) {
      return Array.prototype.map
        .call(new Uint8Array(buf), function (b) {
          return b.toString(16).padStart(2, "0");
        })
        .join("");
    });
  }

  try {
    if (localStorage.getItem(STORAGE_KEY) === HASH) {
      return;
    }
  } catch (e) {}

  var style = document.createElement("style");
  style.textContent =
    "#pg-overlay{position:fixed;inset:0;z-index:99999;background:#111319;" +
    "display:flex;align-items:center;justify-content:center;font-family:system-ui,-apple-system,sans-serif;}" +
    "#pg-overlay .pg-box{background:#fff;padding:2rem 2.25rem;border-radius:12px;max-width:320px;" +
    "width:90%;text-align:center;box-shadow:0 10px 40px rgba(0,0,0,.35);}" +
    "#pg-overlay .pg-title{font-size:1.15rem;font-weight:700;margin:0 0 .25rem;color:#111}" +
    "#pg-overlay .pg-sub{font-size:.85rem;color:#666;margin:0 0 1.25rem}" +
    "#pg-overlay input{width:100%;box-sizing:border-box;padding:.6rem .75rem;font-size:1rem;" +
    "border:1px solid #ccc;border-radius:8px;margin-bottom:.75rem;}" +
    "#pg-overlay button{width:100%;padding:.6rem .75rem;font-size:1rem;border:none;border-radius:8px;" +
    "background:#C73E3A;color:#fff;font-weight:600;cursor:pointer;}" +
    "#pg-overlay button:hover{background:#A6302C}" +
    "#pg-overlay .pg-error{color:#C73E3A;font-size:.8rem;margin:.75rem 0 0}" +
    "html.pg-locked, html.pg-locked body{overflow:hidden;height:100%;}";
  document.head.appendChild(style);
  document.documentElement.classList.add("pg-locked");

  var overlay = document.createElement("div");
  overlay.id = "pg-overlay";
  overlay.innerHTML =
    '<div class="pg-box">' +
    '<p class="pg-title">Our Tokyo 2026</p>' +
    '<p class="pg-sub">Enter the passcode to continue</p>' +
    '<form id="pg-form" autocomplete="off">' +
    '<input type="password" id="pg-input" placeholder="Passcode" autofocus />' +
    '<button type="submit">Enter</button>' +
    "</form>" +
    '<p class="pg-error" id="pg-error" style="display:none">Incorrect passcode</p>' +
    "</div>";
  document.body.appendChild(overlay);

  document.getElementById("pg-form").addEventListener("submit", function (e) {
    e.preventDefault();
    var input = document.getElementById("pg-input");
    sha256Hex(input.value).then(function (hex) {
      if (hex === HASH) {
        try {
          localStorage.setItem(STORAGE_KEY, HASH);
        } catch (e) {}
        document.documentElement.classList.remove("pg-locked");
        overlay.remove();
        style.remove();
      } else {
        document.getElementById("pg-error").style.display = "block";
        input.value = "";
        input.focus();
      }
    });
  });
})();
