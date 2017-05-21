import { Component, OnInit } from '@angular/core';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [AuthService]
})
export class AppComponent implements OnInit {
  title = 'Unknown Globe';

  isLoggedIn: boolean;
  isLoggedInTest: boolean;
  hyperlinks: {}[];

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
  	this.isLoggedIn = this.authService.isLoggedIn();
  	this.authService.loggedInOb.subscribe(
  		res => {
  			this.isLoggedInTest = res;
  			console.log(res);
  			console.log(this.isLoggedInTest);
  			return;
  		}
  	)

  	if(this.isLoggedIn) {
	  this.hyperlinks = [
		{
		  icon: 'home',
		  name: 'Profile',
		  url: '/user/1/'
		},
		{
		  icon: 'search',
		  name: 'Projects',
		  url: '/projects'
		},
		{
		  icon: 'person',
		  name: 'Users',
		  url: '/users'
		}
	  ];
  	} else {
	  this.hyperlinks = [
	  	{
	  		icon: 'lock_open',
	  		name: 'Sign in',
	  		url: '/login'
	  	},
	  	{
	  		icon: 'list',
	  		name: 'Sign up',
	  		url: '/signup'
	  	}
	  ]
  	}

  }


  logOut() {
  	console.log('lol');
  	return this.authService.logOut().subscribe(
  		(response) => {
	  		this.isLoggedIn = false;
			this.hyperlinks = [
			  {
			  	icon: 'lock_open',
			  	name: 'Sign in',
			  	url: '/login'
			  },
			  {
			  	icon: 'list',
			  	name: 'Sign up',
			  	url: '/signup'
			  }
			]
  			this.router.navigate(['/login']);
  			return response;
  		},
  		(error) => {
  			return error;
  		})
  }

}