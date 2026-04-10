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

        const popups = document.querySelectorAll('.pm-popup-overlay');

        popups.forEach(popup => {
            const container = popup.querySelector('.pm-popup-feedback__container');
            if (!container) return;

            const inputs = container.querySelectorAll('input, textarea, select');
            const closeButtons = popup.querySelectorAll('[class*="close-"], .pm-btn--primary');
            const body = document.body;
            const html = document.documentElement;

            let activeElement = null;
            let scrollAnimationFrame = null;
            let isUserScrolling = false;
            let userScrollTimeout = null;
            let originalPaddingBottom = null;
            let savedScrollY = 0;

            function lockBodyScroll() {
                savedScrollY = window.scrollY;

                // Фиксируем body и html для полной блокировки скролла
                html.style.position = 'fixed';
                html.style.top = `-${savedScrollY}px`;
                html.style.width = '100%';
                html.style.overflow = 'hidden';

                body.style.position = 'fixed';
                body.style.top = `-${savedScrollY}px`;
                body.style.width = '100%';
                body.style.overflow = 'hidden';
                body.style.touchAction = 'none';

                body.classList.add('lock');
            }

            function unlockBodyScroll() {
                body.classList.remove('lock');

                html.style.position = '';
                html.style.top = '';
                html.style.width = '';
                html.style.overflow = '';

                body.style.position = '';
                body.style.top = '';
                body.style.width = '';
                body.style.overflow = '';
                body.style.touchAction = '';

                window.scrollTo(0, savedScrollY);
            }

            function isElementFullyVisible(element) {
                const rect = element.getBoundingClientRect();
                const vh = window.visualViewport ? window.visualViewport.height : window.innerHeight;
                return rect.top >= 20 && rect.bottom <= vh - 20;
            }

            function smoothScrollToElement(element) {
                if (!element) return;

                // Пропускаем если поле уже заполнено (iOS сам скроллит)
                if (element.value && element.value.length > 0) {
                    return;
                }

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
                    if (originalPaddingBottom === null) {
                        originalPaddingBottom = getComputedStyle(container).paddingBottom;
                    }
                    container.style.transition = 'padding-bottom 0.2s ease-out';
                    container.style.paddingBottom = keyboardHeight + 'px';
                } else {
                    container.style.transition = 'padding-bottom 0.2s ease-out';
                    container.style.paddingBottom = originalPaddingBottom || '';
                }
            }

            function reset() {
                if (scrollAnimationFrame) {
                    cancelAnimationFrame(scrollAnimationFrame);
                    scrollAnimationFrame = null;
                }

                container.style.transition = '';
                container.scrollTop = 0;
                container.style.paddingBottom = originalPaddingBottom || '';

                unlockBodyScroll();

                activeElement = null;
                isUserScrolling = false;
                originalPaddingBottom = null;

                if (userScrollTimeout) {
                    clearTimeout(userScrollTimeout);
                    userScrollTimeout = null;
                }
            }

            function handleFocus(e) {
                activeElement = e.target;
                lockBodyScroll();
            }

            // Предотвращаем скролл фона при таче на контейнере
            container.addEventListener('touchstart', (e) => {
                container.dataset.touchStartY = e.touches[0].clientY;
            }, { passive: true });

            container.addEventListener('touchmove', (e) => {
                const scrollTop = container.scrollTop;
                const scrollHeight = container.scrollHeight;
                const clientHeight = container.clientHeight;
                const currentY = e.touches[0].clientY;
                const startY = parseFloat(container.dataset.touchStartY) || currentY;
                const deltaY = currentY - startY;

                // Блокируем скролл фона при достижении границ
                if (scrollTop <= 0 && deltaY > 0) {
                    e.preventDefault();
                } else if (scrollTop + clientHeight >= scrollHeight && deltaY < 0) {
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
                    lockBodyScroll();
                    container.scrollTop = 0;
                } else {
                    reset();
                }
            });

            observer.observe(popup, { attributes: true, attributeFilter: ['class'] });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMobileFormFixes);
    } else {
        initMobileFormFixes();
    }

})();