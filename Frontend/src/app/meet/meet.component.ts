import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';




@Component({
  selector: 'app-meet',
  templateUrl: './meet.component.html',
  styleUrls: ['./meet.component.css']
})
export class MeetComponent implements OnInit {
  video: any = {};
  localstream:any;
  constructor( private router:Router ) { }
  audioDevice:any=[]
  videoDevice:any=[]
  audiooutputDevice:any=[]
  audioId:any=''
  videoId:any=''
  audioOutId:any=''
  stream:any
  volume:any
  height:any
  width:any
  videostatus:any=''
  v:any='on';
  joined:any="off"
  a:any='on';
  ngOnInit(): void {
    
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      console.log("enumerateDevices() not supported.");
      return;
    }
    
    // List cameras and microphones.
    
    navigator.mediaDevices.enumerateDevices()
    .then((devices)=>{
      devices.forEach((device)=> {
        if(device.kind=="audioinput"){
          this.audioDevice.push(device)
        }else if(device.kind=="videoinput"){
          this.videoDevice.push(device)
        }else if(device.kind=="audiooutput"){
          this.audiooutputDevice.push(device)
        }
        
      });
    })
    .catch(function(err) {
      console.log(err.name + ": " + err.message);
    });

  }
   constraints = { audio: true , video: true  };

  ngAfterViewInit(){
  

// var constraints = { audio: false , video: false };

 navigator.mediaDevices.getUserMedia(this.constraints)
.then((mediaStream)=>{
 this.stream=mediaStream
  this.video = document.querySelector("video")
  this.video.srcObject = mediaStream;
  this.localstream=mediaStream
  this.video.onloadedmetadata = function() {
    // this.video.play();
    
  }
 
})
.catch(function(err) { console.log(err.name + ": " + err.message); }); // always check for errors at the end.

    
  }
 
  changeAudio(device:any){
    // this.audioId=device.id
    // this.ngAfterViewInit()
    this.stream.getTracks().forEach((track:any) => {
      if(track.kind=='audio'){
        track.applyConstraints({
          deviceId:{exact:device}
        });
        
      }
      });
  
  }

  changeVideo(device:any){
    this.stream.getTracks().forEach((track:any) => {
      if(track.kind=='video'){
        track.applyConstraints({
          deviceId:{exact:device}
        });
        
      }
      });
  
  }


  muteAudio(){
    if(this.v=='off'){
      alert("You cant mute both Audio and Video")

    }else{
      this.a='off'
      console.log("audio:"+this.a);
      
     this.constraints.audio=false
     this.ngAfterViewInit()
    }
  }

  muteVideo(){
    if(this.a=='off'){
      alert("You cant mute both Audio and Video")
    }else{
      this.v='off'
      console.log("video:"+this.v);
     this.constraints.video=false
     this.ngAfterViewInit()
    }
  }

  unmuteAudio(){
      this.a='on'
      console.log("audio:"+this.a);
      
     this.constraints.audio=true
     this.ngAfterViewInit()
  }

  unmuteVideo(){
      this.v='on'
      console.log("video:"+this.v);
     this.constraints.video=true
     this.ngAfterViewInit()
  }

  

  changeVideoResolution(height:any,width:any){
  
    this.stream.getTracks().forEach((track:any) => {
      if(track.kind=='video'){
        track.applyConstraints({
          width: width,
          height: height
        });
        
      }
      });
  
  }

  joinVideo(){
    console.log(this.joined);
    this.joined="on"
    console.log(this.joined);
    this.router.navigate(['/joinedmeet'])
  }
  
  ngOnDestroy() {
    
    this.stream.getTracks().forEach((track:any) => {  
          track.stop();
      });
  }
  conference:any


}
