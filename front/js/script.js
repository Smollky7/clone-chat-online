// Selecionando elementos do DOM relacionados ao login
const login = document.querySelector(".login");
const loginForm = login.querySelector(".login__form");
const loginInput = login.querySelector(".login__input");

// Selecionando elementos do DOM relacionados ao chat
const chat = document.querySelector(".chat");
const chatForm = chat.querySelector(".chat__form");
const chatInput = chat.querySelector(".chat__input");
const chatMessages = chat.querySelector(".chat__messages");

// Definindo uma lista de cores para os usuários
const colors = ["cadetblue", "darkgoldenrod", "cornflowerblue", "darkkhaki", "hotpink", "gold", "mediumaquamarine", "orchid", "steelblue", "tomato", "salmon", "dodgerblue", "limegreen", "slateblue", "crimson", "peru", "indigo", "teal", "olive", "sienna"];

// Definindo variáveis para o usuário e a conexão WebSocket
let user = { id: "", name: "", color: "" };
let websocket;

// Função para criar um elemento de mensagem enviada pelo próprio usuário
const createMessageSelfElement = (content) => {
    const div = createMessageElement(content, "message--self", user.name, user.color);
    return div;
};
// Função para criar um elemento de mensagem enviada por outro usuário
const createMessageOtherElement = (content, sender, senderColor) => {
    const div = createMessageElement(content, "message--other", sender, senderColor);
    return div;
};
// Função para criar um elemento de mensagem genérico
const createMessageElement = (content, messageType, sender = "", senderColor = "") => {
    const div = document.createElement("div");

    div.classList.add("message", messageType);

    if (sender !== "") {
        const spanSender = document.createElement("span");
        spanSender.textContent = sender;
        spanSender.style.color = senderColor;
        div.appendChild(spanSender);
    }

    const spanContent = document.createElement("span");
    spanContent.textContent = content;
    div.appendChild(spanContent);

    const spanHora = document.createElement("span");
    const dataHoraAtual = new Date();
    const hora = dataHoraAtual.getHours();
    const minutos = dataHoraAtual.getMinutes();

    spanHora.classList.add("message--time");

    if (messageType === "message--self") {
        spanHora.classList.add("message--time--self");
    } else if (messageType === "message--other") {
        spanHora.classList.add("message--time--other");
    }

    spanHora.textContent = `${hora}:${minutos}`;
    div.appendChild(spanHora);

    return div;
};
// Função para obter uma cor aleatória da lista de cores
const getRandomColor = () => {
    const randomIndex = Math.floor(Math.random() * colors.length);
    return colors[randomIndex];
};
// Função para rolar a tela para a parte inferior
const scrollScreen = () => {
    window.scrollTo({
        top: document.body.scrollHeight,
        behavior: "smooth"
    });
};
// Função para processar uma mensagem recebida
const processMessage = ({ data }) => {
    const { userId, userName, userColor, content, type } = JSON.parse(data);

    if (type === "notification") {
        const notification = createNotificationElement(content);
        chatMessages.appendChild(notification);
    } else if (type === "image") {
        const imageMessage = createImageMessageElement(content, userName, userColor);
        chatMessages.appendChild(imageMessage);
    } else {
        const message = userId === user.id ?
            createMessageSelfElement(content) :
            createMessageOtherElement(content, userName, userColor);

        chatMessages.appendChild(message);
    }

    scrollScreen();
};
// Função para criar um elemento de mensagem de imagem
const createImageMessageElement = (content, sender, senderColor) => {
    const div = document.createElement("div");

    div.classList.add("message", "message--other");

    if (sender !== "") {
        const spanSender = document.createElement("span");
        spanSender.textContent = sender;
        spanSender.style.color = senderColor;
        div.appendChild(spanSender);
    }

    const img = document.createElement("img");
    img.src = content;
    div.appendChild(img);

    const spanHora = document.createElement("span");
    const dataHoraAtual = new Date();
    const hora = dataHoraAtual.getHours();
    const minutos = dataHoraAtual.getMinutes();

    spanHora.classList.add("message--time", "message--time--other");
    spanHora.textContent = `${hora}:${minutos}`;
    div.appendChild(spanHora);

    return div;
};
// Função para criar um elemento de notificação
const createNotificationElement = (content) => {
    const div = document.createElement("div");
    const spanContent = document.createElement("span");

    div.classList.add("notification");
    spanContent.textContent = content;

    div.appendChild(spanContent);

    return div;
};

// Função para lidar com o envio do formulário de login
const handleLogin = (event) => {
    event.preventDefault();

    const username = loginInput.value.trim();

    if (!username) {
        alert("Por favor, insira um nome de usuário válido.");
        return;
    }

    user = {
        id: crypto.randomUUID(),
        name: username,
        color: getRandomColor()
    };

    login.style.display = "none";
    chat.style.display = "flex";

    // Enviar uma mensagem de notificação quando o usuário se conectar pela primeira vez
    const notificationMessage = {
        type: "notification",
        content: `${user.name} entrou na sala`
    };

    websocket = new WebSocket("ws://localhost:8080");

    websocket.onopen = () => {
        console.log("Conexão WebSocket estabelecida.");
        websocket.send(JSON.stringify(notificationMessage));
    };

    websocket.onmessage = processMessage;
    websocket.onerror = (error) => {
        console.error("Erro na conexão WebSocket:", error);
    };
};
const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = document.createElement("img");
            img.src = e.target.result;
            img.alt = "Preview";
            // Adicione a imagem ao chat__input
            chatInput.appendChild(img);
        }
        reader.readAsDataURL(file);
    }
};

// Função para enviar uma mensagem
const sendMessage = (event) => {
    event.preventDefault();

    const messageContent = chatInput.value.trim();
    const messageContentIMG = chatInput.querySelector("img");
    let message;

    if (messageContentIMG) {
        // Se houver uma imagem no campo de entrada
        message = {
            userId: user.id,
            userName: user.name,
            userColor: user.color,
            type: "image",
            content: messageContentIMG.src
        };
    } else {
        // Se não houver imagem, enviar mensagem de texto
        if (!messageContent) {
            alert("Por favor, insira uma mensagem válida.");
            return;
        }

        message = {
            userId: user.id,
            userName: user.name,
            userColor: user.color,
            content: messageContent
        };
    }

    if (websocket && websocket.readyState === WebSocket.OPEN) {
        websocket.send(JSON.stringify(message));
        chatInput.innerHTML = "";
    } else {
        console.error("Erro ao enviar a mensagem: conexão WebSocket não está pronta.");
    }
};

// Função para lidar com o envio de imagens


// Adicionando ouvintes de eventos para enviar mensagens e lidar com o login
document.getElementById("file-upload").addEventListener("change", handleFileUpload);
chatForm.addEventListener("submit", sendMessage);
loginForm.addEventListener("submit", handleLogin);
