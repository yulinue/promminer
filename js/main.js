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

    function initMobileFormFixes() {
        const popups = document.querySelectorAll('.pm-popup-overlay');

        popups.forEach(popup => {
            const container = popup.querySelector('.pm-popup-feedback__container');
            if (!container) return;

            const inputs = container.querySelectorAll('input, textarea, select');

            // Сохраняем оригинальное значение max-height
            const originalMaxHeight = getComputedStyle(container).maxHeight;

            // Функция для обновления max-height с учётом клавиатуры
            function updateContainerHeight() {
                if (!window.visualViewport) return;

                const viewport = window.visualViewport;
                const windowHeight = window.innerHeight;
                const keyboardHeight = windowHeight - viewport.height;

                if (keyboardHeight > 0) {
                    // Клавиатура открыта - вычитаем её высоту
                    const newMaxHeight = `calc(95vh - ${keyboardHeight}px)`;
                    container.style.maxHeight = newMaxHeight;
                } else {
                    // Клавиатура закрыта - возвращаем оригинал
                    container.style.maxHeight = originalMaxHeight;
                }
            }

            // Функция для скролла к активному элементу
            function scrollToActiveElement(element) {
                setTimeout(() => {
                    if (!element) return;

                    const containerRect = container.getBoundingClientRect();
                    const elementRect = element.getBoundingClientRect();

                    // Проверяем, не перекрыт ли элемент клавиатурой
                    const viewport = window.visualViewport;
                    if (viewport) {
                        const elementBottom = elementRect.bottom;
                        const visibleBottom = viewport.height;

                        if (elementBottom > visibleBottom - 50) {
                            // Элемент перекрыт клавиатурой - скроллим к нему
                            const scrollNeeded = elementBottom - visibleBottom + 70;

                            // Скроллим контейнер, а не всю страницу
                            const currentScroll = container.scrollTop;
                            container.scrollTo({
                                top: currentScroll + scrollNeeded,
                                behavior: 'smooth'
                            });
                        }
                    }
                }, 150);
            }

            // Обработчик фокуса
            inputs.forEach(input => {
                input.addEventListener('focus', (e) => {
                    // Фиксируем body
                    const scrollY = window.scrollY;
                    document.body.style.position = 'fixed';
                    document.body.style.top = `-${scrollY}px`;
                    document.body.style.width = '100%';

                    // Обновляем высоту контейнера с учётом клавиатуры
                    updateContainerHeight();

                    // Скроллим к элементу
                    scrollToActiveElement(e.target);
                });

                input.addEventListener('blur', () => {
                    // Восстанавливаем body
                    const scrollY = document.body.style.top;
                    document.body.style.position = '';
                    document.body.style.top = '';
                    document.body.style.width = '';

                    if (scrollY) {
                        window.scrollTo(0, parseInt(scrollY || '0') * -1);
                    }

                    // Возвращаем оригинальную высоту
                    container.style.maxHeight = originalMaxHeight;
                });
            });

            // Следим за изменениями visualViewport (например, при смене ориентации)
            if (window.visualViewport) {
                let ticking = false;

                window.visualViewport.addEventListener('resize', () => {
                    if (!ticking) {
                        window.requestAnimationFrame(() => {
                            const activeElement = document.activeElement;
                            if (activeElement && container.contains(activeElement)) {
                                updateContainerHeight();
                                scrollToActiveElement(activeElement);
                            }
                            ticking = false;
                        });
                        ticking = true;
                    }
                });
            }

            // Обработчики для кнопок закрытия и submit
            const closeButtons = popup.querySelectorAll('.close-feedback-popup');
            const submitBtn = container.querySelector('button[type="submit"]');

            const restoreBodyAndHeight = () => {
                const scrollY = document.body.style.top;
                document.body.style.position = '';
                document.body.style.top = '';
                document.body.style.width = '';

                if (scrollY) {
                    window.scrollTo(0, parseInt(scrollY || '0') * -1);
                }

                container.style.maxHeight = originalMaxHeight;
            };

            closeButtons.forEach(btn => btn.addEventListener('click', restoreBodyAndHeight));
            if (submitBtn) submitBtn.addEventListener('click', restoreBodyAndHeight);
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