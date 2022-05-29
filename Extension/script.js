var sokord;

//lyssna efter när användaren klickar på knappen "sök i ordbok"
chrome.contextMenus.onClicked.addListener(function (info, tab) {
    if (info.menuItemId == "search") {
        console.log(info.selectionText);
        sokord = info.selectionText;
        apiRequest(info.selectionText);
    }
});

//lyssna efer meddelanden från söksidan
chrome.runtime.onMessage.addListener(
    function (request) {
        console.log("Input:" + request.sokord);
        sokord = request.sokord;
        apiRequest(request.sokord);
    }
);

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

//gör en request till API:n med sökordet och få tillbaka definitionen
function apiRequest(input) {

    chrome.notifications.clear("betydelse");

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

            //skapa notifikationen
            chrome.notifications.create("betydelse", {
                type: "basic",
                iconUrl: "icons/icon_large.png",
                title: title,
                message: extract,
                requireInteraction: true,
                priority: 2,
                silent: true
            });
        })
        .catch((error) => {
            console.error("Error:", error);
            chrome.notifications.create("betydelse", {
                type: "basic",
                iconUrl: "icons/icon_large.png",
                title: "Något gick fel",
                message: "",
                priority: 2
            })
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