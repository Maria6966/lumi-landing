(function () {
  "use strict";

  document.documentElement.classList.add("js");

  var header = document.querySelector("[data-header]");
  var nav = document.getElementById("site-nav");
  var toggle = document.querySelector(".nav-toggle");
  var toggleLabel = document.querySelector(".nav-toggle__label");
  var main = document.getElementById("main");
  var footer = document.querySelector(".site-footer");
  var mobileQuery = window.matchMedia("(max-width: 959px)");

  function setHeaderHeight() {
    if (!header) {
      return;
    }
    document.documentElement.style.setProperty("--header-height", header.offsetHeight + "px");
  }

  function isMobileNav() {
    return mobileQuery.matches;
  }

  function focusableItems(container) {
    return Array.prototype.filter.call(
      container.querySelectorAll("a[href], button:not([disabled]), input, select, textarea, [tabindex]"),
      function (element) {
        return element.getClientRects().length > 0;
      }
    );
  }

  function setBackgroundInert(isInert) {
    [main, footer].forEach(function (element) {
      if (!element) {
        return;
      }
      if (isInert) {
        element.setAttribute("inert", "");
      } else {
        element.removeAttribute("inert");
      }
    });
  }

  function setMenuState(isOpen) {
    if (!nav || !toggle) {
      return;
    }

    var mobile = isMobileNav();
    if (!mobile) {
      nav.classList.remove("is-open");
      document.body.classList.remove("nav-open");
      nav.removeAttribute("inert");
      nav.removeAttribute("aria-hidden");
      setBackgroundInert(false);
      toggle.setAttribute("aria-expanded", "false");
      if (toggleLabel) {
        toggleLabel.textContent = "Открыть меню";
      }
      return;
    }

    nav.classList.toggle("is-open", isOpen);
    document.body.classList.toggle("nav-open", isOpen);
    setBackgroundInert(isOpen);
    toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    if (toggleLabel) {
      toggleLabel.textContent = isOpen ? "Закрыть меню" : "Открыть меню";
    }

    if (isOpen) {
      nav.removeAttribute("inert");
      nav.removeAttribute("aria-hidden");
    } else {
      nav.setAttribute("inert", "");
      nav.setAttribute("aria-hidden", "true");
    }
  }

  function openMenu() {
    setMenuState(true);
    var items = focusableItems(nav);
    if (items[0]) {
      items[0].focus();
    }
  }

  function closeMenu(restoreFocus) {
    var wasOpen = nav.classList.contains("is-open");
    setMenuState(false);
    if (restoreFocus && wasOpen && toggle) {
      toggle.focus();
    }
  }

  function onToggle() {
    if (nav.classList.contains("is-open")) {
      closeMenu(true);
    } else {
      openMenu();
    }
  }

  function markCurrentSection() {
    var links = Array.prototype.slice.call(nav.querySelectorAll('a[href^="#"]'));
    var sections = links.map(function (link) {
      return document.querySelector(link.getAttribute("href"));
    });

    links.forEach(function (link) {
      link.removeAttribute("aria-current");
    });

    var marker = window.scrollY + header.offsetHeight + 24;
    var currentIndex = -1;
    sections.forEach(function (section, index) {
      if (section && section.offsetTop <= marker) {
        currentIndex = index;
      }
    });

    if (currentIndex >= 0) {
      links[currentIndex].setAttribute("aria-current", "true");
    }
  }

  function revealOnScroll() {
    var items = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      items.forEach(function (item) {
        item.classList.add("is-visible");
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) {
            return;
          }
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -8% 0px" }
    );

    items.forEach(function (item) {
      observer.observe(item);
    });
  }

  setHeaderHeight();
  setMenuState(false);
  revealOnScroll();
  markCurrentSection();

  window.addEventListener("resize", function () {
    setHeaderHeight();
    if (!isMobileNav()) {
      closeMenu(false);
    } else {
      setMenuState(nav.classList.contains("is-open"));
    }
  });

  window.addEventListener("scroll", function () {
    header.classList.toggle("is-scrolled", window.scrollY > 8);
    markCurrentSection();
  }, { passive: true });

  if (typeof mobileQuery.addEventListener === "function") {
    mobileQuery.addEventListener("change", function () {
      setHeaderHeight();
      closeMenu(false);
    });
  }

  toggle.addEventListener("click", onToggle);

  nav.addEventListener("click", function (event) {
    var link = event.target.closest("a");
    if (link && isMobileNav()) {
      closeMenu(false);
    }
  });

  document.addEventListener("keydown", function (event) {
    if (!isMobileNav() || !nav.classList.contains("is-open")) {
      return;
    }

    if (event.key === "Escape") {
      closeMenu(true);
      return;
    }

    if (event.key !== "Tab") {
      return;
    }

    var items = [toggle].concat(focusableItems(nav));
    if (!items.length) {
      return;
    }

    var first = items[0];
    var last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  document.addEventListener("click", function (event) {
    if (!nav.classList.contains("is-open")) {
      return;
    }
    if (nav.contains(event.target) || toggle.contains(event.target)) {
      return;
    }
    closeMenu(false);
  });
})();
