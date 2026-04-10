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
            let scrollAnimationFrame = null;

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

            // Плавный скролл с анимацией
            function smoothScrollToElement(element) {
                if (!element) return;

                // Пропускаем если поле уже заполнено (iOS сам скроллит)
                if (element.value && element.value.length > 0) {
                    return;
                }

                // Отменяем предыдущую анимацию
                if (scrollAnimationFrame) {
                    cancelAnimationFrame(scrollAnimationFrame);
                    scrollAnimationFrame = null;
                }

                const elementRect = element.getBoundingClientRect();
                const containerRect = container.getBoundingClientRect();

                // Позиция элемента относительно контейнера
                const elementTop = elementRect.top - containerRect.top;
                const elementBottom = elementRect.bottom - containerRect.top;

                let targetScrollTop = container.scrollTop;

                // Вычисляем целевой скролл
                if (elementTop < 0) {
                    targetScrollTop = container.scrollTop + elementTop - 20;
                } else if (elementBottom > containerRect.height) {
                    targetScrollTop = container.scrollTop + elementBottom - containerRect.height + 20;
                } else {
                    return; // Элемент уже виден
                }

                // Плавная анимация
                const startScrollTop = container.scrollTop;
                const distance = targetScrollTop - startScrollTop;
                const duration = 250; // мс
                const startTime = performance.now();

                function animateScroll(currentTime) {
                    const elapsed = currentTime - startTime;
                    const progress = Math.min(elapsed / duration, 1);

                    // Ease-out функция для плавности
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

            function updateKeyboardPadding() {
                const viewportHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;
                const fullHeight = window.innerHeight;
                const keyboardHeight = fullHeight - viewportHeight;

                if (keyboardHeight > 0) {
                    container.style.paddingBottom = keyboardHeight + 'px';
                } else {
                    container.style.paddingBottom = '';
                }
            }

            function resetPopupPosition() {
                if (scrollTimer) {
                    clearTimeout(scrollTimer);
                    scrollTimer = null;
                }

                if (scrollAnimationFrame) {
                    cancelAnimationFrame(scrollAnimationFrame);
                    scrollAnimationFrame = null;
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

                // Очищаем предыдущий таймер
                if (scrollTimer) {
                    clearTimeout(scrollTimer);
                }

                // Даем клавиатуре время открыться, потом скроллим
                scrollTimer = setTimeout(() => {
                    smoothScrollToElement(activeElement);
                    scrollTimer = null;
                }, 150); // Уменьшил задержку с 300 до 150ms
            }

            // Отслеживание resize viewport
            if (window.visualViewport) {
                let viewportHeight = window.visualViewport.height;

                window.visualViewport.addEventListener('resize', () => {
                    const newHeight = window.visualViewport.height;
                    const keyboardVisible = newHeight < viewportHeight - 50;

                    updateKeyboardPadding();

                    if (keyboardVisible && activeElement) {
                        // Очищаем предыдущий таймер
                        if (scrollTimer) {
                            clearTimeout(scrollTimer);
                        }

                        // Повторный скролл при изменении размера клавиатуры
                        scrollTimer = setTimeout(() => {
                            smoothScrollToElement(activeElement);
                            scrollTimer = null;
                        }, 50);
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
                if (scrollAnimationFrame) {
                    cancelAnimationFrame(scrollAnimationFrame);
                    scrollAnimationFrame = null;
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