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

            .pm-popup-feedback__container {
                scroll-behavior: smooth;
                overscroll-behavior: contain;
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

            let savedScrollX = 0;
            let savedScrollY = 0;
            let activeElement = null;
            let scrollBlocked = false;

            function blockPageScroll() {
                if (scrollBlocked) return;

                savedScrollX = window.scrollX;
                savedScrollY = window.scrollY;

                html.style.setProperty('--pm-scroll-x', `-${savedScrollX}px`);
                html.style.setProperty('--pm-scroll-y', `-${savedScrollY}px`);
                html.classList.add('pm-scroll-blocked');

                scrollBlocked = true;
            }

            function unblockPageScroll() {
                if (!scrollBlocked) return;

                html.classList.remove('pm-scroll-blocked');
                html.style.removeProperty('--pm-scroll-x');
                html.style.removeProperty('--pm-scroll-y');

                window.scrollTo(savedScrollX, savedScrollY);
                scrollBlocked = false;
            }

            function isElementVisible(element) {
                const rect = element.getBoundingClientRect();
                const vh = window.visualViewport ? window.visualViewport.height : window.innerHeight;

                return rect.top >= 0 && rect.bottom <= vh - 10;
            }

            function scrollToElement(element) {
                if (!element) return;

                // если iOS уже сам прокрутил — не мешаем
                if (isElementVisible(element)) return;

                const elementRect = element.getBoundingClientRect();
                const containerRect = container.getBoundingClientRect();

                const offset = elementRect.top - containerRect.top - 80;

                container.scrollTo({
                    top: container.scrollTop + offset,
                    behavior: 'smooth'
                });
            }

            function updateKeyboardSpace() {
                const viewportHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;
                const fullHeight = window.innerHeight;

                const keyboardHeight = fullHeight - viewportHeight;

                if (keyboardHeight > 0) {
                    container.style.paddingBottom = keyboardHeight + 40 + 'px';
                } else {
                    container.style.paddingBottom = '';
                }
            }

            function reset() {
                container.scrollTop = 0;
                container.style.paddingBottom = '';
                unblockPageScroll();
                activeElement = null;
            }

            function handleFocus(e) {
                activeElement = e.target;
                blockPageScroll();
                // ❌ не скроллим тут — ждём клавиатуру
            }

            inputs.forEach(input => {
                input.addEventListener('focus', handleFocus);
            });

            // 💥 главный момент — реагируем на появление клавиатуры
            if (window.visualViewport) {
                let prevHeight = window.visualViewport.height;

                window.visualViewport.addEventListener('resize', () => {
                    const newHeight = window.visualViewport.height;
                    const keyboardVisible = newHeight < prevHeight - 50;

                    updateKeyboardSpace();

                    if (keyboardVisible && activeElement) {
                        requestAnimationFrame(() => {
                            scrollToElement(activeElement);
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