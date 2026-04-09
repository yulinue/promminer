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

            // ГЛАВНАЯ ФУНКЦИЯ: скролл к элементу (как в виджете)
            function scrollToElement(element) {
                if (!element) return;

                // Используем двойной requestAnimationFrame для гарантии
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        const elementRect = element.getBoundingClientRect();
                        const containerRect = container.getBoundingClientRect();

                        // Позиция элемента относительно контейнера
                        const elementTop = elementRect.top - containerRect.top;
                        const elementBottom = elementRect.bottom - containerRect.top;

                        // Если элемент не виден - скроллим
                        if (elementTop < 0) {
                            container.scrollTop += elementTop - 20;
                        } else if (elementBottom > containerRect.height) {
                            container.scrollTop += elementBottom - containerRect.height + 20;
                        }

                        // После скролла проверяем, нужно ли сдвинуть попап
                        const newElementRect = element.getBoundingClientRect();
                        const viewportHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;

                        if (newElementRect.bottom > viewportHeight - 20) {
                            if (originalPaddingTop === null) {
                                originalPaddingTop = getComputedStyle(popup).paddingTop;
                            }

                            const shiftAmount = newElementRect.bottom - viewportHeight + 40;
                            const currentPadding = parseInt(originalPaddingTop) || 92;
                            const newPadding = Math.max(20, currentPadding - shiftAmount);

                            popup.style.paddingTop = newPadding + 'px';
                        }
                    });
                });
            }

            function resetPopupPosition() {
                if (originalPaddingTop !== null) {
                    popup.style.paddingTop = originalPaddingTop;
                }
                container.scrollTop = 0;
            }

            function handleFocus(e) {
                activeElement = e.target;

                if (!isKeyboardOpen) {
                    isKeyboardOpen = true;
                    blockPageScroll();
                }

                // Даем клавиатуре время открыться (300ms как в виджете)
                setTimeout(() => {
                    scrollToElement(activeElement);
                }, 300);
            }

            // Отслеживание resize viewport
            if (window.visualViewport) {
                let viewportHeight = window.visualViewport.height;

                window.visualViewport.addEventListener('resize', () => {
                    const newHeight = window.visualViewport.height;
                    const keyboardVisible = newHeight < viewportHeight - 50;

                    if (keyboardVisible && activeElement) {
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