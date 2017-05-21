import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormControl, FormGroup, FormBuilder } from '@angular/forms';
import 'rxjs/add/operator/startWith';

import { User } from '../../models/user';
import { DjangoServiceService } from '../../django-service.service';
import { Location } from '../../models/location';
import { Uni } from '../../models/uni';
import { Skill } from '../../models/skill';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css'],
  providers: [DjangoServiceService]
})
export class UserListComponent implements OnInit {

  EMPTY_STRING = "";
  notFound: boolean;
  loading: boolean;

  // Resources to populate drop-down lists
  formResources = {
  	locations: [],
  	unis: [],
  	skills: []
  }

  // Controllers for each input
  form = new FormGroup({
	location: new FormControl(),
	uni: new FormControl(),
	skills: new FormControl()
  });

  // Filtered skills in dropdown by user input
  filteredSkills: any;

  // Skills selected by user
  selectedSkills = [];

  // Results
  users: User[];

  constructor(private djangoService: DjangoServiceService) {}

  ngOnInit() {

  	this.getUsers();

  	// Gets resources from REST API to populate form
  	this.djangoService.getLocations().subscribe(locs => this.formResources.locations = locs);
  	this.djangoService.getUniversities().subscribe(unis => this.formResources.unis = unis);
  	this.djangoService.getSkills().subscribe(skills => {
  		this.formResources.skills = skills;
	    this.filteredSkills = this.form.get('skills').valueChanges
		    .map(inputString => this.filterSkills(inputString));
  	});

  }

 	// Returns users based on form input
	getUsers() {

		let searchFilters = {};

		this.form.get('location').value ? searchFilters['location'] = [this.form.get('location').value.id] : null;

		this.form.get('uni').value ? searchFilters['uni'] = [this.form.get('uni').value.id] : null;

		if (this.selectedSkills.length > 0) { 

			searchFilters['skills'] = [];

			for ( let i = 0; i < this.selectedSkills.length; i++ ) {

				searchFilters['skills'].push(this.selectedSkills[i].id);
			}
		}

		// To show loading bar
		this.loading = true;

		// Makes query to API using search filters
		this.djangoService.getUsers(searchFilters).subscribe(
			users => {

				users.length == 0 ? this.notFound = true : this.notFound = false;

				console.log(users);
				return this.users = users;

			}
		)
	}

	pushSkillToSkills(skill) {
		this.selectedSkills.push(skill);

		return null;
	}

	removeSkillFromSkills(skill) {
		this.selectedSkills = this.selectedSkills.filter(function(el) {
			return el.id != skill.id;
		});

		return null;
	}

	filterSkills(val: string) {

		// If input not empty, filter skills regex matching input else return all skills
		return val ? this.formResources.skills.filter((s) => new RegExp(val, 'gi').test(s.name)) : this.formResources.skills;
	}

}
