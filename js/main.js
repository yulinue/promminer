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

            // Сохраняем оригинальную высоту оверлея
            const originalHeight = popup.style.height || '100dvh';

            // Функция для обновления высоты оверлея с учётом клавиатуры
            function updateForKeyboard() {
                if (!window.visualViewport) return;

                const viewport = window.visualViewport;
                const windowHeight = window.innerHeight;
                const keyboardHeight = windowHeight - viewport.height;

                if (keyboardHeight > 100 && window.innerWidth <= 768) {
                    // Клавиатура открыта на мобильном
                    // Ограничиваем высоту оверлея: высота экрана минус клавиатура
                    popup.style.height = `${viewport.height}px`;
                    popup.style.maxHeight = `${viewport.height}px`;

                    // Меняем выравнивание на flex-start чтобы форма была сверху
                    popup.style.alignItems = 'flex-start';
                    popup.style.paddingTop = '20px';

                    // Ограничиваем высоту контейнера формы
                    container.style.maxHeight = `${viewport.height - 40}px`; // 20px сверху + 20px снизу
                } else {
                    // Клавиатура закрыта — возвращаем всё как было
                    popup.style.height = '';
                    popup.style.maxHeight = '';
                    popup.style.alignItems = '';
                    popup.style.paddingTop = '';
                    container.style.maxHeight = '';
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
                container.style.maxHeight = '';
            }

            const closeButtons = popup.querySelectorAll('.close-feedback-popup');
            const submitBtn = container.querySelector('button[type="submit"]');

            closeButtons.forEach(btn => btn.addEventListener('click', restoreAll));
            if (submitBtn) submitBtn.addEventListener('click', restoreAll);

            // Также восстанавливаем при клике на оверлей (если есть такой функционал)
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