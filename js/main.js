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

    function initMobileFormFixes() {
        if (!isMobileDevice()) return;

        const popups = document.querySelectorAll('.pm-popup-overlay');

        popups.forEach(popup => {
            const container = popup.querySelector('.pm-popup-feedback__container');
            if (!container) return;

            const inputs = container.querySelectorAll('input, textarea, select');
            const selects = popup.querySelectorAll('.pm-custom-select');

            let isKeyboardOpen = false;

            // Блокировка скролла body
            function lockBodyScroll() {
                const scrollY = window.scrollY;
                document.body.style.position = 'fixed';
                document.body.style.top = `-${scrollY}px`;
                document.body.style.width = '100%';
                document.body.style.overflow = 'hidden';
                document.documentElement.style.overflow = 'hidden';
            }

            // Разблокировка скролла body - ИСПРАВЛЕННАЯ ВЕРСИЯ
            function unlockBodyScroll() {
                const scrollY = document.body.style.top;

                // Полностью очищаем все стили, которые мы добавили
                document.body.style.position = '';
                document.body.style.top = '';
                document.body.style.width = '';
                document.body.style.overflow = '';
                document.documentElement.style.overflow = '';

                // Восстанавливаем скролл на позицию
                if (scrollY && scrollY.startsWith('-')) {
                    const savedPosition = parseInt(scrollY.replace('-', '').replace('px', ''));
                    if (!isNaN(savedPosition)) {
                        // Небольшая задержка чтобы стили применились
                        setTimeout(() => {
                            window.scrollTo(0, savedPosition);
                        }, 10);
                    }
                }
            }

            // Предотвращение touchmove на body и оверлее
            function preventTouchMove(e) {
                if (!isKeyboardOpen) return;

                const target = e.target;
                const isInsideContainer = container.contains(target);
                const isSelectDropdown = target.closest('.pm-custom-select__dropdown');

                if (!isInsideContainer && !isSelectDropdown) {
                    e.preventDefault();
                    return;
                }
            }

            // Предотвращение скролла колесиком мыши
            function preventWheelScroll(e) {
                if (!isKeyboardOpen) return;

                const target = e.target;
                if (!container.contains(target)) {
                    e.preventDefault();
                }
            }

            // Обновление высоты при открытии клавиатуры
            function updateForKeyboard() {
                if (!window.visualViewport) return;

                const viewport = window.visualViewport;
                const windowHeight = window.innerHeight;
                const keyboardHeight = windowHeight - viewport.height;

                if (keyboardHeight > 100) {
                    if (!isKeyboardOpen) {
                        isKeyboardOpen = true;
                        lockBodyScroll();

                        document.addEventListener('touchmove', preventTouchMove, { passive: false });
                        document.addEventListener('wheel', preventWheelScroll, { passive: false });
                    }

                    const topPadding = viewport.height * 0.05;

                    popup.style.height = `${viewport.height}px`;
                    popup.style.maxHeight = `${viewport.height}px`;
                    popup.style.alignItems = 'flex-start';
                    popup.style.paddingTop = `${topPadding}px`;
                    popup.style.paddingBottom = '0';

                    container.style.maxHeight = `${viewport.height - topPadding}px`;
                    container.style.borderBottomLeftRadius = '0';
                    container.style.borderBottomRightRadius = '0';
                } else {
                    if (isKeyboardOpen) {
                        isKeyboardOpen = false;
                        unlockBodyScroll();

                        document.removeEventListener('touchmove', preventTouchMove);
                        document.removeEventListener('wheel', preventWheelScroll);
                    }

                    popup.style.height = '';
                    popup.style.maxHeight = '';
                    popup.style.alignItems = '';
                    popup.style.paddingTop = '';
                    popup.style.paddingBottom = '';
                    container.style.maxHeight = '';
                    container.style.borderBottomLeftRadius = '';
                    container.style.borderBottomRightRadius = '';
                }
            }

            // Скролл к активному элементу
            function scrollToActiveElement(element) {
                if (!element || !isKeyboardOpen) return;

                setTimeout(() => {
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
                }, 250);
            }

            // Обработчики фокуса
            function handleFocus(e) {
                updateForKeyboard();
                scrollToActiveElement(e.target);
            }

            function handleBlur() {
                setTimeout(() => {
                    const activeElement = document.activeElement;
                    if (!activeElement || !container.contains(activeElement)) {
                        if (isKeyboardOpen) {
                            isKeyboardOpen = false;
                            unlockBodyScroll();

                            document.removeEventListener('touchmove', preventTouchMove);
                            document.removeEventListener('wheel', preventWheelScroll);
                        }

                        popup.style.height = '';
                        popup.style.maxHeight = '';
                        popup.style.alignItems = '';
                        popup.style.paddingTop = '';
                        popup.style.paddingBottom = '';
                        container.style.maxHeight = '';
                        container.style.borderBottomLeftRadius = '';
                        container.style.borderBottomRightRadius = '';
                    }
                }, 100);
            }

            // Навешиваем обработчики на все инпуты
            inputs.forEach(input => {
                input.addEventListener('focus', handleFocus);
                input.addEventListener('blur', handleBlur);
            });

            // Для кастомных селектов
            selects.forEach(select => {
                select.addEventListener('click', () => {
                    if (isKeyboardOpen) {
                        updateForKeyboard();
                    }
                });
            });

            // Следим за visualViewport
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

            // Восстановление при закрытии попапа - ИСПРАВЛЕННАЯ ВЕРСИЯ
            function restoreAll() {
                // Снимаем блокировку с body
                const scrollY = document.body.style.top;

                document.body.style.position = '';
                document.body.style.top = '';
                document.body.style.width = '';
                document.body.style.overflow = '';
                document.documentElement.style.overflow = '';

                // Восстанавливаем позицию скролла
                if (scrollY && scrollY.startsWith('-')) {
                    const savedPosition = parseInt(scrollY.replace('-', '').replace('px', ''));
                    if (!isNaN(savedPosition)) {
                        setTimeout(() => {
                            window.scrollTo(0, savedPosition);
                        }, 10);
                    }
                }

                // Сбрасываем флаг и удаляем слушатели
                isKeyboardOpen = false;
                document.removeEventListener('touchmove', preventTouchMove);
                document.removeEventListener('wheel', preventWheelScroll);

                // Сбрасываем стили попапа и контейнера
                popup.style.height = '';
                popup.style.maxHeight = '';
                popup.style.alignItems = '';
                popup.style.paddingTop = '';
                popup.style.paddingBottom = '';
                container.style.maxHeight = '';
                container.style.borderBottomLeftRadius = '';
                container.style.borderBottomRightRadius = '';
            }

            // Ищем кнопки закрытия
            const closeButtons = popup.querySelectorAll('[class*="close-"]');
            const submitBtn = container.querySelector('button[type="submit"]');

            closeButtons.forEach(btn => {
                btn.addEventListener('click', restoreAll);
            });

            if (submitBtn) {
                submitBtn.addEventListener('click', (e) => {
                    // Не мешаем отправке формы
                    setTimeout(restoreAll, 100);
                });
            }

            // Клик по оверлею
            popup.addEventListener('click', (e) => {
                if (e.target === popup) {
                    restoreAll();
                }
            });

            // Дополнительно: слушаем закрытие попапа через класс active
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                        if (!popup.classList.contains('active')) {
                            // Попап закрылся - восстанавливаем всё
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