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
  template: `
  <div class="flex min-h-screen items-center justify-center bg-linear-to-br from-slate-900 via-gray-800 to-black">
    <div class="w-full max-w-sm bg-white rounded-xl shadow-lg p-6 flex flex-col items-center">
      <img src="image/logo_socketx.png" alt="Logo" class="w-48 h-40 mb-4 object-contain" />
      <div class="w-80 max-w-sm bg-white rounded-xl p-6 pt-0">
        <h1 class="text-2xl font-bold text-center mb-5">Inicio de sesión</h1>
        <p class="text-sm">Ingresa tu nombre</p>

        <div class="mt-4">
          <label for=""></label>
          <input
            [formControl]="username"
            type="text"
            placeholder="Ingresa tu nombre"
            class="w-full border border-gray-300 rounded-md px-3 py-2 outline-none"
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
