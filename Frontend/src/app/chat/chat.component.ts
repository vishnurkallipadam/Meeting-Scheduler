import { Component, OnInit } from '@angular/core';
import { ChatService } from '../chat.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
  constructor(private chat:ChatService) { }
  messageArray:any=[]
  message:any=''
  ngOnInit(): void {
    this.chat.newMessageReceived()
    .subscribe(data =>          
      this.messageArray.push(data)
      );
      console.log(this.messageArray);
  }

  sendMessage(){

    console.log(this.message);
    let loginmail=sessionStorage.getItem("loginmail");
    let room = sessionStorage.getItem("joinedId")
    this.chat.sendMessage({user:loginmail,  message:this.message ,room:room})
    this.message=''
  }

}
