/**
 * Componente de inicio de sesión.
 * Este archivo permite al usuario ingresar su nombre,
 * iniciar la conexión con el servidor WebSocket y
 * redirigirlo a la vista principal del chat.
 */

import { Component, inject } from "@angular/core";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { WebsocketService } from '../websocket.service';
import { Router } from "@angular/router";

// Definición del componente
@Component({
  selector: 'app-login',
  template: `<div class="flex flex-col justify-center min-h-screen items-center">
    <div>
      <h1 class="text-2xl font-bold mb-4">Login</h1>
      <p class="text-sm">Ingresa tu nombre</p>

      <div class="mt-4">
        <label for=""></label>
        <input
          [formControl]="username"
          type="text"
          class="border w-full border-black outline-none rounded-md px-2 py-1 text-inherit"
        />
        <div class="mt-4">
          <button class="bg-black w-full px-4 py-2 text-white rounded-md cursor-pointer active:bg-black/80"
            (click)="goToChat()"
          >
            Ingresar
          </button>
        </div>
      </div>
    </div>
  </div>`,
  imports: [ReactiveFormsModule],
})

export default class LoginComponent {
  // Propiedades y dependencias
  username = new FormControl('');
  private WebsocketService = inject(WebsocketService);
  private route = inject(Router)

  // Lógica del componente
  goToChat() {
    const username = this.username.value;

    if (!username) return;
    this.WebsocketService.connect(username);
    this.route.navigate(['/chat']);
  }
}
