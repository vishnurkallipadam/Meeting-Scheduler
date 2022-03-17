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
  mail:any=''
  ngOnInit(): void {
    let id = sessionStorage.getItem("joinedId")
    this.mail=sessionStorage.getItem("loginmail")
    this.chat.chatHistory(id).subscribe(
      data=>{
        this.messageArray=JSON.parse(JSON.stringify(data))
      }
    )


  }

  ngAfterViewInit(){
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
