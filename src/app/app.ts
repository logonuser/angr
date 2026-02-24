import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Todo, UpdateTodoRequest } from './todo.model';
import { TodoService } from './todo.service';

@Component({
  selector: 'app-root',
  imports: [FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  private readonly todoService = inject(TodoService);

  todos: Todo[] = [];
  loading = false;
  submitting = false;
  errorMessage = '';

  newTodoText = '';
  newTodoCompleted = false;
  newTodoUserId = 1;

  editingTodoId: number | null = null;
  editTodoText = '';
  editTodoCompleted = false;

  ngOnInit(): void {
    this.loadTodos();
  }

  loadTodos(): void {
    this.loading = true;
    this.errorMessage = '';

    this.todoService.getTodos().subscribe({
      next: (response) => {
        this.todos = response.todos;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load todos. Please try again.';
        this.loading = false;
      }
    });
  }

  addTodo(): void {
    const todo = this.newTodoText.trim();
    if (!todo) {
      return;
    }

    this.submitting = true;
    this.errorMessage = '';

    this.todoService
      .addTodo({
        todo,
        completed: this.newTodoCompleted,
        userId: this.newTodoUserId
      })
      .subscribe({
        next: (createdTodo) => {
          this.todos = [createdTodo, ...this.todos];
          this.newTodoText = '';
          this.newTodoCompleted = false;
          this.newTodoUserId = 1;
          this.submitting = false;
        },
        error: () => {
          this.errorMessage = 'Failed to create todo. Please try again.';
          this.submitting = false;
        }
      });
  }

  beginEdit(todo: Todo): void {
    this.editingTodoId = todo.id;
    this.editTodoText = todo.todo;
    this.editTodoCompleted = todo.completed;
  }

  cancelEdit(): void {
    this.editingTodoId = null;
    this.editTodoText = '';
    this.editTodoCompleted = false;
  }

  saveEdit(id: number): void {
    const trimmedText = this.editTodoText.trim();
    if (!trimmedText) {
      return;
    }

    const payload: UpdateTodoRequest = {
      todo: trimmedText,
      completed: this.editTodoCompleted
    };

    this.submitting = true;
    this.errorMessage = '';

    this.todoService.updateTodo(id, payload).subscribe({
      next: (updatedTodo) => {
        this.todos = this.todos.map((todo) =>
          todo.id === id ? { ...todo, ...updatedTodo } : todo
        );
        this.cancelEdit();
        this.submitting = false;
      },
      error: () => {
        this.errorMessage = 'Failed to update todo. Please try again.';
        this.submitting = false;
      }
    });
  }

  toggleComplete(todo: Todo): void {
    this.submitting = true;
    this.errorMessage = '';

    this.todoService.updateTodo(todo.id, { completed: !todo.completed }).subscribe({
      next: (updatedTodo) => {
        this.todos = this.todos.map((currentTodo) =>
          currentTodo.id === todo.id ? { ...currentTodo, ...updatedTodo } : currentTodo
        );
        this.submitting = false;
      },
      error: () => {
        this.errorMessage = 'Failed to update todo status. Please try again.';
        this.submitting = false;
      }
    });
  }

  deleteTodo(id: number): void {
    this.submitting = true;
    this.errorMessage = '';

    this.todoService.deleteTodo(id).subscribe({
      next: () => {
        this.todos = this.todos.filter((todo) => todo.id !== id);
        if (this.editingTodoId === id) {
          this.cancelEdit();
        }
        this.submitting = false;
      },
      error: () => {
        this.errorMessage = 'Failed to delete todo. Please try again.';
        this.submitting = false;
      }
    });
  }

  trackByTodoId(_: number, todo: Todo): number {
    return todo.id;
  }
}
