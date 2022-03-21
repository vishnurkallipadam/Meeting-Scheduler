import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup,FormControl,Validators} from '@angular/forms'
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {

  constructor(private authService:AuthService,private router:Router) { }
  loginForm = new FormGroup({
    name: new FormControl(''),
    email: new FormControl('',[Validators.required,Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,3}$')]),
    password: new FormControl('',[Validators.required,Validators.pattern('^(?=[^A-Z]*[A-Z])(?=[^a-z]*[a-z])(?=\\D*\\d)[A-Za-z\\d!$%@#£€*?&]{8,}$')]),
  })

  get email(){ 
    return this.loginForm.get('email');
  }
  
  get password(){ 
    return this.loginForm.get('password');
  }
  ngOnInit(): void {
  }

  employeeRegister(){
    console.log(this.loginForm.value);
    this.authService.registerUser(this.loginForm.value).subscribe(
      data=>{
        console.log("signup success");
        alert("register success")
        this.router.navigate(['/login'])
        
      },
      err=>{
        console.log(err.error);
        alert(err.error.message)
        
      }

    )
  }

}
