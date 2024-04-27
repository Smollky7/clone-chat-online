const { WebSocketServer } = require("ws");
const dotenv = require("dotenv");

dotenv.config();

const wss = new WebSocketServer({ port: process.env.PORT || 8080 });

wss.on("connection", (ws) => {
    ws.on("error", (error) => {
        console.error("Erro na conexão WebSocket:", error);
        // Encerrar a conexão ou tomar outras medidas apropriadas
    });

    ws.on("message", (data) => {
        try {
            const message = JSON.parse(data);
            if (typeof message === "object") {
                console.log("Mensagem recebida:", message);
                if (message.type === "notification") {
                    // Se for uma mensagem de notificação, enviar para todos os clientes
                    wss.clients.forEach((client) => {
                        client.send(JSON.stringify(message));
                    });
                } else {
                    // Se for uma mensagem de membro, enviar para todos exceto o remetente
                    wss.clients.forEach((client) => {client.send(data.toString())});
                }
            } else {
                console.warn("Mensagem inválida recebida:", data);
            }
        } catch (error) {
            console.error("Erro ao analisar mensagem:", error);
        }
    });

    console.log("Cliente conectado");

    ws.on("close", () => {
        console.log("Cliente desconectado");
        // Remova o cliente da lista de clientes
    });
});
