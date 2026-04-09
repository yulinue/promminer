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
        const userAgentCheck = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const touchCheck = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
        const screenCheck = window.innerWidth <= 1024 && touchCheck;
        return userAgentCheck || (touchCheck && screenCheck);
    }

    // --- НОВАЯ ФУНКЦИЯ: Блокировка скролла через overflow: hidden ---
    function blockPageScroll(popupContainer) {
        // 1. Находим все скроллящиеся элементы, которые нужно заблокировать
        const scrollableElements = [];

        // Начинаем с html и body
        const html = document.documentElement;
        const body = document.body;

        if (isElementScrollable(html)) scrollableElements.push(html);
        if (isElementScrollable(body)) scrollableElements.push(body);

        // Ищем родителей попапа, которые могут скроллиться
        let parent = popupContainer.parentElement;
        while (parent) {
            if (isElementScrollable(parent) && !scrollableElements.includes(parent)) {
                scrollableElements.push(parent);
            }
            parent = parent.parentElement;
        }

        // Сохраняем текущие позиции скролла и блокируем
        scrollableElements.forEach(el => {
            // Сохраняем позицию в data-атрибутах
            el.dataset.scrollTop = el.scrollTop;
            el.dataset.scrollLeft = el.scrollLeft;

            // Блокируем скролл
            el.style.overflow = 'hidden';

            // Для body и html на iOS нужен дополнительный touch-action
            if (el === body || el === html) {
                el.style.position = 'relative';
                el.style.height = '100%';
            }
        });

        // 2. Предотвращаем touchmove на заблокированных элементах
        function preventTouchMove(e) {
            const target = e.target;
            // Разрешаем скролл только внутри контейнера попапа
            if (!popupContainer.contains(target)) {
                e.preventDefault();
            }
        }

        document.addEventListener('touchmove', preventTouchMove, { passive: false });

        // Возвращаем функцию очистки
        return function unblockPageScroll() {
            scrollableElements.forEach(el => {
                // Восстанавливаем overflow
                el.style.overflow = '';
                el.style.position = '';
                el.style.height = '';

                // Восстанавливаем позицию скролла
                const savedTop = el.dataset.scrollTop;
                const savedLeft = el.dataset.scrollLeft;

                if (savedTop !== undefined) {
                    el.scrollTop = parseInt(savedTop, 10);
                    delete el.dataset.scrollTop;
                }
                if (savedLeft !== undefined) {
                    el.scrollLeft = parseInt(savedLeft, 10);
                    delete el.dataset.scrollLeft;
                }
            });

            document.removeEventListener('touchmove', preventTouchMove);
        };
    }

    // Проверка, скроллится ли элемент
    function isElementScrollable(el) {
        const style = window.getComputedStyle(el);
        const overflowY = style.overflowY;
        const overflowX = style.overflowX;

        return (overflowY === 'scroll' || overflowY === 'auto' || overflowX === 'scroll' || overflowX === 'auto')
            && (el.scrollHeight > el.clientHeight || el.scrollWidth > el.clientWidth);
    }

    function initMobileFormFixes() {
        if (!isMobileDevice()) return;

        // Устанавливаем overlaysContent для виртуальной клавиатуры
        if ("virtualKeyboard" in navigator) {
            navigator.virtualKeyboard.overlaysContent = true;
        }

        const popups = document.querySelectorAll('.pm-popup-overlay');

        popups.forEach(popup => {
            const container = popup.querySelector('.pm-popup-feedback__container');
            if (!container) return;

            const inputs = container.querySelectorAll('input, textarea, select');

            let isKeyboardOpen = false;
            let unblockPageScroll = null;

            // Функция для скролла к активному элементу
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
                    unblockPageScroll = blockPageScroll(container);
                }
                scrollToActiveElement(e.target);
            }

            function handleBlur() {
                setTimeout(() => {
                    const activeElement = document.activeElement;
                    if (!activeElement || !container.contains(activeElement)) {
                        if (isKeyboardOpen && unblockPageScroll) {
                            unblockPageScroll();
                            unblockPageScroll = null;
                            isKeyboardOpen = false;
                        }
                    }
                }, 100);
            }

            inputs.forEach(input => {
                input.addEventListener('focus', handleFocus);
                input.addEventListener('blur', handleBlur);
            });

            // Функция полного сброса при закрытии попапа
            function restoreAll() {
                if (unblockPageScroll) {
                    unblockPageScroll();
                    unblockPageScroll = null;
                }
                isKeyboardOpen = false;
            }

            const closeButtons = popup.querySelectorAll('[class*="close-"]');
            closeButtons.forEach(btn => btn.addEventListener('click', restoreAll));

            popup.addEventListener('click', (e) => {
                if (e.target === popup) restoreAll();
            });

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