const axios = require('axios');
const cheerio = require('cheerio');
const express = require('express');

async function getPriceFeed() {
    try {
        const siteUrl = "https://coinmarketcap.com/";

        const {data} = await axios({
            method: "GET",
            url: siteUrl,
        });

        const $ = cheerio.load(data);
        const elemSelector = "#__next > div.sc-48e202ed-1.hJWPVO > div.main-content > div.cmc-body-wrapper > div > div:nth-child(1) > div.sc-996d6db8-2.kQcCjW > table > tbody > tr";

        const keys = [
            'rank',
            'name',
            'price',
            '1h',
            '24h',
            '7d',
            'marketCap',
            'volume',
            'circulatingSupply',
        ];

        const coinArr = [];
        
        $(elemSelector).each((parentIdx, parentElem) => {
            let keyIdx = 0;
            const coinObj = {};

            if (parentIdx <= 9) {
                $(parentElem).children().each((childIdx, childElem) => {
                    let tdValue = $(childElem).text();

                    if (keyIdx === 1 || keyIdx === 6) {
                        tdValue = $('p:first-child', $(childElem).html()).text();
                    }
                    
                    if (tdValue) {
                        coinObj[keys[keyIdx]] = tdValue;
                        keyIdx += 1;
                    }
                });

                coinArr.push(coinObj);
            }
        });
        return coinArr;
    } catch (err) {
        console.error(err);
    }
}

const app = express();

app.get('/api/price-feed', async (req, res) => {
    try {
        const priceFeed = await getPriceFeed();
        return res.status(200).json({
            result: priceFeed
        });
    } catch (err) {
        return res.status(500).json({
            err: err.toString()
        });
    }
});

app.listen(3000, () => {
    console.log("running on port 3000");
});