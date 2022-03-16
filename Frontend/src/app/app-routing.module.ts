import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChatComponent } from './chat/chat.component';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { MeetComponent } from './meet/meet.component';
import { SignupComponent } from './signup/signup.component';
import { UserguardGuard } from './userguard.guard';

const routes: Routes = [
  {
    path:"",
    redirectTo:'/home',
    pathMatch:'full'
  },
  {
    path:'home',
    component:HomeComponent,
    canActivate:[UserguardGuard]
  },
  {
    path:'login',
    component:LoginComponent
  },
  {
    path:'signup',
    component:SignupComponent
  },
  {
    path:'meet/:id',
    component:MeetComponent,
    canActivate:[UserguardGuard]
  },
  {
    path:'joinedmeet',
    component:ChatComponent,
    canActivate:[UserguardGuard]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
