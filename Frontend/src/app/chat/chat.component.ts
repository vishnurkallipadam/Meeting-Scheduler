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
  constructor(private chat: ChatService) {}
  messageArray: any = [];
  message: any = '';
  mail: any = '';
  room: any = '';

  ngOnInit(): void {
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
  ngAfterViewInit() {
    this.chat
      .newMessageReceived()
      .subscribe((data) => this.messageArray.push(data));
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
      $('.msger')
        .stop()
        .animate({ scrollTop: $('.msger')[0].scrollHeight }, 1000);
    }
  }
}
