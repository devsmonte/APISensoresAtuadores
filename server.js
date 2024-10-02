// server.js

// Importando as dependências necessárias
const express = require('express'); // Framework para criar APIs
const bodyParser = require('body-parser'); // Middleware para parsear requisições JSON
const cors = require('cors'); // Middleware para habilitar CORS
const sqlite3 = require('sqlite3').verbose(); // Biblioteca para interação com o SQLite
const path = require('path'); // Módulo para manipulação de caminhos de arquivos

// Inicializa o aplicativo Express
const app = express();

// Define a porta onde o servidor vai rodar
const PORT = 3000;

// Middleware para habilitar CORS
app.use(cors()); // Isso permite que a API seja acessada de qualquer origem

// Middleware para que o Express entenda requisições com corpo JSON
app.use(bodyParser.json());

// Define o caminho do banco de dados SQLite
const dbPath = path.join(__dirname, 'banco.db'); // Nome do banco de dados

// Cria ou abre o banco de dados
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("Erro ao abrir o banco de dados:", err.message);
    } else {
        console.log("Banco de dados conectado com sucesso!");
        
        // Criação da tabela de sensores, caso não exista
        db.run(`CREATE TABLE IF NOT EXISTS sensores (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL UNIQUE,
            temperatura REAL NOT NULL,
            alerta_temperatura INTEGER NOT NULL DEFAULT 0,
            umidade REAL NOT NULL,
            alerta_umidade INTEGER NOT NULL DEFAULT 0
        );`, (err) => {
            if (err) {
                console.error("Erro ao criar a tabela de sensores:", err.message);
            }
        });

        // Criação da tabela de atuadores, caso não exista
        db.run(`CREATE TABLE IF NOT EXISTS atuadores (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL UNIQUE,
            status INTEGER NOT NULL DEFAULT 0
        );`, (err) => {
            if (err) {
                console.error("Erro ao criar a tabela de atuadores:", err.message);
            }
        });
    }
});

// Definindo os limites para gerar alertas de temperatura e umidade
const LIMITE_SUPERIOR_TEMP = 30; // Limite superior da temperatura
const LIMITE_INFERIOR_TEMP = 10;  // Limite inferior da temperatura
const LIMITE_SUPERIOR_UMIDADE = 80; // Limite superior da umidade
const LIMITE_INFERIOR_UMIDADE = 20; // Limite inferior da umidade

// Função para calcular se há alerta de temperatura ou umidade
function calcularAlertas(temperatura, umidade) {
    const alertaTemperatura = (temperatura > LIMITE_SUPERIOR_TEMP || temperatura < LIMITE_INFERIOR_TEMP) ? 1 : 0;
    const alertaUmidade = (umidade > LIMITE_SUPERIOR_UMIDADE || umidade < LIMITE_INFERIOR_UMIDADE) ? 1 : 0;
    return { alertaTemperatura, alertaUmidade };
}

// Rota para cadastrar um novo sensor
app.post('/sensores', (req, res) => {
    const { nome, temperatura, umidade } = req.body;

    // Verifica se todos os campos necessários foram preenchidos
    if (!nome || temperatura === undefined || umidade === undefined) {
        return res.status(400).json({ error: "Todos os campos devem ser preenchidos." });
    }

    const { alertaTemperatura, alertaUmidade } = calcularAlertas(temperatura, umidade);

    // Insere o sensor no banco de dados
    db.run(`INSERT INTO sensores (nome, temperatura, alerta_temperatura, umidade, alerta_umidade) VALUES (?, ?, ?, ?, ?)`,
        [nome, temperatura, alertaTemperatura, umidade, alertaUmidade],
        function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.status(201).json({
                id: this.lastID,
                nome,
                temperatura,
                alerta_temperatura: alertaTemperatura,
                umidade,
                alerta_umidade: alertaUmidade
            });
        });
});

// Rota para consultar todos os sensores
app.get('/sensores', (req, res) => {
    db.all(`SELECT * FROM sensores`, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Rota para consultar um sensor específico pelo ID
app.get('/sensores/:id', (req, res) => {
    const { id } = req.params;
    db.get(`SELECT * FROM sensores WHERE id = ?`, [id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ error: "Sensor não encontrado." });
        }
        res.json(row);
    });
});

// Rota para cadastrar um novo atuador
app.post('/atuadores', (req, res) => {
    const { nome } = req.body; // Extraindo apenas o nome do corpo da requisição

    // Verifica se o campo nome foi preenchido
    if (!nome) {
        return res.status(400).json({ error: "O nome deve ser preenchido." });
    }

    // Insere o atuador no banco de dados
    db.run(`INSERT INTO atuadores (nome) VALUES (?)`, [nome],
        function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.status(201).json({
                id: this.lastID, // ID do atuador inserido
                nome,
                status: 0 // Status padrão definido como 0
            });
        });
});

// Rota para atualizar o status de um atuador pelo ID
app.put('/atuadores/:id', (req, res) => {
    const id = req.params.id; // Obtém o ID do atuador
    const { status } = req.body; // Obtém o novo status do corpo da requisição

    // Verifica se o status foi fornecido
    if (status === undefined) {
        return res.status(400).json({ error: "O status deve ser fornecido." });
    }

    // Atualiza o status do atuador no banco de dados
    db.run(`UPDATE atuadores SET status = ? WHERE id = ?`, [status, id], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        // Verifica se o atuador foi encontrado
        if (this.changes === 0) {
            return res.status(404).json({ error: "Atuador não encontrado." });
        }
        res.status(200).json({ message: "Status atualizado com sucesso." });
    });
});

// Rota para consultar todos os atuadores
app.get('/atuadores', (req, res) => {
    db.all(`SELECT * FROM atuadores`, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Rota para consultar um atuador pelo ID
app.get('/atuadores/:id', (req, res) => {
    const id = req.params.id; // Obtém o ID passado na URL

    // Consulta o atuador no banco de dados pelo ID
    db.get(`SELECT * FROM atuadores WHERE id = ?`, [id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ error: "Atuador não encontrado." });
        }
        res.json(row); // Retorna o atuador encontrado
    });
});

// Rota para atualizar as informações de um sensor pelo ID
app.put('/sensores/:id', (req, res) => {
    const id = req.params.id; // Obtém o ID do sensor
    const { nome, temperatura, umidade } = req.body; // Obtém os novos valores do corpo da requisição

    // Verifica se todos os campos foram fornecidos
    if (!nome || temperatura === undefined || umidade === undefined) {
        return res.status(400).json({ error: "Todos os campos devem ser preenchidos." });
    }

    const { alertaTemperatura, alertaUmidade } = calcularAlertas(temperatura, umidade);

    // Atualiza os dados do sensor no banco de dados
    db.run(`UPDATE sensores SET nome = ?, temperatura = ?, alerta_temperatura = ?, umidade = ?, alerta_umidade = ? WHERE id = ?`,
        [nome, temperatura, alertaTemperatura, umidade, alertaUmidade, id],
        function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            // Verifica se o sensor foi encontrado
            if (this.changes === 0) {
                return res.status(404).json({ error: "Sensor não encontrado." });
            }
            res.status(200).json({ message: "Sensor atualizado com sucesso." });
        });
});

// Inicia o servidor e faz com que ele comece a escutar na porta definida
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
