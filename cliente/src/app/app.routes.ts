/**
 * Configuración de rutas de la aplicación.
 * Este archivo define la navegación entre las vistas
 * de login y chat mediante carga dinámica de componentes.
 */

import { Routes } from '@angular/router';

// Definición de rutas
export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./login/login.component'), // Ruta inicial: pantalla de login
  },
  {
    path: 'chat',
    loadComponent: () => import('./chat/chat.component'), // Ruta del chat principal
  },
];
