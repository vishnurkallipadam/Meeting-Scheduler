import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MeetService {

    //mixed stream
  roomId:any='624ab07e7ac3cc04053b8b31' //mixed stream
  

  // roomId:any='623d87a78f747a0407f8587b' //single and surrounded
  // roomId:any='623c5ca5d4b369040abbca99'

  constructor(private http:HttpClient) { }
  
  createRoom(name:any){
    let body={
    
      "name": name,
      "options": {
        "roles": [
          {
            "subscribe": {
              "video": true,
              "audio": true
            },
            "publish": {
              "video": true,
              "audio": true
            },
            "role": "presenter"
          },
          {
            "subscribe": {
              "video": true,
              "audio": true
            },
            "publish": {
              "video": true,
              "audio": true
            },
            "role": "participant"
          },
          {
            "subscribe": {
              "video": true,
              "audio": true
            },
            "publish": {
              "video": false,
              "audio": false
            },
            "role": "moderator"
          }
        ]
      }
    }
    return this.http.post<any>(`${environment.myHost}/createRoom`,body,{responseType: 'text' as 'json'})

  }

  addMeet(data:any){
    console.log(data);
    return this.http.post<any>(`${environment.url}/createMeet`,{data})
    
  }

  getMeet(){
    return this.http.get<any>(`${environment.url}/getMeet`)
  }

  deleteMeet(id:any){
    return this.http.get<any>(`${environment.url}/deleteMeet/`+id)

  }

  createToken(room:any, user:any, role:any ){
    var body = {
      room: room,
      username: user,
      role: role
  };
  return this.http.post<any>(`${environment.myHost}/createToken/`,body,{responseType: 'text' as 'json'})
  }

  mixStream(room:any, stream:any, view:any){
    
    let rooms=room
  var jsonPatch = [{
      op: 'add',
      path: '/info/inViews',
      value: view
  }];
  return this.http.patch<any>(`${environment.myHost}/rooms/${rooms}/streams/${stream}`,jsonPatch)
  }

  getPaticipants(roomId:any){
    return this.http.get<any>(` ${environment.myHost}/rooms/${roomId}/participants`)
  }
  startStreamingIn(room:any, inUrl:any){

    let rooms=room
      var options = {
          url: environment.url,
          media: {
              audio: 'auto',
              video: true   
          },
          transport: {
              protocol: 'udp',
              bufferSize: 2048
          }
      };
      return this.http.post<any>(`${environment.myHost}/rooms/${rooms}/streaming-ins`,options)
  }
}
