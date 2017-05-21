import { Skill } from './skill.ts';
import { User } from './user.ts';
import { Uni } from './uni.ts';
import { Project } from './project.ts';

export class UserProfile {

	constructor(img: string, uni: Uni, degree: string, desc: string, skills: Skill[]) {
		this.img = img;
		this.uni = uni;
		this.degree = degree;
		this.desc = desc;
		this.skills = skills;
	}

	id: number;
	img: string;
	uni: Uni;
	degree: string;
	desc: string;
	skills: Skill[];
	user: number;
	connections: number[];
	projects: Project[];

}

export class FormUserProfile {

	constructor(img: string, uni: Uni, degree: string, desc: string, skills: Skill[]) {
		this.img = img;
		this.uni = uni;
		this.degree = degree;
		this.desc = desc;
		this.skills = skills;
	}

	img: string;
	uni: Uni;
	degree: string;
	desc: string;
	skills: Skill[];

}