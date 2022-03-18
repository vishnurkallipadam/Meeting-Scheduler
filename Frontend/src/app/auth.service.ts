import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http:HttpClient) { }

  registerUser(data:any){
    return this.http.post<any>(`${environment.url}/register`,{data})
  }

  loginUser(data:any){
    return this.http.post<any>(`${environment.url}/login`,{data})

  }


  getUserToken()
  {
    return sessionStorage.getItem('token')
  }

  userLoggedIn()
  {
    return !!sessionStorage.getItem('loginmail')
  }

}
