let isRouting = false;

function route() {
    if (isRouting) return;
    isRouting = true;

    // Define route tables
    const routeHandlers = {
        'index.html': handleIndex,
    };

    const currentHash = window.location.hash.replace(/^#\/?/, '');
    if (!currentHash || currentHash === "/") {
        const browserLang = getBrowserLanguage();
        window.location.href = `#/${browserLang}/index.html`;
        setTimeout(() => {
            isRouting = false;
        }, 50);
        return;
    }

    const match = currentHash.match(/^([^/]+)\/([^/]+\.html)(?:$|\?)/);
    if (!match) {
        handle404Page();
        setTimeout(() => {
            isRouting = false;
        }, 50);
        return;
    }

    const [_, lang, page] = match;
    setHtmlLangAttribute(lang);

    const handler = routeHandlers[page];
    if (handler) {
        handler(lang);
    } else {
        handle404Page();
    }

    setTimeout(() => {
        isRouting = false;
    }, 50);
}

window.addEventListener('hashchange', route);
window.addEventListener('popstate', route);