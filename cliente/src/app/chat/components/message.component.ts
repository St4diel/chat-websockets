/**
 * Componente de mensaje.
 * Este archivo se encarga únicamente de la presentación visual
 * de cada mensaje del chat, diferenciando los mensajes propios
 * de los mensajes enviados por otros usuarios.
 */

import { NgClass } from "@angular/common";
import { Component, input } from "@angular/core";
import { ChatMessage } from "../../websocket.service";

// Definición del componente
@Component({
  selector: 'app-message',
  template: `
    @if (message().type !== 'message') {
      <div class="w-full flex justify-center my-2">
        <div class="px-4 py-2 rounded-md text-sm font-medium bg-gray-200 text-gray-700">
          {{ message().content }}
        </div>
      </div>
    }
    @else {
      <div
        class="flex items-start gap-4 w-full"
        [class.flex-row-reverse]="myMessage()"
      >
        <!-- Avatar -->
        <div
          class="rounded-full font-semibold text-xl w-10 h-10 flex justify-center items-center"
          [ngClass]="myMessage() ? 'bg-blue-100' : 'bg-gray-200'"
        >
          {{ message().user.charAt(0).toUpperCase() }}
        </div>

        <!-- Burbuja -->
        <div
          class="inline-block max-w-[40%] rounded-md px-4 py-2 break-all"
          [ngClass]="myMessage() ? 'bg-blue-100' : 'bg-gray-200'"
        >
          <!-- Nombre de los otros usuarios -->
          @if (!myMessage()) {
            <p
              class="text-xs font-semibold mb-1"
              [style.color]="getUserColor(message().user)"
            >
              {{ message().user }}
            </p>
          }

          <p>{{ message().content }}</p>
        </div>
      </div>
    }
  `,
  imports: [NgClass],
})
export class MessageComponent {
  // Propiedades de entrada
  myMessage = input<boolean>(false);
  message = input.required<ChatMessage>();

  // Devuelve un color estable por usuario
  private readonly colors = [
    '#2563eb', // azul
    '#9333ea', // morado
    '#ca8a04', // amarillo
    '#db2777', // rosado
    '#0d9488', // teal
  ];

  getUserColor(username: string): string {
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    return this.colors[Math.abs(hash) % this.colors.length];
  }
}
