import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/juego_buscaminas_react/',
  // base: '/',
  plugins: [react()]
});
