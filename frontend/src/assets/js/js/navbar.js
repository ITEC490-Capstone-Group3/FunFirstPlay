document.addEventListener('DOMContentLoaded', function () {
    const navbarCollapse = document.querySelector('#navcol-1');
    const navLinks = document.querySelectorAll('.nav-link');

    // Optional: Close collapse if clicking outside navbar
    document.addEventListener('click', (event) => {
        const navbarToggler = document.querySelector('.navbar-toggler');
        const isClickInsideNavbar = navbarCollapse.contains(event.target) || navbarToggler.contains(event.target);

        if (!isClickInsideNavbar && navbarCollapse.classList.contains('show')) {
            const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse);
            bsCollapse?.hide();
        }
    });
});