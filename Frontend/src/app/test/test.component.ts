import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MeetService } from '../meet.service';

declare var Owt: any;
declare var $: any;

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.css'],
})
export class TestComponent implements OnInit {
  @ViewChild('myvideotag') myvideotag?: any;
  @ViewChild('myvideotag2') myvideotag2?: any;

  constructor(private meet: MeetService, private router: Router) {}

  room: any;
  conference: any;
  mytag: any = false;
  streams: any = [];
  mediaStream: any;
  screenMediaStream: any;

  muteAudioButton: any;
  muteVideoButton: any;
  unmuteAudioButton: any;
  unmuteVideoButton: any;
  screenShare: any = false;
  publicationGlobal: any;
  publishingScreen: any;
  shareScreenBtn: any;
  stopShareScreen: any;
  leaveMeeting: any;
  chatBtn: any;
  username: any;
  email: any;
  meetState: any = {};
  now: any;
  date: any;
  chatclose: any;
  today: any;
  selfShare: any = false;

  ngOnInit(): void {
    this.muteAudioButton = document.getElementById('muteAudio');
    this.muteVideoButton = document.getElementById('muteVideo');
    this.unmuteAudioButton = document.getElementById('unmuteAudio');
    this.unmuteVideoButton = document.getElementById('unmuteVideo');
    this.shareScreenBtn = document.getElementById('shareScreen');
    this.stopShareScreen = document.getElementById('stopShareScreen');
    this.leaveMeeting = document.getElementById('leaveMeeting');
    this.chatBtn = document.getElementById('chat');
    this.chatclose = document.getElementById('close');
    this.conference = new Owt.Conference.ConferenceClient();
    this.room = sessionStorage.getItem('joinedId');
    this.username = sessionStorage.getItem('username');
    this.email = sessionStorage.getItem('loginmail');

    this.today = this.formatDate(new Date());

    setInterval(() => {
      this.now = this.formatAMPM(new Date());
    }, 1000);

    this.join();
    this.conference.addEventListener('streamadded', (event: any) => {
      if (event.stream.attributes.type == 'screen-share') {
        this.screenShare = true;
        $('#screen').addClass('active');
        $('.br-confernce-user-lists').addClass('right');
      }
      this.subscribeStream(event.stream, 'forward');

      // else {
      //   this.subscribeStream(event.stream, 'mixed');
      // }
    });

    window.onbeforeunload = (event) => {
      if (this.publicationGlobal) {
        this.publicationGlobal.stop();
      }
      if (this.publishingScreen) this.publishingScreen.stop();

      this.conference.leave();
    };

    this.leaveMeeting.addEventListener('click', () => {
      this.conference
        .leave()
        .then((response: any) => {
          if (this.mediaStream) {
            this.mediaStream.getTracks().forEach((track: any) => {
              track.stop();
            });
          }
          if (this.screenMediaStream) {
            this.screenMediaStream.getTracks().forEach((track: any) => {
              track.stop();
            });
          }
          let data = {
            user: this.email,
            roomId: this.room,
          };
          this.meet.unmuteAudio(data).subscribe((res) => {
            this.meet.unmuteVideo(data).subscribe((res) => {
              if (this.selfShare) {
                this.meet.stopPresenting(data).subscribe(() => {});
              }
            });
          });

          alert('you left the meeting');
          this.router.navigate(['/']);
        })
        .catch((err: any) => {
          console.log(err);
        });
    });

    this.chatBtn.addEventListener('click', () => {
      $('.br-chat-wrapper').toggleClass('active');
    });
    this.chatclose.addEventListener('click', () => {
      $('.br-chat-wrapper').removeClass('active');
    });
  }

  join() {
    let loginmail = sessionStorage.getItem('loginmail');
    this.meet
      .createToken(this.room, loginmail, 'presenter')
      .subscribe((data: any) => {
        this.conference.join(data).then((resp: any) => {
          this.publish();
          this.meet.getMeetState(this.room).subscribe((data: any) => {
            this.meetState = data;

            for (let stream of resp.remoteStreams) {
              if (stream.source.audio !== 'mixed') {
                if (stream.attributes.type == 'screen-share') {
                  this.screenShare = true;
                  $('#screen').addClass('active');
                  $('.br-confernce-user-lists').addClass('right');
                }
                this.subscribeStream(stream, 'forward');
                let videoIndex = this.meetState.videoMute.findIndex(
                  (s: any) => s.id === stream.attributes.email
                );
                if (videoIndex) {
                  stream.videoMuted = true;
                }
                let audioIndex = this.meetState.audioMute.findIndex(
                  (s: any) => s.id === stream.attributes.email
                );
                if (audioIndex) {
                  stream.audioMuted = true;
                }
              }
            }
          });
        });
      });
  }

