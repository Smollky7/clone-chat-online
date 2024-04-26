const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

wss.on("connection", (ws) => {
    ws.on("error", console.error);

    // Envia uma notificação quando um usuário entra na sala
    wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send("Um novo usuário entrou na sala!");
        }
    });

    ws.on("message", (data) => {
        // Aqui você pode adicionar lógica para lidar com mensagens recebidas
        console.log("Mensagem recebida:", data);
        // Exemplo de como reenviar uma mensagem recebida para todos os clientes
        wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(data);
            }
        });
    });

    console.log("Cliente conectado");
});
