const fs = require('fs')
require("dotenv").config();
var express = require("express");
const app = express();
var cors = require("cors");
var path = require("path");
const jwt = require("jsonwebtoken");
const helmet = require("helmet");
const redisClient = require("./lib/datastore");

const mongoose = require("mongoose");
mongoose.connect(process.env.DBURL);

var meetData = require("./src/models/meetData");
var userdata = require("./src/models/userData");
var chatdata = require("./src/models/chatData");

const icsREST = require('./lib/rest');
icsREST.API.init('62175508b1dd074e87423862', 'oG5RXVEO/U3m4/7QgyE2LH7Y1iq+DonljH3gCuHbDzJ18ATw2GdqhLyIGmXdi4sCQQSjSo70BaBXDER33DlqR+UccbPfqUXERTas+deN6SEaH4JCGD+caX+eTQfIW0cWNxbzQ8YApEz6aT6bcl+jWU7AiX+zzawBaN3rZwoLu8w=', 'https://mcu5.enfinlabs.com:3000/', false);
var bcrypt = require("bcrypt");
let http = require("http");
let https = require("https");
let server
if (process.env.USE_SSL === 'true') {
  var options = {
      key: fs.readFileSync(process.env.key),
      cert: fs.readFileSync(process.env.cert),
  };
  server = https.createServer(options, app)
}
else {
  server = http.createServer(app);
}

let socketIO = require("socket.io");
let io = socketIO(server);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(helmet());

const port = process.env.PORT || 5200;

function verifyUserToken(req, res, next) {
  if (!req.headers.authorization) {
    return res.status(401).send("Unauthorized request4");
  }
  let token = req.headers.authorization.split(" ")[1];
  if (token === null) {
    return res.status(401).send("Unauthorized request5");
  }
  let payload = jwt.verify(token, process.env.JWTTOKEN);

  if (!payload) {
    return res.status(401).send("Unauthorized request6");
  }
  req.userId = payload.subject;
  next();
}

app.post('/createToken/', function(req, res) {
  var room = req.body.room,
    username = req.body.username,
    role = req.body.role;
  //FIXME: The actual *ISP* and *region* info should be retrieved from the *req* object and filled in the following 'preference' data.
  var preference = {isp: 'isp', region: 'region'};
  icsREST.API.createToken(room, username, role, preference, function(token) {
    res.send(token);
  }, function(err,response) {
    console.log("err",err);
    console.log("response",response);

    res.send(err);
  });
});

app.patch('/rooms/:room/streams/:stream', function(req, res) {
  'use strict';
  var room = req.params.room,
    stream_id = req.params.stream,
    items = req.body;
  icsREST.API.updateStream(room, stream_id, items, function(result) {
    res.send(result);
  }, function(err,res) {
    console.log("err",err);
    console.log("res",res);

    res.send(err);
  });
});


app.post("/createMeet", verifyUserToken, (req, res) => {
  console.log(req.body);
  var data = {
    name: req.body.data.meet,
    description: req.body.data.description,
    date: req.body.data.date,
    meetId: req.body.data.meetid,
    owner: req.body.data.owner,
  };
  var meetdata = new meetData(data);
  meetdata
    .save()
    .then(async () => {
      let data = {
        audioMute: [],
        videoMute: [],
        screenShare: false,
        streaming: true,
      };
      try {
        let response = await redisClient.HSET(
          "VishEnfinConference",
          req.body.data.meetid,
          JSON.stringify(data)
        );
        res.send({ success: true });
      } catch (e) {
        res.send({ success: false, message: e.message });
      }
    })
    .catch((e) => {
      res.send({ success: false, message: e.message });
    });
});


app.post('/muteAudio', async function (req, res, next) {
  try {
    let { body } = req
    console.log("body", body)
    let response = await redisClient.HGET('VishEnfinConference', body.data.roomId);
    response=JSON.parse(response)
    console.log(response);
    response.audioMute.push(body.data.user)
    try{
      let data = await redisClient.HSET('VishEnfinConference', body.data.roomId, JSON.stringify(response));
      console.log(data);
      res.json(response)

    }
    catch(e){
      console.log(e)
    }
    
  }
  catch (e) {
    console.log(e)
  }
});

app.post('/unmuteAudio', async function (req, res, next) {
  try {
    let { body } = req
    console.log("body", body)
    let response = await redisClient.HGET('VishEnfinConference', body.data.roomId);
    response=JSON.parse(response)
    console.log(response);
    let index = response.audioMute.indexOf(body.data.user);
    response.audioMute.splice(index, 1);
    try{
      let data = await redisClient.HSET('VishEnfinConference', body.data.roomId, JSON.stringify(response));
      console.log(data);
      res.json(response)

    }
    catch(e){
      console.log(e)
    }
    
  }
  catch (e) {
    console.log(e)
  }
});

app.post('/present', async function (req, res, next) {
  try {
    let { body } = req
    console.log("body", body)
    let response = await redisClient.HGET('VishEnfinConference', body.data.roomId);
    response=JSON.parse(response)
    console.log(response);
    response.screenShare=true
    try{
      let data = await redisClient.HSET('VishEnfinConference', body.data.roomId, JSON.stringify(response));
      console.log(data);
      res.json(response)

    }
    catch(e){
      console.log(e)
    }
    
  }
  catch (e) {
    console.log(e)
  }
});

