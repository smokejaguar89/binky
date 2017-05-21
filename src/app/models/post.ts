import { User } from './user';

export class Post {
	id: number;
	title: string;
	content: string;
	img: string;
	creation_date: string;
	category: string;
	author: User;
}