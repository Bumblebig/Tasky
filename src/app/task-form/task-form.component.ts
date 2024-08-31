import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NgxSemanticModule } from 'ngx-semantic';
import { BehaviorSubject } from 'rxjs';

interface Task {
  title: string;
  description: string;
  status: string;
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

  ngOnInit(): void {

  }

  constructor(private router: Router, private fb: FormBuilder) {
    this.taskForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', [Validators.required, Validators.maxLength(15)]],
    })
  }

  onSubmit() {
    if (this.taskForm.valid) {
      this.filled = "hidden";
      const tasks = TaskFormComponent.tasksSubject.value;
      const newTask: Task = { ...this.taskForm.value, status: 'New Task' };
      TaskFormComponent.tasksSubject.next([...tasks, newTask]);
      this.router.navigate(['/']);
    } else this.filled = null;
  }
}
