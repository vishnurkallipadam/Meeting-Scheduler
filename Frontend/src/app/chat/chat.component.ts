import { ThisReceiver } from '@angular/compiler';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { ChatService } from '../chat.service';
import { MeetService } from '../meet.service';

declare var Owt: any;
declare var $: any;

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent implements OnInit {
  constructor(
    private chat: ChatService,
    private meet: MeetService,
    private router: Router
  ) {}
  messageArray: any = [];
  message: any = '';
  mail: any = '';
  room: any = '';
  conference: any;
  mediaUrl: any;
  isPublish: any;
  shareScreen: any;
  simulcast: any;
  localStream: any;
  video: any;
  videoStream: any;
  publicationGlobal: any;
  subscribeForward: any;
  participants: any = [];

  audio: any = 'on';
  videos: any = 'on';

  muteAudioButton: any;
  muteVideoButton: any;

  unmuteAudioButton: any;
  unmuteVideoButton: any;
  myId: any;
  streamId: any;
  leaveMeeting: any;
  shareYourScreen:any

  stopShareScreen:any;
  showChat:any

  audioId:any
  videoId:any
  token:any

  mediaStream:any
  showPaticipants:any

  ngOnInit(): void {
    this.video = document.querySelector('video');
    this.videoStream = document.getElementById('videoplot');
    this.muteAudioButton = document.getElementById('muteAudio');
    this.muteVideoButton = document.getElementById('muteVideo');
    this.showChat = document.getElementById('showChat');
    this.unmuteAudioButton = document.getElementById('unmuteAudio');
    this.unmuteVideoButton = document.getElementById('unmuteVideo');

    this.leaveMeeting = document.getElementById('leaveMeeting');
    this.showPaticipants = document.getElementById('showPaticipants');

    this.shareYourScreen=document.getElementById('shareScreen')
    this.stopShareScreen=document.getElementById('stopshareScreen')

   
    this.room = sessionStorage.getItem('joinedId');
    this.mail = sessionStorage.getItem('loginmail');
    this.chat.chatHistory(this.room).subscribe(
      (data) => {
        this.messageArray = JSON.parse(JSON.stringify(data.messages));
      },
      (err) => {
        console.log(err);
      }
    );
  }

  isSelf: any;

  ngAfterViewInit() {
    this.chat
      .newMessageReceived()
      .subscribe((data) => this.messageArray.push(data));

    let loginmail = sessionStorage.getItem('loginmail');
    this.meet
      .createToken(this.room, loginmail, 'presenter')
      .subscribe((response: any) => {
        // console.log(response);
        this.conference = new Owt.Conference.ConferenceClient();
        this.token = response;
        this.conference.join(this.token).then(
          (resp: any) => {
            //  console.log(resp);

            this.myId = resp.self.id;
            let myRoom = resp.id;
            // this.mediaUrl="localhost"
            if (this.mediaUrl) {
              this.meet.startStreamingIn(myRoom, this.mediaUrl).subscribe(
                (data) => {
                  console.log(data);
                },
                (err) => {
                  console.log(err);
                }
              );
            }
            if (this.isPublish !== 'false') {
              // audioConstraintsForMic
              let audioConstraints
              let videoConstraints

              // let audioId = sessionStorage.getItem('audio');
              // let videoId = sessionStorage.getItem('video');
          
              // if(audioId){
              //   audioConstraints = new Owt.Base.AudioTrackConstraints(
              //     Owt.Base.AudioSourceInfo.audioId
              //   );
              // }else{
              //   audioConstraints = new Owt.Base.AudioTrackConstraints(
              //     Owt.Base.AudioSourceInfo.MIC
              //   );
              // }
             
              audioConstraints = new Owt.Base.AudioTrackConstraints(
                    Owt.Base.AudioSourceInfo.MIC
                  );

              // videoConstraintsForCamera
              videoConstraints = new Owt.Base.VideoTrackConstraints(
                Owt.Base.VideoSourceInfo.CAMERA
              );
              if (this.shareScreen) {
                // audioConstraintsForScreen
                audioConstraints = new Owt.Base.AudioTrackConstraints(
                  Owt.Base.AudioSourceInfo.SCREENCAST
                );
                // videoConstraintsForScreen
                videoConstraints = new Owt.Base.VideoTrackConstraints(
                  Owt.Base.VideoSourceInfo.SCREENCAST
                );
              }

             
              Owt.Base.MediaStreamFactory.createMediaStream(
                new Owt.Base.StreamConstraints(
                  audioConstraints,
                  videoConstraints
                )
              ).then(
                (stream: any) => {
                  let publishOption;

                  if (this.simulcast) {
                    publishOption = {
                      video: [
                        {
                          rid: 'q',
                          active: true /*, scaleResolutionDownBy: 4.0*/,
                        },
                        {
                          rid: 'h',
                          active: true /*, scaleResolutionDownBy: 2.0*/,
                        },
                        { rid: 'f', active: true },
                      ],
                    };
                  }
                  this.mediaStream = stream;
                  this.localStream = new Owt.Base.LocalStream(
                    this.mediaStream,
                    new Owt.Base.StreamSourceInfo('mic', 'camera')
                  );
                  // this.video.srcObject = stream;
                  this.conference
                    .publish(this.localStream, publishOption)
                    .then((publication: any) => {
                      this.publicationGlobal = publication;
                      console.log('publication', publication);
                      this.streamId = publication.id;

                      this.meet
                        .mixStream(myRoom, publication.id, 'common')
                        .subscribe(
                          (data) => {
                            $(`#loading`).remove();
                            this.streamId = data.id;
                            this.muteAudioButton.style.display = 'inline-block';
                            this.muteVideoButton.style.display = 'inline-block';
                            this.leaveMeeting.style.display = 'inline-block';
                            this.shareYourScreen.style.display = 'inline-block';
                            this.showChat.style.display = 'inline-block';
                            this.showPaticipants.style.display='inline-block'

                          },
                          (err) => {
                            console.log(err);
                          }
                        );

                      publication.addEventListener('error', (err: any) => {
                        console.log('Publication error: ' + err.error.message);
                      });

                      this.muteAudioButton.addEventListener('click', () => {
                        publication.mute('audio').then((response: any) => {
                          this.audio = 'off';
                          this.muteAudioButton.style.display = 'none';
                          this.unmuteAudioButton.style.display = 'inline-block';
                        });
                      });

                      this.muteVideoButton.addEventListener('click', () => {
                        publication.mute('video').then((response: any) => {
                          this.videos = 'off';
                          this.muteVideoButton.style.display = 'none';
                          this.unmuteVideoButton.style.display = 'inline-block';
                        });
                      });

                      this.unmuteVideoButton.addEventListener('click', () => {
                        publication.unmute('video').then((response: any) => {
                          this.videos = 'off';
                          this.unmuteVideoButton.style.display = 'none';
                          this.muteVideoButton.style.display = 'inline-block';
                        });
  
                      });

                      this.unmuteAudioButton.addEventListener('click', () => {
                        publication.unmute('audio').then((response: any) => {
                          this.audio = 'off';
                          this.unmuteAudioButton.style.display = 'none';
                          this.muteAudioButton.style.display = 'inline-block';
                        });
                      });

                      this.conference.addEventListener(
                        'streamadded',
                        (event: any) => {
                          this.getParticipant();
                          console.log(event);

                          if (event.stream.id !== this.streamId) {
                            console.log(this.streamId);

                            console.log(
                              'A new stream is added ',
                              event.stream.id
                            );
                          }
                          let isSelf = this.streamId;
                          isSelf = isSelf
                            ? isSelf
                            : event.stream.id != this.publicationGlobal.id;
                          this.subscribeForward &&
                            isSelf &&
                            this.subscribeAndRenderVideo(event.stream);
                          this.meet
                            .mixStream(myRoom, event.stream.id, 'common')
                            .subscribe(() => {});
                          event.stream.addEventListener('ended', () => {
                            console.log(event.stream.id + ' is ended.');
                            this.getParticipant()
                          });
                        }
                      );
                    });
                },
                (err: any) => {
                  console.error('Failed to create MediaStream, ' + err);
                }
              );
              this.conference.addEventListener('left', (event: any) => {
                this.getParticipant();
                console.log(event);
              });
              this.conference.addEventListener('participantjoined', (event: any) => {
                
                console.log("paticipant joined console",event);
              });

              this.showPaticipants.addEventListener('click',(evenet:any)=>{
                this.getParticipant()
              })
            }
            console.log('RSPONSE', resp);

            this.leaveMeeting.addEventListener('click', () => {
              this.conference
                .leave()
                .then((response: any) => {
                  console.log(response);

                  alert('you left the meeting');
                  this.router.navigate(['/']);
                })
                .catch((err: any) => {
                  console.log(err);
                });
            });

            var streams = resp.remoteStreams;
            // console.log(streams);

            for (const stream of streams) {
              if (!this.subscribeForward) {
                if (
                  stream.source.audio === 'mixed' ||
                  stream.source.video === 'mixed'
                ) {
                  console.log(' mixed');

                  this.subscribeAndRenderVideo(stream);
                }
              } else if (
                stream.source.audio !== 'mixed' ||
                stream.source.video !== 'mixed'
              ) {
                console.log('non mixed');

                this.subscribeAndRenderVideo(stream);
              }
            }
            console.log('Streams in conference:', streams.length);
            var participants = resp.participants;
            console.log('Participants in conference: ' + participants.length);
          },
          function (err: any) {
            console.error('server connection failed:', err);
            if (err.message.indexOf('connect_error:') >= 0) {
              const signalingHost = err.message.replace('connect_error:', '');
              const signalingUi = 'signaling';
            }
          }
        );
      });
  }

  sendMessage() {
    if (this.message != '') {
      let loginmail = sessionStorage.getItem('loginmail');
      let room = sessionStorage.getItem('joinedId');
      this.chat.sendMessage({
        user: loginmail,
        message: this.message,
        room: room,
      });
      this.message = '';
    }
  }
  subscirptionLocal: any;
  videospace: any;
  subscribeAndRenderVideo(stream: any) {
    console.log(stream);

    this.conference.subscribe(stream).then(
      (subscription: any) => {
        this.subscirptionLocal = subscription;
        console.log(subscription);
        console.log('stream:', stream);
        this.videospace = document.getElementById('videospace');
        let $video = $(
          `<video autoplay id=${stream.id}  style="display:inline-block; " >this browser does not supported video tag</video>`
        );
        $video.get(0).srcObject = stream.mediaStream;
        $('p').append($video);

        subscription.addEventListener('mute', (event: any) => {
          console.log(event);
          this.getParticipant()
        });

        stream.addEventListener('ended', () => {
          this.removeUi(stream.id);
          this.getParticipant();
        });
      },
      (err: any) => {
        console.log('subscribe failed', err);
      }
    );
  }



  

  getParticipant() {
    this.meet.getPaticipants(this.room).subscribe(
      (data: any) => {
        console.log("participants",data);
        
        this.participants = data;

      },
      (err: any) => {
        console.log(err);
      }
    );
  }
  

  removeUi(id: any) {
    $(`#${id}`).remove();
  }
  screenstreamId:any
  screenMediaStream:any
  shareScreenFunc(){
    this.stopShareScreen.style.display = 'inline-block';
    this.shareYourScreen.style.display = 'none';
        let audioConstraints = new Owt.Base.AudioTrackConstraints(
          Owt.Base.AudioSourceInfo.SCREENCAST
        );
    
        let videoConstraints = new Owt.Base.VideoTrackConstraints(
          Owt.Base.VideoSourceInfo.SCREENCAST
        );
    
        Owt.Base.MediaStreamFactory.createMediaStream(
          new Owt.Base.StreamConstraints(
            audioConstraints,
            videoConstraints
          )
        ).then(
          (stream: any) => {
            this.screenMediaStream=stream
            console.log(stream);
            this.localStream = new Owt.Base.LocalStream(
              this.screenMediaStream,
              new Owt.Base.StreamSourceInfo('screen-cast', 'screen-cast')
            );
           let publishOption = {
              video: [
                {
                  rid: 'q',
                  active: true /*, scaleResolutionDownBy: 4.0*/,
                },
                {
                  rid: 'h',
                  active: true /*, scaleResolutionDownBy: 2.0*/,
                },
                { rid: 'f', active: true },
              ],
            };
            this.conference.publish(this.localStream, publishOption)
            .then((publication:any)=>{
              this.publicationGlobal = publication;
                          console.log('publication', publication);
                          this.streamId = publication.id;
                          this.meet
                            .mixStream(this.room, publication.id, 'common')
                            .subscribe(
                              (data) => {
                                this.screenstreamId = data.id;
                                
    
                              },
                              (err) => {
                                console.log(err);
                              }
                            );

                            this.stopShareScreen.addEventListener('click', () => {
                              publication.stop().then((response: any) => {
            
                                this.stopShareScreen.style.display = 'none';
                                this.shareYourScreen.style.display = 'inline-block';
                                this.screenMediaStream.getTracks().forEach((track:any) => { 
       
                                  track.stop();
                              });


                              });
                            });

            })
          })
  }



  ngOnDestroy() {
    this.conference
                .leave()
                .then((response: any) => {
                  console.log(response);
                  this.mediaStream.getTracks().forEach((track:any) => { 
       
                    track.stop();
                });

                  alert('you left the meeting');
                  this.router.navigate(['/']);
                })
                .catch((err: any) => {
                  console.log(err);
                });
    
    
  }

}
