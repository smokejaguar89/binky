import { Injectable } from '@angular/core';
import { Headers, Http, URLSearchParams, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class AuthService {

	constructor(private _http: Http) {
		if (typeof this.getCookie("user_id") !== 'undefined') {
			this.user = {
				id : this.getCookie("user_id"),
				email : this.getCookie("user_email"),
				name : this.getCookie("user_name")
			}
		}
	}

	user = {
		id : null,
		email: null,
		name: null
	};

	private logInUri = "http://localhost:8000/login_user/";
	private logOutUri = "http://localhost:8000/logout_user/";
	private signUpUri = "http://localhost:8000/users/";

	loggedIn: boolean = false;
	private loggedInSubject = new Subject<boolean>();
	loggedInOb = this.loggedInSubject.asObservable();

	headers = new Headers({
		'Content-Type': 'application/json', 
		'X-CSRFToken' : this.getCookie('csrftoken')
	});

	options = new RequestOptions({ headers: this.headers, withCredentials: true });

	// Functions for manipulating cookies
	getCookie(name) {
	  var value = "; " + document.cookie;
	  var parts = value.split("; " + name + "=");
	  if (parts.length == 2) return parts.pop().split(";").shift();
	}

	setCookie(key, value) {
	    var d = new Date();
	    d.setTime(d.getTime() + (90*24*60*60*1000));
	    var expires = "expires="+ d.toUTCString();
	    document.cookie = key + "=" + value + ";" + expires + ";path=/";
	}

	deleteCookie(key) {
		document.cookie = key + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
	}

	isLoggedIn() {
		let id = this.getCookie("user_id");

		if(typeof id === 'undefined' || !id) {
			return false;
		} else {
			return true;
		}
	}

	// Functions to call API
	logIn(u, p) {

		let params = JSON.stringify({
			'username' : u,
			'password': p
		});

		return this._http.post(this.logInUri, params, this.options)
			.map(res => {

				let resJson = res.json();
				this.loggedIn = true;
				this.loggedInSubject.next(true);

				console.log(resJson);

				this.setCookie('user_id', resJson.user.id)
				this.setCookie('user_name', resJson.user.name)
				this.setCookie('user_email', resJson.user.email)

				this.user = {
					id : resJson.user.id,
					email : resJson.user.email,
					name : resJson.user.name
				}
				return resJson;
			})
			.catch(error => {
				console.log(error);
				console.log("error!")
				return error.json();
			})
	}

	logOut() { 

		return this._http.get(this.logOutUri)
			.map(res => {
				this.deleteCookie('user_id');
				this.deleteCookie('user_name');
				this.deleteCookie('user_email');

				this.loggedIn = false;
				this.user = {
					id: null,
					email: null,
					name: null
				}
				return res.json();
			})
			.catch(error => {
				console.log(error);
				return Observable.throw(error);
			})

	}

	signUp(model) {

		let params = JSON.stringify(model);

		return this._http.post(this.signUpUri, params, this.options)
			.map(res => {

				return res.json();

			})
			.catch(error => {

				return Observable.throw(error);

			})

	}

}