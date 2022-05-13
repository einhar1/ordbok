var sökord;

chrome.contextMenus.onClicked.addListener(function (info, tab) {
    if (info.menuItemId == "search") {
        console.log(info.selectionText);
        sökord = info.selectionText;
        sendToServer(info.selectionText);
    }
});

chrome.runtime.onMessage.addListener(
    function (request) {
        console.log("Input:" + request.sökord);
        sökord = request.sökord;
        sendToServer(request.sökord);
    }
);

chrome.notifications.onClicked.addListener(
    function () {
        console.log("click");
        console.log(chrome.tabs.query({
            currentWindow: true,
            url: "https://svenska.se/*"
        }));
        
        chrome.tabs.query({ currentWindow: true, url: "https://svenska.se/*" }, function (tab) {
            if (tab.length != 0) {
                chrome.tabs.update(tab[0].id, { url: 'https://svenska.se/tre/?sok=' + sökord + '&pz=1', highlighted: true });
            } else {
                chrome.tabs.create({
                    url: 'https://svenska.se/tre/?sok=' + sökord + '&pz=1'
                });
            }
        });
    }
)

function sendToServer(input) {

    const data = { sökord: input };

    chrome.notifications.clear("betydelse");

    fetch('http://127.0.0.1:3000/api', {
        method: 'POST', // or 'PUT'
        body: JSON.stringify(data),
    })
        .then(response => response.text())
        .then(data => {
            console.log('Success:', data);
            chrome.notifications.create('betydelse', {
                type: 'basic',
                iconUrl: 'icons/icon_large.png',
                title: input,
                message: data,
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
                title: 'Fel',
                message: 'Något gick fel',
                priority: 2
            })
        });
}

chrome.contextMenus.create({
    id: "search",
    title: "Sök i ordbok",
    contexts: ["selection"]
});