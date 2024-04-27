const login = document.querySelector(".login");
const loginForm = login.querySelector(".login__form");
const loginInput = login.querySelector(".login__input");

const chat = document.querySelector(".chat");
const chatForm = chat.querySelector(".chat__form");
const chatInput = chat.querySelector(".chat__input");
const chatMessages = chat.querySelector(".chat__messages");

const colors = ["cadetblue", "darkgoldenrod", "cornflowerblue", "darkkhaki", "hotpink", "gold", "mediumaquamarine", "orchid", "steelblue", "tomato", "salmon", "dodgerblue", "limegreen", "slateblue", "crimson", "peru", "indigo", "teal", "olive", "sienna"];

let user = { id: "", name: "", color: "" };
let websocket;

const createMessageSelfElement = (content) => {
    const div = createMessageElement(content, "message--self", user.name, user.color);
    return div;
};

const createMessageOtherElement = (content, sender, senderColor) => {
    const div = createMessageElement(content, "message--other", sender, senderColor);
    return div;
};

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



const getRandomColor = () => {
    const randomIndex = Math.floor(Math.random() * colors.length);
    return colors[randomIndex];
};

const scrollScreen = () => {
    window.scrollTo({
        top: document.body.scrollHeight,
        behavior: "smooth"
    });
};

const processMessage = ({ data }) => {
    const { userId, userName, userColor, content, type } = JSON.parse(data);

    if (type === "notification") {
        const notification = createNotificationElement(content);
        chatMessages.appendChild(notification);
    } else {
        const message = userId === user.id ?
            createMessageSelfElement(content) :
            createMessageOtherElement(content, userName, userColor);

        chatMessages.appendChild(message);
    }

    scrollScreen();
};

const createNotificationElement = (content) => {
    const div = document.createElement("div");
    const spanContent = document.createElement("span");

    div.classList.add("notification");
    spanContent.textContent = content;

    div.appendChild(spanContent);

    return div;
};


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
        content: `${user.name} entrou na sala.`
    };

    websocket = new WebSocket("wss://clone-chat-online.onrender.com");

    websocket.onopen = () => {
        console.log("Conexão WebSocket estabelecida.");
        websocket.send(JSON.stringify(notificationMessage));
    };

    websocket.onmessage = processMessage;
    websocket.onerror = (error) => {
        console.error("Erro na conexão WebSocket:", error);
    };
};


const sendMessage = (event) => {
    event.preventDefault();

    const messageContent = chatInput.value.trim();

    if (!messageContent) {
        alert("Por favor, insira uma mensagem válida.");
        return;
    }

    const message = {
        userId: user.id,
        userName: user.name,
        userColor: user.color,
        content: messageContent
    };

    if (websocket && websocket.readyState === WebSocket.OPEN) {
        websocket.send(JSON.stringify(message));
        chatInput.value = "";
    } else {
        console.error("Erro ao enviar a mensagem: conexão WebSocket não está pronta.");
    }
};


chatForm.addEventListener("submit", sendMessage);
loginForm.addEventListener("submit", handleLogin);
