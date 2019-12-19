exports.dynamicPageRenderer = (req, res) => {
    const url = req.query.url;
    if (!url) {
        return;
    }
    run(url)
        .then((content) => {
            res.status(200).send(content);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send("error: " + err);
        })
};

async function run(url) {
    const puppeteer = require('puppeteer');

    const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});

    const page = await browser.newPage();
    page.on('error', err=> {
        console.log('error happen at the page: ', err);
    });
    page.on('pageerror', pageerr=> {
        console.log('pageerror occurred: ', pageerr);
    });

    await page.goto(url, { waitUntil: 'networkidle0' });
    await page.setViewport({
        width: 1200,
        height: 800
    });
    await autoScroll(page);

    const content = await page.content();
    browser.close();
    return content;
}

async function autoScroll(page){
    await page.evaluate(async () => {
        await new Promise((resolve, reject) => {
            var totalHeight = 0;
            var distance = 100;
            var timer = setInterval(() => {
                var scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if(totalHeight >= scrollHeight){
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    });
}
