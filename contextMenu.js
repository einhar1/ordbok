chrome.contextMenus.onClicked.addListener(function (info, tab) {
    if (info.menuItemId == "search") {
        console.log(info.selectionText);
        sendToServer(info.selectionText);
    }
});

chrome.runtime.onMessage.addListener(
    function (request) {
        console.log("Input:" + request.sökord);
        sendToServer(request.sökord);
    }
);

function sendToServer(input) {

    const data = { sökord: input };

    chrome.notifications.clear('betydelse');

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
                buttons: [
                    {
                        title: 'Öppna i ny flik'
                    }
                ],
                priority: 2
            })
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}

chrome.contextMenus.create({
    id: "search",
    title: "Sök i ordbok",
    contexts: ["selection"]
});