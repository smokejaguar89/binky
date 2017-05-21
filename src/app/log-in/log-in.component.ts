import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import {MdSnackBar} from '@angular/material';

@Component({
  selector: 'app-log-in',
  templateUrl: './log-in.component.html',
  styleUrls: ['./log-in.component.css'],
  providers: [AuthService]
})
export class LogInComponent implements OnInit {

  submitted = false;

  model = {
  	username: "",
  	password: ""
  }

  constructor(private authService: AuthService, public snackBar: MdSnackBar, private router: Router) { }

  openSnackBar(message: string) {
    this.snackBar.open(message, "close", {
      duration: 2000,
    });
  }

  ngOnInit() {
  }

  onSubmit() {

  	this.submitted = true;
  	return this.logIn();

  }

  logIn() {

  	if(this.model.username != "" && this.model.password != "") {

	  	this.authService.logIn(this.model.username, this.model.password).subscribe(
	  		(response) => {

	  			this.openSnackBar("Log in successful");
	  			console.log(response);
	  			this.router.navigate(['/user/' + response['user']['id'] + "/"]);

	  		},
	  		(error) => {

	  			this.openSnackBar("Log in unsuccessful");
	  			this.submitted = false;
	  			console.log(error);

	  		}
	  	)

	} else {

		this.openSnackBar("Log in unsuccessful");
		this.submitted = false;

	}

  }

}
