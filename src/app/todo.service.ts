import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { CreateTodoRequest, Todo, TodoListResponse, UpdateTodoRequest } from './todo.model';

@Injectable({
  providedIn: 'root'
})
export class TodoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'https://dummyjson.com/todos';

  getTodos(limit = 20, skip = 0): Observable<TodoListResponse> {
    return this.http.get<TodoListResponse>(`${this.baseUrl}?limit=${limit}&skip=${skip}`);
  }

  addTodo(payload: CreateTodoRequest): Observable<Todo> {
    return this.http.post<Todo>(`${this.baseUrl}/add`, payload);
  }

  updateTodo(id: number, payload: UpdateTodoRequest): Observable<Todo> {
    return this.http.put<Todo>(`${this.baseUrl}/${id}`, payload);
  }

  deleteTodo(id: number): Observable<Todo> {
    return this.http.delete<Todo>(`${this.baseUrl}/${id}`);
  }
}
