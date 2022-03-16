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
  v:any="on";
  joined:any="off"
  a:any="on";
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

  ngAfterViewInit(){
  
  var constraints = { audio: { deviceId: this.audioId } , video: { deviceId: this.videoId, height:this.height, width:this.width } };

// var constraints = { audio: false , video: false };

 navigator.mediaDevices.getUserMedia(constraints)
.then((mediaStream)=>{
 this.stream=mediaStream
  this.video = document.querySelector("video")
  this.video.srcObject = mediaStream;
  this.localstream=mediaStream
  this.video.onloadedmetadata = function() {
    // this.video.play();
    
  }
  // const audioContext = new AudioContext();
  // const analyser = audioContext.createAnalyser();
  // const microphone = audioContext.createMediaStreamSource(mediaStream);
  // const scriptProcessor = audioContext.createScriptProcessor(2048, 1, 1);

  // analyser.smoothingTimeConstant = 0.8;
  // analyser.fftSize = 1024;

  // microphone.connect(analyser);
  // analyser.connect(scriptProcessor);
  // scriptProcessor.connect(audioContext.destination);
  // scriptProcessor.onaudioprocess = ()=>{
  //   const array = new Uint8Array(analyser.frequencyBinCount);
  //   analyser.getByteFrequencyData(array);
  //   const arraySum = array.reduce((a, value) => a + value, 0);
  //   const average = arraySum / array.length;
  //   // this.volume=Math.round(average)
  //   // console.log(this.volume);
  //   this.volume = document.getElementById('volume')
  //   this.volume.setAttribute("value",Math.round(average))
    
    // colorPids(average);
  // };
})
.catch(function(err) { console.log(err.name + ": " + err.message); }); // always check for errors at the end.

    
  }

 
  changeAudio(device:any){
    this.audioId=device.id
    this.ngAfterViewInit()
  }

  changeVideo(device:any){
    this.videoId=device.id
    this.ngAfterViewInit()

  }


  muteAudio(){
    this.stream.getTracks().forEach((track:any) => {
      if(track.kind=='audio'){
          track.stop();
          this.a="off"
          console.log(this.a);
   
      }
      });
  }

  muteVideo(){
    this.stream.getTracks().forEach((track:any) => {
      if(track.kind=='video'){
          track.stop();
      }
      });
  }

  changeVideoResolution(height:any,width:any){
    this.height=height
    this.width=width
    this.ngAfterViewInit()
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
}
