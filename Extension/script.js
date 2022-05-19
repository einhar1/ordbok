var sökord;

chrome.contextMenus.onClicked.addListener(function (info, tab) {
    if (info.menuItemId == "search") {
        console.log(info.selectionText);
        sökord = info.selectionText;
        apiRequest(info.selectionText);
    }
});

chrome.runtime.onMessage.addListener(
    function (request) {
        console.log("Input:" + request.sökord);
        sökord = request.sökord;
        apiRequest(request.sökord);
    }
);

chrome.notifications.onClicked.addListener(
    function () {
        console.log("click");
        console.log(chrome.tabs.query({
            currentWindow: true,
            url: "https://sv.wiktionary.org/wiki/*"
        }));
        
        chrome.tabs.query({ currentWindow: true, url: "https://sv.wiktionary.org/wiki/*" }, function (tab) {
            if (tab.length != 0) {
                chrome.tabs.update(tab[0].id, { url: 'https://sv.wiktionary.org/wiki/' + sökord, highlighted: true });
            } else {
                chrome.tabs.create({
                    url: 'https://sv.wiktionary.org/wiki/' + sökord
                });
            }
        });
    }
)

function apiRequest(input) {

    chrome.notifications.clear("betydelse");

    fetch('https://sv.wiktionary.org/w/api.php?action=query&prop=extracts&titles=' + input + '&exchars=300&format=json&origin=*', {
        method: 'POST', // or 'PUT'
        //body: null,
    })
        .then(response => response.json())
        .then(data => {
            var extract;
            var title;
            console.log('Success:', data);
            for (var key in data.query.pages) {
                if (data.query.pages[key].hasOwnProperty("extract"))
                    extract = data.query.pages[key].extract.replace(/\n/g, ''); //or log the key value
            }
            for (var key in data.query.pages) {
                if (data.query.pages[key].hasOwnProperty("title"))
                    title = data.query.pages[key].title; //or log the key value
            }
            if (extract.includes("uttal:")) {
                extract = extract.substring(extract.indexOf("<li>", extract.indexOf("<li>") + 4) + 4);
            } else {
                extract = extract.substring(extract.indexOf("<li>") + 4);
            }
            extract = extract.replace(/<i>.*<\/i>/, '');
            extract = extract.substring(0, extract.indexOf("<"));
            
            chrome.notifications.create('betydelse', {
                type: 'basic',
                iconUrl: 'icons/icon_large.png',
                title: title,
                message: extract,
                requireInteraction: true,
                priority: 2,
                silent: true
            })
        })
        .catch((error) => {
            console.error('Error:', error);
            chrome.notifications.create('betydelse', {
                type: 'basic',
                iconUrl: 'icons/icon_large.png',
                title: 'Något gick fel',
                message: '',
                priority: 2
            })
        });
}

chrome.contextMenus.removeAll(function () {
    chrome.contextMenus.create({
        id: "search",
        title: "Sök i ordbok",
        contexts: ["selection"]
    });
});