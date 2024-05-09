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
const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
        // Verifica o tipo do arquivo
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const imgPreview = document.createElement("img");
                imgPreview.src = e.target.result;
                imgPreview.alt = "Preview";
                imgPreview.classList.add("image-preview");
                
                // Adicione a imagem de pré-visualização dentro da barra chat__input
                const inputContainer = document.querySelector('.chat__input-container');
                inputContainer.innerHTML = ''; // Limpa o conteúdo anterior
                inputContainer.appendChild(imgPreview);

                // Armazena a imagem para ser enviada posteriormente
                inputContainer.dataset.imageData = e.target.result;
            }
            reader.readAsDataURL(file);
        } else {
            // Se não for uma imagem, exibe uma mensagem de erro
            console.error("O arquivo selecionado não é uma imagem.");
        }
    }
};
const createImageMessageElement = (content, sender, senderColor) => {
    const div = document.createElement("div");

    if (sender === user.name) {
        div.classList.add("message", "message--self");
    } else {
        div.classList.add("message", "message--other");
    }

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

    spanHora.classList.add("message--time");

    if (sender === user.name) {
        spanHora.classList.add("message--time--self");
    } else {
        spanHora.classList.add("message--time--other");
    }

    spanHora.textContent = `${hora}:${minutos}`;
    div.appendChild(spanHora);

    return div;
};
const sendMessage = (event) => {
    event.preventDefault();

    const messageContent = chatInput.value.trim();
    const imageData = document.querySelector('.chat__input-container').dataset.imageData;

    // Verifica se há conteúdo de mensagem ou imagem
    if (imageData || messageContent) {
       
        const message = {
            userId: user.id,
            userName: user.name,
            userColor: user.color,
            image: imageData || null,
            content: messageContent || null
        };

        // Adiciona a mensagem de imagem ao chat apenas se o campo de texto estiver vazio
        if (imageData && !messageContent) {
            const img = document.createElement("img");
            img.src = imageData;
            img.alt = "Preview";
           
            const imageMessage = createImageMessageElement(img.src, user.name, user.color);
            chatMessages.appendChild(imageMessage);
            
            // Atualiza o valor do campo de entrada para "IMG"
            chatInput.value = "IMG";
        }

        // Verifica se há uma conexão WebSocket aberta e envia a mensagem
        (websocket && websocket.readyState === WebSocket.OPEN) ?
            (websocket.send(JSON.stringify(message)),
                (chatInput.value = "",
                    document.querySelector('.chat__input-container').innerHTML = '')) :
            console.error("Erro ao enviar a mensagem: conexão WebSocket não está pronta.");
    } else {
        console.log("Nenhuma mensagem significativa para enviar.");
        // Marca o campo de entrada de texto como requerido se nenhum conteúdo estiver presente
       
    }
};

  
  




// Função para lidar com o envio de imagens


// Adicionando ouvintes de eventos para enviar mensagens e lidar com o login
document.getElementById("file-upload").addEventListener("change", handleFileUpload);
chatForm.addEventListener("submit", sendMessage);
loginForm.addEventListener("submit", handleLogin);
