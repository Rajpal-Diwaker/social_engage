let app = require('express')(),
    server = require('http').Server(app),
    io = require('socket.io')(server),
    bodyParser = require('body-parser'),
    express = require('express'),
    cors = require('cors'),
    http = require('http'),
    path = require('path');

let userDAO = require('./DAO/userDAO');
let groupDAO =require('./DAO/groupDAO');
let chatDAO = require ("./DAO/chatDataDAO");

let mongoose = require('./Utilities/mongooseConfig')();
let staticAuthRoute = require('./Routes/staticAuth')
let userAuthRoute = require('./Routes/userAuth'),
    adminAuthRoute = require('./Routes/adminAuth'),
    util = require('./Utilities/util'),
    config = require("./Utilities/config").config;

app.use("/media", express.static(path.join(__dirname, '/public')));
app.use(express.static(path.join(__dirname, 'client/dist')))

app.use(express.static(__dirname + '/views'));
app.set('view engine', 'ejs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true  }));
app.use(cors());

app.use(function (err, req, res, next) {
    return res.send({ "statusCode": util.statusCode.ONE, "statusMessage": util.statusMessage.SOMETHING_WENT_WRONG });
});

app.use('/user', userAuthRoute);
app.use('/admin', adminAuthRoute);
app.use('/static', staticAuthRoute);

require("./Utilities/instagramtest")


//===========================================Group Chat Module===============================================================

io.on('connection', function (socket) {
  var client = [];
  io.clients((error, clients) => {
    if (error) throw error;
    client = client.concat(clients)
    console.log(clients);
  })

  socket.on('getChatList', function (data) {
     let criteria = {
       groupId:data.groupId
     }
     let option = {
       limit : data.limit || 15,
       sort :{ messageTime : -1 },
       page : data.page || 1
     }
    chatDAO.paginateData(criteria,option, (err, dbData) => {
      if (err) 
      {
        io.sockets.to(socket.id).emit('error_callback', { "message": "error occur." });
      }
      if(dbData.docs.length==0){
        io.sockets.to(socket.id).emit('error_callback', { "message": "No data" });
      }
      console.log("WWWWWWWWWWW",dbData)
      let newArray = dbData.docs.reverse();
      console.log(">>>>>>>>>>>>>>>>>>>",newArray)
      io.sockets.to(socket.id).emit('getChatList', { "result": newArray });

    });
  });

  socket.on('sendMessage', function (data) 
  {
    userDAO.getOneUser({_id:data.userId},(err,result)=>{
      if(err){
        io.sockets.to(socket.id).emit('error_callback', { "message": "error occur." });
      }
      let time = new Date().getTime()

      console.log("dhjsfhfsjkdhgfsg",data,"WWWWWWWWWWWddfdsgsdWWWWWW",new Date())
      let chatData = {
        groupId:data.groupId,
        message:data.message,
        userId:data.userId,
        name:result.fullName,
        profilePic:result.image,
        messageTime:time
      }
       
      chatDAO.createChatData(chatData,(err1,result1)=>{
        if(err1){
          console.log("errror",err1)
        }
        // io.sockets.to(socket.id).emit('sendMessage', { "result": result });
        // io.sockets.to(client).emit('receiveMessage', { "result": result });
        io.sockets.emit('receiveMessage', { "result": result1 });
      })
    })
  })
   socket.on('disconnect', function () {
    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>.Disconnected")
    })
  // });

 

});

//===========================================Chat Completed============================================================

server.listen(config.NODE_SERVER_PORT.port, function () {
    console.log('app listening on port:' + config.NODE_SERVER_PORT.port);
});