import { spawn } from 'child_process';

console.log('[DevRunner] Starting FastAPI backend on port 5000...');
const backend = spawn('python3', ['-m', 'uvicorn', 'backend.main:app', '--host', '127.0.0.1', '--port', '5000'], {
  stdio: 'inherit',
});

console.log('[DevRunner] Starting Vite frontend server on port 3000...');
const frontend = spawn('npx', ['vite', '--host', '0.0.0.0', '--port', '3000'], {
  stdio: 'inherit',
});

const cleanup = () => {
  console.log('[DevRunner] Shutting down services...');
  backend.kill();
  frontend.kill();
  process.exit();
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

backend.on('exit', (code) => {
  if (code !== 0 && code !== null) {
    console.error(`[DevRunner] Backend exited with code ${code}`);
  }
});

frontend.on('exit', (code) => {
  if (code !== 0 && code !== null) {
    console.error(`[DevRunner] Frontend exited with code ${code}`);
  }
});
