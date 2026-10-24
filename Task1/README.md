# 🌐 Task 1: Personal Developer Portfolio

> **Part of the Datheon Full Stack Web Development Internship Program**  
> Developed by **Niket Aggarwal**

## 📌 Project Overview
This project is the deliverable for **Task 1** of the **Datheon Full Stack Web Development Internship**. It represents a modern, responsive, high-performance personal developer portfolio built entirely with **pure Vanilla web technologies** (HTML5, CSS3, and JavaScript) without relying on heavyweight external frameworks or UI libraries

The portfolio is designed with a strong focus on aesthetics, accessibility, seamless responsiveness across screen sizes and intuitive micro-interactions

### 🔗 Live Deployment
- **Live Preview URL**: [https://dev123.vercel.app/](https://dev123.vercel.app/)
- **Main Repository**: [Datheon Full Stack Web Development Internship](../README.md)

## ✨ Key Features
- 🌓 **Dynamic Dark / Light Theme Toggle**:
  - Automatically respects user preference with persistent state saved in `localStorage`
  - Smooth color palette transitions utilizing CSS custom properties (`var(--...)`)

- 📱 **Fully Responsive Layout**:
  - Mobile-first approach scaling seamlessly from mobile devices (320px+) to ultra-wide displays
  - Accessible slide-out hamburger navigation menu with backdrop click detection and focus management

- 🎨 **Modern Minimalist & Expressive Design**:
  - Interactive abstract code art illustration in the hero section
  - Subtle micro-animations, glowing accents, and glassmorphic card layouts
  - Active section indicator dynamically highlighting navigation links using `IntersectionObserver`

- 💼 **Interactive Project Showcase**:
  - Featured project cards showcasing real-world full-stack web applications (`Mynexlink`, `PulseOps`)
  - Native HTML5 `<dialog>` modal popup for deep-dive project details, tech stack badges, and live demo/repo links
  - Keyboard accessible (Open with `Enter`/`Space`, dismiss with `Escape` or backdrop click)

- 🛠️ **Categorized Skills Matrix**:
  - Structured categorization across **Frontend**, **Backend**, and **Tools & Workflow**

- 🎓 **Experience & Education Timeline**:
  - Chronological timeline tracking education (Delhi University) and independent development experience

- 📬 **Accessible Contact & Social Links**:
  - Direct mail action and verified links to GitHub, LinkedIn, and social media
  - Downloadable/viewable resume integration (`assets/resume.pdf`)
  - Dynamic copyright year updated automatically through JavaScript

- ♿ **Accessibility First (A11y)**:
  - Skip-to-content link for keyboard and screen reader navigation
  - Full ARIA markup (`aria-expanded`, `aria-label`, `aria-controls`, `role="button"`)
  - Semantic HTML5 structure (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<dialog>`).

## 🛠️ Tech Stack & Architecture
| Layer | Technology | Purpose & Implementation Details |
| :--- | :--- | :--- |
| **Markup** | HTML5 | Semantic architecture, semantic sections, native `<dialog>` element, accessible ARIA roles |
| **Styling** | CSS3 (Vanilla) | Custom CSS properties (design tokens), CSS Grid, Flexbox, media queries, smooth transforms |
| **Behavior** | JavaScript (ES6+) | Theme switcher, modal manager, `IntersectionObserver` scroll-spy, keyboard traps, mobile menu |
| **Assets** | Static Files | Optimized SVG icons, custom favicon (`favicon.ico`), hosted resume (`resume.pdf`) |

## 📁 Directory Structure
```text
Task1/
├── assets/
│   ├── favicon.ico        
│   └── resume.pdf          
├── index.html             
├── script.js               
├── style.css               
└── README.md               
```

## 🧠 Code Architecture & Implementation Highlights

### 1. Theme Persistence (`script.js`)
```javascript
function setTheme(theme) {
  root.dataset.theme = theme;
  try {
    localStorage.setItem("portfolio-theme", theme);
  } catch (error) {}
}
```
Themes switch between `data-theme="dark"` and `data-theme="light"` on `document.documentElement`, instantaneously swapping hundreds of custom CSS variables without page reloads

### 2. Scroll-Spy via Intersection Observer
```javascript
const observer = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const activeId = entry.target.id;
      navLinks.querySelectorAll('a[href^="#"]').forEach(link => {
        link.classList.toggle("active", link.getAttribute("href") === `#${activeId}`);
      });
    });
  },
  { rootMargin: "-35% 0px -55% 0px" }
);
```

### 3. Native `<dialog>` Modal API
Project cards feature full keyboard navigability and utilize the native browser modal dialog API with `projectModal.showModal()` and backdrop dismissal events

## 📄 License

This project was built for the **Datheon Full Stack Web Development Internship**