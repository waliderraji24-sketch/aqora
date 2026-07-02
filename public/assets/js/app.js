// AQORA main client script
window.addEventListener("DOMContentLoaded", () => {
  if (window.router && typeof window.router.init === "function") {
    window.router.init();
  }
});

