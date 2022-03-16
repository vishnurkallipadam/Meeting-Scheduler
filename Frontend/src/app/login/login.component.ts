import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  user={
    email:'',
    password:'',
  }
  constructor(private auth:AuthService) { }

  ngOnInit(): void {
  }

  login(){
    console.log(this.user);
    this.auth.loginUser(this.user).subscribe(
      data=>{
        alert("Login Success")
        console.log(data);
        
      },
      err=>{
        alert(err.error);
        
      }
    )

    
  }

}
