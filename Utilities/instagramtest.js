// const Instagram = require('instagram-web-api')
// const FileCookieStore = require('tough-cookie-filestore2')

// const { username, password } = require('./credentials') // Only required when no cookies are stored yet
// console.log("jghfgsdkjfgdksjfgksdf",username)
// const cookieStore = new FileCookieStore('./cookies.json')
// const client = new Instagram({ username, password, cookieStore });

// (async () => {
//   // URL or path of photo
// //   const photo =
// //     'https://scontent-scl1-1.cdninstagram.com/t51.2885-15/e35/22430378_307692683052790_5667315385519570944_n.jpg'

//   await client.login()

//   // Upload Photo
// //   const { media } = await client.uploadPhoto(photo)
// // const profile = await client.getProfile()
// // const activity = await client.getActivity()
//   console.log(`https://www.instagram.com/p/prakashsingh7876/`)
//   console.log(">>>>>>>>>>>>>>>>>>>>",profile,"aaaaaaaaaaaaaaaaaaaaaaa",activity)
// })()


const {
  getMediaByCode,
  getUserByUsername,
  getMediaByLocation,
  getMediaByTag,
  getMediaLikesByCode,
  getMediaCommentsByCode,
  generalSearch,
  getUserIdFromUsername,
  getUserProfilePicture,
  getTaggedUsersByCode,
  getMediaOwnerByCode
} = require('instapro');


// getUserByUsername('prakashsingh7876').then((user) => {
//   console.log(">><>><><><><>>>>>>>>>>>>>>>>>>>>>>>>",typeof user)
// })

// getUserIdFromUsername('instagram').then((id) => {
//   console.log(id)
// })

// getMediaByCode('BUu14BdBkO5').then(media => {
//   console.log(">>>>>>><<<<<<<<<<<<<<<<<<<<<",media)
// })

// getMediaOwnerByCode('BUu14BdBkO5').then(media => {
//   console.log(media)
// })

// getMediaByLocation('292188415').then(({ location }) => {
//   console.log(location.id)
//   console.log(location.name)
//   console.log(location.slug)
// })

// getMediaByTag('abcd').then((media) => {
//   console.log(media)
// })

// generalSearch('insta').then((results) => {
//   console.log(results)
// })

// getUserProfilePicture('instagram').then((url) => {
//   console.log(url)
// })

getMediaLikesByCode('BUu14BdBkO5').then((media) => {
  console.log(media)
})

// getMediaCommentsByCode('BUu14BdBkO5').then((media) => {
//   console.log(media)
// })

// getTaggedUsersByCode('BUu14BdBkO5').then((media) => {
//   console.log(media)
// })



























// let superagent=require("superagent");

// (async function init(){
//     const getCookieValueFromKey = function(key, cookies) {
//         const cookie = cookies.find(c => c.indexOf(key) !== -1);
//         if (!cookie) {
//             throw new Error('No key found.');
//         }
//         return (RegExp(key + '=(.*?);', 'g').exec(cookie))[1];
//     };
    
//     /*
//     ** Calculate the value of the X-Instagram-GIS header by md5 hashing together the rhx_gis variable and the query variables for the request.
//     */
//     const generateRequestSignature = function(rhxGis, queryVariables) {
//     return crypto.createHash('md5').update(`${rhxGis}:${queryVariables}`, 'utf8').digest("hex");
//     };
    
//     /*
//     ** Begin
//     */
//     const userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_1) AppleWebKit/604.3.5 (KHTML, like Gecko) Version/11.0.1 Safari/604.3.5';
    
//     // Make an initial request to get the rhx_gis string
//     const initResponse = await superagent.get('https://www.instagram.com/prakashsingh7876/')
//     .set('User-Agent', userAgent);
//     console.log("DDDDDDDDDDDDDDDDDDDD",initResponse)
//     const rhxGis = (RegExp('"rhx_gis":"([a-f0-9]{32})"', 'g')).exec(initResponse.text)[1];
    
//     const csrfTokenCookie = getCookieValueFromKey('csrftoken', initResponse.header['set-cookie']);
    
//     const queryVariables = JSON.stringify({
//     id: "123456789",
//     first: 9
//     });
    
//     const signature = generateRequestSignature(rhxGis, queryVariables);
    
//     const res = await superagent.get('https://www.instagram.com/prakashsingh7876/')
    
//     .set({
//         'User-Agent': userAgent,
//         'X-Instagram-GIS': signature,
//         'Cookie': `rur=FRC;csrftoken=${csrfTokenCookie};ig_pr=1`
//     })
//     console.log("GGGGGGGGGGGGGGGGGGG",res)
// })();




// let obj={
//     'Accept':"*/*",
// 'Accept-Encoding':gzip, deflate, br,	

// Connection:keep-alive,
// Cookie:	"mid=XZ8RGwAEAAE4-F80CBbmfKdtH6…:_Tjjk52J3V6AC5CUwnLZGoiJd6w",
// Host:www.instagram.com,
// 'X-CSRFToken':"DYFrKOruf5R9vv9WZgzCXPX3HrZJRnVZ",

// X-Requested-With	
// XMLHttpRequest
// }

// curl -i -X GET "https://graph.facebook.com/v5.0/me/accounts?access_token={EAAVLcuLZAXo0BAC43YBhIoFZB0EbadhefZA2wwosKtTBmd3QWZCWQLhgv5nHf33wSDa3RJ5vVofIewDXXUH2VqSdCNZAgVt8Yjp0dekZCazUoiVuqfcwPVzTdFXS4yCOhlTzioYbUfu1XpQKyMgmJwOdbyRLG9KqS5twOZBmVWOzn4bajxiq3q4cosRsgRhZA98ZD}"