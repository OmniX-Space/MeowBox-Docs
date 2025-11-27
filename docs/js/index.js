function route() {
    const currentHash = window.location.hash;
    const isDirectAccess = currentHash === "" || currentHash === "#" || currentHash === "#/";

    if (isDirectAccess) {
        const browserLang = getBrowserLanguage();
        setHtmlLangAttribute(browserLang);
        window.location.href = "#/" + browserLang + "/v0.1.x/index.html";
        return;
    }

    loadPageContent(currentHash.substring(1));
}

async function loadPageContent(path) {
    try {
        const mdPath = convertHtmlPathToMdPath(path);

        const markdownContent = await fetchMarkdownContent(mdPath);

        renderMarkdownContent(markdownContent);

        updatePageMetadata(path);
    } catch (error) {
        console.error("Failed to load page content: ", error);
        renderErrorPage(error.message);
    }
}

function convertHtmlPathToMdPath(htmlPath) {
    let normalizedPath = htmlPath.startsWith('/') ? htmlPath.substring(1) : htmlPath;
    const mdFilename = normalizedPath.replace(/\.html$/, '.md');
    return `/markdown/${mdFilename}`;
}

async function fetchMarkdownContent(mdPath) {
    const response = await fetch(mdPath);
    if (!response.ok) {
        throw new Error(`Unable to load file: ${mdPath} with status code: ${response.status}`);
    }
    return await response.text();
}

function renderMarkdownContent(markdownContent) {
    if (typeof marked === 'undefined') {
        throw new Error('Markdown parsing library marked is not loaded, please introduce marked-js first.');
    }

    const htmlContent = marked.parse(markdownContent);

    const contentContainer = document.getElementById('content');
    if (!contentContainer) {
        throw new Error('Content container with id "content" not found.');
    }

    contentContainer.innerHTML = htmlContent;

    handleInternalLinks();
}

function handleInternalLinks() {
    const contentContainer = document.getElementById('content');
    const links = contentContainer.querySelectorAll('a');

    links.forEach(link => {
        const href = link.getAttribute('href');
        if (href && (href.endsWith('.md') || href.includes('/'))) {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const htmlPath = href.replace(/\.md$/, '.html');
                const normalizedPath = htmlPath.startsWith('/') ? htmlPath : '/' + htmlPath;
                window.location.hash = normalizedPath;
                route();
            });
        }
    });
}

function updatePageMetadata(path) {
    const pageTitle = path.split('/').pop().replace('.html', '').replace(/-/g, ' ');
    document.title = `${capitalizeFirstLetter(pageTitle)}`;
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function renderErrorPage(message) {
    const contentContainer = document.getElementById('content');
    contentContainer.innerHTML = `
        <div class="error-page">
            <h1>页面加载失败</h1>
            <p>${message}</p>
            <button onclick="window.location.hash='#/'">返回首页</button>
        </div>
    `;
}

// Load layout script
function loadLayoutScript() {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = "/js/layout.js";
        script.async = true;

        script.onload = () => {
            resolve();
            script.remove();
        };

        script.onerror = () => {
            const errorMsg = `Failed to load script: ${scriptUrl}`;
            console.error(`[ScriptLoader] ${errorMsg}`);
            reject(new Error(errorMsg));
        };

        document.body.appendChild(script);
    });
}

// Initialize app
async function initializeApp() {
    try {
        await Promise.all([
            loadLayoutScript()
        ]);
        await Promise.all([
            loadScript("/js/i18n.js"),
            loadCSSAsPromise("/css/layout.css"),
            loadCSSAsPromise("/css/index.css"),
            loadCSSAsPromise("/font-awesome/css/all.min.css")
        ])
        createPage();
        route();
    } catch (error) {
        console.error('App initialization error:', error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});