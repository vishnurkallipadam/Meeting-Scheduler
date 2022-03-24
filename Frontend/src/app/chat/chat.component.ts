import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ChatService } from '../chat.service';
import { MeetService } from '../meet.service';

declare var Owt: any;
declare var $:any

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
  constructor(private chat:ChatService,private meet:MeetService) { }
  messageArray:any=[]
  message:any=''
  mail:any=''
  room:any=''
  conference:any
  mediaUrl:any
  isPublish:any
  shareScreen:any
  simulcast:any
  localStream:any
  video:any
  videoStream:any
  publicationGlobal:any
  subscribeForward:any
 
  audio:any='on'
  videos:any='on'

  muteAudioButton:any
  muteVideoButton:any

  unmuteAudioButton:any
  unmuteVideoButton:any
  myId:any

  ngOnInit(): void {
   
    this.video = document.querySelector("video")
this.videoStream=document.getElementById("videoplot")
this.muteAudioButton=document.getElementById("muteAudio")
this.muteVideoButton=document.getElementById("muteVideo")

this.unmuteAudioButton=document.getElementById("unmuteAudio")
this.unmuteVideoButton=document.getElementById("unmuteVideo")


    this.room = sessionStorage.getItem("joinedId")
    this.mail=sessionStorage.getItem("loginmail")
    this.chat.chatHistory(this.room).subscribe(
      data=>{
        this.messageArray=JSON.parse(JSON.stringify(data.messages))
      },
      err=>{
        console.log(err);
         
      }
    )


  }

  isSelf:any

  ngAfterViewInit(){
    this.chat.newMessageReceived()
    .subscribe(data =>          
      this.messageArray.push(data)
      );
     

      
     
      
      this.meet.createToken(this.room, 'user', 'presenter').subscribe( (response:any) => {
        // console.log(response);
        this.conference = new Owt.Conference.ConferenceClient();
        var token = response;
        this.conference.join(token).then((resp:any) => {
          // console.log(resp);
          
            this.myId  = resp.self.id;
            let myRoom = resp.id;
            // this.mediaUrl="localhost"
            if(this.mediaUrl){
                 this.meet.startStreamingIn(myRoom, this.mediaUrl).subscribe(data=>{console.log(data);
                 },err=>{
                   console.log(err);
                   
                 })
            }
            if (this.isPublish !== 'false') {
                // audioConstraintsForMic
                let audioConstraints = new Owt.Base.AudioTrackConstraints(Owt.Base.AudioSourceInfo.MIC);
                // videoConstraintsForCamera
                let videoConstraints = new Owt.Base.VideoTrackConstraints(Owt.Base.VideoSourceInfo.CAMERA);
                if (this.shareScreen) {
                    // audioConstraintsForScreen
                    audioConstraints = new Owt.Base.AudioTrackConstraints(Owt.Base.AudioSourceInfo.SCREENCAST);
                    // videoConstraintsForScreen
                    videoConstraints = new Owt.Base.VideoTrackConstraints(Owt.Base.VideoSourceInfo.SCREENCAST);
                }

                let mediaStream;
                Owt.Base.MediaStreamFactory.createMediaStream(new Owt.Base.StreamConstraints(
                    audioConstraints, videoConstraints)).then((stream:any) => {
                    let publishOption;
                    
                    if (this.simulcast) {
                        publishOption = {video:[
                            {rid: 'q', active: true/*, scaleResolutionDownBy: 4.0*/},
                            {rid: 'h', active: true/*, scaleResolutionDownBy: 2.0*/},
                            {rid: 'f', active: true}
                        ]};
                    }
                    mediaStream = stream;
                    this.localStream = new Owt.Base.LocalStream(
                        mediaStream, new Owt.Base.StreamSourceInfo(
                            'mic', 'camera'));
                // this.video.srcObject = stream;
                    this.conference.publish(this.localStream, publishOption).then((publication:any) => {
                        this.publicationGlobal = publication;
                        console.log("publication",publication);
                        
                        this.meet.mixStream(myRoom, publication.id, 'common')
                        .subscribe((data)=>{
                          console.log(data);
                          
                        },err=>{console.log(err);
                        })

                        publication.addEventListener('error', (err:any) => {
                            console.log('Publication error: ' + err.error.message);
                        });
                       
                        
                        this.muteAudioButton.addEventListener('click',()=>{
                  
                          
                          publication.mute('audio').then((response:any)=>{
                         
                            
                            this.audio='off'
                            this.muteAudioButton.style.display='none'
                            this.unmuteAudioButton.style.display='block'

                            
                          })
                        })

                        this.muteVideoButton.addEventListener('click',()=>{
                      
                          
                          publication.mute('video').then((response:any)=>{
                        
                            
                            this.videos='off'
                            this.muteVideoButton.style.display='none'
                            this.unmuteVideoButton.style.display='block'

                          })
                        })

                        this.unmuteVideoButton.addEventListener('click',()=>{
                       
                          
                          publication.unmute('video').then((response:any)=>{
                           
                            
                            this.videos='off'
                            this.unmuteVideoButton.style.display='none'
                            this.muteVideoButton.style.display='block'

                          })
                        })

                        this.unmuteAudioButton.addEventListener('click',()=>{
                   
                          
                          publication.unmute('audio').then((response:any)=>{
                          
                            
                            this.audio='off'
                            this.unmuteAudioButton.style.display='none'
                            this.muteAudioButton.style.display='block'

                            
                          })
                        })

                        this.conference.addEventListener('streamadded', (event:any) => {
                          console.log('A new stream is added ', event.stream.id);
                          let isSelf=this.myId
                          isSelf = isSelf?isSelf:event.stream.id != this.publicationGlobal.id;
                          this.subscribeForward && isSelf && this.subscribeAndRenderVideo(event.stream);
                          this.meet.mixStream(myRoom, event.stream.id, 'common').subscribe(()=>{})
                          event.stream.addEventListener('ended', () => {
                              console.log(event.stream.id + ' is ended.');
                          });
                      });

                        
                        
                    });
                }, (err:any) => {
                    console.error('Failed to create MediaStream, ' +
                        err);
                });
            }
            var streams = resp.remoteStreams;
            // console.log(streams);
            
            for (const stream of streams) {
                if(!this.subscribeForward){
                  if (stream.source.audio === 'mixed' || stream.source.video ===
                    'mixed') {
                  
                      
                    this.subscribeAndRenderVideo(stream);
                  }
                } else if (stream.source.audio !== 'mixed') {
                 

                    this.subscribeAndRenderVideo(stream);
                }
            }
            console.log('Streams in conference:', streams.length);
            var participants = resp.participants;
            console.log('Participants in conference: ' + participants.length);
        }, function(err:any) {
            console.error('server connection failed:', err);
            if (err.message.indexOf('connect_error:') >= 0) {
                const signalingHost = err.message.replace('connect_error:', '');
                const signalingUi = 'signaling';
            }
        });
    });



    
  }

  sendMessage(){

      if(this.message!=''){
        let loginmail=sessionStorage.getItem("loginmail");
        let room = sessionStorage.getItem("joinedId")
        this.chat.sendMessage({user:loginmail,  message:this.message ,room:room})
        this.message=''
        }
  }
  subscirptionLocal:any
   subscribeAndRenderVideo(stream:any){
    
     
    this.conference.subscribe(stream)
    .then((subscription:any)=>{
      this.subscirptionLocal = subscription;
      // console.log(subscription);
      // console.log("stream:",stream);
    
      
     this.videoStream.srcObject = stream.mediaStream;
     
  }, (err:any)=>{ console.log('subscribe failed', err);
  });
   
}

}
