document.querySelectorAll('.carousel').forEach((carousel) => {
    const carouselInner = carousel.querySelector('.carousel-inner');
    const nextButton = carousel.querySelector('.carousel-control-next');
    const prevButton = carousel.querySelector('.carousel-control-prev');

    if (window.matchMedia("(min-width:576px)").matches) {
        const carouselWidth = carouselInner.scrollWidth;
        const cardWidth = carouselInner.querySelector('.carousel-item').offsetWidth;
        let scrollPosition = 0;

        nextButton.addEventListener('click', () => {
            if (scrollPosition < (carouselWidth - cardWidth)) {
                scrollPosition += cardWidth;
                carouselInner.scrollTo({ left: scrollPosition, behavior: 'smooth' });
            }
        });

        prevButton.addEventListener('click', () => {
            if (scrollPosition > 0) {
                scrollPosition -= cardWidth;
                carouselInner.scrollTo({ left: scrollPosition, behavior: 'smooth' });
            }
        });
    } else {
        carousel.classList.add('slide');
    }
});
