// script.js
//initCustomCursor();
const navbar = document.querySelector(".navbar");
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
      updateNavbarAppearance(section);
    }

    setActiveLink(link);
  });
});

// Function to update navbar appearance based on section background
function updateNavbarAppearance(activeSection) {
  // Check if the section is the hero section or board section (dark background)
  const isHeroSection = activeSection.classList.contains('hero-section');
  const isBoardSection = activeSection.id === 'board';
  
  if (isHeroSection || isBoardSection) {
    // Light navbar for dark background
    navbar.classList.remove('dark');
  } else {
    // Dark navbar for bright backgrounds
    navbar.classList.add('dark');
  }
}

// Scroll spy with IntersectionObserver
const observer = new IntersectionObserver(
  (entries) => {
    // Find the section with the highest intersection ratio
    let maxRatio = 0;
    let activeEntry = null;

    entries.forEach((entry) => {
      if (entry.isIntersecting && entry.intersectionRatio > maxRatio) {
        maxRatio = entry.intersectionRatio;
        activeEntry = entry;
      }
    });

    // If we found an active section, update the navbar
    if (activeEntry && maxRatio > 0.1) {
      const match = sections.find((s) => s.section === activeEntry.target);
      if (match) {
        setActiveLink(match.link);
        updateNavbarAppearance(activeEntry.target);
      }
    }
  },
  {
    threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0], // Multiple thresholds for better detection
    rootMargin: '-10% 0px -10% 0px', // Trigger when section is in the middle portion of viewport
  }
);

// Observe each section
sections.forEach(({ section }) => observer.observe(section));

// Fallback scroll handler for better detection
let scrollTimeout;
window.addEventListener('scroll', () => {
  clearTimeout(scrollTimeout);
  scrollTimeout = setTimeout(() => {
    // Find which section is most visible in viewport
    let maxVisible = 0;
    let activeSection = null;

    sections.forEach(({ section }) => {
      const rect = section.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      
      // Calculate how much of the section is visible
      const visibleTop = Math.max(0, -rect.top);
      const visibleBottom = Math.min(rect.height, viewportHeight - rect.top);
      const visibleHeight = Math.max(0, visibleBottom - visibleTop);
      const visibleRatio = visibleHeight / Math.min(rect.height, viewportHeight);

      // Section is considered active if it's in the viewport and has good visibility
      if (rect.top < viewportHeight * 0.5 && rect.bottom > viewportHeight * 0.3) {
        if (visibleRatio > maxVisible) {
          maxVisible = visibleRatio;
          activeSection = section;
        }
      }
    });

    if (activeSection && maxVisible > 0.2) {
      const match = sections.find((s) => s.section === activeSection);
      if (match) {
        setActiveLink(match.link);
        updateNavbarAppearance(activeSection);
      }
    }
  }, 10);
});

// Timeline initialization - sort events by date and assign alternating sides
function initializeTimeline() {
  const timelineEvents = document.querySelectorAll('.timeline-event');
  const eventsArray = Array.from(timelineEvents);
  
  if (eventsArray.length === 0) return;
  
  // Sort events by date (most recent first)
  eventsArray.sort((a, b) => {
    const dateA = new Date(a.querySelector('.event-date').textContent);
    const dateB = new Date(b.querySelector('.event-date').textContent);
    return dateB - dateA; // Most recent first
  });
  
  // Reorder in DOM and assign alternating sides
  const timelineContainer = document.querySelector('.timeline-events');
  eventsArray.forEach((event, index) => {
    // Remove from current position
    event.remove();
    // Assign side (alternating: left, right, left, right...)
    event.setAttribute('data-side', index % 2 === 0 ? 'left' : 'right');
    // Append back in sorted order
    timelineContainer.appendChild(event);
  });
}

// Position pill initially (on first active link)
window.addEventListener("load", () => {
  const active = document.querySelector(".nav-link.active") || links[0];
  if (active) moveIndicatorTo(active);
  
  // Set initial navbar appearance based on first section
  const firstSection = sections[0]?.section;
  if (firstSection) {
    updateNavbarAppearance(firstSection);
  }
  
  // Initialize timeline
  initializeTimeline();
  
  // Handle default profile pictures for missing images
  const memberImages = document.querySelectorAll('.member-image');
  memberImages.forEach(img => {
    if (!img.src || img.src === '' || img.src === window.location.href) {
      // Image is empty, show default
      img.classList.add('no-image');
    } else {
      // Image exists, try to load it
      img.addEventListener('load', function() {
        this.classList.add('loaded');
      });
      img.addEventListener('error', function() {
        // Image failed to load, show default
        this.classList.add('no-image');
      });
      // If image is already loaded
      if (img.complete && img.naturalHeight !== 0) {
        img.classList.add('loaded');
      }
    }
  });
});

// If window resizes, recalc pill position
window.addEventListener("resize", () => {
  const active = document.querySelector(".nav-link.active");
  if (active) moveIndicatorTo(active);
});

// Smooth scroll snapping when 10% of next section is visible
let isSectionScrolling = false;
let lastScrollTop = 0;
let scrollDirection = 0; // 1 = down, -1 = up, 0 = unknown

window.addEventListener('scroll', () => {
  if (isSectionScrolling) return;
  
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const viewportHeight = window.innerHeight;
  const scrollDelta = scrollTop - lastScrollTop;
  
  // Determine scroll direction
  if (Math.abs(scrollDelta) > 1) {
    scrollDirection = scrollDelta > 0 ? 1 : -1;
  }
  lastScrollTop = scrollTop;
  
  // Check each section to see if 10% is visible
  sections.forEach(({ section }) => {
    const rect = section.getBoundingClientRect();
    const sectionHeight = section.offsetHeight;
    const visibleThreshold = sectionHeight * 0.1; // 10% of section
    
    // Check if scrolling down and 10% of section is visible from bottom
    if (scrollDirection === 1 && rect.top < viewportHeight && rect.top > viewportHeight - visibleThreshold) {
      // Next section is coming into view from bottom
      if (!isSectionScrolling) {
        isSectionScrolling = true;
        section.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
        setTimeout(() => {
          isSectionScrolling = false;
        }, 1000);
      }
    }
    
    // Check if scrolling up and 10% of section is visible from top
    if (scrollDirection === -1 && rect.bottom > 0 && rect.bottom < visibleThreshold) {
      // Previous section is coming into view from top
      if (!isSectionScrolling) {
        isSectionScrolling = true;
        section.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
        setTimeout(() => {
          isSectionScrolling = false;
        }, 1000);
      }
    }
  });
});