import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class UserguardGuard implements CanActivate {
 
  constructor(private authservice:AuthService,private router:Router){}
  canActivate():boolean{
    if (this.authservice.userLoggedIn())
    {
      console.log('true')
      return true

    }
    else{
      this.router.navigate(['/login'])
      return false

    }

  }
  
}
