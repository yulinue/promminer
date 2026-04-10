document.addEventListener('DOMContentLoaded', () => {
    /* ---------------- SWIPER ---------------- */

    const swipers = [];

    document.querySelectorAll('.pm-catalog-menu__list-wrapper.swiper').forEach(swiperEl => {

        const swiperInstance = new Swiper(swiperEl, {
            direction: 'vertical',
            slidesPerView: 'auto',
            spaceBetween: 32,
            freeMode: true,
            mousewheel: {
                sensitivity: 0.3,
                forceToAxis: true
            },
            speed: 600,
            scrollbar: {
                el: swiperEl.querySelector('.swiper-scrollbar'),
                draggable: true
            },
            breakpoints: {
                961: {
                    spaceBetween: 24,
                }
            }
        });

        swipers.push(swiperInstance);

    });

    const searchEl = document.querySelector('.pm-menu__search-list');
    const searchSwiper = new Swiper(searchEl, {
        direction: 'vertical',
        slidesPerView: 'auto',
        spaceBetween: 16,
        freeMode: true,
        mousewheel: {
            sensitivity: 0.3,
            forceToAxis: true
        },
        speed: 600,
        scrollbar: {
            el: searchEl.querySelector('.swiper-scrollbar'),
            draggable: true
        },
        breakpoints: {
            600: {
                spaceBetween: 24
            }
        }
    });

    // переключение категорий по ховеру в меню каталога
    const navItems = document.querySelector('#menu-catalog').querySelectorAll('.pm-menu-nav__main-item');
    const categories = document.querySelectorAll('.pm-catalog-category');

    const mobileMenuSubtitle = document.querySelector('.pm-menu-mobile__header-subtitle');
    const mobileMenuCategoryList = document.querySelector('.pm-catalog-menu__content');
    let isCategoryListActive = false;

    navItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            const id = item.dataset.category;

            document.querySelector('.pm-menu-nav__main-item.active')?.classList.remove('active');
            document.querySelector('.pm-catalog-category.active')?.classList.remove('active');

            item.classList.add('active');
            mobileMenuTitle.innerText = item.innerText;
            mobileMenuSubtitle.classList.add('active');
            mobileMenuCategoryList.classList.add('active');
            mobileMenuContainer.classList.add('mobile-category-open');
            isCategoryListActive = true;

            const activeCategory = document.querySelector(`.pm-catalog-category[data-category="${id}"]`);
            activeCategory.classList.add('active');

            // находим Swiper внутри активной категории и обновляем
            const swiperEl = activeCategory.querySelector('.pm-catalog-menu__list-wrapper.swiper');
            const swiperInstance = swipers.find(sw => sw.el === swiperEl);
            swiperInstance?.update();
        });
    });


    /* ---------------- ELEMENTS ---------------- */

    const openCatalogBtn = document.querySelector('#openCatalog');
    const catalogPopup = document.querySelector('#catalogPopup');
    const catalogContainer = catalogPopup.querySelector('.pm-menu-popup__container');

    const openSearchBtn = document.querySelector('#openSearch');
    const searchTab = document.querySelector('#menu-search');

    const openTabBtns = document.querySelectorAll('.pm-header__link');
    const catalogTab = document.querySelector('#menu-catalog');
    const menuTabs = document.querySelectorAll('.pm-menu-popup__container');


    /* ---------------- UTILS ---------------- */

    function resetMenu() {
        menuTabs.forEach(tab => tab.classList.remove('active'));
        openTabBtns.forEach(btn => btn.classList.remove('active-menu-item'));
        openCatalogBtn.classList.remove('active-menu-item');
        searchInputContainer.classList.remove('active');
        headerNav.classList.remove('hidden');
        header.classList.remove('search-open');
        searchActionsBlock.classList.remove('active');
        searchResults.classList.remove('active');
        searchInput.value = '';
        mobileMenuContainer.classList.remove('mobile-catalog-open');
        mobileMenuContainer.classList.remove('mobile-category-open');
        mobileMenuTitle.innerText = 'Меню';
        catalogPopup.classList.remove('mobile-popup-open');
    }

    function getScrollbarWidth() {
        return window.innerWidth - document.documentElement.clientWidth;
    }

    function updateScrollbarWidth() {
        const scrollBarWidth = getScrollbarWidth();
        document.documentElement.style.setProperty('--scrollbar-width', scrollBarWidth + 'px');
    }

    updateScrollbarWidth();
    window.addEventListener('resize', updateScrollbarWidth);

    /* ---------------- POPUP CONTROL ---------------- */
    function openPopup() {
        document.body.classList.add('lock');
        catalogPopup.classList.add('active');
        // обновляем swiper после открытия
        swipers.forEach(swiper => swiper.update());
    }

    function closePopup() {
        document.body.classList.remove('lock');

        catalogPopup.classList.remove('active');
        headerNav.classList.remove('hidden');
        searchInputContainer.classList.remove('active');
        isCategoryListActive = false;
        mobileMenuContainer.classList.remove('mobile-catalog-open');
        mobileMenuSubtitle.classList.remove('active');
        mobileMenuCategoryList.classList.remove('active');
        mobileMenuContainer.classList.remove('mobile-category-open');
        resetMenu();
    }


    /* ---------------- CATALOG BUTTON ---------------- */

    openCatalogBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isPopupOpen = catalogPopup.classList.contains('active');
        const isCatalogActive = catalogTab.classList.contains('active');
        if (isPopupOpen && !isCatalogActive) {
            resetMenu();
            catalogTab.classList.add('active');
            openCatalogBtn.classList.add('active-menu-item');
            catalogPopup.classList.add('mobile-popup-open');
            return;
        }

        if (isPopupOpen) {
            closePopup();
            return;
        }

        openPopup();
        catalogTab.classList.add('active');
        openCatalogBtn.classList.add('active-menu-item');
        catalogPopup.classList.add('mobile-popup-open');

    });

    /* ---------------- CATALOG MOBILE ---------------- */
    const mobileHeaderClose = document.querySelector('#mobileHeaderClose');
    const mobileHeaderPrev = document.querySelector('#mobileHeaderPrev');
    const mobileCatalogOpen = document.querySelector('#openMobileCatalog');
    const mobileMenuContainer = document.querySelector('.pm-menu-popup--mobile');

    const mobileMenuTitle = document.querySelector('.pm-menu-mobile__header-title');

    mobileHeaderClose.addEventListener('click', () => {
        closePopup();
    });
    mobileHeaderPrev.addEventListener('click', () => {
        if(isCategoryListActive){
            mobileMenuCategoryList.classList.remove('active');
            mobileMenuSubtitle.classList.remove('active');
            mobileMenuContainer.classList.remove('mobile-category-open');
            mobileMenuTitle.innerText = 'Каталог'
            isCategoryListActive = false;
        } else {
            mobileMenuContainer.classList.remove('mobile-catalog-open');
            mobileMenuTitle.innerText = 'Меню';
        }
    });
    mobileCatalogOpen.addEventListener('click', () => {
        mobileMenuContainer.classList.add('mobile-catalog-open');
        mobileMenuTitle.innerText = 'Каталог';
    });

    /* ---------------- SEARCH BUTTON ---------------- */
    const header = document.querySelector('.pm-header');
    const headerNav = document.querySelector('.pm-header__nav');

    const searchInputContainer = document.querySelector('.pm-menu-search__input-container');
    const searchInput = document.querySelector('#search-input');
    const searchActionsBlock = document.querySelector('.pm-menu-search__actions-block');
    const searchResults = document.querySelector('#menu-search');

    const clearSearchBtn = document.querySelector('#clear-search');

    openSearchBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isPopupOpen = catalogPopup.classList.contains('active');
        const isSearchActive = searchInputContainer.classList.contains('active');
        if (isPopupOpen && !isSearchActive) {
            resetMenu();
            searchInputContainer.classList.add('active');
            headerNav.classList.add('hidden');
            header.classList.add('search-open');
            return;
        }
        if (isPopupOpen) {
            closePopup();
            searchInputContainer.classList.remove('active');
            headerNav.classList.remove('hidden');
            header.classList.remove('search-open');
            searchInput.value = '';
            return;
        }
        openPopup();
        searchInputContainer.classList.add('active');
        headerNav.classList.add('hidden');
        header.classList.add('search-open');
    });

    searchInput.addEventListener('focus', () => {
        searchActionsBlock.classList.add('active');
    });
    searchInput.addEventListener('input', () => {
        if (searchInput.value.trim().length) {
            searchResults.classList.add('active');
        } else {
            searchResults.classList.remove('active');
        }
    });
    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', (e) => {
            e.preventDefault();
            searchInput.value = '';
            searchResults.classList.remove('active');
        });
    }


    /* ---------------- OTHER TABS ---------------- */

    openTabBtns.forEach(btn => {
        const tabName = btn.dataset.tab;
        if (!tabName) return;
        const tabContainer = document.querySelector(`#${tabName}`);
        if (!tabContainer) return;
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isPopupOpen = catalogPopup.classList.contains('active');
            const isTabActive = tabContainer.classList.contains('active');

            if (isPopupOpen && !isTabActive) {
                resetMenu();
                tabContainer.classList.add('active');
                btn.classList.add('active-menu-item');
                openCatalogBtn.classList.remove('active-menu-item');
                return;
            }
            if (isPopupOpen && isTabActive) {
                closePopup();
                return;
            }

            openPopup();
            resetMenu();

            tabContainer.classList.add('active');
            btn.classList.add('active-menu-item');
            openCatalogBtn.classList.remove('active-menu-item');

        });

    });


    /* ---------------- CLICK OUTSIDE ---------------- */
    // document.addEventListener('click', (e) => {
    //     if (!catalogPopup.classList.contains('active')) return;
    //     if (!catalogContainer.contains(e.target)) {
    //         closePopup();
    //     }
    // });

    catalogPopup.addEventListener('click', (e) => {
        // если клик именно по оверлею
        if (e.target === catalogPopup) {
            closePopup();
        }
    });


    /* ---------------- STOP PROPAGATION INSIDE ---------------- */

    catalogPopup.querySelectorAll('.pm-menu-popup__container').forEach(container => {
        container.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    });
    searchInputContainer.addEventListener('click', (e) => {
        e.stopPropagation();
    });

});