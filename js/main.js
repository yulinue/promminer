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

            // Функция для обновления отступов с учётом клавиатуры
            function updateForKeyboard() {
                if (!window.visualViewport) return;

                const viewport = window.visualViewport;
                const windowHeight = window.innerHeight;
                const keyboardHeight = windowHeight - viewport.height;

                if (keyboardHeight > 100) { // Клавиатура точно открыта
                    // Добавляем padding-bottom к оверлею равный высоте клавиатуры
                    popup.style.paddingBottom = `${keyboardHeight}px`;

                    // Немного уменьшаем max-height для надёжности
                    container.style.maxHeight = `calc(95vh - ${keyboardHeight}px)`;

                    // Меняем выравнивание на flex-start чтобы форма была сверху
                    if (window.innerWidth <= 768) {
                        popup.style.alignItems = 'flex-start';
                        // Добавляем небольшой отступ сверху чтобы не прилипало к краю
                        popup.style.paddingTop = '20px';
                    }
                } else {
                    // Клавиатура закрыта — возвращаем всё как было
                    popup.style.paddingBottom = '';
                    popup.style.paddingTop = '';
                    popup.style.alignItems = '';
                    container.style.maxHeight = '';
                }
            }

            // Функция для скролла к активному элементу
            function scrollToActiveElement(element) {
                setTimeout(() => {
                    if (!element) return;

                    // Небольшая задержка чтобы DOM обновился после изменения padding
                    requestAnimationFrame(() => {
                        const containerRect = container.getBoundingClientRect();
                        const elementRect = element.getBoundingClientRect();

                        // Проверяем видимость элемента относительно контейнера
                        const elementRelativeTop = elementRect.top - containerRect.top;
                        const elementRelativeBottom = elementRect.bottom - containerRect.top;

                        const visibleTop = container.scrollTop;
                        const visibleBottom = container.scrollTop + container.clientHeight;

                        // Если элемент не полностью виден
                        if (elementRelativeBottom > visibleBottom) {
                            // Скроллим так, чтобы элемент оказался вверху видимой области
                            container.scrollTo({
                                top: elementRelativeTop - 20,
                                behavior: 'smooth'
                            });
                        } else if (elementRelativeTop < visibleTop) {
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

                    // Обновляем отступы с учётом клавиатуры
                    updateForKeyboard();

                    // Скроллим к элементу
                    scrollToActiveElement(e.target);
                });

                input.addEventListener('blur', () => {
                    // Не сразу убираем отступы, даём время на переключение между полями
                    setTimeout(() => {
                        const activeElement = document.activeElement;
                        // Если фокус не перешёл на другой инпут в этой же форме
                        if (!activeElement || !container.contains(activeElement)) {
                            // Восстанавливаем body
                            const scrollY = document.body.style.top;
                            document.body.style.position = '';
                            document.body.style.top = '';
                            document.body.style.width = '';

                            if (scrollY) {
                                window.scrollTo(0, parseInt(scrollY || '0') * -1);
                            }

                            // Возвращаем оригинальные стили
                            popup.style.paddingBottom = '';
                            popup.style.paddingTop = '';
                            popup.style.alignItems = '';
                            container.style.maxHeight = '';
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

            // Восстановление при закрытии
            function restoreAll() {
                const scrollY = document.body.style.top;
                document.body.style.position = '';
                document.body.style.top = '';
                document.body.style.width = '';

                if (scrollY) {
                    window.scrollTo(0, parseInt(scrollY || '0') * -1);
                }

                popup.style.paddingBottom = '';
                popup.style.paddingTop = '';
                popup.style.alignItems = '';
                container.style.maxHeight = '';
            }

            const closeButtons = popup.querySelectorAll('.close-feedback-popup');
            const submitBtn = container.querySelector('button[type="submit"]');

            closeButtons.forEach(btn => btn.addEventListener('click', restoreAll));
            if (submitBtn) submitBtn.addEventListener('click', restoreAll);
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