import { Component, OnInit } from '@angular/core';
import { MeetService } from '../meet.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  meetArray:Array<{name:String,description:String,date:String,_id:String}> = [];
  constructor(private meetService:MeetService,private router:Router) { }

  data={
    meet:'',
    description:'',
    date:''
  }

  currentDate:any=''
  ngOnInit(): void {
    this.currentDate=new Date
    this.meetService.getMeet().subscribe(
      data=>{
        this.meetArray=JSON.parse(JSON.stringify(data.data))
      },
      err=>{
        console.log(err);
        
      }
    )
  }

  addMeet(){
    console.log(this.data);
    this.meetService.addMeet(this.data).subscribe(
      data=>{
        console.log("Meet Created");
        this.ngOnInit()
      },
      err=>{
        alert("something happened wrong!! TRy Again")
        this.ngOnInit()
      }
    )
  }

  joinMeet(data:any){
    this.router.navigate(['/meet/'+data._id])
    sessionStorage.setItem('joinedId',data._id)

  }

  deleteMeet(task:any){
    if(confirm("Are you sure you want to delete the meeting")) {
      this.meetService.deleteMeet(task._id).subscribe(
        data=>{
          this.ngOnInit()

        },
        err=>{
        alert("something happened wrong!! TRy Again")
          this.ngOnInit()
        }
      )
      
    }else{
      this.ngOnInit()
    }
   


  }

}
