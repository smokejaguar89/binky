import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { DjangoServiceService } from '../django-service.service';
import { Router } from '@angular/router';
import {FormControl} from '@angular/forms';

import { Uni } from '../models/uni';
import { Skill } from '../models/skill';
import { FormUser } from '../models/user';
import { UserProfile } from '../models/userprofile';
import { FormUserProfile } from '../models/userprofile';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css'],
  providers: [AuthService, DjangoServiceService]
})
export class SignUpComponent implements OnInit {

  EMPTY_STRING = "";

  submitted = false;
  fail = false;
  errorMessage = "";

  unis: Uni[];
  skills: Skill[];

  stateCtrl: FormControl;
  filteredStates: any;

  repeat_password = "";

  model = new FormUser(
  	"", // username
  	"", // first_name
  	"", // last_name
  	"", // email,
  	"", // password,
  	new FormUserProfile(
  		"", // img
  		null, // uni,
  		"", // degree,
  		"", // desc,
  		[] // skills
  	)
  )

  /* model = {
  	first_name: null,
  	last_name: null,
  	username: null,
  	email: null,
  	uni: null,
  	skills: [],
  	degree: null,
  	password: null,
  	repeat_password: null
  } */

  constructor(private authService: AuthService, private router: Router, private djangoService: DjangoServiceService) {
  	this.stateCtrl = new FormControl();
  }

  ngOnInit() {

  	this.djangoService.getUniversities().subscribe(
  		unis => {
  			this.unis = unis;
  		});

	this.djangoService.getSkills().subscribe(
		skills => {
			this.skills = skills;

			this.filteredStates = this.stateCtrl.valueChanges
			    	.startWith(null)
			        .map(name => this.filterStates(name));

		}
	)
  }

	pushSkillToSkills(skill) {
		this.model.userprofile.skills.push(skill);

		return null;
	}

	removeSkillFromSkills(skill) {
		this.model.userprofile.skills = this.model.userprofile.skills.filter(function(el) {
			return el.id != skill.id;
		});

		return null;
	}

  filterStates(val: string) {
	console.log(val);
	return val ? this.skills.filter((s) => new RegExp(val, 'gi').test(s.name)) : this.skills;
  }

  onSubmit() {

  	if (this.model.first_name == "" ||
  		this.model.last_name == "" ||
  		this.model.username == "" ||
  		this.model.email == "" ||
  		this.model.password == "" ||
  		this.repeat_password == "") {

  		this.errorMessage = "Please fill out all fields.";
  		this.fail = true;

  		return false;

  	} else if (this.model.password != this.repeat_password) {

  		this.errorMessage = "Passwords must match.";
  		this.fail = true;

  		return false;

  	} else if (this.model.first_name.length > 20 || this.model.last_name.length > 20 || this.model.username.length > 20) {

  		this.errorMessage = "First name, last name or username too long.";
  		this.fail = true;
  		return false;

  	} else if (!this.validateEmail(this.model.email)) {

  		this.errorMessage = "E-Mail invalid.";
  		this.fail = true;
  		return false;

  	} else if (!this.checkPassword(this.model.password)) {

  		this.fail = true;
  		return false;

  	} else {
  		this.fail = false;
  		this.submitted = true;
  		this.signUp();
  	}

  }

  validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }

  checkPassword(password) {
    if (password.length < 6) {
    	this.errorMessage = "Password too short.";
        return false;
    } else if (password.length > 50) {
    	this.errorMessage = "Password too long.";
        return false;
    } else if (password.search(/\d/) == -1) {
    	this.errorMessage = "Password must contain a number.";
        return false;
    } else if (password.search(/[a-zA-Z]/) == -1) {
    	this.errorMessage = "Password must contain a letter.";
        return false;
    }
    return true;
  }

  signUp() {

  	this.authService.signUp(this.model).subscribe(
  		(response) => {
  			console.log(response);
  		},
  		(error) => {
  			this.submitted = false;
  			this.errorMessage = error.json().failure;
  		}
  	);
  }

}
