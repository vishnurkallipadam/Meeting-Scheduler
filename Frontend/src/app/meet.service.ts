import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MeetService {

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
}