  publish() {
    let audioConstraints;
    let videoConstraints;
    audioConstraints = new Owt.Base.AudioTrackConstraints(
      Owt.Base.AudioSourceInfo.MIC
    );

    // videoConstraintsForCamera
    videoConstraints = new Owt.Base.VideoTrackConstraints(
      Owt.Base.VideoSourceInfo.CAMERA
    );

    Owt.Base.MediaStreamFactory.createMediaStream(
      new Owt.Base.StreamConstraints(audioConstraints, videoConstraints)
    ).then((stream: any) => {
      this.mediaStream = stream;
      let localStream = new Owt.Base.LocalStream(
        stream,
        new Owt.Base.StreamSourceInfo('mic', 'camera'),
        {
          name: this.username,
          type: 'cam',
          email: this.email,
        }
      );
      this.conference.publish(localStream).then((publication: any) => {
        this.publicationGlobal = publication;

        this.muteAudioButton.style.display = 'inline-block';
        this.muteVideoButton.style.display = 'inline-block';
        this.shareScreenBtn.style.display = 'inline-block';
        this.leaveMeeting.style.display = 'inline-block';
        this.chatBtn.style.display = 'inline-block';
        $(`#loading`).remove();
        this.mixStream(publication.id);
        publication.addEventListener('error', (err: any) => {
          console.log('Publication error: ' + err.error.message);
        });

        this.muteAudioButton.addEventListener('click', () => {
          publication.mute('audio').then((response: any) => {
            this.muteAudioButton.style.display = 'none';
            this.unmuteAudioButton.style.display = 'inline-block';
            let data = {
              user: this.email,
              roomId: this.room,
            };
            this.meet.muteAudio(data).subscribe(
              (data: any) => {},
              (err: any) => {
                console.log(err);
              }
            );
          });
        });

        this.muteVideoButton.addEventListener('click', () => {
          publication.mute('video').then((response: any) => {
            this.muteVideoButton.style.display = 'none';
            this.unmuteVideoButton.style.display = 'inline-block';
            let data = {
              user: this.email,
              roomId: this.room,
            };
            this.meet.muteVideo(data).subscribe(
              (data: any) => {},
              (err: any) => {
                console.log(err);
              }
            );
          });
        });

        this.unmuteVideoButton.addEventListener('click', () => {
          publication.unmute('video').then((response: any) => {
            this.unmuteVideoButton.style.display = 'none';
            this.muteVideoButton.style.display = 'inline-block';
            let data = {
              user: this.email,
              roomId: this.room,
            };
            this.meet.unmuteVideo(data).subscribe(
              (data: any) => {},
              (err: any) => {
                console.log(err);
              }
            );
          });
        });

        this.unmuteAudioButton.addEventListener('click', () => {
          publication.unmute('audio').then((response: any) => {
            this.unmuteAudioButton.style.display = 'none';
            this.muteAudioButton.style.display = 'inline-block';
            let data = {
              user: this.email,
              roomId: this.room,
            };
            this.meet.unmuteAudio(data).subscribe(
              (data: any) => {},
              (err: any) => {
                console.log(err);
              }
            );
          });
        });
      });
    });
  }

