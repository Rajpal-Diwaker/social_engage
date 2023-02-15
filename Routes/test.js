// let Instagram = require('instagram-nodejs-without-api');
// Instagram = new Instagram()


// Instagram.getCsrfToken().then((csrf) =>
// {
//   Instagram.csrfToken = csrf;
// }).then(() =>
// {
//   return Instagram.auth('prakashsingh7876', '8953672758').then(sessionId =>
//   {
//     Instagram.sessionId = sessionId

//     return Instagram.getUserDataByUsername('vivekindra').then((t) =>
//     {console.log("HHHHHHHHHHHH",t)
//       return Instagram.getUserFollowers(t.graphql.user.id).then((t) =>
//       {
//         console.log("ddddddddddddddddddd",t); // - instagram followers for user "username-for-get"
//       })
//     })

//   })
// }).catch(console.error);