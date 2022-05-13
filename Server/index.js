'use strict';
var express = require('express');
let cors = require("cors");
const { Builder, By, Key, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

var app = express();
app.use((req, res, next) => {
    res.setHeader('Acces-Control-Allow-Origin', '*');
    res.setHeader('Acces-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE');
    res.setHeader('Acces-Contorl-Allow-Methods', 'Content-Type', 'Authorization');
    next();
})
app.use(express.json({ type: '*/*' }));

app.use(cors());
app.use(express.static(`${__dirname}/public`));

var betydelse;
const screen = {
    width: 640,
    height: 480
};

app.post('/api', function (req, res) {

    (async function firstScript() {
        try {
            let driver = await new Builder()
            .forBrowser('chrome')
            .setChromeOptions(new chrome.Options().headless().windowSize(screen))
            .build()

            console.log(req.body.sökord)
            await driver.get("https://svenska.se/")
            await driver.findElement(By.id("seeker")).sendKeys(req.body.sökord)
            await driver.findElement(By.css(".knapp > img")).click()
            console.log(await driver.findElements(By.xpath("/html/body/div[1]/div[3]/div/div/article/section/div/div/div[2]/div/div/div/div/div[1]/div/div[2]/div/div[4]/div[1]/span[1]")))
            if (await driver.findElements(By.xpath("/html/body/div[1]/div[3]/div/div/article/section/div/div/div[2]/div/div/div/div/div[1]/div/div[2]/div/div[4]/div[1]/span[1]")) != "") {
                betydelse = await driver.findElement(By.xpath("/html/body/div[1]/div[3]/div/div/article/section/div/div/div[2]/div/div/div/div/div[1]/div/div[2]/div/div[4]/div[1]/span[1]")).getText()
            } else {
                await driver.findElement(By.css("#so-1 > div.cshow > a:nth-child(1)")).click()
                betydelse = await driver.findElement(By.xpath("/html/body/div[1]/div[3]/div/div/article/section/div/div/div[2]/div/div/div/div/div[1]/div[2]/div/div[4]")).getText()
            }
            console.log(betydelse)
            res.send(betydelse)
            await driver.close()
        } catch (error) {
            console.log(error)
            res.send("Något gick fel")
        }
    })();
    
});

app.listen(3000);