var express = require('express');
const app = express();
var cors = require('cors')
var meetData = require('./src/models/meetData')


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));




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

app.listen(port, () => {
    console.log(`started on port: ${port}`);
});

module.exports = app;