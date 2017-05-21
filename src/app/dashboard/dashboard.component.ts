import { Component, OnInit } from '@angular/core';
import { DjangoServiceService } from '../django-service.service';
import {FormControl} from '@angular/forms';

import 'rxjs/add/operator/startWith';

import { Project } from '../models/project';
import { Skill } from '../models/skill';
import { Category } from '../models/category';
import { Location } from '../models/location';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  providers: [DjangoServiceService]
})
export class DashboardComponent implements OnInit {

	// Used for 
	EMPTY_STRING=""

	stateCtrl: FormControl;
  	filteredStates: any;

	notFound: boolean;
	loading: boolean;

	projects: Project[];

	// Used to populate form inputs
	categories: Category[];
	locations: Location[];
	skills: Skill[];

	// Used to build filters
	filterLocations = [];
	filterCategories = [];
	filterSkills = [];

	constructor(private djangoService: DjangoServiceService) {
		this.stateCtrl = new FormControl();
	}

	ngOnInit() {

		this.getProjects();

		this.djangoService.getProjectCategories().subscribe(
			categories => {
				console.log(categories);
				this.categories = categories;
			}
		)

		this.djangoService.getLocations().subscribe(
			locations => {
				console.log(locations);
				this.locations = locations;
			}
		)

		this.djangoService.getSkills().subscribe(
			skills => {
				console.log(skills);
				this.skills = skills;

			    this.filteredStates = this.stateCtrl.valueChanges
			    	.startWith(null)
			        .map(name => this.filterStates(name));

			}
		)

	}

	// Returns recommended projects based on user profile data
	getRecommended() {

		this.djangoService.getRecommendedProjects().subscribe(
			projects => {
				if(projects.length == 0) {
					this.notFound = true;
				} else {
					this.notFound = false;
				}

				this.projects = projects;
			}
		)
	}

	// Returns projects based on form input
	getProjects() {

		// To show loading bar
		this.loading = true;
		let searchFilters = {};

		// Pushes IDs of chosen categories into search filters objects
		if(this.filterCategories.length > 0) { 

			searchFilters['categories'] = [];

			for(let x = 0; x < this.filterCategories.length; x++) { 
				searchFilters['categories'].push(this.filterCategories[x].id);
			}
		}

		// Pushes IDs of chosen locations into search filters objects
		if(this.filterLocations.length > 0) { 

			searchFilters['locations'] = [];

			for(let x = 0; x < this.filterLocations.length; x++) { 
				searchFilters['locations'].push(this.filterLocations[x].id);
			}
		}

		// Pushes IDs of chosen skills into search filters objects
		if(this.filterSkills.length > 0) { 

			searchFilters['req_skills'] = [];

			for(let x = 0; x < this.filterSkills.length; x++) {
				searchFilters['req_skills'].push(this.filterSkills[x].id);
			}
		}

		// Makes query to API using search filters
		this.djangoService.getProjects(searchFilters).subscribe(
			projects => {
				if(projects.length == 0) {
					this.notFound = true;
				} else {
					this.notFound = false;
				}

				this.projects = projects;
			}
		)
	}

	pushSkillToSkills(skill) {
		this.filterSkills.push(skill);

		return null;
	}

	removeSkillFromSkills(skill) {
		this.filterSkills = this.filterSkills.filter(function(el) {
			return el.id != skill.id;
		});

		return null;
	}

	filterStates(val: string) {
		console.log(val);
		return val ? this.skills.filter((s) => new RegExp(val, 'gi').test(s.name)) : this.skills;
	}


}
