// script.js
//initCustomCursor();
const navbarInner = document.querySelector(".navbar-inner");
const indicator = document.querySelector(".nav-indicator");
const links = Array.from(document.querySelectorAll(".nav-link"));

// // --- Custom Cursor ---
// function initCustomCursor() {
//     const cursor = document.getElementById('customCursor');
//     document.addEventListener('mousemove', e => {
//       cursor.style.left = `${e.clientX}px`;
//       cursor.style.top  = `${e.clientY}px`;
//     });
//   }

// Map links to their sections
const sections = links
  .map((link) => {
    const id = link.getAttribute("href");
    const section = document.querySelector(id);
    return section ? { link, section } : null;
  })
  .filter(Boolean);

function moveIndicatorTo(element) {
  const linkRect = element.getBoundingClientRect();
  const navRect = navbarInner.getBoundingClientRect();

  const left = linkRect.left - navRect.left;

  indicator.style.width = `${linkRect.width}px`;
  indicator.style.transform = `translateX(${left}px)`;
  indicator.style.opacity = 1;
}

function setActiveLink(targetLink) {
  links.forEach((link) => link.classList.remove("active"));
  targetLink.classList.add("active");
  moveIndicatorTo(targetLink);
}

// On click: scroll + move pill
links.forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const href = link.getAttribute("href");
    const section = document.querySelector(href);

    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    setActiveLink(link);
  });
});

// Scroll spy with IntersectionObserver
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const match = sections.find((s) => s.section === entry.target);
        if (match) {
          setActiveLink(match.link);
        }
      }
    });
  },
  {
    threshold: 0.6, // section is "active" when ~60% in view
  }
);

// Observe each section
sections.forEach(({ section }) => observer.observe(section));

// Position pill initially (on first active link)
window.addEventListener("load", () => {
  const active = document.querySelector(".nav-link.active") || links[0];
  if (active) moveIndicatorTo(active);
});

// If window resizes, recalc pill position
window.addEventListener("resize", () => {
  const active = document.querySelector(".nav-link.active");
  if (active) moveIndicatorTo(active);
});
