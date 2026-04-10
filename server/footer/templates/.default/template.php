<? if (!defined("B_PROLOG_INCLUDED") || B_PROLOG_INCLUDED !== true)
    die();
/** @var array $arParams */
/** @var array $arResult */
/** @global CMain $APPLICATION */

$arModalsData = $arParams['MODALS_DATA'];
$arCatalogMenu = $arParams['CATALOG_MENU'];
?>

<div class="pm-footer__main-content">
    <div class="pm-footer__list-container">
        <nav class="pm-footer__main-nav" data-da=".pm-footer__right-container,1120,3">
            <div class="pm-footer-list pm-footer-list--main">
                <div class="pm-footer-list-title__container">
                    <h5 class="pm-footer__list-title"><?= $arParams['TITLE_PRODUCTS'] ?></h5>
                    <svg class="pm-footer__list-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                        viewBox="0 0 16 16" fill="none">
                        <path
                            d="M8.24661 10.5564L12.5331 6.13612C12.8005 5.8603 12.6384 5.33301 12.2861 5.33301H3.71321C3.36093 5.33301 3.1988 5.8603 3.46627 6.13612L7.75274 10.5564C7.89483 10.703 8.10452 10.703 8.24661 10.5564Z"
                            fill="rgba(163, 163, 163, 1)" />
                    </svg>
                </div>
                <? if (!empty($arModalsData['CATALOG']['ELEMENTS'])): ?>
                    <ul class="pm-footer-list pm-footer-list--small">
                        <? foreach ($arModalsData['CATALOG']['ELEMENTS'] as $arItem): ?>
                            <li><a href="<?= $arItem['URL'] ?>" class="pm-footer__list-item"><?= $arItem['NAME'] ?></a></li>
                        <? endforeach; ?>
                    </ul>
                <? endif; ?>
            </div>
            <div class="pm-footer-list pm-footer-list--main">
                <div class="pm-footer-list-title__container">
                    <h5 class="pm-footer__list-title"><?= $arParams['TITLE_CATALOG'] ?></h5>
                    <svg class="pm-footer__list-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                        viewBox="0 0 16 16" fill="none">
                        <path
                            d="M8.24661 10.5564L12.5331 6.13612C12.8005 5.8603 12.6384 5.33301 12.2861 5.33301H3.71321C3.36093 5.33301 3.1988 5.8603 3.46627 6.13612L7.75274 10.5564C7.89483 10.703 8.10452 10.703 8.24661 10.5564Z"
                            fill="rgba(163, 163, 163, 1)" />
                    </svg>
                </div>
                <? if (!empty($arCatalogMenu)): ?>
                    <ul class="pm-footer-list pm-footer-list--small">
                        <? foreach ($arCatalogMenu as $arSect): ?>
                            <li><a href="<?= $arSect['SECTION_PAGE_URL'] ?>"
                                    class="pm-footer__list-item"><?= $arSect['NAME'] ?></a></li>
                        <? endforeach; ?>
                    </ul>
                <? endif; ?>
                <?php
                if ($arParams['PRICE_FILE']) {
                    $APPLICATION->IncludeComponent(
                        "custom:price.list",
                        ".default",
                        array(
                            "PRICE_FILE" => $arParams['PRICE_FILE'],
                            "TITLE" => $arParams['PRICE_TITLE'],
                            "SUBTITLE" => $arParams['PRICE_SUBTITLE'],
                            "SUBTITLEFOOTER" => $arParams['SUBTITLEFOOTER'],
                            "SHOW_PRICE" => "Y",
                            "COMPONENT_TEMPLATE" => ".default",
                            "FOOTER" => "Y"
                        ),
                        false
                    );
                }
                ?>
            </div>
            <div class="pm-footer-list pm-footer-list--main">
                <div class="pm-footer-list-title__container">
                    <h5 class="pm-footer__list-title"><?= $arParams['TITLE_SERVICES'] ?></h5>
                    <svg class="pm-footer__list-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                        viewBox="0 0 16 16" fill="none">
                        <path
                            d="M8.24661 10.5564L12.5331 6.13612C12.8005 5.8603 12.6384 5.33301 12.2861 5.33301H3.71321C3.36093 5.33301 3.1988 5.8603 3.46627 6.13612L7.75274 10.5564C7.89483 10.703 8.10452 10.703 8.24661 10.5564Z"
                            fill="rgba(163, 163, 163, 1)" />
                    </svg>
                </div>
                <? if (!empty($arModalsData['SERVICES']['ELEMENTS'])): ?>
                    <ul class="pm-footer-list pm-footer-list--small">
                        <? foreach ($arModalsData['SERVICES']['ELEMENTS'] as $arItem): ?>
                            <li><a href="<?= $arItem['URL'] ?>" class="pm-footer__list-item"><?= $arItem['NAME'] ?></a></li>
                        <? endforeach; ?>
                    </ul>
                <? endif; ?>
            </div>
            <div class="pm-footer-list pm-footer-list--main">
                <div class="pm-footer-list-title__container">
                    <h5 class="pm-footer__list-title"><?= $arParams['TITLE_COMPANY'] ?></h5>
                    <svg class="pm-footer__list-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                        viewBox="0 0 16 16" fill="none">
                        <path
                            d="M8.24661 10.5564L12.5331 6.13612C12.8005 5.8603 12.6384 5.33301 12.2861 5.33301H3.71321C3.36093 5.33301 3.1988 5.8603 3.46627 6.13612L7.75274 10.5564C7.89483 10.703 8.10452 10.703 8.24661 10.5564Z"
                            fill="rgba(163, 163, 163, 1)" />
                    </svg>
                </div>
                <? if (!empty($arModalsData['COMPANY']['ELEMENTS'])): ?>
                    <ul class="pm-footer-list pm-footer-list--small">
                        <? foreach ($arModalsData['COMPANY']['ELEMENTS'] as $arItem): ?>
                            <li><a href="<?= $arItem['URL'] ?>" class="pm-footer__list-item"><?= $arItem['NAME'] ?></a></li>
                        <? endforeach; ?>
                    </ul>
                <? endif; ?>
            </div>
        </nav>

        <div class="pm-footer__logo-list" data-da=".pm-footer__right-container,1485,last">
            <? if ($arParams['LOGO_SKOLKOVO']): ?>
                <img src="<?= $arParams['LOGO_SKOLKOVO'] ?>" alt="" class="pm-footer__logo-item">
            <? endif; ?>
            <? if ($arParams['LOGO_PMEF']): ?>
                <img src="<?= $arParams['LOGO_PMEF'] ?>" alt="" class="pm-footer__logo-item">
            <? endif; ?>
            <? if ($arParams['LOGO_RGO']): ?>
                <img src="<?= $arParams['LOGO_RGO'] ?>" alt="" class="pm-footer__logo-item">
            <? endif; ?>
            <? if ($arParams['LOGO_APM']): ?>
                <img src="<?= $arParams['LOGO_APM'] ?>" alt="" class="pm-footer__logo-item">
            <? endif; ?>
        </div>
    </div>

    <div class="pm-footer__right-container">
        <? if ($arParams['MAIN_LOGO']): ?>
            <img src="<?= $arParams['MAIN_LOGO'] ?>" alt="" class="pm-footer__main-logo">
        <? endif; ?>

        <div class="pm-footer__contacts">
            <h5 class="pm-footer__list-title"><?= $arParams['TITLE_CONTACTS'] ?></h5>
            <a href="tel:<?= preg_replace('/[^0-9]/', '', $arParams['PHONE']) ?>"
                class="pm-footer__contacts-link"><?= $arParams['PHONE'] ?></a>
            <a href="mailto:<?= $arParams['EMAIL'] ?>" class="pm-footer__contacts-link"><?= $arParams['EMAIL'] ?></a>
        </div>

        <div class="pm-footer__socials">
            <h5 class="pm-footer__list-title"><?= $arParams['TITLE_SOCIALS'] ?></h5>
            <div class="pm-footer__social-list">
                <?
                $socials = ['VK', 'YT', 'WA', 'MAX', 'TG', 'TIKTOK', 'DZEN', 'RUTUBE'];
                foreach ($socials as $soc):
                    if ($arParams[$soc] && $arParams[$soc . '_ICON']): ?>
                        <a href="<?= $arParams[$soc] ?>">
                            <img src="<?= $arParams[$soc . '_ICON'] ?>" alt="" class="pm-btn-icon pm-social-icon__base">
                            <?php if($arParams[$soc . '_ICON']) :?>
                                <img src="<?= $arParams[$soc . '_ICON-COLOR'] ?>" alt="" class="pm-btn-icon pm-social-icon__gradient">
                            <?php endif; ?>
                        </a>
                    <? endif;
                endforeach; ?>
            </div>
        </div>

        <div class="pm-footer__btn-container">
            <? if ($arParams['ANDROID_LINK']): ?>
                <a href="<?= $arParams['ANDROID_LINK'] ?>" class="pm-footer__download-btn">
                    <? if ($arParams['ANDROID_ICON']): ?>
                        <img src="<?= $arParams['ANDROID_ICON'] ?>" alt="" class="pm-footer__download-icon">
                    <? endif; ?>
                    <span class="pm-footer__download-text">
                        <span class="pm-footer__download-subtitle"><?= $arParams['ANDROID_SUBTITLE'] ?></span>
                        <span class="pm-footer__download-title"><?= $arParams['ANDROID_TITLE'] ?></span>
                    </span>
                </a>
            <? endif; ?>
            <? if ($arParams['IOS_LINK']): ?>
                <a href="<?= $arParams['IOS_LINK'] ?>" class="pm-footer__download-btn">
                    <? if ($arParams['IOS_ICON']): ?>
                        <img src="<?= $arParams['IOS_ICON'] ?>" alt="" class="pm-footer__download-icon">
                    <? endif; ?>
                    <span class="pm-footer__download-text">
                        <span class="pm-footer__download-subtitle"><?= $arParams['IOS_SUBTITLE'] ?></span>
                        <span class="pm-footer__download-title"><?= $arParams['IOS_TITLE'] ?></span>
                    </span>
                </a>
            <? endif; ?>
        </div>
    </div>
</div>

<div class="pm-footer__divider"></div>

<div class="pm-footer__copyright-container">
    <div class="pm-copyright-text">© Promminer, <?= date('Y') ?>. <?= $arParams['COPYRIGHT_TEXT'] ?>
    </div>
    <div class="pm-footer__copyright-list">
        <a href="<?= $arParams['POLICY_LINK'] ?>" target="_blank"
            class="pm-copyright-text"><?= $arParams['POLICY_TEXT'] ?></a>
    </div>
</div>