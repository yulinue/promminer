<?php
if (!defined("B_PROLOG_INCLUDED") || B_PROLOG_INCLUDED!==true) die();

/** @var array $arParams */
/** @var array $arResult */

$arResult['MODALS_DATA'] = $arParams['MODALS_DATA'];
$arResult['CATALOG_MENU'] = $arParams['CATALOG_MENU'];

$this->IncludeComponentTemplate();
