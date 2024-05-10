// Versão 1.0

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

// Versão 2.0

// Definindo variáveis para o usuário e a conexão WebSocket
let user = { id: "", name: "", color: "" };
let websocket;

// Função para obter uma cor aleatória da lista de cores
const getRandomColor = () => {
    const randomIndex = Math.floor(Math.random() * colors.length);
    return colors[randomIndex];
};

const highlightMentions = (messageContent) => {
    // Expressão regular para encontrar menções (@usuário)
    const mentionRegex = /@(\w+)/g;
    return messageContent.replace(mentionRegex, '@$1');
};

// Função para criar um elemento de mensagem genérico
const createMessageElement = (content, messageType, sender = "", senderColor = "") => {
    const div = document.createElement("div");

    div.classList.add("message", messageType);
        // Destaca as menções no conteúdo da mensagem
        content = highlightMentions(content);

    if (sender !== "") {
        const spanSender = document.createElement("span");
        spanSender.textContent = sender;
        spanSender.style.color = senderColor;
        div.appendChild(spanSender);
    }

    const spanContent = document.createElement("span");
    spanContent.textContent = content;
    div.appendChild(spanContent);
    
    // Adicionando ponto de exclamação vermelho se o usuário foi mencionado e é o usuário atual
    if (content.includes(`@${user.name}`)) {
        if (messageType === "message--self") {
            const iconContainer = document.createElement("span");
            iconContainer.classList.add("mention-icon-container-self");
    
            const exclamIcon = document.createElement("span");
            exclamIcon.innerHTML = "&#9888;"; // Ponto de exclamação vermelho
            exclamIcon.style.color = "red";
            exclamIcon.style.marginRight = "5px"; // Margem para separação
            exclamIcon.style.marginTop = "-5px"; // Ajuste de posicionamento
            iconContainer.appendChild(exclamIcon);
            div.appendChild(iconContainer);
        } else if (messageType === "message--other") {
            const iconContainer = document.createElement("span");
            iconContainer.classList.add("mention-icon-container-other");
    
            const exclamIcon = document.createElement("span");
            exclamIcon.innerHTML = "&#9888;"; // Ponto de exclamação vermelho
            exclamIcon.style.color = "red";
            exclamIcon.style.marginRight = "5px"; // Margem para separação
            exclamIcon.style.marginTop = "-5px"; // Ajuste de posicionamento
            iconContainer.appendChild(exclamIcon);
            div.appendChild(iconContainer);
        }
    }

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

// Versão 4.0

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

// Versão 5.0

// Função para criar um elemento de notificação
const createNotificationElement = (content) => {
    const div = document.createElement("div");
    const spanContent = document.createElement("span");

    div.classList.add("notification");
    spanContent.textContent = content;

    div.appendChild(spanContent);

    return div;
};

// Versão 6.0

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

// Versão 7.0

// Função para rolar a tela para a parte inferior
const scrollScreen = () => {
    window.scrollTo({
        top: document.body.scrollHeight,
        behavior: "smooth"
    });
};

// Versão 8.0

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

    websocket = new WebSocket("ws://localhost:5555");

    websocket.onopen = () => {
        console.log("Conexão WebSocket estabelecida.");
        websocket.send(JSON.stringify(notificationMessage));
    };

    websocket.onmessage = processMessage;
    websocket.onerror = (error) => {
        console.error("Erro na conexão WebSocket:", error);
    };
};

// Versão 9.0

