import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

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
  constructor(private auth:AuthService, private router:Router) { }

  ngOnInit(): void {
  }

  login(){
    console.log(this.user);
    this.auth.loginUser(this.user).subscribe(
      data=>{
        alert("Login Success")
        console.log(data.mail);
        sessionStorage.setItem("loginmail",this.user.email)
        console.log(data);
        this.router.navigate(['/'])
        
      },
      err=>{
        alert(err.error);
        
      }
    )

    
  }

}
