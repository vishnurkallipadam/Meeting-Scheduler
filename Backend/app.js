require('dotenv').config()
var express = require('express');
const app = express();
var cors = require('cors')
var path = require('path');
const jwt = require('jsonwebtoken')
const helmet = require("helmet");

const mongoose = require('mongoose');
mongoose.connect(process.env.DBURL);

var meetData=require('./src/models/meetData')
var userdata=require('./src/models/userData')
var chatdata=require('./src/models/chatData')

var bcrypt = require('bcrypt')
let http = require('http');
let server = http.Server(app);

let socketIO = require('socket.io');
let io = socketIO(server);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(helmet());

const port = process.env.PORT || 5200;


function verifyUserToken(req, res,next) {

  if(!req.headers.userauthorization) {
      return res.status(401).send('Unauthorized request4')
    }
    let token = req.headers.userauthorization.split(' ')[1]
    if(token === null) {
      return res.status(401).send('Unauthorized request5')    
    }
    let payload = jwt.verify(token, process.env.JWTTOKEN)

    if(!payload) {
      return res.status(401).send('Unauthorized request6')    
    }
    req.userId = payload.subject
    next()
}


app.post('/createMeet',verifyUserToken,(req,res)=>{
    console.log(req.body);
    var data={
        name:req.body.data.meet,
        description:req.body.data.description,
        date:req.body.data.date
    }
    var meetdata=new meetData(data);
    meetdata.save().then(()=>{
    res.send({success:true})
  })
  .catch((e)=>{
    res.send({success:false,message:e.message})
  })
})

app.get('/getMeet',verifyUserToken,(req,res)=>{
    meetData.find().then((data)=>{
      res.send({success:true,data})
    })
    .catch((err)=>{
      console.log(err);
      res.send({success:false,message:err.message})
    })
})

app.get('/deleteMeet/:id',verifyUserToken,(req,res)=>{
  meetData.findByIdAndDelete({_id:req.params.id})
  .then((data)=>{
    res.send({success:true,data})
  })
  .catch((e)=>{
    res.send({success:false})
  })
})

app.post('/register',async(req,res)=>{
  console.log(req.body);
  var item={
      name:req.body.data.name,
      password:req.body.data.password,
      email:req.body.data.email,
      
  }
  userdata.findOne({email:item.email})
  .then(async(data)=>{
      if(data){
        res.status(401).send({message:'User Already Exist',success:false})
      }else{
        console.log(item.password);
          item.password=await bcrypt.hash(item.password,10)
          let user = new userdata(item)
          user.save(
              err=>{
                  console.log(err);
                  res.send({success:false,message:err})
              },
              data=>{
                  console.log("Registration Successfull");
                  res.send({success:true,message:"Registration Successfull"})
              }  
          )
      }
  })
})

app.post('/login',(req,res)=>{
  console.log(req.body);
  userdata.findOne({email:req.body.data.email},(err,user)=>{
      console.log(user);
      if(user){
          bcrypt.compare(req.body.data.password,user.password)
          .then((response)=>{
              if(response){
                  console.log("user");
                  let payload = {subject: req.body.data.email+user.password}
                  let token = jwt.sign(payload, process.env.JWTTOKEN)
                  res.status(200).send({success:true,user:user,token:token})
                  
                  console.log("success");
              }else{
                  console.log("failed");
                  res.status(401).send({success:false,message:'Invalid user Password'})
              }
          })   
      }else{
          console.log("failed");
          res.status(401).send({success:false,message:'Invalid credential'})
      }
  })
})

app.get('/chatHistory/:item',verifyUserToken, (req, res) => {
  const room = req.params.item;
  chatdata.find({ room:room  })
    .then((otheruserdetail)=>{
        res.send({success:true,messages:otheruserdetail});
    })
    .catch((err)=>{
      res.send({success:false,message:err.message})
    })
})


console.log("b4 connection");

io.on('connection', (socket) => {
    console.log("a user connected");
    socket.on('join', (data) => {
        socket.join(data.room);
        socket.broadcast.to(data.room).emit('user joined');
    });

    socket.on('message',(data)=>{
      console.log(data);
      let date_ob = new Date();
        var chatsdata={
          user:data.user,
          room:data.room,
          message:data.message,
          date:new Date().toLocaleDateString(),
          time:formatAMPM(new Date)
        }
        var data=new chatdata(chatsdata);
        data.save();
      io.emit(`${data.room}`, data);
    })  
});


function formatAMPM(date) {
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? '0'+minutes : minutes;
  var strTime = hours + ':' + minutes + ' ' + ampm;
  return strTime;
}


server.listen(port, () => {
    console.log(`started on port: ${port}`);
});

module.exports = app;