import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { UserComponent } from './user/user.component';
import { UserDetailComponent } from './user-detail/user-detail.component';
import { LoginComponent } from './login/login.component';
import { CalendarComponent } from './calendar/calendar.component';
import { WorkflowComponent } from './workflow/workflow.component';
import { AnimalDetailComponent } from './animal-detail/animal-detail.component';
import { ImprintComponent } from './imprint/imprint.component';

const routes: Routes = [
    { path: '', component: LoginComponent },
    { path: 'dashboard', component: DashboardComponent },
    { path: 'patients', component: UserComponent },
    { path: 'patients/:id', component: UserDetailComponent },
    { path: 'patients/:id/:animal', component: AnimalDetailComponent},
    { path: 'calendar', component: CalendarComponent},
    { path: 'workflow', component: WorkflowComponent},
    { path: 'imprint', component: ImprintComponent}
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
