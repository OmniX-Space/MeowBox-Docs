function load404Page() {
    setHtmlLangAttribute(getBrowserLanguage());
    var translations = setTranslations(getBrowserLanguage());
    document.title = translations["404_Docs_Not_Found"];
    const page = document.getElementById("page");
    page.style.background = "url('/img/background_v0.1.x.webp') no-repeat center center fixed";
    page.style.backgroundSize = "cover";
    const container = document.createElement("div");
    container.classList.add("container-404");
    const cdIcon = document.createElement("i");
    cdIcon.classList.add("fa-solid", "fa-compact-disc");
    container.appendChild(cdIcon);
    const rightContainer = document.createElement("div");
    rightContainer.classList.add("right-container-404");
    const h1 = document.createElement("h1");
    h1.textContent = translations["404_Docs_Not_Found"];
    rightContainer.appendChild(h1);
    const p = document.createElement("p");
    p.textContent = translations["404_Docs_Not_Found_Contant"];
    rightContainer.appendChild(p);
    const button = document.createElement("button");
    button.classList.add("go-home-button");
    const buttonIcon = document.createElement("i");
    buttonIcon.classList.add("fa-solid", "fa-arrow-left");
    button.appendChild(buttonIcon);
    const buttonText = document.createElement("span");
    buttonText.classList.add("go-home-button-text");
    buttonText.textContent = translations["404_Go_Home"];
    button.appendChild(buttonText);
    button.addEventListener("click", () => {
        window.location.hash = "";
        window.location.href = "/";
        window.location.reload();
    });
    rightContainer.appendChild(button);
    const langSelect = document.createElement("div");
    langSelect.classList.add("lang-select-404");
    const select = document.createElement("select");
    const availableLanguages = getAvailableLanguages();
    availableLanguages.forEach(lang => {
        const option = document.createElement('option');
        option.value = lang.code;
        option.textContent = lang.name;
        select.appendChild(option);
    });
    select.value = currentLang;
    select.addEventListener("change", function () {
        setHtmlLangAttribute(this.value);
        translations = setTranslations(this.value);
        document.title = translations["404_Docs_Not_Found"];
        h1.textContent = translations["404_Docs_Not_Found"];
        p.textContent = translations["404_Docs_Not_Found_Contant"];
        buttonText.textContent = translations["404_Go_Home"];
    });
    langSelect.appendChild(select);
    rightContainer.appendChild(langSelect);
    container.appendChild(rightContainer);
    page.appendChild(container);
}