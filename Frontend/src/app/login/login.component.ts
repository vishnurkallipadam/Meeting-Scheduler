import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  user = {
    email: '',
    password: '',
  };
  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit(): void {}

  login() {
    this.auth.loginUser(this.user).subscribe(
      (data) => {
        alert('Login Success');
        sessionStorage.setItem('loginmail', this.user.email);
        sessionStorage.setItem('username', data.user.name);
        sessionStorage.setItem('token', data.token);
        this.router.navigate(['/']);
      },
      (err) => {
        alert(err.error.message);
      }
    );
  }
}
