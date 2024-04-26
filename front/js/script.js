// login elements
const login = document.querySelector(".login")
const loginForm = login.querySelector(".login__form")
const loginInput = login.querySelector(".login__input")

// chat elements
const chat = document.querySelector(".chat")
const chatForm = chat.querySelector(".chat__form")
const chatInput = chat.querySelector(".chat__input")
const chatMessages = chat.querySelector(".chat__messages")

const colors = [    "cadetblue",    "darkgoldenrod",    "cornflowerblue",    "darkkhaki",    "hotpink",    "gold",    "mediumaquamarine",    "orchid",    "steelblue",    "tomato",    "salmon",    "dodgerblue",    "limegreen",    "slateblue",    "crimson",    "peru",    "indigo",    "teal",    "olive",    "sienna"];

const user = { id: "", name: "", color: "" }

let websocket

const createMessageSelfElement = (content, sender) => {
    const div = document.createElement("div");
    const spanHora = document.createElement("span");
    const dataHoraAtual = new Date();
    const hora = dataHoraAtual.getHours();
    const minutos = dataHoraAtual.getMinutes();

    div.classList.add("message--self");

    // Adicionando o conteúdo e o remetente aos elementos corretos
    const spanContent = document.createElement("span");
    spanContent.textContent = content;
    div.appendChild(spanContent);

    const spanSender = document.createElement("span");
    spanSender.textContent = sender;
    div.appendChild(spanSender);

    spanHora.classList.add("message--time--self");
    spanHora.textContent = `${hora}:${minutos}`;
    div.appendChild(spanHora);

    return div;
};



const createMessageOtherElement = (content, sender, senderColor) => {
    const div = document.createElement("div");
    const spanHora = document.createElement("span");
    const span = document.createElement("span");
    const dataHoraAtual = new Date();
    const hora = dataHoraAtual.getHours();
    const minutos = dataHoraAtual.getMinutes();

    div.classList.add("message--other");

    span.classList.add("message--sender");
    span.style.color = senderColor;
    span.textContent = sender;
    div.appendChild(span);

    div.innerHTML += content;

    // Adicionando o horário depois do conteúdo e do remetente
    div.appendChild(spanHora);
    spanHora.classList.add("message--time--other");
    spanHora.textContent = `${hora}:${minutos}`;

    return div;
};



const getRandomColor = () => {
    const randomIndex = Math.floor(Math.random() * colors.length)
    return colors[randomIndex]
}

const scrollScreen = () => {
    window.scrollTo({
        top: document.body.scrollHeight,
        behavior: "smooth"
    })
}

const processMessage = ({ data }) => {
    const { userId, userName, userColor, content } = JSON.parse(data)

    const message =
        userId == user.id
            ? createMessageSelfElement(content)
            : createMessageOtherElement(content, userName, userColor)

    chatMessages.appendChild(message)

    scrollScreen()
}

const handleLogin = (event) => {
    event.preventDefault();

    user.id = crypto.randomUUID();
    user.name = loginInput.value;
    user.color = getRandomColor();

    login.style.display = "none";
    chat.style.display = "flex";

    console.log(user.name);

    websocket = new WebSocket("wss://clone-chat-online.onrender.com");
    websocket.onmessage = processMessage;

};




const sendMessage = (event) => {
    event.preventDefault();

    const message = {
        userId: user.id,
        userName: user.name,
        userColor: user.color,
        content: chatInput.value
    };

    if (websocket && websocket.readyState === WebSocket.OPEN) {
        websocket.send(JSON.stringify(message));
        chatInput.value = "";
    } else {
        console.error("Erro ao enviar a mensagem: conexão WebSocket não está pronta.");
    }
};




loginForm.addEventListener("submit", handleLogin)
chatForm.addEventListener("submit", sendMessage)
chatForm.addEventListener("submit", sendNotificationLogin)
loginForm.addEventListener("submit", handleLogin);
