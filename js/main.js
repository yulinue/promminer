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
        // Проверяем по userAgent
        const userAgentCheck = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        // Дополнительная проверка через touch points (для некоторых планшетов и гибридных устройств)
        const touchCheck = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

        // Проверка по соотношению сторон и размеру экрана (для уверенности)
        const screenCheck = window.innerWidth <= 1024 && touchCheck;

        return userAgentCheck || (touchCheck && screenCheck);
    }

    function initMobileFormFixes() {
        // Применяем фиксы только для мобильных устройств
        if (!isMobileDevice()) return;

        const popups = document.querySelectorAll('.pm-popup-overlay');

        popups.forEach(popup => {
            const container = popup.querySelector('.pm-popup-feedback__container');
            if (!container) return;

            const inputs = container.querySelectorAll('input, textarea, select');

            // Функция для обновления высоты оверлея с учётом клавиатуры
            function updateForKeyboard() {
                if (!window.visualViewport) return;

                const viewport = window.visualViewport;
                const windowHeight = window.innerHeight;
                const keyboardHeight = windowHeight - viewport.height;

                if (keyboardHeight > 100) {
                    // Клавиатура открыта
                    const topPadding = viewport.height * 0.05; // 5% от высоты экрана

                    // Ограничиваем высоту оверлея: высота экрана минус клавиатура
                    popup.style.height = `${viewport.height}px`;
                    popup.style.maxHeight = `${viewport.height}px`;

                    // Выравнивание сверху
                    popup.style.alignItems = 'flex-start';
                    popup.style.paddingTop = `${topPadding}px`;
                    popup.style.paddingBottom = '0';

                    // Высота контейнера формы = высота viewport минус верхний отступ
                    container.style.maxHeight = `${viewport.height - topPadding}px`;

                    // Убираем скругления снизу когда клавиатура открыта
                    container.style.borderBottomLeftRadius = '0';
                    container.style.borderBottomRightRadius = '0';
                } else {
                    // Клавиатура закрыта — возвращаем всё как было
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

                        // Если элемент не полностью виден в контейнере
                        if (elementRelativeBottom > visibleBottom || elementRelativeTop < visibleTop) {
                            // Скроллим так, чтобы элемент был в верхней части видимой области
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
                    // Фиксируем body
                    const scrollY = window.scrollY;
                    document.body.style.position = 'fixed';
                    document.body.style.top = `-${scrollY}px`;
                    document.body.style.width = '100%';
                    document.body.style.overflow = 'hidden';

                    // Обновляем высоту оверлея
                    updateForKeyboard();

                    // Скроллим к элементу
                    scrollToActiveElement(e.target);
                });

                input.addEventListener('blur', () => {
                    setTimeout(() => {
                        const activeElement = document.activeElement;
                        // Если фокус не перешёл на другой инпут в этой же форме
                        if (!activeElement || !container.contains(activeElement)) {
                            // Восстанавливаем body
                            const scrollY = document.body.style.top;
                            document.body.style.position = '';
                            document.body.style.top = '';
                            document.body.style.width = '';
                            document.body.style.overflow = '';

                            if (scrollY) {
                                window.scrollTo(0, parseInt(scrollY || '0') * -1);
                            }

                            // Возвращаем оригинальные стили оверлея
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
                const scrollY = document.body.style.top;
                document.body.style.position = '';
                document.body.style.top = '';
                document.body.style.width = '';
                document.body.style.overflow = '';

                if (scrollY) {
                    window.scrollTo(0, parseInt(scrollY || '0') * -1);
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

            const closeButtons = popup.querySelectorAll('.close-feedback-popup');
            const submitBtn = container.querySelector('button[type="submit"]');

            closeButtons.forEach(btn => btn.addEventListener('click', restoreAll));
            if (submitBtn) submitBtn.addEventListener('click', restoreAll);

            // Также восстанавливаем при клике на оверлей
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