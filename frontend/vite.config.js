import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        proxy: {
            '/auth': 'http://localhost:8080',
            '/library': 'http://localhost:8080',
            '/genres': 'http://localhost:8080',
            '/refresh': 'http://localhost:8080',
            '/graphql': 'http://localhost:8080',
            '/logout': 'http://localhost:8080',
            '/admin/library': 'http://localhost:8080',
        },
    },
});
