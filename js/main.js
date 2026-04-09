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

    // --- ГЛАВНАЯ ФУНКЦИЯ БЛОКИРОВКИ (как в виджете) ---
    function createScrollBlocker() {
        let scrollPosition = 0;
        let scrollBlocked = false;
        let touchMoveHandler = null;
        let wheelHandler = null;

        function block() {
            if (scrollBlocked) return;

            const docEl = document.documentElement;
            const body = document.body;

            // Сохраняем позицию
            scrollPosition = window.scrollY;

            // Метод 1: Фиксируем через position (работает везде)
            body.style.position = 'fixed';
            body.style.top = `-${scrollPosition}px`;
            body.style.left = '0';
            body.style.right = '0';
            body.style.bottom = '0';
            body.style.overflow = 'hidden';

            // Метод 2: Блокируем touchmove (для iOS)
            touchMoveHandler = (e) => {
                // Разрешаем скролл только внутри попапа
                const popup = document.querySelector('.pm-popup-overlay.active');
                if (popup && !popup.contains(e.target)) {
                    e.preventDefault();
                }
            };

            // Метод 3: Блокируем колесо мыши (для Android с мышкой)
            wheelHandler = (e) => {
                const popup = document.querySelector('.pm-popup-overlay.active');
                if (popup && !popup.contains(e.target)) {
                    e.preventDefault();
                }
            };

            document.addEventListener('touchmove', touchMoveHandler, { passive: false });
            document.addEventListener('wheel', wheelHandler, { passive: false });

            // Метод 4: Для iOS Safari - блокируем скролл через CSS + preventDefault на touchstart
            docEl.style.overflow = 'hidden';
            docEl.style.touchAction = 'none';
            body.style.touchAction = 'none';

            scrollBlocked = true;
        }

        function unblock() {
            if (!scrollBlocked) return;

            const body = document.body;
            const docEl = document.documentElement;

            // Восстанавливаем стили
            body.style.position = '';
            body.style.top = '';
            body.style.left = '';
            body.style.right = '';
            body.style.bottom = '';
            body.style.overflow = '';
            body.style.touchAction = '';

            docEl.style.overflow = '';
            docEl.style.touchAction = '';

            // Удаляем обработчики
            if (touchMoveHandler) {
                document.removeEventListener('touchmove', touchMoveHandler);
                touchMoveHandler = null;
            }
            if (wheelHandler) {
                document.removeEventListener('wheel', wheelHandler);
                wheelHandler = null;
            }

            // Восстанавливаем скролл
            window.scrollTo(0, scrollPosition);

            scrollBlocked = false;
        }

        return { block, unblock };
    }

    function initMobileFormFixes() {
        if (!isMobileDevice()) return;

        // Включаем overlaysContent для виртуальной клавиатуры
        if ("virtualKeyboard" in navigator) {
            navigator.virtualKeyboard.overlaysContent = true;
        }

        const popups = document.querySelectorAll('.pm-popup-overlay');
        const scrollBlocker = createScrollBlocker();

        popups.forEach(popup => {
            const container = popup.querySelector('.pm-popup-feedback__container');
            if (!container) return;

            const inputs = container.querySelectorAll('input, textarea, select');

            let isKeyboardOpen = false;

            // Скролл к активному элементу
            function scrollToActiveElement(element) {
                if (!element) return;

                setTimeout(() => {
                    const elementRect = element.getBoundingClientRect();
                    const containerRect = container.getBoundingClientRect();

                    if (elementRect.bottom > containerRect.bottom || elementRect.top < containerRect.top) {
                        const scrollOffset = elementRect.top - containerRect.top - 20;
                        container.scrollBy({ top: scrollOffset, behavior: 'smooth' });
                    }
                }, 300);
            }

            function handleFocus(e) {
                if (!isKeyboardOpen) {
                    isKeyboardOpen = true;
                    scrollBlocker.block();
                }
                scrollToActiveElement(e.target);
            }

            function handleBlur() {
                setTimeout(() => {
                    const activeElement = document.activeElement;
                    if (!activeElement || !container.contains(activeElement)) {
                        if (isKeyboardOpen) {
                            scrollBlocker.unblock();
                            isKeyboardOpen = false;
                        }
                    }
                }, 100);
            }

            inputs.forEach(input => {
                input.addEventListener('focus', handleFocus);
                input.addEventListener('blur', handleBlur);
            });

            // Восстановление при закрытии попапа
            function restoreAll() {
                scrollBlocker.unblock();
                isKeyboardOpen = false;
            }

            // Закрытие по кнопкам
            const closeButtons = popup.querySelectorAll('[class*="close-"], .pm-btn--primary');
            closeButtons.forEach(btn => btn.addEventListener('click', restoreAll));

            // Закрытие по оверлею
            popup.addEventListener('click', (e) => {
                if (e.target === popup) restoreAll();
            });

            // Отслеживание удаления класса active
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                        if (!popup.classList.contains('active')) {
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