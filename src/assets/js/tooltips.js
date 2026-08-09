document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach((tooltipTrigger) => {
    new bootstrap.Tooltip(tooltipTrigger, {
        offset: [0, 10]
    });
});
