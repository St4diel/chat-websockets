/**
 * Componente principal del chat.
 * Este archivo gestiona la visualización de los mensajes en tiempo real,
 * el envío de nuevos mensajes al servidor WebSocket y
 * el cierre de sesión del usuario.
 */

import { Component, inject } from "@angular/core";
import { MessageComponent } from "./components/message.component";
import { WebsocketService } from '../websocket.service';
import { FormControl, ReactiveFormsModule } from "@angular/forms";

// Definición del componente
@Component({
  selector: 'app-chat',
  template: `
    <div class="h-screen flex flex-col overflow-hidden">
      <header class="bg-gray-200 p-3 flex items-center justify-end">
        <button
          class="bg-black rounded-md text-white px-4 py-2"
          (click)="logout()"
        >
          Cerrar Sesión
        </button>
      </header>

      <div class="flex-1 p-4 overflow-y-auto flex flex-col gap-4">
          <!--<app-message/>
          <app-message [myMessage]="true"/>-->

          @for (message of messages(); track message) {
            <app-message
              [message]="message"
              [myMessage]="username() === message.user"
            />
          }
      </div>

      <div class="flex gap-x-4 mt-4 p-4">
        <input
          type="text"
          class="w-full rounded-md border outline-none border-gray-200 p-2"
          [formControl]="messageControl"
        />
        <button
          class="cursor-pointer bg-black text-white px-4 py-2 rounded-md"
          (click)="sendMessage()"
        >
          Enviar
        </button>
      </div>
    </div>
  `,
  imports: [MessageComponent, ReactiveFormsModule]
})

export default class ChatComponent {
  // Dependencias y estado
  private websocketService  = inject(WebsocketService);

  messages = this.websocketService.messages;
  username = this.websocketService.username;
  messageControl = new FormControl('');

  // Lógica del componente
  sendMessage() {
    const value = this.messageControl.value;
    if (!value) return;
    this.websocketService.sendChatMessage(value);
    this.messageControl.setValue('');
  }

  logout() {
    this.websocketService.logOut();
  }
}
