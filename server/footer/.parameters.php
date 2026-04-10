<?php
if (!defined("B_PROLOG_INCLUDED") || B_PROLOG_INCLUDED !== true)
	die();

$arComponentParameters = array(
	"GROUPS" => array(
		"TITLES" => array("NAME" => "Заголовки колонок", "SORT" => 105),
		"CONTACTS" => array("NAME" => "Контакты", "SORT" => 110),
		"SOCIALS" => array("NAME" => "Социальные сети", "SORT" => 120),
		"APPS" => array("NAME" => "Приложения", "SORT" => 130),
		"LOGOS" => array("NAME" => "Логотипы и партнеры", "SORT" => 140),
		"PRICE" => array("NAME" => "Прайс-лист", "SORT" => 150),
		"LEGAL" => array("NAME" => "Юридическая информация", "SORT" => 160),
	),
	"PARAMETERS" => array(
		"MODALS_DATA" => array(
			"NAME" => "Данные меню (MODALS_DATA)",
			"TYPE" => "STRING",
			"DEFAULT" => '={$arModalsData}',
		),
		"CATALOG_MENU" => array(
			"NAME" => "Меню каталога (CATALOG_MENU)",
			"TYPE" => "STRING",
			"DEFAULT" => '={$arCatalogMenu}',
		),

		// TITLES
		"TITLE_PRODUCTS" => array("NAME" => "Заголовок 'Продукты'", "TYPE" => "STRING", "DEFAULT" => "Продукты", "PARENT" => "TITLES"),
		"TITLE_CATALOG" => array("NAME" => "Заголовок 'Каталог'", "TYPE" => "STRING", "DEFAULT" => "Каталог", "PARENT" => "TITLES"),
		"TITLE_SERVICES" => array("NAME" => "Заголовок 'Сервисы'", "TYPE" => "STRING", "DEFAULT" => "Сервисы", "PARENT" => "TITLES"),
		"TITLE_COMPANY" => array("NAME" => "Заголовок 'О Promminer'", "TYPE" => "STRING", "DEFAULT" => "О Promminer", "PARENT" => "TITLES"),
		"TITLE_CONTACTS" => array("NAME" => "Заголовок 'Контакты'", "TYPE" => "STRING", "DEFAULT" => "Контакты", "PARENT" => "TITLES"),
		"TITLE_SOCIALS" => array("NAME" => "Заголовок 'Социальные сети'", "TYPE" => "STRING", "DEFAULT" => "Социальные сети", "PARENT" => "TITLES"),

		// CONTACTS
		"PHONE" => array("NAME" => "Телефон", "TYPE" => "STRING", "DEFAULT" => "8 (800) 350-72-85", "PARENT" => "CONTACTS"),
		"EMAIL" => array("NAME" => "Email", "TYPE" => "STRING", "DEFAULT" => "info@promminer.ru", "PARENT" => "CONTACTS"),

		// SOCIALS LINKS
		"VK" => array("NAME" => "VK Link", "TYPE" => "STRING", "PARENT" => "SOCIALS"),
		"YT" => array("NAME" => "YouTube Link", "TYPE" => "STRING", "PARENT" => "SOCIALS"),
		"WA" => array("NAME" => "WhatsApp Link", "TYPE" => "STRING", "PARENT" => "SOCIALS"),
		"MAX" => array("NAME" => "Max Link", "TYPE" => "STRING", "PARENT" => "SOCIALS"),
		"TG" => array("NAME" => "Telegram Link", "TYPE" => "STRING", "PARENT" => "SOCIALS"),
		"TIKTOK" => array("NAME" => "TikTok Link", "TYPE" => "STRING", "PARENT" => "SOCIALS"),
		"DZEN" => array("NAME" => "Dzen Link", "TYPE" => "STRING", "PARENT" => "SOCIALS"),
		"RUTUBE" => array("NAME" => "Rutube Link", "TYPE" => "STRING", "PARENT" => "SOCIALS"),

		// SOCIALS ICONS
		"VK_ICON" => array("NAME" => "VK Icon", "TYPE" => "FILE", "PARENT" => "SOCIALS"),
		"YT_ICON" => array("NAME" => "YouTube Icon", "TYPE" => "FILE", "PARENT" => "SOCIALS"),
		"WA_ICON" => array("NAME" => "WhatsApp Icon", "TYPE" => "FILE", "PARENT" => "SOCIALS"),
		"MAX_ICON" => array("NAME" => "Max Icon", "TYPE" => "FILE", "PARENT" => "SOCIALS"),
		"TG_ICON" => array("NAME" => "Telegram Icon", "TYPE" => "FILE", "PARENT" => "SOCIALS"),
		"TIKTOK_ICON" => array("NAME" => "TikTok Icon", "TYPE" => "FILE", "PARENT" => "SOCIALS"),
		"DZEN_ICON" => array("NAME" => "Dzen Icon", "TYPE" => "FILE", "PARENT" => "SOCIALS"),
		"RUTUBE_ICON" => array("NAME" => "Rutube Icon", "TYPE" => "FILE", "PARENT" => "SOCIALS"),

        // SOCIALS ICONS COLOR
        "VK_ICON-COLOR" => array("NAME" => "VK Icon Color", "TYPE" => "FILE", "PARENT" => "SOCIALS"),
        "YT_ICON-COLOR" => array("NAME" => "YouTube Icon Color", "TYPE" => "FILE", "PARENT" => "SOCIALS"),
        "WA_ICON-COLOR" => array("NAME" => "WhatsApp Icon Color", "TYPE" => "FILE", "PARENT" => "SOCIALS"),
        "MAX_ICON-COLOR" => array("NAME" => "Max Icon Color", "TYPE" => "FILE", "PARENT" => "SOCIALS"),
        "TG_ICON-COLOR" => array("NAME" => "Telegram Icon Color", "TYPE" => "FILE", "PARENT" => "SOCIALS"),
        "TIKTOK_ICON-COLOR" => array("NAME" => "TikTok Icon Color", "TYPE" => "FILE", "PARENT" => "SOCIALS"),
        "DZEN_ICON-COLOR" => array("NAME" => "Dzen Icon Color", "TYPE" => "FILE", "PARENT" => "SOCIALS"),
        "RUTUBE_ICON-COLOR" => array("NAME" => "Rutube Icon Color", "TYPE" => "FILE", "PARENT" => "SOCIALS"),

		// APPS
		"ANDROID_LINK" => array("NAME" => "Android Download Link", "TYPE" => "STRING", "PARENT" => "APPS"),
		"ANDROID_TITLE" => array("NAME" => "Android Button Title", "TYPE" => "STRING", "DEFAULT" => "Android", "PARENT" => "APPS"),
		"ANDROID_SUBTITLE" => array("NAME" => "Android Button Subtitle", "TYPE" => "STRING", "DEFAULT" => "Загрузите на", "PARENT" => "APPS"),
		"ANDROID_ICON" => array("NAME" => "Android Icon", "TYPE" => "FILE", "PARENT" => "APPS"),

		"IOS_LINK" => array("NAME" => "iOS Download Link", "TYPE" => "STRING", "PARENT" => "APPS"),
		"IOS_TITLE" => array("NAME" => "iOS Button Title", "TYPE" => "STRING", "DEFAULT" => "iOS", "PARENT" => "APPS"),
		"IOS_SUBTITLE" => array("NAME" => "iOS Button Subtitle", "TYPE" => "STRING", "DEFAULT" => "Загрузите на", "PARENT" => "APPS"),
		"IOS_ICON" => array("NAME" => "iOS Icon", "TYPE" => "FILE", "PARENT" => "APPS"),

		// LOGOS
		"MAIN_LOGO" => array("NAME" => "Основной логотип", "TYPE" => "FILE", "PARENT" => "LOGOS"),
		"LOGO_SKOLKOVO" => array("NAME" => "Логотип Сколково", "TYPE" => "FILE", "PARENT" => "LOGOS"),
		"LOGO_PMEF" => array("NAME" => "Логотип ПМЭФ", "TYPE" => "FILE", "PARENT" => "LOGOS"),
		"LOGO_RGO" => array("NAME" => "Логотип РГО", "TYPE" => "FILE", "PARENT" => "LOGOS"),
		"LOGO_APM" => array("NAME" => "Логотип АПМ", "TYPE" => "FILE", "PARENT" => "LOGOS"),

		// PRICE
		"PRICE_FILE" => array("NAME" => "Файл прайс-листа", "TYPE" => "FILE", "PARENT" => "PRICE"),
		"PRICE_TITLE" => array("NAME" => "Заголовок прайса", "TYPE" => "STRING", "DEFAULT" => "Прайс-лист", "PARENT" => "PRICE"),
		"PRICE_SUBTITLE" => array("NAME" => "Подзаголовок прайса", "TYPE" => "STRING", "DEFAULT" => "Обновлен 30.01.2026 в 12:55", "PARENT" => "PRICE"),
		"SUBTITLEFOOTER" => array("NAME" => "Подзаголовок футер", "TYPE" => "STRING", "DEFAULT" => "Обновлен 30.01.2026 в 12:55", "PARENT" => "PRICE"),
		// LEGAL
		"COPYRIGHT_TEXT" => array(
			"NAME" => "Текст копирайта (после года)",
			"TYPE" => "STRING",
			"DEFAULT" => "Все права защищены. Не является публичной офертой",
			"PARENT" => "LEGAL"
		),
		"POLICY_TEXT" => array("NAME" => "Текст ссылки на политику", "TYPE" => "STRING", "DEFAULT" => "Политика конфиденциальности", "PARENT" => "LEGAL"),
		"POLICY_LINK" => array("NAME" => "Ссылка на политику", "TYPE" => "STRING", "DEFAULT" => "#", "PARENT" => "LEGAL"),
	),
);