app.post('/stopPresent', async function (req, res, next) {
  try {
    let { body } = req
    console.log("body", body)
    let response = await redisClient.HGET('VishEnfinConference', body.data.roomId);
    response=JSON.parse(response)
    console.log(response);
    response.screenShare=false
    try{
      let data = await redisClient.HSET('VishEnfinConference', body.data.roomId, JSON.stringify(response));
      console.log(data);
      res.json(response)

    }
    catch(e){
      console.log(e)
    }
    
  }
  catch (e) {
    console.log(e)
  }
});


app.post('/muteVideo', async function (req, res, next) {
  try {
    let { body } = req
    console.log("body", body)
    let response = await redisClient.HGET('VishEnfinConference', body.data.roomId);
    response=JSON.parse(response)
    console.log(response);
    response.videoMute.push(body.data.user)
    try{
      let data = await redisClient.HSET('VishEnfinConference', body.data.roomId, JSON.stringify(response));
      console.log(data);
      res.json(response)

    }
    catch(e){
      console.log(e)
    }
    
  }
  catch (e) {
    console.log(e)
  }
});


app.post('/unmuteVideo', async function (req, res, next) {
  try {
    let { body } = req
    console.log("body", body)
    let response = await redisClient.HGET('VishEnfinConference', body.data.roomId);
    response=JSON.parse(response)
    console.log(response);
    let index = response.videoMute.indexOf(body.data.user);
    response.videoMute.splice(index, 1);
    try{
      let data = await redisClient.HSET('VishEnfinConference', body.data.roomId, JSON.stringify(response));
      console.log(data);
      res.json(response)

    }
    catch(e){
      console.log(e)
    }
    
  }
  catch (e) {
    console.log(e)
  }
});


app.get('/meetStatus/:id', async function (req, res, next) {
  try {
    let { params } = req
    let response = await redisClient.HGET('VishEnfinConference', params.id);
    res.send(response)

  }
  catch (e) {
    console.log(e)
  }
});




app.get("/getMeet", verifyUserToken, (req, res) => {
  meetData
    .find()
    .then((data) => {
      res.send({ success: true, data });
    })
    .catch((err) => {
      console.log(err);
      res.send({ success: false, message: err });
    });
});

app.get("/deleteMeet/:id", verifyUserToken, (req, res) => {
  meetData
    .findByIdAndDelete({ _id: req.params.id })
    .then((data) => {
      res.send({ success: true, data });
    })
    .catch((e) => {
      res.send({ success: false });
    });
});

app.post("/register", async (req, res) => {
  console.log(req.body);
  var item = {
    name: req.body.data.name,
    password: req.body.data.password,
    email: req.body.data.email,
  };
  userdata.findOne({ email: item.email }).then(async (data) => {
    if (data) {
      res.status(401).send({ message: "User Already Exist", success: false });
    } else {
      console.log(item.password);
      item.password = await bcrypt.hash(item.password, 10);
      let user = new userdata(item);
      user.save(
        (err) => {
          console.log(err);
          res.send({ success: false, message: err });
        },
        (data) => {
          console.log("Registration Successfull");
          res.send({ success: true, message: "Registration Successfull" });
        }
      );
    }
  });
});

app.post("/create-meeting", async function (req, res, next) {
  res.send("respond with a resource");
  let { body } = req;
  console.log("body", body);

  let data = {
    audioMute: [],
    videoMute: [],
    screenShare: false,
    streaming: true,
  };
  try {
    let response = await redisClient.HSET(
      "VishEnfinConference",
      body.meetId,
      JSON.stringify(data)
    );
    console.log(response);
  } catch (e) {
    console.log(e);
  }
});

app.post('/createRoom/', function(req, res) {
  'use strict';
  var name = req.body.name;
  var options = req.body.options;
  icsREST.API.createRoom(name, options, function(response) {
    res.send(response);
  }, function(err) {
    res.send(err);
  });
});

app.post("/login", (req, res) => {
  console.log(req.body);
  userdata.findOne({ email: req.body.data.email }, (err, user) => {
    console.log(user);
    if (user) {
      bcrypt.compare(req.body.data.password, user.password).then((response) => {
        if (response) {
          console.log("user");
          let payload = { subject: user.name };
          let token = jwt.sign(payload, process.env.JWTTOKEN);
          res.status(200).send({ success: true, user: user, token: token });

          console.log("success");
        } else {
          console.log("failed");
          res
            .status(401)
            .send({ success: false, message: "Invalid user Password" });
        }
      });
    } else {
      console.log("failed");
      res.status(401).send({ success: false, message: "Invalid credential" });
    }
  });
});

app.get("/chatHistory/:item", verifyUserToken, (req, res) => {
  const room = req.params.item;
  chatdata
    .find({ room: room })
    .then((otheruserdetail) => {
      res.send({ success: true, messages: otheruserdetail });
    })
    .catch((err) => {
      res.send({ success: false, message: err });
    });
});

console.log("b4 connection");

io.on("connection", (socket) => {
  console.log("a user connected");
  socket.on("join", (data) => {
    socket.join(data.room);
    socket.broadcast.to(data.room).emit("user joined");
  });

  socket.on("message", (data) => {
    console.log(data);
    let date_ob = new Date();
    var chatsdata = {
      user: data.user,
      room: data.room,
      message: data.message,
      date: new Date().toLocaleDateString(),
      time: formatAMPM(new Date()),
    };
    var data = new chatdata(chatsdata);
    data.save();
    io.emit(`${data.room}`, data);
  });
});

function formatAMPM(date) {
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? "0" + minutes : minutes;
  var strTime = hours + ":" + minutes + " " + ampm;
  return strTime;
}

server.listen(port, () => {
  console.log(`started on port: ${port}`);
});

module.exports = app;
