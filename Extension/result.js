$( document ).ready(function() {

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const header = urlParams.get("header");
const extract = urlParams.get("extract");

document.title = header;
document.getElementById("result").innerHTML = extract;

});