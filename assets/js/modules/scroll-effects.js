// Global scroll-driven 3D effects for entire site
// Usage: add data-scroll-fade, data-scroll-parallax="0.15", data-scroll-rotate
(function () {
    'use strict';

    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;

    var ticking = false;

    // Elements with scroll effects
    var fadeEls = document.querySelectorAll('[data-scroll-fade]');
    var parallaxEls = document.querySelectorAll('[data-scroll-parallax]');
    var rotateEls = document.querySelectorAll('[data-scroll-rotate]');
    var scaleEls = document.querySelectorAll('[data-scroll-scale]');

    // Stats for parallax (only compute once per frame)
    var scrollY = 0;
    var viewH = window.innerHeight;

    function update() {
        scrollY = window.scrollY;
        var progress = Math.min(scrollY / viewH, 1);

        // Fade in/out based on scroll position
        fadeEls.forEach(function (el) {
            var rect = el.getBoundingClientRect();
            var elProgress = 1 - (rect.bottom / (viewH * 2));
            var opacity = Math.max(0, Math.min(1, elProgress));
            el.style.opacity = opacity;
        });

        // Parallax layers
        parallaxEls.forEach(function (el) {
            var speed = parseFloat(el.getAttribute('data-scroll-parallax')) || 0.1;
            var rect = el.getBoundingClientRect();
            var offset = (rect.top / viewH) * scrollY * speed;
            el.style.transform = 'translateY(' + offset + 'px)';
        });

        // 3D rotate on scroll
        rotateEls.forEach(function (el) {
            var speed = parseFloat(el.getAttribute('data-scroll-rotate')) || 0.02;
            var rotateVal = Math.min(scrollY * speed, 15);
            el.style.transform = 'rotateX(' + (-rotateVal) + 'deg)';
        });

        // Scale on scroll
        scaleEls.forEach(function (el) {
            var speed = parseFloat(el.getAttribute('data-scroll-scale')) || 0.001;
            var scaleVal = Math.max(0.8, 1 - (scrollY * speed));
            el.style.transform = 'scale(' + scaleVal + ')';
        });

        ticking = false;
    }

    window.addEventListener('scroll', function () {
        if (!ticking) {
            requestAnimationFrame(update);
            ticking = true;
        }
    }, { passive: true });

    // Initial state
    update();
})();