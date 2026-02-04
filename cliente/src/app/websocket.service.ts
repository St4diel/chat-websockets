/**
 * Servicio WebSocket de Angular.
 * Este archivo gestiona la conexión con el servidor WebSocket,
 * el envío y recepción de mensajes en tiempo real, así como
 * la persistencia básica de la sesión del usuario.
 */

import { inject, Injectable, signal } from "@angular/core";
import { Router } from "@angular/router";

// Interfaces y contratos
export interface ChatMessage {
  type: "message" | "join" | "leave";
  user: string;
  content?: string;
  timestamp: number;
}

interface UsersMessage {
  type: 'users';
  users: string[];
  timestamp: number;
}

type ServerMessage = ChatMessage | UsersMessage;

// Decorador del servicio
@Injectable({
  providedIn: 'root',
})

export class WebsocketService {
  // Propiedades y estado
  private socket: WebSocket | null = null;

  // Estado reactivo del usuario y mensajes
  username = signal<string>('');
  messages = signal<ChatMessage[]>([]);
  connectedUsers = signal<string[]>([]);

  private router = inject(Router);

  // Ciclo de vida del servicio
  constructor() {
    this.loadSession();
  }

  // Gestión de sesión
  private loadSession() {
    const savedUsername = localStorage.getItem('username');
    if (savedUsername) {
      this.connect(savedUsername);
      this.loadChatMessages(); // obtener los mensajes
    } else {
      this.router.navigate(['/']); // redirigir al login
    }
  }

  loadChatMessages() {
    const savedMessages = localStorage.getItem('messages');
    if (savedMessages) {
      this.messages.set(JSON.parse(savedMessages));
    }
  }

  connect(username: string) {
    localStorage.setItem('username', username);
    this.username.set(username);
    // Conexión al servidor WebSocket (Bun)
    this.socket = new WebSocket('ws://localhost:3000'); // 3000 por defecto en Bun

    this.socket.onopen = () => {
      // mandar mensaje de que se unio alguien
      this.joinChat();
    };

    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data) as ServerMessage;

      // lista de usuarios conectados
      if (data.type === 'users') {
        this.connectedUsers.set(data.users);
        return;
      }

      // mensajes normales (join, leave, message)
      this.messages.update((oldMessages) => {
        const messages = [...oldMessages, data];
        localStorage.setItem('messages', JSON.stringify(messages));
        return messages;
      });
    };

    this.socket.onclose = () => {
      this.socket = null;
      this.connectedUsers.set([]); // limpieza
      console.log('WebSocket connection closed');
    };
  }

  // Envío de mensajes
  sendChatMessage(content: string) {
    const message: ChatMessage = {
      type: 'message',
      user: this.username(),
      content,
      timestamp: Date.now(),
    };
    this.sendMessage(message);
  }

  private joinChat() {
    const joinMessage: ChatMessage = {
      type: 'join',
      user: this.username(),
      timestamp: Date.now(),
      content: `Bienvenido al chat ${this.username()}`,
    };
    this.sendMessage(joinMessage);
  }

  private sendMessage(message: ChatMessage) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    }
  }

  // Cierre de sesión
  logOut() {
    if (this.socket) {
      this.socket.close();
      this.username.set('');
      this.messages.set([]);
      this.connectedUsers.set([]);
      localStorage.removeItem('username');
      localStorage.removeItem('messages');
      this.router.navigateByUrl('/');
    }
  }
}
