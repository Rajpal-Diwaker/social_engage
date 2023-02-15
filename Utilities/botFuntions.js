let rp = require('request-promise')
const puppeteer = require('puppeteer');
const credentials = require('./credentials');


let checkCommentsInstagram = (instaUserName, postUrl) => {
    return new Promise((resolve, reject) => {
        let URl = `${postUrl}?__a=1`
        rp(URl).then(async (html) => {
            let data = JSON.parse(html);
            let data1 = data.graphql.shortcode_media.edge_media_to_parent_comment.edges
            for (let i = 0; i < data1.length; i++) {
                let username = data1[i].node.owner.username;
                console.log("LLLLLLLLLLLL", username)
                if (instaUserName == username) {
                    console.log("yes he has commented")
                    resolve({ commented: true })
                } 
            }
            resolve({commented:false})
        }).catch(error => {
            resolve({commented:false})
        })
    })
}

let checkLikesInstagram = async (instaUserName, postUrl) => {
    return new Promise((resolve, reject) => {
        [0].forEach(async x => {

            const browser = await puppeteer.launch({
                headless: false,
                executablePath:'/usr/bin/google-chrome-stable',
                args: ['--headless']
            }
            );
            const page = await browser.newPage();
            // page.setViewport({ height: 1080, width: 1920 })
            // await page.setRequestInterception(true);
            await page.goto('https://instagram.com/accounts/login', { waitUntil: 'networkidle2' });
            // await page.addScriptTag({url: 'https://code.jquery.com/jquery-3.2.1.min.js'})
            await page.waitFor(() => document.querySelectorAll('input').length)

            await page.type('[name=username]', credentials.username)
            await page.type('[name=password]', credentials.password)
            await page.waitFor(1000)
            await page.waitForSelector('.L3NKy', { waitUntil: 'load', timeout: 0 });
            await page.evaluate(() => {
                document.querySelector('.L3NKy').click()
            })
            await page.waitFor(3000)
            await page.goto(postUrl, { waitUntil: 'networkidle2' });
            await page.waitFor(3000)
            await page.waitForSelector('.Nm9Fw .sqdOP', { waitUntil: 'networkidle2', timeout: 0 });
            await page.evaluate(async () => {
                await document.querySelector('.Nm9Fw .sqdOP').click()
            })
            await page.waitFor(3000)
            const textsArray = await page.evaluate(
                () => [...document.querySelectorAll('.Igw0E .rBNOH .eGOV_ .ybXk5 ._4EzTm')].map(elem => elem.innerText)
            );
            console.log("FASDGTSRH", textsArray)
            for (let i = 0; i < textsArray.length; i++) {
                if (instaUserName === textsArray[i]) {
                    console.log("CCCCCCCCCCCCCLiked")
                    resolve({ liked: true })
                } 
            }
            resolve({liked:false})
            

            // await page.screenshot({ path: 'example.png' });
            await browser.close();
        })

    })
}


// [0].forEach(async x=>{
//     let abc=await checkLike("prakashsingh7876",'https://www.instagram.com/p/BqKlS64Bazi/')
//     console.log(">>>>>>>>>>>>>>>>ii>>>",abc)

// })


let checkLikeAndCommentsInstagram = (instaUserName, postUrl) => {
    return new Promise(async (resolve, reject) => {
        let checkComments = await checkComment(instaUserName, postUrl);
        let checkLikes = await checkLike(instaUserName, postUrl)
        if (checkLikes.liked && checkComments.commented) {
            resolve({ likedAndCommented: true })
        } else {
            resolve({ likedAndCommented: false })
        }
    })
}

// [0].forEach(async x=>{
//     let abc=await checkLikeAndComment("prakashsingh7876",'https://www.instagram.com/p/BqKlS64Bazi/')
//     console.log(">>>>>>>>>>>>>>>>>oo>>",abc)

// })




module.exports = {
    checkCommentsInstagram: checkCommentsInstagram,
    checkLikeAndCommentsInstagram: checkLikeAndCommentsInstagram,
    checkLikesInstagram: checkLikesInstagram
}