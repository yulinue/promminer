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

            // Функция блокировки скролла (как в виджете)
            function blockScroll() {
                if (html.classList.contains('pm-scroll-blocked')) return;

                savedScrollX = window.scrollX;
                savedScrollY = window.scrollY;

                html.style.setProperty('--pm-scroll-x', `-${savedScrollX}px`);
                html.style.setProperty('--pm-scroll-y', `-${savedScrollY}px`);
                html.classList.add('pm-scroll-blocked');
            }

            // Функция разблокировки скролла
            function unblockScroll() {
                if (!html.classList.contains('pm-scroll-blocked')) return;

                html.classList.remove('pm-scroll-blocked');
                html.style.removeProperty('--pm-scroll-x');
                html.style.removeProperty('--pm-scroll-y');

                // Восстанавливаем позицию скролла
                window.scrollTo(savedScrollX, savedScrollY);
            }

            // Скролл к активному элементу внутри контейнера
            function scrollToActiveElement(element) {
                if (!element) return;

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
                }, 300);
            }

            function handleFocus(e) {
                if (!isKeyboardOpen) {
                    isKeyboardOpen = true;
                    blockScroll();
                }
                scrollToActiveElement(e.target);
            }

            function handleBlur() {
                setTimeout(() => {
                    const activeElement = document.activeElement;
                    if (!activeElement || !container.contains(activeElement)) {
                        if (isKeyboardOpen) {
                            unblockScroll();
                            isKeyboardOpen = false;
                        }
                    }
                }, 100);
            }

            inputs.forEach(input => {
                input.addEventListener('focus', handleFocus);
                input.addEventListener('blur', handleBlur);
            });

            // Полное восстановление при закрытии попапа
            function restoreAll() {
                unblockScroll();
                isKeyboardOpen = false;
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
                            blockScroll();
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