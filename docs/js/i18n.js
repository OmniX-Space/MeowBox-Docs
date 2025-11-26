/*
 * i18n.js
 * MeowBox-Docs
 * Created by MoeCinnamo on 2025/11/26.
 *
 * This file contains the i18n strings for the web interface.
 */

const en = {
    "404_Docs_Not_Found": "404 Docs Not Found",
    "404_Docs_Not_Found_Contant": "Sorry, the page you are looking for does not exist.",
    "404_Go_Home": "Go Home"
};

const zhCN = {
    "404_Docs_Not_Found": "文档未找到",
    "404_Docs_Not_Found_Contant": "抱歉，您正在寻找的页面不存在。",
    "404_Go_Home": "返回首页"
};

const zhTW = {
    "404_Docs_Not_Found": "檔案未找到",
    "404_Docs_Not_Found_Contant": "抱歉，您正在尋找的頁面不存在。",
    "404_Go_Home": "回首頁"
};

const jp = {
    "404_Docs_Not_Found": "ドキュメントが見つかりません",
    "404_Docs_Not_Found_Contant": "申し訳ありません。要求されたページは存在しません。",
    "404_Go_Home": "ホームページに戻る"
};

const languages_code = [
    { code: 'en', data: en },
    { code: 'zh-CN', data: zhCN },
    { code: 'zh-TW', data: zhTW },
    { code: 'ja', data: jp }
];

function getBrowserLanguage() {
    try {
        const browserLang = navigator.language || navigator.userLanguage;

        if (!browserLang) {
            return 'en';
        }

        const langCode = browserLang.toLowerCase();

        const exactMatch = languages_code.find(lang =>
            langCode === lang.code.toLowerCase() ||
            langCode.startsWith(lang.code.toLowerCase() + '-')
        );

        if (exactMatch) {
            return exactMatch.code;
        }

        if (langCode.startsWith('ja') || langCode.startsWith('jp')) {
            return 'ja';
        }

        return 'en';
    } catch (error) {
        console.error("Error detecting browser language:", error);
        return 'en';
    }
}

let currentLang = getBrowserLanguage();

function setTranslations(langCode) {
    const langObj = languages_code.find(lang => lang.code === langCode);
    return langObj ? langObj.data : en;
}

function setHtmlLangAttribute(langCode) {
    document.documentElement.setAttribute('lang', langCode);
}

function getAvailableLanguages() {
    return languages_code.map(lang => ({
        code: lang.code,
        name: {
            'en': 'English',
            'zh-CN': '简体中文',
            'zh-TW': '繁體中文',
            'ja': '日本語'
        }[lang.code] || lang.code
    }));
}
