import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class MeetService {

  constructor(private http:HttpClient) { }
  server_address:String = 'http://localhost:5200';
  addMeet(data:any){
    console.log(data);
    return this.http.post<any>(`${this.server_address}/createMeet`,{data})
  }

  getMeet(){
    return this.http.get<any>(`${this.server_address}/getMeet`)
  }

  deleteMeet(id:any){
    return this.http.get<any>(`${this.server_address}/deleteMeet/`+id)

  }
}
