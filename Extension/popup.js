//känn av när formuläret submittas
$(document).on('submit', '#form', function () {

    //skicka vidare sökordet till servern
    chrome.runtime.sendMessage({ sokord: document.getElementById("exampleFormControlInput1").value });
    
});