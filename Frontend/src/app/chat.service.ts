import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private socket: Socket;
 

  constructor(private http:HttpClient) { 
    this.socket = io(environment.url,{ transports: ['websocket','polling', 'flashback']})
  }


  sendMessage(data: any): void {
    this.socket.emit('message', data);
  }
  
  newMessageReceived(){
    let room= sessionStorage.getItem('joinedId')
    let observable = new Observable<{user:String, message:String, userID:String}>(observer=>{
        this.socket.on(`${room}`, (data:any)=>{
            observer.next(data);    
        });
        return () => {this.socket.disconnect();}
    });

    return observable;
  }

  chatHistory(item:any){
    return this.http.get<any>(`${environment.url}/chatHistory/`+item);
  }
}
