const express = require("express");
const multer = require("multer");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5555;

// Configuração do multer para upload de imagens
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, path.join(__dirname, "uploads")); // Pasta de destino das imagens
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname); // Nome do arquivo
    }
});

const upload = multer({ storage: storage }).single("image");

// Rota para upload de imagem
app.post("/upload", (req, res) => {
    upload(req, res, (err) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: "Erro ao fazer upload do arquivo" });
        } else {
            res.status(200).json({ message: "Imagem enviada com sucesso" });
        }
    });
});

// Rota para acessar as imagens
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
