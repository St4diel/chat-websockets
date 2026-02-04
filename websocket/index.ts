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

interface UsersMessage {
  type: 'users';
  users: string[];
  timestamp: number;
}

// Mensajes que el servidor puede enviar
type ServerMessage = ChatMessage | UsersMessage;

// Almacena los clientes conectados y su respectivo nombre de usuario
const clients = new Map<ServerWebSocket<unknown>, {username: string}>(); 

// Envía un mensaje a todos los clientes conectados
const sendMessageToClients = (message: ServerMessage) => {
    clients.forEach((_, client) => {
        client.send(JSON.stringify(message));
    })
}

// Envía la lista de usuarios conectados a todos los clientes
const sendUsersList = () => {
  const users = Array.from(clients.values()).map(c => c.username);

  sendMessageToClients({
    type: 'users',
    users,
    timestamp: Date.now(),
  });
};



// Inicialización del servidor WebSocket
Bun.serve({
  fetch(req, server) {
    // Actualiza la conexión HTTP a WebSocket
    if (server.upgrade(req)) {
      return; // no se devuelve una respuesta HTTP
    }
    return new Response("Upgrade failed", { status: 500 });
  },
  
  // Eventos del WebSocket
  websocket: {
    open() {
        console.log ('WebSocket server started');
    },

    message(ws, message) {
        const data = JSON.parse(message as string) as ChatMessage;

        // Usuario se une
        if (data.type === 'join') {
            clients.set(ws, { username: data.user });

            sendMessageToClients({
                type: 'join',
                user: data.user,
                content: `Bienvenido al chat ${data.user}`,
                timestamp: Date.now(),
            });

            // actualizar lista de usuarios
            sendUsersList();
            return;
        }

        // Evento cuando un usuario envía un mensaje
        if (data.type === 'message') {
            const client = clients.get(ws);
            if (!client) return;

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

        // actualizar lista de usuarios
        sendUsersList();
    }
  },
});