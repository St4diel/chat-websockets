/**
 * Componente principal del chat.
 * Este archivo gestiona la visualización de los mensajes en tiempo real,
 * el envío de nuevos mensajes al servidor WebSocket y
 * el cierre de sesión del usuario.
 */

import { Component, effect, ElementRef, inject, ViewChild } from "@angular/core";
import { MessageComponent } from "./components/message.component";
import { WebsocketService } from '../websocket.service';
import { FormControl, ReactiveFormsModule } from "@angular/forms";

@Component({
  selector: 'app-chat',
  template: `
    <div class="h-screen flex flex-col overflow-hidden">
      <header class="bg-gray-200 p-3 flex items-center justify-end gap-2">
        <button
          class="bg-gray-700 rounded-md text-white px-4 py-2"
          (click)="toggleUsers()">
          Usuarios ({{ connectedUsers().length }})
        </button>

        <button
          class="bg-black rounded-md text-white px-4 py-2"
          (click)="logout()">
          Cerrar Sesión
        </button>
      </header>

      <!-- Ventana de usuarios conectados -->
      @if (showUsers) {
        <div class="fixed inset-0 bg-black/40 z-40" (click)="closeUsers()"></div>

        <!-- ventana -->
        <div class="fixed top-16 right-4 w-64 bg-white rounded-lg shadow-lg z-50 p-4">
          <h3 class="font-semibold mb-3">
            Usuarios conectados ({{ connectedUsers().length }})
          </h3>

          <ul class="flex flex-col gap-2 max-h-64 overflow-y-auto">
            @for (user of connectedUsers(); track user) {
              <li class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-semibold">
                  {{ user.charAt(0).toUpperCase() }}
                </div>
                <span>{{ user }}</span>
              </li>
            }
          </ul>
        </div>
      }

      <!-- Mensajes -->
      <div class="flex-1 p-4 overflow-y-auto flex flex-col gap-4" #chatContainer (scroll)="onScroll()">
          <!--<app-message/>
          <app-message [myMessage]="true"/>-->
          @for (message of messages(); track message) {
            <app-message
              [message]="message"
              [myMessage]="username() === message.user"/>
          }
      </div>

      <!-- Input -->
      <div class="flex gap-x-4 mt-4 p-4">
        <input
          type="text"
          class="w-full rounded-md border outline-none border-gray-200 p-2"
          [formControl]="messageControl"
          (keydown.enter)="sendMessage()"/>
        <button
          class="cursor-pointer bg-black text-white px-4 py-2 rounded-md"
          (click)="sendMessage()">
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
  connectedUsers = this.websocketService.connectedUsers;
  messageControl = new FormControl('');
  showUsers = false;

  @ViewChild('chatContainer')
  private chatContainer!: ElementRef<HTMLDivElement>;

  // controla si debe hacer auto-scroll
  private shouldAutoScroll = true;
  private lastMessageFromMe = false;

  constructor() {
    // se ejecuta cada vez que llegan mensajes
    effect(() => {
      const messages = this.messages();
      if (!messages.length) return;

      if (this.lastMessageFromMe) {
        // siempre scroll si el mensaje es mío
        this.scrollToBottom();
        this.lastMessageFromMe = false;
        return;
      }

      // mensajes de otros usuarios
      if (this.shouldAutoScroll) {
        this.scrollToBottom();
      }
    });
  }

  // metodo para enviar mensajes
  sendMessage() {
    const value = this.messageControl.value;
    if (!value) return;

    this.lastMessageFromMe = true;
    this.websocketService.sendChatMessage(value);
    this.messageControl.setValue('');
  }

  logout() {
    this.websocketService.logOut();
  }

  // muestra/oculta la ventana de usuarios
  toggleUsers() {
    this.showUsers = !this.showUsers;
  }
  closeUsers() {
    this.showUsers = false;
  }

  // detecta si el usuario está abajo o leyendo arriba
  onScroll() {
    const el = this.chatContainer.nativeElement;
    const threshold = 50;

    this.shouldAutoScroll =
      el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
  }

  // Scroll real
  private scrollToBottom() {
    setTimeout(() => {
      const el = this.chatContainer.nativeElement;
      el.scrollTop = el.scrollHeight;
    });
  }
}
