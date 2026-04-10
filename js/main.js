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
        return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
            || (('ontouchstart' in window) && window.innerWidth <= 1024);
    }

    function init() {
        if (!isMobileDevice()) return;

        const popups = document.querySelectorAll('.pm-popup-overlay');

        popups.forEach(popup => {
            const container = popup.querySelector('.pm-popup-feedback__container');
            if (!container) return;

            const inputs = container.querySelectorAll('input, textarea, select');
            const closeBtns = popup.querySelectorAll('[class*="close-"], .pm-btn--primary');

            let scrollY = 0;

            // ✅ БЛОК СКРОЛЛА СТРАНИЦЫ
            function lockBody() {
                scrollY = window.scrollY;
                document.body.style.position = 'fixed';
                document.body.style.top = `-${scrollY}px`;
                document.body.style.left = '0';
                document.body.style.right = '0';
                document.body.style.width = '100%';
            }

            function unlockBody() {
                document.body.style.position = '';
                document.body.style.top = '';
                window.scrollTo(0, scrollY);
            }

            // ✅ СКРОЛЛ К ИНПУТУ
            function scrollToInput(el) {
                setTimeout(() => {
                    el.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });
                }, 300); // ждём клавиатуру
            }

            // ✅ ФОКУС
            inputs.forEach(input => {
                input.addEventListener('focus', (e) => {
                    lockBody();
                    scrollToInput(e.target);
                });
            });

            // ✅ ЗАКРЫТИЕ
            function reset() {
                unlockBody();
                container.scrollTop = 0;
            }

            closeBtns.forEach(btn => {
                btn.addEventListener('click', reset);
            });

            popup.addEventListener('click', (e) => {
                if (e.target === popup) reset();
            });

            // ✅ ОТСЛЕЖИВАНИЕ ОТКРЫТИЯ
            const observer = new MutationObserver(() => {
                if (popup.classList.contains('active')) {
                    container.scrollTop = 0;
                } else {
                    reset();
                }
            });

            observer.observe(popup, { attributes: true });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();