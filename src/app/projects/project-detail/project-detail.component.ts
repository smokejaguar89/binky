import { Component, OnInit } from '@angular/core';
import { DjangoServiceService } from '../../django-service.service';
import { Project } from '../../models/project';
import { User } from '../../models/user';
import { UserProfile } from '../../models/userprofile';
import { ActivatedRoute } from '@angular/router';
import { Skill } from '../../models/skill';
import { Uni } from '../../models/uni';
import { Location } from '../../models/location';

@Component({
  selector: 'app-project-detail',
  templateUrl: './project-detail.component.html',
  styleUrls: ['./project-detail.component.css'],
  providers: [DjangoServiceService]
})
export class ProjectDetailComponent implements OnInit {

  project: Project;
  id: number;

  constructor(private djangoService: DjangoServiceService, private route: ActivatedRoute) { }

  ngOnInit() {

  	this.route.params.subscribe(params => {
  		this.id = +params['id'];
  	})

  	this.djangoService.getProject(this.id).subscribe(
  		res => {
	  		console.log("Received");
	  		console.log(res['img']);
	  		return this.project = res;
	  	}
  	)

  }

}
