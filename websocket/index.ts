/**
 * Servidor WebSocket implementado con Bun.
 * Este archivo se encarga de gestionar las conexiones de los clientes,
 * el envío y recepción de mensajes en tiempo real y la notificación
 * de eventos como unión y salida de usuarios del chat.
 */

import type { ServerWebSocket } from "bun";

//  Interfaces y contratos
interface ChatMessage {
    type: 'message' | 'join' | 'leave';
    user: string;
    content: string;
    timestamp: number;
}
// Almacena los clientes conectados y su respectivo nombre de usuario
const clients = new Map<ServerWebSocket<unknown>, {username: string}>(); 
// Envía un mensaje a todos los clientes conectados
const sendMessageToClients = (message: ChatMessage) => {
    clients.forEach((_, client) => {
        client.send(JSON.stringify(message));
    })
}

// Inicialización del servidor WebSocket
Bun.serve({
  fetch(req, server) {
    // Actualiza la conexión HTTP a WebSocket
    if (server.upgrade(req)) {
      return; // no se devuelve una respuesta HTTP
    }
    return new Response("Upgrade failed", { status: 500 });
  },
  
  websocket: {
    // Eventos del WebSocket
    open() {
        console.log ('WebSocket server started');
    },

    message(ws, message) {
        const data = JSON.parse(message as string) as ChatMessage;

        if (data.type === 'join') {
            clients.set(ws, { username: data.user });

            // Evento cuando un usuario se une al chat
            sendMessageToClients({
                type: 'join',
                user: data.user,
                content: `Bienvenido al chat ${data.user}`,
                timestamp: Date.now(),
            });
            return;
        }

        // Evento cuando un usuario envía un mensaje
        if (data.type === 'message') {
            const client = clients.get(ws);
            if (!client) return; // cliente no registrado

            sendMessageToClients({
                type: 'message',
                user: client.username,
                content: data.content,
                timestamp: Date.now(),
            });
        }
    },

    close(ws) {
        const client = clients.get(ws);
        if (!client) return;

        // Notifica cuando un usuario abandona el chat
        sendMessageToClients({
            type: 'leave',
            user: client.username,
            content: `${client.username} ha salido del chat.`,
            timestamp: Date.now(),
        });
        clients.delete(ws);
    }
  }, // handlers
});