var express = require('express');
const app = express();
var cors = require('cors')
var path = require('path');
var meetData=require('./src/models/meetData')
var userdata=require('./src/models/userData')
var bcrypt = require('bcrypt')
let http = require('http');
let server = http.Server(app);

let socketIO = require('socket.io');
let io = socketIO(server);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

const port = process.env.PORT || 5200;

app.post('/createMeet',(req,res)=>{
    console.log(req.body);
    var data={
        name:req.body.data.meet,
        description:req.body.data.description,
        date:req.body.data.date
    }
    var meetdata=new meetData(data);
    meetdata.save().then(()=>{
    res.send()
  })
})

app.get('/getMeet',(req,res)=>{
    meetData.find().then((data)=>{
      res.send(data)
    })
})

app.get('/deleteMeet/:id',(req,res)=>{
  meetData.findByIdAndDelete({_id:req.params.id}).then((data)=>{
    res.send(data)
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
        res.status(401).send('User Already Exist')
      }else{
        console.log(item.password);
          item.password=await bcrypt.hash(item.password,10)
          let user = new userdata(item)
          user.save(
              err=>{
                  console.log(err);
                  res.send(err)
              },
              data=>{
                  console.log("Registration Successfull");
                  res.send({})
              }  
          )
      }
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
      io.emit('message', data);
    })  
});



server.listen(port, () => {
    console.log(`started on port: ${port}`);
});

module.exports = app;