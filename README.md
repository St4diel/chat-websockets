## Chat en Tiempo Real con Angular y Bun
Este proyecto implementa un chat en tiempo real utilizando Angular para el frontend y Bun como backend, empleando WebSockets para la comunicación bidireccional entre múltiples usuarios.

### Tecnologías utilizadas
* Angular 19 – Framework frontend
* Bun v1.3.7– Runtime JavaScript para el backend
* Tailwind CSS v4.1– Estilizado de la interfaz

### Requisitos previos
Antes de ejecutar el proyecto, asegúrate de tener instalado:
* Node.js (recomendado v20 o v22)
* Bun → https://bun.sh
* Angular CLI
````
npm install -g @angular/cli@19
````

### Configuración y ejecución del backend (WebSocket)
````
1. Entra a la carpeta del backend:
cd websocket

2. Instala las dependencias:
bun install

3. Inicia el servidor WebSocket:
bun run index.ts
````

### Configuración y ejecución del frontend (Angular)
````
1. Entra a la carpeta del cliente:
cd cliente

2. Instala las dependencias:
bun install

3. Ejecuta la aplicación Angular:
ng serve
````
