//känn av när formuläret submittas
$(document).on('submit', '#form', function () {

    //skicka vidare sökordet till servern
    chrome.runtime.sendMessage({ sokord: document.getElementById("exampleFormControlInput1").value });
    
});

// Lyssna på meddelanden från bakgrundsskriptet
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.type === "result") {
        document.getElementById("result").innerHTML =
            `<h2>${request.title}</h2><p>${request.message}</p>`;
    }
});