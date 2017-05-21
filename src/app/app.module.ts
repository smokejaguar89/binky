import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '@angular/material';

import 'hammerjs';

import { AppComponent } from './app.component';
import { ProjectListComponent } from './projects/project-list/project-list.component';
import { UserListComponent } from './users/user-list/user-list.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { UserDetailComponent } from './users/user-detail/user-detail.component';
import { ProjectDetailComponent } from './projects/project-detail/project-detail.component';
import { LogInComponent } from './log-in/log-in.component';
import { UserAuthGuard } from './guards/user-auth.guard';
import { AuthService } from './services/auth.service';
import { SignUpComponent } from './sign-up/sign-up.component';

@NgModule({
  declarations: [
    AppComponent,
    ProjectListComponent,
    UserListComponent,
    DashboardComponent,
    UserDetailComponent,
    ProjectDetailComponent,
    LogInComponent,
    SignUpComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    MaterialModule,
    RouterModule.forRoot([
      {
        path: 'login',
        component: LogInComponent
      },
      {
        path: 'signup',
        component: SignUpComponent
      },
      {
        path: 'projects',
        component: ProjectListComponent,
        canActivate: [UserAuthGuard]
      },
      {
        path: 'project/:id',
        component: ProjectDetailComponent,
        canActivate: [UserAuthGuard]
      },
      {
        path: 'users',
        component: UserListComponent,
        canActivate: [UserAuthGuard] 
      },
      {
        path: 'user/:id',
        component: UserDetailComponent,
        canActivate: [UserAuthGuard]
      },
      {
        path: '',
        component: ProjectListComponent,
        canActivate: [UserAuthGuard]
      },
      {
        path: '**',
        component: LogInComponent,
        canActivate: [UserAuthGuard]
      }
    ])
  ],
  providers: [UserAuthGuard, AuthService],
  bootstrap: [AppComponent]
})
export class AppModule { }
