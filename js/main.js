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

        // Добавляем CSS-правила (как в виджете)
        const style = document.createElement('style');
        style.textContent = `
            html.pm-scroll-blocked {
                position: fixed !important;
                top: var(--pm-scroll-y) !important;
                left: var(--pm-scroll-x) !important;
                width: 100% !important;
                height: 100% !important;
                overflow-x: hidden !important;
                overflow-y: scroll !important;
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
            let containerScrollBeforeKeyboard = 0;
            let activeElement = null;

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

            // Скролл к активному элементу (как в виджете)
            function scrollToActiveElement(element) {
                if (!element) return;

                // Даем время клавиатуре открыться
                setTimeout(() => {
                    const elementRect = element.getBoundingClientRect();
                    const containerRect = container.getBoundingClientRect();

                    // Проверяем, не перекрыт ли элемент клавиатурой
                    if (elementRect.bottom > containerRect.bottom) {
                        const scrollOffset = elementRect.bottom - containerRect.bottom + 20;
                        container.scrollBy({ top: scrollOffset, behavior: 'smooth' });
                    } else if (elementRect.top < containerRect.top) {
                        const scrollOffset = elementRect.top - containerRect.top - 20;
                        container.scrollBy({ top: scrollOffset, behavior: 'smooth' });
                    }
                }, 100);
            }

            // Восстановление позиции скролла контейнера
            function restoreContainerScroll() {
                if (containerScrollBeforeKeyboard > 0) {
                    container.scrollTo({ top: 0, behavior: 'smooth' });
                }
            }

            function handleFocus(e) {
                activeElement = e.target;
                containerScrollBeforeKeyboard = container.scrollTop;

                if (!isKeyboardOpen) {
                    isKeyboardOpen = true;
                    blockPageScroll();
                }
                scrollToActiveElement(e.target);
            }

            function handleBlur() {
                setTimeout(() => {
                    const currentActive = document.activeElement;
                    if (!currentActive || !container.contains(currentActive)) {
                        if (isKeyboardOpen) {
                            // Восстанавливаем позицию контейнера
                            restoreContainerScroll();
                            unblockPageScroll();
                            isKeyboardOpen = false;
                            activeElement = null;
                        }
                    }
                }, 100);
            }

            // Отслеживание изменения размера viewport (для Android)
            if (window.visualViewport) {
                let initialHeight = window.visualViewport.height;

                window.visualViewport.addEventListener('resize', () => {
                    const currentHeight = window.visualViewport.height;
                    const keyboardOpen = currentHeight < initialHeight * 0.85;

                    if (keyboardOpen && activeElement) {
                        // Клавиатура открылась - скроллим к активному элементу
                        scrollToActiveElement(activeElement);
                    } else if (!keyboardOpen && isKeyboardOpen) {
                        // Клавиатура закрылась - восстанавливаем позицию
                        restoreContainerScroll();
                    }
                });
            }

            inputs.forEach(input => {
                input.addEventListener('focus', handleFocus);
                input.addEventListener('blur', handleBlur);
            });

            // Полное восстановление при закрытии попапа
            function restoreAll() {
                restoreContainerScroll();
                unblockPageScroll();
                isKeyboardOpen = false;
                activeElement = null;
                container.scrollTop = 0;
            }

            // Закрытие по кнопкам
            const closeButtons = popup.querySelectorAll('[class*="close-"], .pm-btn--primary');
            closeButtons.forEach(btn => btn.addEventListener('click', restoreAll));

            // Закрытие по оверлею
            popup.addEventListener('click', (e) => {
                if (e.target === popup) restoreAll();
            });

            // Блокируем скролл сразу при открытии попапа
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                        if (popup.classList.contains('active')) {
                            blockPageScroll();
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

    // Инициализация
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMobileFormFixes);
    } else {
        initMobileFormFixes();
    }
})();