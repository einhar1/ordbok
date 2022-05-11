$(document).on('submit', '#form', function () {

    chrome.runtime.sendMessage({ sökord: document.getElementById("exampleFormControlInput1").value });
    
});