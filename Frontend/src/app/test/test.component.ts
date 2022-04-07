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
  chatBtn:any
  username:any

  ngOnInit(): void {
    this.muteAudioButton = document.getElementById('muteAudio');
    this.muteVideoButton = document.getElementById('muteVideo');
    this.unmuteAudioButton = document.getElementById('unmuteAudio');
    this.unmuteVideoButton = document.getElementById('unmuteVideo');
    this.shareScreenBtn = document.getElementById('shareScreen');
    this.stopShareScreen = document.getElementById('stopShareScreen');
    this.leaveMeeting = document.getElementById('leaveMeeting');
    this.chatBtn = document.getElementById('chat')

    this.conference = new Owt.Conference.ConferenceClient();
    this.room = sessionStorage.getItem('joinedId');
    this.username = sessionStorage.getItem('username');

    this.join();
    this.conference.addEventListener('streamadded', (event: any) => {
      console.log('added', event);
      if (event.stream.attributes.type == 'screen-cast') {
        this.screenShare = true;
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
          this.mediaStream.getTracks().forEach((track: any) => {
            track.stop();
          });
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
          for (let stream of resp.remoteStreams) {
            if (stream.source.audio !== 'mixed') {
              this.subscribeStream(stream, 'forward');
            }
            // else if (stream.source.audio === 'screen-cast') {
            //   this.subscribeStream(stream, 'forward');
            // }
          }
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
      this.mediaStream=stream
      let localStream = new Owt.Base.LocalStream(
        stream,
        new Owt.Base.StreamSourceInfo('mic', 'camera'),
        {
          name: this.username,
          type: 'cam',
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
          });
        });

        this.muteVideoButton.addEventListener('click', () => {
          publication.mute('video').then((response: any) => {
            this.muteVideoButton.style.display = 'none';
            this.unmuteVideoButton.style.display = 'inline-block';
          });
        });

        this.unmuteVideoButton.addEventListener('click', () => {
          publication.unmute('video').then((response: any) => {
            this.unmuteVideoButton.style.display = 'none';
            this.muteVideoButton.style.display = 'inline-block';
          });
        });

        this.unmuteAudioButton.addEventListener('click', () => {
          publication.unmute('audio').then((response: any) => {
            this.unmuteAudioButton.style.display = 'none';
            this.muteAudioButton.style.display = 'inline-block';
          });
        });
      });
    });
  }

  subscribeStream(stream: any, type: string) {
    console.log(stream);
    this.conference.subscribe(stream).then((subscription: any) => {
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
        this.streams.splice(index, 1);
        console.log(this.streams);
      });
      // subscription.addEventListener('ended', (event: any) => {
      //   let index = this.streams.findIndex((s: any) => s.id === stream.id);
      //   this.streams.splice(index, 1);
      //   console.log(this.streams);
      // });
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
    };
    Owt.Base.MediaStreamFactory.createMediaStream(
      new Owt.Base.StreamConstraints(audioConstraints, videoConstraints)
    ).then((stream: any) => {
      let mediaStream = stream;
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

        this.stopShareScreen.addEventListener('click', () => {
          publication.stop().then((response: any) => {
            this.stopShareScreen.style.display = 'none';
            this.shareScreenBtn.style.display = 'inline-block';
            mediaStream.getTracks().forEach((track: any) => {
              track.stop();
            });
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

        alert('you left the meeting');
        this.router.navigate(['/']);
      })
      .catch((err: any) => {
        console.log(err);
      });
  }
}
