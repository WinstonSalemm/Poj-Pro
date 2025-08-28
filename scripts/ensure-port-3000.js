// scripts/ensure-port-3000.js
const net = require('net');

const PORT = 3000;
const server = net.createServer();

server.once('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(
      `\n[dev] Порт ${PORT} занят. Dev обязан стартовать на 3000.\n` +
      `Закройте процесс, держащий порт 3000 (например, другой next/node), и запустите снова.\n`
    );
    process.exit(1);
  } else {
    console.error('[dev] Ошибка проверки порта:', err);
    process.exit(1);
  }
});

server.once('listening', () => {
  server.close();
});
server.listen(PORT, '0.0.0.0');
