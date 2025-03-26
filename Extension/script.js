var sokord;

//lyssna efter när användaren klickar på knappen "sök i ordbok"
chrome.contextMenus.onClicked.addListener(function (info, tab) {
    if (info.menuItemId == "search") {
        console.log(info.selectionText);
        sokord = info.selectionText.toLowerCase();
        apiRequest(info.selectionText.toLowerCase(), "context", tab);
    }
});

//lyssna efer meddelanden från söksidan
chrome.runtime.onMessage.addListener(
    function (request) {
        console.log("Input:" + request.sokord);
        sokord = request.sokord.toLowerCase();
        apiRequest(request.sokord.toLowerCase(), "popup");
    }
);
/*
//lyssna efter klickningar på notifikationen
chrome.notifications.onClicked.addListener(
    function () {
        console.log("click");
        console.log(chrome.tabs.query({
            currentWindow: true,
            url: "https://sv.wiktionary.org/wiki/*"
        }));

        chrome.tabs.query({ currentWindow: true, url: "https://sv.wiktionary.org/wiki/*" }, function (tab) {
            if (tab.length != 0) {
                chrome.tabs.update(tab[0].id, { highlighted: true, url: "https://sv.wiktionary.org/wiki/" + sokord });
            } else {
                chrome.tabs.create({
                    url: "https://sv.wiktionary.org/wiki/" + sokord
                });
            }
        });
    }
);
*/
//gör en request till API:n med sökordet och få tillbaka definitionen
function apiRequest(input, source, tab) {

    fetch("https://sv.wiktionary.org/w/api.php?action=query&prop=extracts&titles=" + input + "&exchars=300&format=json&origin=*", {
        method: "POST"
    })
        .then((response) => response.json())
        .then(function (data) {
            var extract;
            var title;
            console.log("Success:", data);

            //filtrera bort de oönskade delarna i sveret
            for (var key in data.query.pages) {
                if (data.query.pages[key].hasOwnProperty("extract"))
                    extract = data.query.pages[key].extract.replace(/\n/g, "");
            }
            for (var key in data.query.pages) {
                if (data.query.pages[key].hasOwnProperty("title"))
                    title = data.query.pages[key].title;
            }
            if (extract.includes("uttal:")) {
                extract = extract.substring(extract.indexOf("<li>", extract.indexOf("<li>") + 4) + 4);
            } else {
                extract = extract.substring(extract.indexOf("<li>") + 4);
            }
            extract = extract.replace(/<i>.*<\/i>/, "");
            extract = extract.substring(0, extract.indexOf("<"));

            if (source == "context") {
                chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    func: createPopup,
                    args: [input, extract]
                    });
            } else if (source == "popup") {
                chrome.runtime.sendMessage({
                    type: "result",
                    title: input,
                    message: extract
                });
            }
        })
        .catch((error) => {
            console.error(error);
            if (source == "context") {
                chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    func: createPopup,
                    args: ["Inga sökresultat för " + input, ""]
                    });
            } else if (source == "popup") {
                chrome.runtime.sendMessage({
                    type: "result",
                    title: "Inga sökresultat för " + input,
                    message: ""
                });
            }
        });
}

//skapa knappen "sök i ordbok"
chrome.contextMenus.removeAll(function () {
    chrome.contextMenus.create({
        id: "search",
        title: "Sök i ordbok",
        contexts: ["selection"]
    });
});

function createPopup(title, extract) {
    // Skapa popup-behållaren
    const popup = document.createElement('div');
    popup.id = 'extension-popup';
    popup.style.cssText = `
        font-family: "Segoe UI", sans-serif;
        position: fixed;
        top: 50px;
        right: 50px;
        width: 350px;
        background: #fff;
        border: 1px solid #ddd;
        border-radius: 4px;
        padding: 15px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        z-index: 10000;
    `;
    popup.innerHTML = `<h3>${title}</h3><p>${extract}</p>`;
    document.body.appendChild(popup);

    // Lägg till en osynlig overlay för att fånga klick utanför popuppen
    const overlay = document.createElement('div');
    overlay.id = 'extension-popup-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 9999;
    `;
    document.body.appendChild(overlay);

    // När användaren klickar på overlayn tas popup och overlay bort
    overlay.addEventListener('click', () => {
        popup.remove();
        overlay.remove();
    });
}