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
            
            .pm-popup-overlay {
                transition: padding-top 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
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
            let containerScrollBefore = 0;

            // Функция блокировки скролла страницы
            function blockPageScroll() {
                if (scrollBlocked) return;

                savedScrollX = window.scrollX;
                savedScrollY = window.scrollY;

                html.style.setProperty('--pm-scroll-x', `-${savedScrollX}px`);
                html.style.setProperty('--pm-scroll-y', `-${savedScrollY}px`);
                html.classList.add('pm-scroll-blocked');
                scrollBlocked = true;
            }

            // Функция разблокировки скролла страницы
            function unblockPageScroll() {
                if (!scrollBlocked) return;

                html.classList.remove('pm-scroll-blocked');
                html.style.removeProperty('--pm-scroll-x');
                html.style.removeProperty('--pm-scroll-y');

                window.scrollTo(savedScrollX, savedScrollY);
                scrollBlocked = false;
            }

            // Скроллим контейнер к активному элементу
            function scrollContainerToElement(element) {
                if (!element) return;

                const elementRect = element.getBoundingClientRect();
                const containerRect = container.getBoundingClientRect();

                // Проверяем, виден ли элемент в контейнере
                const elementTopRelative = elementRect.top - containerRect.top;
                const elementBottomRelative = elementRect.bottom - containerRect.top;

                // Если элемент не полностью виден - скроллим
                if (elementTopRelative < 0) {
                    // Элемент выше видимой области
                    container.scrollTop += elementTopRelative - 20;
                } else if (elementBottomRelative > containerRect.height) {
                    // Элемент ниже видимой области
                    container.scrollTop += elementBottomRelative - containerRect.height + 20;
                }
            }

            // Сдвигаем попап и скроллим к элементу
            function adjustForKeyboard(element) {
                if (!element) return;

                if (originalPaddingTop === null) {
                    originalPaddingTop = getComputedStyle(popup).paddingTop;
                }

                const elementRect = element.getBoundingClientRect();
                const viewportHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;

                // Сначала скроллим контейнер
                scrollContainerToElement(element);

                // Затем, если нужно, сдвигаем весь попап
                setTimeout(() => {
                    const newElementRect = element.getBoundingClientRect();
                    const elementBottom = newElementRect.bottom;

                    if (elementBottom > viewportHeight - 20) {
                        const shiftAmount = elementBottom - viewportHeight + 40;
                        const currentPadding = parseInt(originalPaddingTop) || 92;
                        const newPadding = Math.max(20, currentPadding - shiftAmount);

                        popup.style.paddingTop = newPadding + 'px';
                    }
                }, 50);
            }

            // Восстанавливаем позицию попапа и скролл контейнера
            function resetPosition() {
                if (originalPaddingTop !== null) {
                    popup.style.paddingTop = originalPaddingTop;
                }
                if (containerScrollBefore > 0) {
                    container.scrollTop = 0;
                }
            }

            function handleFocus(e) {
                activeElement = e.target;
                containerScrollBefore = container.scrollTop;

                if (!isKeyboardOpen) {
                    isKeyboardOpen = true;
                    blockPageScroll();
                }

                // Даем время клавиатуре открыться
                setTimeout(() => {
                    adjustForKeyboard(activeElement);
                }, 200);
            }

            // Отслеживание изменения размера viewport
            if (window.visualViewport) {
                window.visualViewport.addEventListener('resize', () => {
                    if (activeElement && isKeyboardOpen) {
                        adjustForKeyboard(activeElement);
                    }
                });
            }

            inputs.forEach(input => {
                input.addEventListener('focus', handleFocus);
            });

            // Полное восстановление при закрытии попапа
            function restoreAll() {
                resetPosition();
                unblockPageScroll();
                isKeyboardOpen = false;
                activeElement = null;
                containerScrollBefore = 0;
            }

            // Закрытие по кнопкам
            closeButtons.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    restoreAll();
                });
            });

            // Закрытие по оверлею
            popup.addEventListener('click', (e) => {
                if (e.target === popup) {
                    restoreAll();
                }
            });

            // При открытии попапа
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

            // Отслеживаем клик по кнопке отправки
            const submitBtn = container.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.addEventListener('click', () => {
                    setTimeout(() => {
                        if (!popup.classList.contains('active')) {
                            restoreAll();
                        }
                    }, 100);
                });
            }
        });
    }

    // Инициализация
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMobileFormFixes);
    } else {
        initMobileFormFixes();
    }
})();