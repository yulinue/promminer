document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('.pm-header');
    const mainBlock = document.querySelector('.pm-main-block');

    const observer = new IntersectionObserver(
        ([entry]) => {
            if (!entry.isIntersecting) {
                // mainBlock не видно → добавить класс фиксированного хедера
                if (!header.classList.contains('pm-header--fixed')) {
                    header.classList.add('pm-header--fixed');
                    header.classList.remove('slide-up');
                }
            } else {
                // mainBlock виден → проиграть анимацию исчезания
                if (header.classList.contains('pm-header--fixed')) {
                    header.classList.add('slide-up');
                    // удалить класс после окончания анимации
                    header.addEventListener('animationend', function handler() {
                        header.classList.remove('pm-header--fixed', 'slide-up');
                        header.removeEventListener('animationend', handler);
                    });
                }
            }
        },
        { root: null, threshold: 0 }
    );

    if(mainBlock){
        observer.observe(mainBlock);
    }
});


(function() {
    'use strict';

    function isMobileDevice() {
        return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
            || (('ontouchstart' in window) && window.innerWidth <= 1024);
    }

    function initMobileFormFixes() {
        if (!isMobileDevice()) return;

        if ("virtualKeyboard" in navigator) {
            navigator.virtualKeyboard.overlaysContent = true;
        }

        const style = document.createElement('style');
        style.textContent = `
            html.pm-scroll-blocked {
                position: fixed !important;
                top: var(--pm-scroll-y) !important;
                left: var(--pm-scroll-x) !important;
                width: 100% !important;
                height: 100% !important;
                overflow: hidden !important;
            }
            
            html.pm-scroll-blocked body {
                position: fixed !important;
                width: 100% !important;
                height: 100% !important;
                overflow: hidden !important;
                touch-action: none !important;
            }
            
            /* Предотвращаем скролл фона на модалке */
            .pm-popup-overlay.active {
                touch-action: none !important;
            }
            
            /* Разрешаем скролл только внутри контейнера */
            .pm-popup-overlay.active .pm-popup-feedback__container {
                touch-action: pan-y !important;
                overscroll-behavior: contain !important;
            }
        `;
        document.head.appendChild(style);

        const popups = document.querySelectorAll('.pm-popup-overlay');

        popups.forEach(popup => {
            const container = popup.querySelector('.pm-popup-feedback__container');
            if (!container) return;

            const inputs = container.querySelectorAll('input, textarea, select');
            const closeButtons = popup.querySelectorAll('[class*="close-"], .pm-btn--primary');
            const html = document.documentElement;
            const body = document.body;

            let savedScrollX = 0;
            let savedScrollY = 0;
            let activeElement = null;
            let scrollBlocked = false;
            let scrollAnimationFrame = null;
            let isUserScrolling = false;
            let userScrollTimeout = null;

            function blockPageScroll() {
                if (scrollBlocked) return;

                savedScrollX = window.scrollX;
                savedScrollY = window.scrollY;

                html.style.setProperty('--pm-scroll-x', `-${savedScrollX}px`);
                html.style.setProperty('--pm-scroll-y', `-${savedScrollY}px`);
                html.classList.add('pm-scroll-blocked');

                // Дополнительно предотвращаем скролл на body
                body.style.overflow = 'hidden';
                body.style.position = 'fixed';
                body.style.width = '100%';
                body.style.height = '100%';
                body.style.top = `-${savedScrollY}px`;

                scrollBlocked = true;
            }

            function unblockPageScroll() {
                if (!scrollBlocked) return;

                html.classList.remove('pm-scroll-blocked');
                html.style.removeProperty('--pm-scroll-x');
                html.style.removeProperty('--pm-scroll-y');

                // Восстанавливаем body
                body.style.overflow = '';
                body.style.position = '';
                body.style.width = '';
                body.style.height = '';
                body.style.top = '';

                window.scrollTo(savedScrollX, savedScrollY);
                scrollBlocked = false;
            }

            function isElementFullyVisible(element) {
                const rect = element.getBoundingClientRect();
                const vh = window.visualViewport ? window.visualViewport.height : window.innerHeight;

                return rect.top >= 20 && rect.bottom <= vh - 20;
            }

            function smoothScrollToElement(element) {
                if (!element) return;

                if (scrollAnimationFrame) {
                    cancelAnimationFrame(scrollAnimationFrame);
                }

                const elementRect = element.getBoundingClientRect();
                const containerRect = container.getBoundingClientRect();

                const elementTopRelative = elementRect.top - containerRect.top;
                const targetScrollTop = container.scrollTop + elementTopRelative - 80;

                const startScrollTop = container.scrollTop;
                const distance = targetScrollTop - startScrollTop;
                const duration = 300;
                const startTime = performance.now();

                function animateScroll(currentTime) {
                    const elapsed = currentTime - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    const easeOut = 1 - Math.pow(1 - progress, 3);

                    container.scrollTop = startScrollTop + distance * easeOut;

                    if (progress < 1) {
                        scrollAnimationFrame = requestAnimationFrame(animateScroll);
                    } else {
                        scrollAnimationFrame = null;
                    }
                }

                scrollAnimationFrame = requestAnimationFrame(animateScroll);
            }

            function updateKeyboardSpace() {
                const viewportHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;
                const fullHeight = window.innerHeight;
                const keyboardHeight = fullHeight - viewportHeight;

                if (keyboardHeight > 0) {
                    container.style.transition = 'padding-bottom 0.2s ease-out';
                    container.style.paddingBottom = keyboardHeight + 'px';
                } else {
                    container.style.transition = 'padding-bottom 0.2s ease-out';
                    container.style.paddingBottom = '';
                }
            }

            function reset() {
                if (scrollAnimationFrame) {
                    cancelAnimationFrame(scrollAnimationFrame);
                    scrollAnimationFrame = null;
                }

                container.style.transition = '';
                container.scrollTop = 0;
                container.style.paddingBottom = '';
                unblockPageScroll();
                activeElement = null;
                isUserScrolling = false;

                if (userScrollTimeout) {
                    clearTimeout(userScrollTimeout);
                    userScrollTimeout = null;
                }
            }

            function handleFocus(e) {
                activeElement = e.target;
                blockPageScroll();
            }

            // Предотвращаем скролл фона на контейнере
            container.addEventListener('touchstart', (e) => {
                // Ничего не делаем, просто предотвращаем всплытие к фону
            }, { passive: true });

            container.addEventListener('touchmove', (e) => {
                // Предотвращаем скролл фона при достижении границ контейнера
                const scrollTop = container.scrollTop;
                const scrollHeight = container.scrollHeight;
                const clientHeight = container.clientHeight;

                if ((scrollTop === 0 && e.touches[0].clientY > e.touches[0].startY) ||
                    (scrollTop + clientHeight >= scrollHeight && e.touches[0].clientY < e.touches[0].startY)) {
                    e.preventDefault();
                }
            }, { passive: false });

            container.addEventListener('scroll', () => {
                isUserScrolling = true;

                if (userScrollTimeout) {
                    clearTimeout(userScrollTimeout);
                }

                userScrollTimeout = setTimeout(() => {
                    isUserScrolling = false;
                }, 150);
            }, { passive: true });

            inputs.forEach(input => {
                input.addEventListener('focus', handleFocus);
            });

            if (window.visualViewport) {
                let prevHeight = window.visualViewport.height;

                window.visualViewport.addEventListener('resize', () => {
                    const newHeight = window.visualViewport.height;
                    const keyboardVisible = newHeight < prevHeight - 50;

                    updateKeyboardSpace();

                    if (keyboardVisible && activeElement && !activeElement.value && !isUserScrolling) {
                        requestAnimationFrame(() => {
                            if (!isElementFullyVisible(activeElement)) {
                                smoothScrollToElement(activeElement);
                            }
                        });
                    }

                    prevHeight = newHeight;
                });
            }

            closeButtons.forEach(btn => {
                btn.addEventListener('click', reset);
            });

            popup.addEventListener('click', (e) => {
                if (e.target === popup) reset();
            });

            const observer = new MutationObserver(() => {
                if (popup.classList.contains('active')) {
                    container.scrollTop = 0;
                    blockPageScroll();
                } else {
                    reset();
                }
            });

            observer.observe(popup, { attributes: true });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMobileFormFixes);
    } else {
        initMobileFormFixes();
    }

})();