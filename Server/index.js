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

            var betydelse;
            var titel;

            console.log(req.body.sökord)
            await driver.get("https://svenska.se/")
            await driver.findElement(By.id("seeker")).sendKeys(req.body.sökord)
            await driver.findElement(By.css(".knapp > img")).click()
            if (await driver.findElements(By.xpath("/html/body/div[1]/div[3]/div/div/article/section/div/div/div[2]/div/div/div/div/div[1]/div/div[2]/div/div[4]/div[1]/span[1]")) != "") {
                betydelse = await driver.findElement(By.xpath("/html/body/div[1]/div[3]/div/div/article/section/div/div/div[2]/div/div/div/div/div[1]/div/div[2]/div/div[4]/div[1]/span[1]")).getText()
                titel = req.body.sökord;
            } else if (await driver.findElements(By.css("#so-1 > div.cshow > a:nth-child(1)")) != "") {
                let btn = await driver.findElement(By.css("#so-1 > div.cshow > a:nth-child(1)"))
                await btn.click()
                titel = await btn.getText()
                let text = await driver.wait(until.elementLocated(By.xpath("/html/body/div[1]/div[3]/div/div/article/section/div/div/div[2]/div/div/div/div/div[1]/div[2]/div/div[4]")), 500)
                betydelse = await text.getText()
            } else {
                let btn = await driver.wait(until.elementLocated(By.css("#so-1 > div.cshow > a:nth-child(6)")), 500)
                await btn.click()
                titel = await btn.getText()
                try {
                    let text = await driver.wait(until.elementLocated(By.xpath("/html/body/div[1]/div[3]/div/div/article/section/div/div/div[2]/div/div/div/div/div[1]/div/div[2]/div/div[4]")), 500)
                    betydelse = await text.getText()
                } catch (error) {
                    console.log(error)
                    let btn = await driver.findElement(By.css("#so-1 > div.cshow > a:nth-child(1)"))
                    await btn.click()
                    titel = await btn.getText()
                    let text = await driver.wait(until.elementLocated(By.xpath("/html/body/div[1]/div[3]/div/div/article/section/div/div/div[2]/div/div/div/div/div[1]/div[2]/div/div[4]")), 500)
                    betydelse = await text.getText()
                }
            }
            const content = {"betydelse": betydelse, "titel": titel}
            console.log(content)
            res.send(content)
            await driver.close()
            await driver.quit()
        } catch (error) {
            console.log(error)
            res.send({ "betydelse": "", "titel": "Något gick fel" })
        }
    })();
    
});

app.listen(3000);