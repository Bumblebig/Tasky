import { Routes } from '@angular/router';
import { TaskFormComponent } from './task-form/task-form.component';
import { DashboardComponent } from './dashboard/dashboard.component';

const routeConfig: Routes = [
    { path: '', component: DashboardComponent, title: "Dashboard | Abdurrahman Abdulsalam" },
    { path: 'task-form', component: TaskFormComponent, title: "New Task | Abdurrahman Abdulsalam" }
];

export default routeConfig;
