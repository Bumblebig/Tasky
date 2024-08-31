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
    // Subscribe to the BehaviorSubject to get updated tasks
    TaskFormComponent.tasksSubject.subscribe(tasks => {
      this.newTasks = tasks.filter(task => task.status === 'New Task');
      this.inProgressTasks = tasks.filter(task => task.status === 'In Progress');
      this.doneTasks = tasks.filter(task => task.status === 'Done');
    });
  }

  onDrop(event: CdkDragDrop<any[]>) {
    if (event.previousContainer !== event.container) {
      // Move task to the new list
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      // Update the status of the moved task
      const task = event.container.data[event.currentIndex];
      if (event.container.id === 'newTasksList') {
        task.status = 'New Task';
      } else if (event.container.id === 'inProgressList') {
        task.status = 'In Progress';
      } else if (event.container.id === 'doneList') {
        task.status = 'Done';
      }

      // Update the BehaviorSubject with the new task list
      TaskFormComponent.tasksSubject.next([
        ...this.newTasks,
        ...this.inProgressTasks,
        ...this.doneTasks
      ]);
    }
  }
}
