import { UserProfile, FormUserProfile } from './userprofile';
import { Post } from './post';
import { Project } from './project';

export class User {

	constructor(
		username: string, first_name: string, last_name: string, email: string, 
		userprofile: UserProfile) {
		this.username = username;
		this.first_name = first_name;
		this.last_name = last_name;
		this.email = email;
		this.userprofile = userprofile
	}

	url: string;
	id: number;
	username: string;
	first_name: string;
	last_name: string;
	email: string;
	projects: Project[];
	userprofile: UserProfile;
	posts: Post[];

}

export class FormUser {

	constructor(
		username: string, first_name: string, last_name: string, email: string, password: string,
		userprofile: FormUserProfile) {
		this.username = username;
		this.first_name = first_name;
		this.last_name = last_name;
		this.email = email;
		this.userprofile = userprofile;
		this.password = password;
	}

	username: string;
	first_name: string;
	last_name: string;
	email: string;
	password : string;
	userprofile: FormUserProfile;

}