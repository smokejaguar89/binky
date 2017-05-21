import { Injectable } from '@angular/core';
import { Headers, Http, URLSearchParams, RequestOptions } from '@angular/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/Rx';
import 'rxjs/add/operator/map';

import { Project } from './models/project';
import { Skill } from './models/skill';
import { Category } from './models/category';
import { Location } from './models/location';
import { User } from './models/user';
import { Uni } from './models/uni';
import { Post } from './models/post';

@Injectable()
export class DjangoServiceService {

	constructor(private _http: Http) { }

	private getProjectsUri = "http://localhost:8000/projects/";
	private getLocationsUri = "http://localhost:8000/locations/";
	private getUniversitiesUri = "http://localhost:8000/universities/";
	private getRecommendedProjectsUri = "http://localhost:8000/recommended_projects/";
	private getSkillsUri = "http://localhost:8000/skills/";
	private getProjectCategoriesUri = "http://localhost:8000/projectcategories/";
	private getUsersUri = "http://localhost:8000/users/";
	private getPostsUri = "http://localhost:8000/posts/";

	getCookie(name) {
	  var value = "; " + document.cookie;
	  var parts = value.split("; " + name + "=");
	  if (parts.length == 2) return parts.pop().split(";").shift();
	}

	headers = new Headers({
		'Content-Type': 'application/json', 
		'X-CSRFToken' : this.getCookie('csrftoken')
	});
	options = new RequestOptions({ headers: this.headers, withCredentials: true });

	setCookie(user_id, user_email, user_name) {
	    var d = new Date();
	    d.setTime(d.getTime() + (90*24*60*60*1000));
	    var expires = "expires="+ d.toUTCString();
	    document.cookie = "user_id=" + user_id + ";user_email=" + user_email + ";user_name=" + user_name + ";" + expires + ";path=/";
	}

	deleteCookie() {
		document.cookie = 'user_id=user_email=user_name=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
	}

	getRecommendedProjects(): Observable<Project[]> {

		return this._http.get(this.getRecommendedProjectsUri, this.options)
			.map(res => res.json().results)
			.catch(error => {
				console.log(error);
				return Observable.throw(error);
			});

	}

	getLocations(): Observable<Location[]> {

		return this._http.get(this.getLocationsUri, this.options)
			.map(res => res.json().results)
			.catch(error => {
				console.log(error);
				return Observable.throw(error);
			});

	}

	getUniversities(): Observable<Uni[]> {

		return this._http.get(this.getUniversitiesUri, this.options)
			.map(res => res.json().results)
			.catch(error => {
				console.log(error);
				return Observable.throw(error);
			});

	}

	getProjects(params: {}): Observable<Project[]> {

		let urlSearchParams = new URLSearchParams();

	    for (var p in params) {
	      if( params.hasOwnProperty(p) ) {
	      	urlSearchParams.set(p, params[p].join());
	      } 
	    }       

		return this._http.get(this.getProjectsUri, { search : urlSearchParams})
			.map(res => res.json().results)
			.catch(error => {
				console.log(error);
				return Observable.throw(error);
			});
	}

	getUsers(params: {}): Observable<User[]> {

		let urlSearchParams = new URLSearchParams();

	    for (var p in params) {
	      if( params.hasOwnProperty(p) ) {
	      	urlSearchParams.set(p, params[p].join());
	      } 
	    }       

		return this._http.get(this.getUsersUri, { search : urlSearchParams})
			.map(res => res.json().results)
			.catch(error => {
				console.log(error);
				return Observable.throw(error);
			});
	}

	getSkills(): Observable<Skill[]> {

		return this._http.get(this.getSkillsUri, this.options)
			.map(res => res.json().results)
			.catch(error => {
				console.log(error);
				return Observable.throw(error);
			});
	}

	getProjectCategories(): Observable<Category[]> {

		return this._http.get(this.getProjectCategoriesUri, this.options)
			.map(res => res.json().results)
			.catch(error => {
				console.log(error);
				return Observable.throw(error);
			});
	}

	getUser(id): Observable<User> {

		return this._http.get(this.getUsersUri + id + "/", this.options)
			.map(res => res.json())
			.catch(error => {
				console.log(error);
				return Observable.throw(error);
			});
	}

	getProject(id): Observable<Project> {

		return this._http.get(this.getProjectsUri + id + "/", this.options)
			.map(res => res.json())
			.catch(error => {
				console.log(error);
				return Observable.throw(error);
			});
	}

	writePost(content, img, project): Observable<Post> {

		project ? project = project : project = null

		let post = {
			'content': content,
			'img': img,
			'category' : 'post',
			'project' : project
		}

		return this._http.post(this.getPostsUri, JSON.stringify(post), this.options)
			.map(res => res.json())
			.catch(error => {
				console.log(error);
				return Observable.throw(error);
			});
	}

	deletePost(id): Observable<{}> {

		return this._http.delete(this.getPostsUri + id + "/", this.options)
			.map(res => res.json())
			.catch(error => {
				console.log(error);
				return Observable.throw(error);
			});

	}

}
