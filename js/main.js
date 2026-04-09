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

        // Включаем overlaysContent для виртуальной клавиатуры
        if ("virtualKeyboard" in navigator) {
            navigator.virtualKeyboard.overlaysContent = true;
        }

        // Добавляем CSS-правила
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
            
            .pm-popup-overlay.pm-keyboard-open {
                align-items: flex-start !important;
                transition: padding-top 0.2s ease-out !important;
            }
        `;
        document.head.appendChild(style);

        const popups = document.querySelectorAll('.pm-popup-overlay');

        popups.forEach(popup => {
            const container = popup.querySelector('.pm-popup-feedback__container');
            if (!container) return;

            const inputs = container.querySelectorAll('input, textarea, select');
            const html = document.documentElement;

            let isKeyboardOpen = false;
            let savedScrollX = 0;
            let savedScrollY = 0;
            let activeElement = null;
            let originalPaddingTop = null;

            // Функция блокировки скролла страницы
            function blockPageScroll() {
                if (html.classList.contains('pm-scroll-blocked')) return;

                savedScrollX = window.scrollX;
                savedScrollY = window.scrollY;

                html.style.setProperty('--pm-scroll-x', `-${savedScrollX}px`);
                html.style.setProperty('--pm-scroll-y', `-${savedScrollY}px`);
                html.classList.add('pm-scroll-blocked');
            }

            // Функция разблокировки скролла страницы
            function unblockPageScroll() {
                if (!html.classList.contains('pm-scroll-blocked')) return;

                html.classList.remove('pm-scroll-blocked');
                html.style.removeProperty('--pm-scroll-x');
                html.style.removeProperty('--pm-scroll-y');

                window.scrollTo(savedScrollX, savedScrollY);
            }

            // Сдвигаем попап вверх, чтобы активное поле было видно
            function shiftPopupForKeyboard(element) {
                if (!element) return;

                // Сохраняем оригинальный padding-top
                if (originalPaddingTop === null) {
                    originalPaddingTop = getComputedStyle(popup).paddingTop;
                }

                const elementRect = element.getBoundingClientRect();
                const viewportHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;

                // Вычисляем, насколько элемент ниже видимой области
                const elementBottom = elementRect.bottom;
                const keyboardHeight = window.innerHeight - viewportHeight;

                if (elementBottom > viewportHeight) {
                    // Элемент перекрыт клавиатурой - сдвигаем попап вверх
                    const shiftAmount = elementBottom - viewportHeight + 20;
                    const currentPadding = parseInt(originalPaddingTop) || 92; // 92px - ваш оригинальный padding
                    const newPadding = Math.max(20, currentPadding - shiftAmount);

                    popup.style.paddingTop = newPadding + 'px';
                    popup.classList.add('pm-keyboard-open');
                }
            }

            // Восстанавливаем позицию попапа
            function resetPopupPosition() {
                if (originalPaddingTop !== null) {
                    popup.style.paddingTop = originalPaddingTop;
                }
                popup.classList.remove('pm-keyboard-open');
            }

            function handleFocus(e) {
                activeElement = e.target;

                if (!isKeyboardOpen) {
                    isKeyboardOpen = true;
                    blockPageScroll();
                }

                // Даем время клавиатуре открыться
                setTimeout(() => {
                    shiftPopupForKeyboard(activeElement);
                }, 100);
            }

            function handleBlur() {
                setTimeout(() => {
                    const currentActive = document.activeElement;
                    if (!currentActive || !container.contains(currentActive)) {
                        if (isKeyboardOpen) {
                            resetPopupPosition();
                            unblockPageScroll();
                            isKeyboardOpen = false;
                            activeElement = null;
                        }
                    }
                }, 100);
            }

            // Отслеживание изменения размера viewport
            if (window.visualViewport) {
                window.visualViewport.addEventListener('resize', () => {
                    if (activeElement && isKeyboardOpen) {
                        shiftPopupForKeyboard(activeElement);
                    }
                });
            }

            inputs.forEach(input => {
                input.addEventListener('focus', handleFocus);
                input.addEventListener('blur', handleBlur);
            });

            // Полное восстановление при закрытии попапа
            function restoreAll() {
                resetPopupPosition();
                unblockPageScroll();
                isKeyboardOpen = false;
                activeElement = null;
                originalPaddingTop = null;
            }

            // Закрытие по кнопкам
            const closeButtons = popup.querySelectorAll('[class*="close-"], .pm-btn--primary');
            closeButtons.forEach(btn => btn.addEventListener('click', restoreAll));

            // Закрытие по оверлею
            popup.addEventListener('click', (e) => {
                if (e.target === popup) restoreAll();
            });

            // При открытии попапа
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                        if (popup.classList.contains('active')) {
                            blockPageScroll();
                            originalPaddingTop = getComputedStyle(popup).paddingTop;
                        } else {
                            restoreAll();
                        }
                    }
                });
            });
            observer.observe(popup, { attributes: true });
        });
    }

    // Инициализация
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMobileFormFixes);
    } else {
        initMobileFormFixes();
    }
})();