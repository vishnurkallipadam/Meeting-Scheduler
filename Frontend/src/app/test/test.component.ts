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
  ngOnInit(): void {
    this.muteAudioButton = document.getElementById('muteAudio');
    this.muteVideoButton = document.getElementById('muteVideo');
    this.unmuteAudioButton = document.getElementById('unmuteAudio');
    this.unmuteVideoButton = document.getElementById('unmuteVideo');
    this.shareScreenBtn = document.getElementById('shareScreen');
    this.stopShareScreen = document.getElementById('stopShareScreen');
    this.leaveMeeting = document.getElementById('leaveMeeting');
    this.chatBtn = document.getElementById('chat');

    this.conference = new Owt.Conference.ConferenceClient();
    this.room = sessionStorage.getItem('joinedId');
    this.username = sessionStorage.getItem('username');
    this.email = sessionStorage.getItem('loginmail');

    this.join();
    this.conference.addEventListener('streamadded', (event: any) => {
      console.log('added', event);
      console.log(event.stream.attributes.type);

      if (event.stream.attributes.type == 'screen-share') {
        console.log('screensh');

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

          console.log(response);
          alert('you left the meeting');
          this.router.navigate(['/']);
        })
        .catch((err: any) => {
          console.log(err);
        });
    });
  }

  join() {
    let loginmail = sessionStorage.getItem('loginmail');
    this.meet
      .createToken(this.room, loginmail, 'presenter')
      .subscribe((data: any) => {
        this.conference.join(data).then((resp: any) => {
          console.log('resp', resp);
          this.publish();
          this.meet.getMeetState(this.room).subscribe((data: any) => {
            this.meetState = data;
            console.log(this.meetState);
            if (this.meetState.screenShare) {
              $('#screen').addClass('active');
              $('.br-confernce-user-lists').addClass('right');
            }

            for (let stream of resp.remoteStreams) {
              if (stream.source.audio !== 'mixed') {
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
        console.log(publication);
        this.publicationGlobal = publication;
        $(`#loading`).remove();
        this.muteAudioButton.style.display = 'inline-block';
        this.muteVideoButton.style.display = 'inline-block';
        this.shareScreenBtn.style.display = 'inline-block';
        this.leaveMeeting.style.display = 'inline-block';
        this.chatBtn.style.display = 'inline-block';

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
    console.log(stream);
    this.conference
      .subscribe(stream)
      .then((subscription: any) => {
        console.log(subscription);
        this.streams.push(stream);
        console.log(this.streams);

        subscription.addEventListener('mute', (event: any) => {
          console.log(event);
          let i = this.streams.findIndex((s: any) => s.id === stream.id);
          if (event.kind === 'video') {
            this.streams[i].videoMuted = true;
          }
          if (event.kind === 'audio') {
            this.streams[i].audioMuted = true;
          }
          console.log(this.streams);
        });

        subscription.addEventListener('unmute', (event: any) => {
          console.log(event);
          let i = this.streams.findIndex((s: any) => s.id === stream.id);
          if (event.kind === 'video') {
            this.streams[i].videoMuted = false;
          }
          if (event.kind === 'audio') {
            this.streams[i].audioMuted = false;
          }
          console.log(this.streams);
        });

        subscription.addEventListener('error', (event: any) => {
          console.log(event);

          let index = this.streams.findIndex((s: any) => s.id === stream.id);
          console.log(this.streams[index].attributes.type);

          if (this.streams[index].attributes.type == 'screen-share') {
            $('#screen').removeClass('active');
            $('.br-confernce-user-lists').removeClass('right');
          }
          this.streams.splice(index, 1);
          console.log(this.streams);
        });
        // subscription.addEventListener('ended', (event: any) => {
        //   let index = this.streams.findIndex((s: any) => s.id === stream.id);
        //   this.streams.splice(index, 1);
        //   console.log(this.streams);
        // });
      })
      .catch((e: any) => {
        console.log(e);
      });
  }

  mixStream(id: string) {
    this.meet.mixStream(this.room, id, 'common').subscribe((data) => {
      console.log('mixed resp', data);
    });
  }

  shareScreen() {
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
        console.log(publication);

        this.stopShareScreen.style.display = 'inline-block';
        this.shareScreenBtn.style.display = 'none';

        this.publishingScreen = publication;
        let data = {
          user: this.email,
          roomId: this.room,
        };
        this.meet.presentScreen(data).subscribe(
          (data: any) => {},
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

  ngOnDestroy() {
    this.conference
      .leave()
      .then((response: any) => {
        console.log(response);
        this.mediaStream.getTracks().forEach((track: any) => {
          track.stop();
        });
        let data = {
          user: this.email,
          roomId: this.room,
        };
        this.meet.unmuteAudio(data).subscribe((data) => {
          this.meet.unmuteVideo(data).subscribe(() => {});
        });

        alert('you left the meeting');
        this.router.navigate(['/']);
      })
      .catch((err: any) => {
        console.log(err);
      });
  }
}