  subscribeStream(stream: any, type: string) {
    if (stream.attributes.type == 'cam') {
      this.conference
        .subscribe(stream)
        .then((subscription: any) => {
          this.streams.push(stream);

          subscription.addEventListener('mute', (event: any) => {
            let i = this.streams.findIndex((s: any) => s.id === stream.id);
            if (event.kind === 'video') {
              this.streams[i].videoMuted = true;
            }
            if (event.kind === 'audio') {
              this.streams[i].audioMuted = true;
            }
          });

          subscription.addEventListener('unmute', (event: any) => {
            let i = this.streams.findIndex((s: any) => s.id === stream.id);
            if (event.kind === 'video') {
              this.streams[i].videoMuted = false;
            }
            if (event.kind === 'audio') {
              this.streams[i].audioMuted = false;
            }
          });

          subscription.addEventListener('error', (event: any) => {
            let index = this.streams.findIndex((s: any) => s.id === stream.id);

            if (this.streams[index].attributes.type == 'screen-share') {
              $('#screen').removeClass('active');
              $('.br-confernce-user-lists').removeClass('right');
              this.screenShare = false;
            }
            this.streams.splice(index, 1);
          });
        })
        .catch((e: any) => {
          console.log(e);
        });
    } else {
      this.conference
        .subscribe(stream, { audio: false, video: true })
        .then((subscription: any) => {
          this.streams.push(stream);

          subscription.addEventListener('error', (event: any) => {
            let index = this.streams.findIndex((s: any) => s.id === stream.id);

            if (this.streams[index].attributes.type == 'screen-share') {
              $('#screen').removeClass('active');
              $('.br-confernce-user-lists').removeClass('right');
              this.screenShare = true;
            }
            this.streams.splice(index, 1);
          });
        })
        .catch((e: any) => {
          console.log(e);
        });
    }
  }

  mixStream(id: string) {
    this.meet.mixStream(this.room, id, 'common').subscribe((data) => {});
  }

  shareScreen() {
    if (!this.screenShare) {
      let audioConstraints;
      let videoConstraints;
      audioConstraints = new Owt.Base.AudioTrackConstraints(
        Owt.Base.AudioSourceInfo.SCREENCAST
      );

      // videoConstraintsForCamera
      videoConstraints = new Owt.Base.VideoTrackConstraints(
        Owt.Base.VideoSourceInfo.SCREENCAST
      );
      let attributes = {
        name: this.username,
        type: 'screen-share',
        email: this.email,
      };
      Owt.Base.MediaStreamFactory.createMediaStream(
        new Owt.Base.StreamConstraints(audioConstraints, videoConstraints)
      ).then((stream: any) => {
        this.screenMediaStream = stream;
        let localStream = new Owt.Base.LocalStream(
          stream,
          new Owt.Base.StreamSourceInfo('screen-cast', 'screen-cast'),
          attributes
        );
        this.conference.publish(localStream).then((publication: any) => {
          this.stopShareScreen.style.display = 'inline-block';
          this.shareScreenBtn.style.display = 'none';

          this.publishingScreen = publication;
          let data = {
            user: this.email,
            roomId: this.room,
          };
          this.meet.presentScreen(data).subscribe(
            (data: any) => {
              this.selfShare = true;
            },
            (err: any) => {
              console.log(err);
            }
          );

          this.stopShareScreen.addEventListener('click', () => {
            publication.stop().then((response: any) => {
              this.stopShareScreen.style.display = 'none';
              this.shareScreenBtn.style.display = 'inline-block';

              this.screenMediaStream.getTracks().forEach((track: any) => {
                track.stop();
              });
              let data = {
                user: this.email,
                roomId: this.room,
              };
              this.meet.stopPresenting(data).subscribe(
                (data: any) => {
                  this.selfShare = false;
                },
                (err: any) => {
                  console.log(err);
                }
              );
            });
          });
        });
      });
    } else {
      alert('another user is already presenting');
    }
  }

  ngOnDestroy() {
    this.conference
      .leave()
      .then((response: any) => {
        this.mediaStream.getTracks().forEach((track: any) => {
          track.stop();
        });
        let data = {
          user: this.email,
          roomId: this.room,
        };
        this.meet.unmuteAudio(data).subscribe((res) => {
          this.meet.unmuteVideo(data).subscribe((res) => {
            if (this.selfShare) {
              this.meet.stopPresenting(data).subscribe(() => {});
            }
          });
        });

        alert('you left the meeting');
        this.router.navigate(['/']);
      })
      .catch((err: any) => {
        console.log(err);
      });
  }
  formatAMPM(date: any) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
  }

  formatDate(date: any) {
    var day = date.getDate();
    var month = date.getMonth() + 1;
    var year = date.getFullYear();
    var currentDate = day + ' - ' + month + ' - ' + year;
    return currentDate;
  }
}
