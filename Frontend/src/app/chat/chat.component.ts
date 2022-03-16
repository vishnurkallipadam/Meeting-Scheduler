import { Component, OnInit } from '@angular/core';
import { ChatService } from '../chat.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
  messageArray:any=[]
  constructor(private chat:ChatService) { }
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
    this.chat.sendMessage({user:loginmail,  message:this.message})
    this.message=''
  }

}
