/* ============================================================
   OSN MEMBER PORTAL — STOPGAP WEBSITE
   main.js
   ============================================================ */

(function () {
  "use strict";

  /* ── GOOGLE FORM URLS ────────────────────────────────────── */
  const FORMS = {
    newMember: "https://forms.gle/XzCTD5pgWdmZHg2PA",
    payDues: "https://forms.gle/XzCTD5pgWdmZHg2PA",
    conference: "https://forms.gle/mLz4ipEcmgfRmJFL8",
  };

  /* ── DUES RATE ENGINE ────────────────────────────────────── */
  const DUES = {
    consultant: { early: 80000, late: 100000 },
    associate: { early: 40000, late: 50000 },
  };

  const NOW = new Date();
  const YEAR = NOW.getFullYear();
  const JUNE_30 = new Date(YEAR, 5, 30, 23, 59, 59);

  function getCurrentRate(type) {
    const tiers = DUES[type] || DUES.consultant;
    if (NOW <= JUNE_30)
      return {
        amount: tiers.early,
        label: "Early rate",
        period: `Valid until JUNE 30 ${YEAR}`,
        tier: "early",
      };
    return {
      amount: tiers.late,
      label: "Late rate",
      period: `From JULY 1 ${YEAR}`,
      tier: "late",
    };
  }

  function fmtNGN(n) {
    return "₦" + Number(n).toLocaleString("en-NG");
  }

  /* ── RENDER LIVE RATES INTO HERO CARD ───────────────────── */
  function renderHeroRates() {
    const conRate = getCurrentRate("consultant");
    const assRate = getCurrentRate("associate");
    const el = document.getElementById("hero-rate-info");
    if (!el) return;

    el.innerHTML = `
      <div class="hero-rate-row">
        <span class="hero-rate-label">Consultant / Diplomate</span>
        <span class="hero-rate-amount">${fmtNGN(conRate.amount)}/yr</span>
      </div>
      <div class="hero-rate-row">
        <span class="hero-rate-label">Associate Member</span>
        <span class="hero-rate-amount">${fmtNGN(assRate.amount)}/yr</span>
      </div>
      <div class="hero-rate-tier hero-rate-tier--${conRate.tier}">
        ${conRate.label} — ${conRate.period}
      </div>`;
  }

  /* ── CONFERENCE COUNTDOWN ───────────────────────────────── */
  const CONF_TARGET = new Date("2026-09-02T00:00:00"); // ASO 2026 Abuja — update date when confirmed

  function updateCountdown() {
    const now = new Date();
    const diff = CONF_TARGET - now;
    const ids = ["cd-days", "cd-hours", "cd-mins", "cd-secs"];

    if (diff <= 0) {
      ids.forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.textContent = "00";
      });
      return;
    }

    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    const secs = Math.floor((diff % 60000) / 1000);

    const vals = [days, hours, mins, secs];
    ids.forEach((id, i) => {
      const el = document.getElementById(id);
      if (el) el.textContent = String(vals[i]).padStart(2, "0");
    });
  }

  /* ── OPEN FORM HANDLER ──────────────────────────────────── */
  function openForm(type) {
    const url = FORMS[type];
    if (!url) return;

    // Brief confirmatory animation on the clicked card
    const card = document.querySelector(`[data-action="${type}"]`);
    if (card) {
      card.style.transform = "scale(0.98)";
      setTimeout(() => {
        card.style.transform = "";
      }, 180);
    }

    // Open Google Form in a new tab
    window.open(url, "_blank", "noopener,noreferrer");
  }

  // Expose globally so inline onclick attributes can call it
  window.openForm = openForm;

  /* ── MODAL HELPERS ──────────────────────────────────────── */
  function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
      modal.classList.add("open");
      document.body.style.overflow = "hidden";
    }
  }

  function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
      modal.classList.remove("open");
      document.body.style.overflow = "";
    }
  }

  window.openModal = openModal;
  window.closeModal = closeModal;

  // Close modal when clicking the backdrop
  document.querySelectorAll(".modal-overlay").forEach((overlay) => {
    overlay.addEventListener("click", function (e) {
      if (e.target === this) closeModal(this.id);
    });
  });

  // Close modal on Escape key
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      document.querySelectorAll(".modal-overlay.open").forEach((m) => {
        closeModal(m.id);
      });
    }
  });

  /* ── SMOOTH SCROLL FOR ANCHOR LINKS ────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  /* ── SCROLL-TO-TOP BUTTON ───────────────────────────────── */
  const scrollBtn = document.getElementById("scroll-top");
  if (scrollBtn) {
    window.addEventListener(
      "scroll",
      function () {
        if (window.scrollY > 400) {
          scrollBtn.classList.add("visible");
        } else {
          scrollBtn.classList.remove("visible");
        }
      },
      { passive: true },
    );

    scrollBtn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ── SCROLL REVEAL (lightweight) ───────────────────────── */
  const revealEls = document.querySelectorAll("[data-reveal]");

  if ("IntersectionObserver" in window && revealEls.length) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );

    revealEls.forEach((el) => {
      el.style.opacity = "0";
      el.style.transform = "translateY(22px)";
      el.style.transition = "opacity .5s ease, transform .5s ease";
      revealObserver.observe(el);
    });

    document.addEventListener("DOMContentLoaded", () => {
      // Add class toggle for revealed state
      const style = document.createElement("style");
      style.textContent =
        ".revealed { opacity: 1 !important; transform: translateY(0) !important; }";
      document.head.appendChild(style);
    });
  }

  /* ── CURRENT YEAR IN FOOTER ─────────────────────────────── */
  const yearEl = document.getElementById("footer-year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ── INIT ───────────────────────────────────────────────── */
  function init() {
    renderHeroRates();
    updateCountdown();
    setInterval(updateCountdown, 1000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
