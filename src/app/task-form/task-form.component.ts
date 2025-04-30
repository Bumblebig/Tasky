import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NgxSemanticModule } from 'ngx-semantic';
import { BehaviorSubject } from 'rxjs';

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
  selector: 'app-task-form',
  standalone: true,
  imports: [NgxSemanticModule, CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './task-form.component.html',
  styleUrl: './task-form.component.css'
})
export class TaskFormComponent implements OnInit {
  taskForm!: FormGroup;
  filled: string | null = "hidden";
  static tasksSubject = new BehaviorSubject<Task[]>([]);
  static nextId = 1; // Add static counter
  availableParents: Task[] = []; // Add availableParents property

  ngOnInit(): void {
    // Subscribe to tasks changes to update available parents
    TaskFormComponent.tasksSubject.subscribe(tasks => {
      // For now, all tasks can be parents. Flatten the list if needed in the future.
      this.availableParents = this.flattenTasks(tasks);
    });
  }

  constructor(private router: Router, private fb: FormBuilder) {
    this.taskForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', [Validators.required, Validators.maxLength(15)]],
      parentId: [null] // Add parentId form control
    })
  }

  // Helper function to flatten the task tree (needed if children can be parents)
  private flattenTasks(tasks: Task[]): Task[] {
    let flatList: Task[] = [];
    tasks.forEach(task => {
      flatList.push(task);
      if (task.children && task.children.length > 0) {
        flatList = flatList.concat(this.flattenTasks(task.children));
      }
    });
    return flatList;
  }


  onSubmit() {
    if (this.taskForm.valid) {
      this.filled = "hidden";
      const tasks = [...TaskFormComponent.tasksSubject.value]; // Clone the array
      const newTaskId = TaskFormComponent.nextId++;
      const parentId = this.taskForm.value.parentId;

      const newTask: Task = {
        id: newTaskId,
        title: this.taskForm.value.title,
        description: this.taskForm.value.description,
        status: 'New Task',
        children: [], // Initialize children array
        isExpanded: true // Initialize as expanded
      };

      if (parentId !== null && parentId !== undefined) {
        // Find parent and add as child
        const parentTask = this.findTaskById(tasks, parentId);
        if (parentTask) {
          if (!parentTask.children) {
            parentTask.children = []; // Ensure children array exists
          }
          newTask.parentId = parentId; // Set parentId on the new task
          parentTask.children.push(newTask);
          // No need to explicitly update the array here as parentTask is a reference
        } else {
          // Parent not found (shouldn't happen with dropdown selection but handle defensively)
          console.error(`Parent task with ID ${parentId} not found.`);
          tasks.push(newTask); // Add as top-level task as fallback
        }
      } else {
        // Add as a new top-level task
        tasks.push(newTask);
      }

      TaskFormComponent.tasksSubject.next(tasks); // Emit the updated array
      this.router.navigate(['/']);
    } else {
      this.filled = null;
    }
  }

  // Helper function to find a task by ID in the tree
  private findTaskById(tasks: Task[], id: number): Task | null {
    for (const task of tasks) {
      if (task.id === id) {
        return task;
      }
      if (task.children && task.children.length > 0) {
        const found = this.findTaskById(task.children, id);
        if (found) {
          return found;
        }
      }
    }
    return null;
  }
}
