import { Skill } from './skill.ts';
import { User } from './user.ts';

export class Project {

	url: string;
	id: number;
	name: string;
	location: string;
	desc: string;
	img: string;
	creation_date: string;
	req_skills: Skill[];
	members: User[];

}