// Função para criar o botão de exclusão da imagem
const createDeleteButton = () => {
    const deleteButton = document.createElement("button");
    deleteButton.classList.add("delete-button");
    deleteButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="#ffffff" stroke-width="2"/><line x1="15" y1="9" x2="9" y2="15" stroke="#ffffff" stroke-width="2"/><line x1="15" y1="15" x2="9" y2="9" stroke="#ffffff" stroke-width="2"/></svg>`;

    deleteButton.addEventListener("click", () => {
        // Limpa o preview da imagem e os dados da imagem anexada
        const inputContainer = document.querySelector('.chat__input-container');
        inputContainer.innerHTML = '';
        inputContainer.removeAttribute("data-image-data");
    });

    return deleteButton;
};

// Versão 10.0

// Variável para armazenar a imagem anexada atualmente
let currentImage = null;

// Função para lidar com o envio de arquivo quando o usuário seleciona uma imagem
const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
        // Verifica o tipo do arquivo
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                // Cria o preview da imagem
                const imgPreview = document.createElement("img");
                imgPreview.src = e.target.result;
                imgPreview.alt = "Preview";
                imgPreview.classList.add("image-preview");

                // Cria o botão de exclusão da imagem
                const deleteButton = createDeleteButton();

                // Adiciona a imagem de pré-visualização e o botão de exclusão dentro da barra chat__input
                const inputContainer = document.querySelector('.chat__input-container');
                inputContainer.innerHTML = ''; // Limpa o conteúdo anterior
                inputContainer.appendChild(deleteButton);
                inputContainer.appendChild(imgPreview);

                // Armazena a imagem anexada
                currentImage = e.target.result;
            }
            reader.readAsDataURL(file);
        } else {
            // Se não for uma imagem, exibe uma mensagem de erro
            console.error("O arquivo selecionado não é uma imagem.");
        }
    }
};

// Versão 11.0

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
    img.classList.add("zoomable-image"); // Adicionando uma classe para identificar imagens clicáveis
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

    // Adicionando o ouvinte de eventos para ampliar a imagem quando clicada
    img.addEventListener("click", () => {
        zoomImage(content);
    });

    return div;
};
const zoomImage = (imageUrl) => {
    // Criando um elemento de imagem para a versão ampliada
    const zoomedImage = document.createElement("img");
    zoomedImage.src = imageUrl;
    zoomedImage.classList.add("zoomed-image");

    // Criando um botão de fechar
    const closeButton = document.createElement("button");
    closeButton.classList.add("close-button");
    closeButton.innerHTML = "&times;"; // Adicionando o símbolo 'X'

    // Criando uma camada de fundo escura para destacar a imagem ampliada
    const overlay = document.createElement("div");
    overlay.classList.add("overlay");
    overlay.appendChild(zoomedImage);
    overlay.appendChild(closeButton);

    // Adicionando a camada de sobreposição ao corpo do documento
    document.body.appendChild(overlay);

    // Adicionando um ouvinte de eventos para fechar a imagem ampliada quando clicada fora dela
    overlay.addEventListener("click", (event) => {
        if (event.target === overlay) {
            closeZoomedImage(overlay);
        }
    });

    // Adicionando um ouvinte de eventos para fechar a imagem ampliada quando o botão de fechar é clicado
    closeButton.addEventListener("click", () => {
        closeZoomedImage(overlay);
    });
};

// Função para fechar a imagem ampliada
const closeZoomedImage = (overlay) => {
    overlay.remove();
};


// Versão 12.0

// Função para enviar a mensagem quando o usuário clica no botão de enviar
const sendMessage = (event) => {
    event.preventDefault();

    const messageContent = chatInput.value.trim();
        // Verifica se há menções na mensagem
        const mentions = messageContent.match(/@(\w+)/g);
        let mentionedUsers = [];
        if (mentions) {
            // Extrai os nomes de usuário das menções
            mentionedUsers = mentions.map(mention => mention.substring(1));
        }

    // Verifica se há uma conexão WebSocket aberta
    if (websocket && websocket.readyState === WebSocket.OPEN) {
        // Verifica se há conteúdo de mensagem ou imagem anexada
        if (messageContent || currentImage) {
            // Se há conteúdo de mensagem, envia a mensagem de texto
            if (messageContent) {
                const message = {
                    userId: user.id,
                    userName: user.name,
                    userColor: user.color,
                    content: messageContent
                };
                websocket.send(JSON.stringify(message));
            }
            
            // Se há uma imagem anexada, envia a mensagem com a imagem
            if (currentImage) {
                const message = {
                    userId: user.id,
                    userName: user.name,
                    userColor: user.color,
                    type: "image",
                    content: currentImage
                };
                websocket.send(JSON.stringify(message));
            }

            // Limpa o campo de entrada e os dados da imagem após o envio
            chatInput.value = "";
            currentImage = null;
            const inputContainer = document.querySelector('.chat__input-container');
            inputContainer.innerHTML = '';
        } else {
            console.log("Nenhuma mensagem significativa para enviar.");
        }
    } else {
        console.error("Erro ao enviar a mensagem: conexão WebSocket não está pronta.");
    }
};  

// Versão 13.0

// Adicionando ouvintes de eventos para enviar mensagens e lidar com o login
document.getElementById("file-upload").addEventListener("change", handleFileUpload);
chatForm.addEventListener("submit", sendMessage);
loginForm.addEventListener("submit", handleLogin);
    
