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

    // Функция для определения мобильного устройства
    function isMobileDevice() {
        const userAgentCheck = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const touchCheck = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
        const screenCheck = window.innerWidth <= 1024 && touchCheck;
        return userAgentCheck || (touchCheck && screenCheck);
    }

    function initMobileFormFixes() {
        if (!isMobileDevice()) return;

        const popups = document.querySelectorAll('.pm-popup-overlay');

        popups.forEach(popup => {
            const container = popup.querySelector('.pm-popup-feedback__container');
            if (!container) return;

            const inputs = container.querySelectorAll('input, textarea, select');

            // Переменная для отслеживания состояния
            let isKeyboardOpen = false;

            // Функция для блокировки скролла body
            function lockBodyScroll() {
                const scrollY = window.scrollY;
                document.body.style.position = 'fixed';
                document.body.style.top = `-${scrollY}px`;
                document.body.style.width = '100%';
                document.body.style.overflow = 'hidden';
                document.documentElement.style.overflow = 'hidden';

                // Блокируем touch-события на body
                document.body.style.touchAction = 'none';
                document.body.style.webkitOverflowScrolling = 'auto';
            }

            // Функция для разблокировки скролла body
            function unlockBodyScroll() {
                const scrollY = document.body.style.top;
                document.body.style.position = '';
                document.body.style.top = '';
                document.body.style.width = '';
                document.body.style.overflow = '';
                document.documentElement.style.overflow = '';
                document.body.style.touchAction = '';
                document.body.style.webkitOverflowScrolling = '';

                if (scrollY) {
                    window.scrollTo(0, parseInt(scrollY || '0') * -1);
                }
            }

            // Предотвращаем скролл body при касании вне контейнера
            function preventBodyTouchMove(e) {
                if (isKeyboardOpen) {
                    const target = e.target;
                    // Если касание не внутри контейнера формы - блокируем
                    if (!container.contains(target)) {
                        e.preventDefault();
                    }
                }
            }

            // Предотвращаем скролл оверлея
            function preventOverlayScroll(e) {
                if (isKeyboardOpen) {
                    const target = e.target;
                    // Если скроллят сам оверлей, а не контейнер формы
                    if (target === popup || target.classList.contains('pm-popup-overlay')) {
                        e.preventDefault();
                    }
                }
            }

            // Функция для обновления высоты оверлея с учётом клавиатуры
            function updateForKeyboard() {
                if (!window.visualViewport) return;

                const viewport = window.visualViewport;
                const windowHeight = window.innerHeight;
                const keyboardHeight = windowHeight - viewport.height;

                if (keyboardHeight > 100) {
                    isKeyboardOpen = true;

                    // Добавляем класс для CSS
                    popup.classList.add('keyboard-open');
                    container.classList.add('keyboard-open');

                    const topPadding = viewport.height * 0.05;

                    popup.style.height = `${viewport.height}px`;
                    popup.style.maxHeight = `${viewport.height}px`;
                    popup.style.alignItems = 'flex-start';
                    popup.style.paddingTop = `${topPadding}px`;
                    popup.style.paddingBottom = '0';

                    container.style.maxHeight = `${viewport.height - topPadding}px`;
                    container.style.borderBottomLeftRadius = '0';
                    container.style.borderBottomRightRadius = '0';

                    // Блокируем скролл body и touch-события
                    lockBodyScroll();

                    // Добавляем слушатели для предотвращения скролла
                    document.addEventListener('touchmove', preventBodyTouchMove, { passive: false });
                    popup.addEventListener('touchmove', preventOverlayScroll, { passive: false });
                } else {
                    isKeyboardOpen = false;

                    popup.classList.remove('keyboard-open');
                    container.classList.remove('keyboard-open');

                    popup.style.height = '';
                    popup.style.maxHeight = '';
                    popup.style.alignItems = '';
                    popup.style.paddingTop = '';
                    popup.style.paddingBottom = '';
                    container.style.maxHeight = '';
                    container.style.borderBottomLeftRadius = '';
                    container.style.borderBottomRightRadius = '';

                    // Убираем слушатели
                    document.removeEventListener('touchmove', preventBodyTouchMove);
                    popup.removeEventListener('touchmove', preventOverlayScroll);
                }
            }

            // Функция для скролла к активному элементу
            function scrollToActiveElement(element) {
                setTimeout(() => {
                    if (!element) return;

                    requestAnimationFrame(() => {
                        const containerRect = container.getBoundingClientRect();
                        const elementRect = element.getBoundingClientRect();

                        const elementRelativeTop = elementRect.top - containerRect.top;
                        const elementRelativeBottom = elementRect.bottom - containerRect.top;

                        const visibleTop = container.scrollTop;
                        const visibleBottom = container.scrollTop + container.clientHeight;

                        if (elementRelativeBottom > visibleBottom || elementRelativeTop < visibleTop) {
                            container.scrollTo({
                                top: elementRelativeTop - 20,
                                behavior: 'smooth'
                            });
                        }
                    });
                }, 200);
            }

            // Обработчик фокуса
            inputs.forEach(input => {
                input.addEventListener('focus', (e) => {
                    updateForKeyboard();
                    scrollToActiveElement(e.target);
                });

                input.addEventListener('blur', () => {
                    setTimeout(() => {
                        const activeElement = document.activeElement;
                        if (!activeElement || !container.contains(activeElement)) {
                            isKeyboardOpen = false;

                            popup.classList.remove('keyboard-open');
                            container.classList.remove('keyboard-open');

                            unlockBodyScroll();

                            popup.style.height = '';
                            popup.style.maxHeight = '';
                            popup.style.alignItems = '';
                            popup.style.paddingTop = '';
                            popup.style.paddingBottom = '';
                            container.style.maxHeight = '';
                            container.style.borderBottomLeftRadius = '';
                            container.style.borderBottomRightRadius = '';

                            document.removeEventListener('touchmove', preventBodyTouchMove);
                            popup.removeEventListener('touchmove', preventOverlayScroll);
                        }
                    }, 100);
                });
            });

            // Следим за изменениями visualViewport
            if (window.visualViewport) {
                let ticking = false;

                window.visualViewport.addEventListener('resize', () => {
                    if (!ticking) {
                        window.requestAnimationFrame(() => {
                            const activeElement = document.activeElement;
                            if (activeElement && container.contains(activeElement)) {
                                updateForKeyboard();
                                scrollToActiveElement(activeElement);
                            }
                            ticking = false;
                        });
                        ticking = true;
                    }
                });
            }

            // Восстановление при закрытии попапа
            function restoreAll() {
                isKeyboardOpen = false;

                popup.classList.remove('keyboard-open');
                container.classList.remove('keyboard-open');

                unlockBodyScroll();

                popup.style.height = '';
                popup.style.maxHeight = '';
                popup.style.alignItems = '';
                popup.style.paddingTop = '';
                popup.style.paddingBottom = '';
                container.style.maxHeight = '';
                container.style.borderBottomLeftRadius = '';
                container.style.borderBottomRightRadius = '';

                document.removeEventListener('touchmove', preventBodyTouchMove);
                popup.removeEventListener('touchmove', preventOverlayScroll);
            }

            const closeButtons = popup.querySelectorAll('.close-feedback-popup');
            const submitBtn = container.querySelector('button[type="submit"]');

            closeButtons.forEach(btn => btn.addEventListener('click', restoreAll));
            if (submitBtn) submitBtn.addEventListener('click', restoreAll);

            popup.addEventListener('click', (e) => {
                if (e.target === popup) {
                    restoreAll();
                }
            });
        });
    }

    // Инициализация
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMobileFormFixes);
    } else {
        initMobileFormFixes();
    }

    // Наблюдатель за открытием попапа
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const target = mutation.target;
                if (target.classList.contains('active')) {
                    setTimeout(initMobileFormFixes, 100);
                }
            }
        });
    });

    document.querySelectorAll('.pm-popup-overlay').forEach(popup => {
        observer.observe(popup, { attributes: true });
    });

})();