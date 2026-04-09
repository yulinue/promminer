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

    // --- Функция принудительной блокировки скролла страницы (как в виджете) ---
    function createPageScrollLocker() {
        let isLocked = false;
        let savedScrollTop = 0;
        let scrollingElement = null;

        function lock() {
            if (isLocked) return;

            // Находим элемент, который реально скроллит страницу
            scrollingElement = document.scrollingElement || document.documentElement;

            // Сохраняем текущую позицию скролла
            savedScrollTop = scrollingElement.scrollTop;

            // ПРИНУДИТЕЛЬНО ФИКСИРУЕМ СТРАНИЦУ
            scrollingElement.style.position = 'fixed';
            scrollingElement.style.top = `-${savedScrollTop}px`;
            scrollingElement.style.left = '0';
            scrollingElement.style.right = '0';
            scrollingElement.style.width = '100%';
            scrollingElement.style.overflow = 'hidden';

            // Дополнительно для body (на всякий случай)
            document.body.style.position = 'fixed';
            document.body.style.top = `-${savedScrollTop}px`;
            document.body.style.left = '0';
            document.body.style.right = '0';
            document.body.style.width = '100%';
            document.body.style.overflow = 'hidden';

            isLocked = true;
        }

        function unlock() {
            if (!isLocked || !scrollingElement) return;

            // Восстанавливаем стили
            scrollingElement.style.position = '';
            scrollingElement.style.top = '';
            scrollingElement.style.left = '';
            scrollingElement.style.right = '';
            scrollingElement.style.width = '';
            scrollingElement.style.overflow = '';

            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.left = '';
            document.body.style.right = '';
            document.body.style.width = '';
            document.body.style.overflow = '';

            // Восстанавливаем скролл
            scrollingElement.scrollTop = savedScrollTop;
            document.body.scrollTop = savedScrollTop;
            window.scrollTo(0, savedScrollTop);

            isLocked = false;
            scrollingElement = null;
        }

        return { lock, unlock };
    }

    function initMobileFormFixes() {
        if (!isMobileDevice()) return;

        // Включаем overlaysContent для виртуальной клавиатуры
        if ("virtualKeyboard" in navigator) {
            navigator.virtualKeyboard.overlaysContent = true;
        }

        const popups = document.querySelectorAll('.pm-popup-overlay');
        const pageLocker = createPageScrollLocker();

        popups.forEach(popup => {
            const container = popup.querySelector('.pm-popup-feedback__container');
            if (!container) return;

            const inputs = container.querySelectorAll('input, textarea, select');

            let isKeyboardOpen = false;

            // Функция для скролла КОНТЕЙНЕРА к активному элементу (не страницы!)
            function scrollContainerToElement(element) {
                if (!element) return;

                setTimeout(() => {
                    const elementRect = element.getBoundingClientRect();
                    const containerRect = container.getBoundingClientRect();

                    // Проверяем, не перекрыт ли элемент клавиатурой
                    if (elementRect.bottom > containerRect.bottom) {
                        // Скроллим только контейнер, не страницу!
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
                    // ПРИ ОТКРЫТИИ КЛАВИАТУРЫ БЛОКИРУЕМ СТРАНИЦУ
                    pageLocker.lock();
                }
                scrollContainerToElement(e.target);
            }

            function handleBlur() {
                setTimeout(() => {
                    const activeElement = document.activeElement;
                    if (!activeElement || !container.contains(activeElement)) {
                        if (isKeyboardOpen) {
                            // При закрытии клавиатуры разблокируем страницу
                            pageLocker.unlock();
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
                pageLocker.unlock();
                isKeyboardOpen = false;

                // Сбрасываем скролл контейнера
                if (container) {
                    container.scrollTop = 0;
                }
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

            // Также при открытии попапа (если клавиатура ещё не открыта) блокируем страницу
            const popupObserver = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                        if (popup.classList.contains('active')) {
                            // Попап открыт - блокируем страницу сразу
                            pageLocker.lock();
                        }
                    }
                });
            });
            popupObserver.observe(popup, { attributes: true });
        });
    }

    // Инициализация
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMobileFormFixes);
    } else {
        initMobileFormFixes();
    }
})();