const tooltipTriggers = document.querySelectorAll('[data-bs-toggle="tooltip"]');

tooltipTriggers.forEach((tooltipTrigger) => {
    new bootstrap.Tooltip(tooltipTrigger);
});
