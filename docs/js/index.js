async function handle404Page() {
    await Promise.all([
        loadScript("/js/404.js"),
        loadCSSAsPromise("/css/404.css")
    ]);
    const page = document.getElementById("page");
    page.innerHTML = "";
    load404Page();
}

function handleIndex(lang) {
    const page = document.getElementById("page");
    page.style.background = "url('/img/background_v0.1.x.webp') no-repeat center center fixed";
    page.style.backgroundSize = "cover";
    const container = document.createElement("div");
    container.classList.add("container-index");
    page.appendChild(container);
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
            loadScript("/js/route.js"),
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