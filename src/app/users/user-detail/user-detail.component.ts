import { Component, OnInit } from '@angular/core';
import { DjangoServiceService } from '../../django-service.service';
import { User } from '../../models/user';
import { UserProfile } from '../../models/userprofile';
import { ActivatedRoute } from '@angular/router';
import { Skill } from '../../models/skill';
import { Uni } from '../../models/uni';
import { Location } from '../../models/location';
import {MdInputModule} from '@angular/material';
import {MdTextareaAutosize} from '@angular/material';
import {AuthService} from '../../services/auth.service';
import {MdSnackBar} from '@angular/material';

@Component({
  selector: 'app-user-detail',
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.css'],
  providers: [DjangoServiceService]
})
export class UserDetailComponent implements OnInit {

  user: User;
  id: number;
  isProfileOwner: boolean;
  postContent: string = "";

  constructor(private djangoService: DjangoServiceService, public snackBar: MdSnackBar, private authService : AuthService, private route: ActivatedRoute) { }

  openSnackBar(message: string) {
    this.snackBar.open(message, "close", {
      duration: 2000,
    });
  }

  ngOnInit() {

  	this.route.params.subscribe(params => {
  		this.id = +params['id'];

  		console.log("from URL:" + this.id);
  		console.log("from cookie:" + this.authService.user.id);

  		if (this.authService.user.id == this.id) {
  			this.isProfileOwner = true;
  		} else {
  			this.isProfileOwner = false;
  		}

  	})

  	this.djangoService.getUser(this.id).subscribe(
  		res => {
	  		console.log("Received");
	  		console.log(res);
	  		console.log(res.userprofile['img']);
	  		return this.user = res;
	  	}
  	)

  }

  writePost() {

  	if(this.postContent !== "") {

	  	this.djangoService.writePost(this.postContent, null, null).subscribe(
	  		(res) =>{
	  			console.log(res);
	  			this.user.posts.push(res);
	  			this.postContent = "";
	  			this.openSnackBar("Post created");
	  		},
	  		(error) => {
	  			console.log(error);
	  			this.openSnackBar("Post could not be created");
	  		});
	  } else {
	  	this.openSnackBar("Please enter some text");
	  }
  }

  deletePost(id) {
  	this.djangoService.deletePost(id).subscribe(
  		(res) => {

			console.log(res);
			this.openSnackBar("Post deleted");

			// Removes post from page
			for(let i = 0; i < this.user.posts.length; i++) {
				if(this.user.posts[i].id == id) {
					this.user.posts.splice(i, 1);
					console.log("spliced number " + id);
					console.log(this.user.posts);
					return;
				}
			}

  		},
  		(error) => {
  			console.log(error);
  			this.openSnackBar("Post could not be deleted");
  		})

  }

  editProfile() {
  	console.log("Edit profile " + this.user.id);
  }

}
