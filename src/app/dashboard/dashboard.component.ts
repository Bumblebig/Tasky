import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxSemanticModule } from 'ngx-semantic';
import { TaskFormComponent } from '../task-form/task-form.component';
import { DragDropModule, CdkDragDrop, transferArrayItem } from '@angular/cdk/drag-drop';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NgxSemanticModule, CommonModule, DragDropModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  newTasks: any[] = [];
  inProgressTasks: any[] = [];
  doneTasks: any[] = [];

  ngOnInit(): void {
    TaskFormComponent.tasksSubject.subscribe(tasks => {
      this.newTasks = tasks.filter(task => task.status === 'New Task');
      this.inProgressTasks = tasks.filter(task => task.status === 'In Progress');
      this.doneTasks = tasks.filter(task => task.status === 'Done');
    });
  }

  onDrop(event: CdkDragDrop<any[]>) {
    if (event.previousContainer !== event.container) {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      const task = event.container.data[event.currentIndex];
      if (event.container.id === 'newTasksList') {
        task.status = 'New Task';
      } else if (event.container.id === 'inProgressList') {
        task.status = 'In Progress';
      } else if (event.container.id === 'doneList') {
        task.status = 'Done';
      }

      TaskFormComponent.tasksSubject.next([
        ...this.newTasks,
        ...this.inProgressTasks,
        ...this.doneTasks
      ]);
    }
  }

  getHeadingColor(status: string): string {
    switch (status) {
      case 'New Task':
        return '#ff6b6b';
      case 'In Progress':
        return '#ff9800';
      case 'Done':
        return '#0e7c7b';
      default:
        return '#000'; 
    }
  }

  getHeadingBackgroundColor(status: string): string {
    switch (status) {
      case 'New Task':
        return 'rgba(255, 107, 107, 0.16)';
      case 'In Progress':
        return 'rgba(255, 152, 0, 0.16)';
      case 'Done':
        return 'rgba(14, 124, 122, 0.16)';
      default:
        return 'rgba(0, 0, 0, 0.1)';
    }
  }
}
