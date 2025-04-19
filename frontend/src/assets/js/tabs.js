document.addEventListener("DOMContentLoaded", function () {
    // Get the hash from the URL (e.g., #tab-1)
    const hash = window.location.hash;

    // If a hash exists, activate the corresponding tab
    if (hash) {
        const targetTab = document.querySelector(`a[href="${hash}"]`);
        const targetPane = document.querySelector(hash);

        if (targetTab && targetPane) {
            // Deactivate all tabs and panes
            document.querySelectorAll('.nav-link').forEach(tab => tab.classList.remove('active'));
            document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active', 'show'));

            // Activate the target tab and pane
            targetTab.classList.add('active');
            targetPane.classList.add('active', 'show');
        }
    }
});