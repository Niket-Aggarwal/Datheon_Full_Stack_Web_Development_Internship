const root = document.documentElement;
const themeToggle = document.getElementById("themeToggle");
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");
const projectModal = document.getElementById("projectModal");
const modalClose = document.getElementById("modalClose");

const projects = {
  mynexlink: {
    type: "WEB APP · 2026",
    title: "Mynexlink",
    description:
      "A digital identity platform that brings all your important links together in one place. Create a personalized public NexLink profile and share a single URL as your digital visiting card.",
    stack: ["React", "TAILWIND", "NODE.JS", "EXPRESS.JS", "MONGODB"],
    url: "https://github.com/Niket-Aggarwal"
  },
  pulseops: {
    type: "WEB APP · 2026",
    title: "PulseOps",
    description:
      "A digital identity platform that brings all your important links together in one place. Create a personalized public NexLink profile and share a single URL as your digital visiting card.",
    stack: ["React", "TAILWIND", "NODE.JS", "EXPRESS.JS", "MONGODB"],
    url: "https://github.com/Niket-Aggarwal"
  }
};

projects.orbit = projects.mynexlink;

function setTheme(theme) {
  root.dataset.theme = theme;
  const next = theme === "dark" ? "light" : "dark";

  if (themeToggle) {
    themeToggle.setAttribute("aria-label", `Switch to ${next} theme`);
    themeToggle.title = `Switch to ${next} theme`;
  }

  try {
    localStorage.setItem("portfolio-theme", theme);
  } catch (error) {

  }
}

try {
  const savedTheme = localStorage.getItem("portfolio-theme");
  if (savedTheme === "light" || savedTheme === "dark") {
    setTheme(savedTheme);
  }
} catch (error) { }

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    setTheme(root.dataset.theme === "dark" ? "light" : "dark");
  });
}

function closeMenu() {
  if (!navLinks || !menuToggle) return;
  navLinks.classList.remove("is-open");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Open navigation menu");
}

if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";

    menuToggle.setAttribute("aria-expanded", String(!isOpen));
    menuToggle.setAttribute(
      "aria-label",
      isOpen ? "Open navigation menu" : "Close navigation menu"
    );

    navLinks.classList.toggle("is-open", !isOpen);
  });

  navLinks.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", closeMenu);
  });
}

document.addEventListener("click", event => {
  if (
    navLinks &&
    menuToggle &&
    navLinks.classList.contains("is-open") &&
    !navLinks.contains(event.target) &&
    !menuToggle.contains(event.target)
  ) {
    closeMenu();
  }
});

function closeModal() {
  if (projectModal) {
    if (typeof projectModal.close === "function" && projectModal.open) {
      projectModal.close();
    } else {
      projectModal.removeAttribute("open");
    }
  }
  document.body.classList.remove("modal-open");
}

if (modalClose) {
  modalClose.addEventListener("click", closeModal);
}

if (projectModal) {
  projectModal.addEventListener("click", event => {
    if (event.target === projectModal) {
      closeModal();
    }
  });

  projectModal.addEventListener("close", () => {
    document.body.classList.remove("modal-open");
  });
}

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    closeMenu();
    closeModal();
  }
});

function openProjectModal(project) {
  if (!project || !projectModal) return;

  const modalType = document.getElementById("modalType");
  const modalTitle = document.getElementById("modalTitle");
  const modalDescription = document.getElementById("modalDescription");
  const modalStack = document.getElementById("modalStack");
  const modalLink = document.getElementById("modalLink");

  if (modalType) modalType.textContent = project.type || "PROJECT DETAILS";
  if (modalTitle) modalTitle.textContent = project.title || "";
  if (modalDescription) modalDescription.textContent = project.description || "";

  if (modalStack && Array.isArray(project.stack)) {
    modalStack.replaceChildren(
      ...project.stack.map(item => {
        const tag = document.createElement("span");
        tag.textContent = item;
        return tag;
      })
    );
  }

  if (modalLink && project.url) {
    modalLink.href = project.url;
  }

  document.body.classList.add("modal-open");

  if (typeof projectModal.showModal === "function") {
    projectModal.showModal();
  } else {
    projectModal.setAttribute("open", "");
  }
}

document.querySelectorAll("[data-project]").forEach(button => {
  button.addEventListener("click", e => {
    e.stopPropagation();
    const key = button.dataset.project?.toLowerCase();
    if (key && projects[key]) {
      openProjectModal(projects[key]);
    }
  });
});

document.querySelectorAll(".project-card").forEach(card => {
  if (!card.hasAttribute("tabindex")) {
    card.setAttribute("tabindex", "0");
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", "View project details");
  }

  const handleOpen = () => {
    const key = card.dataset.project?.toLowerCase();
    if (key && projects[key]) {
      openProjectModal(projects[key]);
      return;
    }

    const heading = card.querySelector("h3")?.textContent?.trim().toLowerCase();
    if (heading) {
      const cleanKey = heading.replace(/[^a-z0-9]/g, "");
      if (projects[heading]) {
        openProjectModal(projects[heading]);
        return;
      }
      if (projects[cleanKey]) {
        openProjectModal(projects[cleanKey]);
        return;
      }
    }


    const firstProject = Object.values(projects)[0];
    if (firstProject) openProjectModal(firstProject);
  };

  card.addEventListener("click", event => {
    if (event.target.closest("a")) return;
    handleOpen();
  });

  card.addEventListener("keydown", event => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleOpen();
    }
  });
});


const yearEl = document.getElementById("year");
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

const sections = document.querySelectorAll("main section[id]");

if ("IntersectionObserver" in window && navLinks) {
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        const activeId = entry.target.id;

        navLinks.querySelectorAll('a[href^="#"]').forEach(link => {
          link.classList.toggle(
            "active",
            link.getAttribute("href") === `#${activeId}`
          );
        });
      });
    },
    { rootMargin: "-35% 0px -55% 0px" }
  );

  sections.forEach(section => observer.observe(section));
}
