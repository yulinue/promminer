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

            let savedScrollX = 0;
            let savedScrollY = 0;
            let activeElement = null;
            let originalPaddingTop = null;
            let scrollBlocked = false;
            let scrollAnimationFrame = null;
            let isScrolling = false;

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

                // Если уже скроллим - не мешаем
                if (isScrolling) return;

                // Отменяем предыдущую анимацию
                if (scrollAnimationFrame) {
                    cancelAnimationFrame(scrollAnimationFrame);
                    scrollAnimationFrame = null;
                }

                // Ждём перерисовки лейаута после открытия клавиатуры
                setTimeout(() => {
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
                    const duration = 400; // Увеличил для плавности
                    const startTime = performance.now();

                    isScrolling = true;

                    function animateScroll(currentTime) {
                        const elapsed = currentTime - startTime;
                        const progress = Math.min(elapsed / duration, 1);

                        // Более плавная ease-out функция
                        const easeOut = progress < 0.5
                            ? 4 * progress * progress * progress
                            : 1 - Math.pow(-2 * progress + 2, 3) / 2;

                        container.scrollTop = startScrollTop + distance * easeOut;

                        if (progress < 1) {
                            scrollAnimationFrame = requestAnimationFrame(animateScroll);
                        } else {
                            scrollAnimationFrame = null;
                            isScrolling = false;
                        }
                    }

                    scrollAnimationFrame = requestAnimationFrame(animateScroll);
                }, 200); // Ждём 200ms для полного открытия клавиатуры
            }

            function updateKeyboardPadding() {
                const viewportHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;
                const fullHeight = window.innerHeight;
                const keyboardHeight = fullHeight - viewportHeight;

                if (keyboardHeight > 0) {
                    container.style.transition = 'padding-bottom 0.3s ease-out';
                    container.style.paddingBottom = keyboardHeight + 'px';
                } else {
                    container.style.transition = 'padding-bottom 0.3s ease-out';
                    container.style.paddingBottom = '';
                }
            }

            function resetPopupPosition() {
                if (scrollAnimationFrame) {
                    cancelAnimationFrame(scrollAnimationFrame);
                    scrollAnimationFrame = null;
                }

                isScrolling = false;

                if (originalPaddingTop !== null) {
                    popup.style.paddingTop = originalPaddingTop;
                }
                container.scrollTop = 0;
                container.style.paddingBottom = '';
            }

            function handleFocus(e) {
                activeElement = e.target;
                blockPageScroll();

                // Скроллим к элементу
                smoothScrollToElement(activeElement);
            }

            // Отслеживание resize viewport
            if (window.visualViewport) {
                let viewportHeight = window.visualViewport.height;

                window.visualViewport.addEventListener('resize', () => {
                    const newHeight = window.visualViewport.height;
                    const keyboardVisible = newHeight < viewportHeight - 50;

                    updateKeyboardPadding();

                    if (keyboardVisible && activeElement) {
                        // При ресайзе скроллим с небольшой задержкой
                        setTimeout(() => {
                            smoothScrollToElement(activeElement);
                        }, 100);
                    } else if (!keyboardVisible) {
                        resetPopupPosition();
                    }

                    viewportHeight = newHeight;
                });
            }

            inputs.forEach(input => {
                input.addEventListener('focus', handleFocus);
            });

            function restoreAll() {
                if (scrollAnimationFrame) {
                    cancelAnimationFrame(scrollAnimationFrame);
                    scrollAnimationFrame = null;
                }
                isScrolling = false;
                resetPopupPosition();
                unblockPageScroll();
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