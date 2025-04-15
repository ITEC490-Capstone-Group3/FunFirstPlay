document.addEventListener('DOMContentLoaded', () => {
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) {
        const dropdownMenu = dropdown.querySelector('.dropdown-menu');
        let hideTimeout;

        // Show dropdown on hover
        dropdown.addEventListener('mouseenter', () => {
            clearTimeout(hideTimeout); // Clear any existing timeout
            dropdownMenu.classList.add('show');
        });

        // Hide dropdown on mouse leave
        dropdown.addEventListener('mouseleave', () => {
            hideTimeout = setTimeout(() => {
                dropdownMenu.classList.remove('show');
            }, 500); // Adjust the timeout duration as needed
        });

        // Hide dropdown after clicking and no interaction
        dropdownMenu.addEventListener('click', () => {
            hideTimeout = setTimeout(() => {
                dropdownMenu.classList.remove('show');
            }, 2000); // Adjust the timeout duration as needed
        });
    }
});