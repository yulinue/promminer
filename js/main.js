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
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
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

            let isKeyboardOpen = false;
            let savedScrollX = 0;
            let savedScrollY = 0;
            let activeElement = null;
            let originalPaddingTop = null;
            let scrollBlocked = false;
            let scrollTimer = null;

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

            // Улучшенная функция скролла (как в виджете)
            function scrollToElement(element) {
                if (!element) return;

                // Очищаем предыдущий таймер
                if (scrollTimer) {
                    clearTimeout(scrollTimer);
                }

                // Используем несколько RAF для гарантии отрисовки
                function performScroll() {
                    requestAnimationFrame(() => {
                        requestAnimationFrame(() => {
                            const elementRect = element.getBoundingClientRect();
                            const containerRect = container.getBoundingClientRect();

                            // Позиция элемента относительно контейнера
                            const elementTop = elementRect.top - containerRect.top;
                            const elementBottom = elementRect.bottom - containerRect.top;

                            // Скроллим, если элемент не виден
                            if (elementTop < 0) {
                                container.scrollTop += elementTop - 20;
                            } else if (elementBottom > containerRect.height) {
                                container.scrollTop += elementBottom - containerRect.height + 20;
                            }

                            // После скролла проверяем, нужно ли сдвинуть попап
                            const newElementRect = element.getBoundingClientRect();
                            const viewportHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;

                            const fullHeight = window.innerHeight;

                            // высота клавиатуры
                            const keyboardHeight = fullHeight - viewportHeight;

                            if (keyboardHeight > 0) {
                                container.style.paddingBottom = keyboardHeight + 40 + 'px';
                            } else {
                                container.style.paddingBottom = '';
                            }
                        });
                    });
                }

                // Даем время на открытие клавиатуры и выполняем скролл
                scrollTimer = setTimeout(() => {
                    performScroll();
                    scrollTimer = null;
                }, 300);
            }

            function resetPopupPosition() {
                if (scrollTimer) {
                    clearTimeout(scrollTimer);
                    scrollTimer = null;
                }

                if (originalPaddingTop !== null) {
                    popup.style.paddingTop = originalPaddingTop;
                }
                container.scrollTop = 0;
                container.style.paddingBottom = '';
            }

            function handleFocus(e) {
                activeElement = e.target;

                if (!isKeyboardOpen) {
                    isKeyboardOpen = true;
                    blockPageScroll();
                }

                // НЕМЕДЛЕННО запускаем скролл (не ждем клавиатуру)
                scrollToElement(activeElement);
            }

            // Отслеживание resize viewport
            if (window.visualViewport) {
                let viewportHeight = window.visualViewport.height;

                window.visualViewport.addEventListener('resize', () => {
                    const newHeight = window.visualViewport.height;
                    const keyboardVisible = newHeight < viewportHeight - 50;

                    if (keyboardVisible && activeElement) {
                        // Повторный скролл при изменении размера клавиатуры
                        scrollToElement(activeElement);
                    } else if (!keyboardVisible && isKeyboardOpen) {
                        resetPopupPosition();
                    }

                    viewportHeight = newHeight;
                });
            }

            inputs.forEach(input => {
                input.addEventListener('focus', handleFocus);
            });

            function restoreAll() {
                if (scrollTimer) {
                    clearTimeout(scrollTimer);
                    scrollTimer = null;
                }
                resetPopupPosition();
                unblockPageScroll();
                isKeyboardOpen = false;
                activeElement = null;
            }

            closeButtons.forEach(btn => {
                btn.addEventListener('click', restoreAll);
            });

            popup.addEventListener('click', (e) => {
                if (e.target === popup) restoreAll();
            });

            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                        if (popup.classList.contains('active')) {
                            blockPageScroll();
                            originalPaddingTop = getComputedStyle(popup).paddingTop;
                            container.scrollTop = 0;
                        } else {
                            restoreAll();
                        }
                    }
                });
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