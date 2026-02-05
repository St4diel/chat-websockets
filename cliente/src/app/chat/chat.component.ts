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
      <header class="bg-linear-to-r from-slate-900 via-gray-800 to-black
         p-3 flex items-center justify-between shadow-md">

        <!-- Logo -->
        <div class="flex items-center gap-1">
          <img src="image/logo_socketx.png" alt="Chat Logo" class="w-15 h-11" />
          <span class="text-white font-semibold text-lg">SocketX</span>
        </div>

        <!-- Botones-->
        <div class="ml-auto flex items-center gap-3">
          <button
            class="bg-slate-900 hover:bg-slate-700 transition border border-white
                  rounded-md cursor-pointer text-white px-4 py-2 font-medium"
                  (click)="toggleUsers()">
            Usuarios ({{ connectedUsers().length }})
          </button>

          <button
            class="bg-white text-black px-4 py-2 font-medium rounded-md cursor-pointer
                   hover:bg-gray-100 transition"
                   (click)="logout()">
            Cerrar Sesión
          </button>
        </div>
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

      <!-- Área de chat -->
      <div class="chat-bg relative flex-1 flex flex-col min-h-0">
        <div class="absolute inset-0 bg-gray-800/60 pointer-events-none"></div>
        <!-- Mensajes -->
        <div class="relative z-10 flex flex-col flex-1 min-h-0">
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
          <div class="flex gap-x-1 p-4 shrink-0">
            <input
              type="text"
              class="w-full rounded-md border outline-none border-gray-200 p-2 bg-white"
              placeholder="Escribe tu mensaje..."
              [formControl]="messageControl"
              (keydown.enter)="sendMessage()"/>
            <button
              class="cursor-pointer bg-slate-900 text-white px-4 py-2 rounded-md hover:bg-slate-700 transition"
              (click)="sendMessage()">
              Enviar
            </button>
          </div>
        </div>
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
