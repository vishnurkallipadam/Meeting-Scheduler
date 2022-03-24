import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MeetService {

  roomId:any='623abb207ac3cc04053b83fd'
  constructor(private http:HttpClient) { }
  
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
      room: this.roomId,
      username: user,
      role: role
  };
  return this.http.post<any>(`${environment.myHost}/createToken/`,body,{responseType: 'text' as 'json'})
  }

  mixStream(room:any, stream:any, view:any){
    
    let rooms=this.roomId
  var jsonPatch = [{
      op: 'add',
      path: '/info/inViews',
      value: view
  }];
  return this.http.patch<any>(`${environment.myHost}/rooms/${rooms}/streams/${stream}`,jsonPatch)
  }

  startStreamingIn(room:any, inUrl:any){

    let rooms=this.roomId
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
