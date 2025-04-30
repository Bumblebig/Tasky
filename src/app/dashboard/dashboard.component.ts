import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxSemanticModule } from 'ngx-semantic';
import { TaskFormComponent } from '../task-form/task-form.component';
// Import moveItemInArray
import { DragDropModule, CdkDragDrop, transferArrayItem, moveItemInArray } from '@angular/cdk/drag-drop';
import { RouterModule, Router } from '@angular/router';

// Add the Task interface definition (copied from task-form.component.ts)
interface Task {
  id: number;
  title: string;
  description: string;
  status: string;
  children?: Task[];
  parentId?: number;
  isExpanded?: boolean; // Add isExpanded property
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NgxSemanticModule, CommonModule, DragDropModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  newTasks: Task[] = []; // Changed type to Task[]
  inProgressTasks: Task[] = []; // Changed type to Task[]
  doneTasks: Task[] = []; // Changed type to Task[]

  ngOnInit(): void {
    TaskFormComponent.tasksSubject.subscribe(tasks => {
      // Initialize empty arrays for categorization
      const newTasks: Task[] = [];
      const inProgressTasks: Task[] = [];
      const doneTasks: Task[] = [];

      // Iterate through the top-level tasks received
      for (const task of tasks) {
        // Categorize based on status, pushing the entire task object (with children)
        if (task.status === 'New Task') {
          newTasks.push(task);
        } else if (task.status === 'In Progress') {
          inProgressTasks.push(task);
        } else if (task.status === 'Done') {
          doneTasks.push(task);
        }
        // Note: This logic assumes only top-level tasks determine the column.
        // Child tasks remain nested within their parents when pushed.
      }

      // Assign the categorized arrays to component properties
      this.newTasks = newTasks;
      this.inProgressTasks = inProgressTasks;
      this.doneTasks = doneTasks;
    });
  }

  // Update onDrop signature to use Task[]
  onDrop(event: CdkDragDrop<Task[]>) {
    const draggedTask: Task = event.item.data;
    const previousContainerId = event.previousContainer.id;
    const containerId = event.container.id;
    const previousData = event.previousContainer.data;
    const containerData = event.container.data;

    if (event.previousContainer === event.container) {
      // Reordering within the same list
      moveItemInArray(containerData, event.previousIndex, event.currentIndex);
    } else {
      // Moving between different lists (columns)

      // 1. Find and Remove from source
      let sourceList: Task[];
      if (previousContainerId === 'newTasksList') sourceList = this.newTasks;
      else if (previousContainerId === 'inProgressList') sourceList = this.inProgressTasks;
      else sourceList = this.doneTasks; // Assuming 'doneList'

      const removedTask = this.findAndRemoveTask(sourceList, draggedTask.id);

      if (removedTask) {
        // 2. Determine New Status
        let newStatus: string;
        if (containerId === 'newTasksList') newStatus = 'New Task';
        else if (containerId === 'inProgressList') newStatus = 'In Progress';
        else newStatus = 'Done'; // Assuming 'doneList'

        // 3. Update Status Recursively
        this.updateTaskStatusRecursive(removedTask, newStatus);

        // 4. Add to Destination (at top level)
        removedTask.parentId = null; // Reset parentId as it's now top-level
        containerData.splice(event.currentIndex, 0, removedTask);

      } else {
          console.error("Could not find the dragged task in the source list after drag.");
          // Fallback or error handling - potentially try the old transferArrayItem
          // transferArrayItem(previousData, containerData, event.previousIndex, event.currentIndex);
          // This fallback might break hierarchy, so omitting it for now.
      }
    }

    // 5. Update tasksSubject
    TaskFormComponent.tasksSubject.next([
        ...this.newTasks,
        ...this.inProgressTasks,
        ...this.doneTasks
    ]);
  }


  // --- Helper Functions ---

  findAndRemoveTask(taskList: Task[], taskId: number): Task | null {
    for (let i = 0; i < taskList.length; i++) {
      const task = taskList[i];
      if (task.id === taskId) {
        // Found at top level of this list
        return taskList.splice(i, 1)[0]; // Remove and return
      }
      // Search in children
      if (task.children && task.children.length > 0) {
        const foundInChildren = this.findAndRemoveTask(task.children, taskId);
        if (foundInChildren) {
          return foundInChildren; // Return if found in children
        }
      }
    }
    return null; // Not found in this list or its children
  }

  updateTaskStatusRecursive(task: Task, newStatus: string): void {
    task.status = newStatus;
    if (task.children) {
      for (const child of task.children) {
        this.updateTaskStatusRecursive(child, newStatus);
      }
    }
  }


  // Original onDrop logic (to be replaced by the code above)
  /*
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

  toggleExpand(task: Task): void {
    task.isExpanded = !task.isExpanded;
    // Note: No need to update tasksSubject here, as this is purely a view state change
    // managed within the DashboardComponent's representation of the data.
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
