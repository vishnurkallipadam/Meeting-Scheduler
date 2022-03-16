import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  server_address:String = 'http://localhost:5200';
  constructor(private http:HttpClient) { }

  registerUser(data:any){
    return this.http.post<any>(`${this.server_address}/register`,{data})
  }

  loginUser(data:any){
    return this.http.post<any>(`${this.server_address}/login`,{data})

  }

}
