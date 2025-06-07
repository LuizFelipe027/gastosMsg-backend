const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const db = new sqlite3.Database('./gastos.db');

db.run(`CREATE TABLE IF NOT EXISTS gastos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    descricao TEXT,
    valor REAL,
    data TEXT
)`);
db.run(`CREATE TABLE IF NOT EXISTS limite (
    chave TEXT PRIMARY KEY,
    valor TEXT
)`);

function getLimite(callback) {
    db.get(`SELECT valor FROM limite WHERE chave = 'limite'`, (err, row) => {
        if (row) callback(parseFloat(row.valor));
        else callback(0);
    });
}

app.post('/webhook', (req, res) => {
    const body = req.body.Body || '';
    const linhas = body.split('\n').map(l => l.trim());
    const data = new Date().toISOString();

    if (linhas.length === 2 && !isNaN(parseFloat(linhas[1]))) {
        const descricao = linhas[0];
        const valor = parseFloat(linhas[1]);

        db.run(`INSERT INTO gastos (descricao, valor, data) VALUES (?, ?, ?)`, [descricao, valor, data], () => {
            db.all(`SELECT SUM(valor) AS total FROM gastos WHERE strftime('%Y-%m', data) = strftime('%Y-%m', 'now')`, (err, rows) => {
                const total = rows[0].total || 0;
                getLimite((limite) => {
                    const restante = limite - total;
                    res.send(`<Response><Message>Total gasto este mês: R$ ${total.toFixed(2)}\nLimite: R$ ${limite.toFixed(2)}\nDisponível: R$ ${restante.toFixed(2)}</Message></Response>`);
                });
            });
        });
    } else if (linhas[0].toLowerCase() === 'limite' && !isNaN(parseFloat(linhas[1]))) {
        const novoLimite = parseFloat(linhas[1]);
        db.run(`INSERT OR REPLACE INTO limite (chave, valor) VALUES ('limite', ?)`, [novoLimite], () => {
            res.send(`<Response><Message>Limite atualizado para R$ ${novoLimite.toFixed(2)}</Message></Response>`);
        });
    } else {
        res.send(`<Response><Message>Formato inválido. Use:\nDescrição\\nValor ou Limite\\nValor</Message></Response>`);
    }
});

app.get('/gastos', (req, res) => {
    db.all('SELECT * FROM gastos ORDER BY data DESC', (err, rows) => res.json(rows));
});

app.post('/gastos', (req, res) => {
    const { descricao, valor } = req.body;
    const data = new Date().toISOString();
    db.run(`INSERT INTO gastos (descricao, valor, data) VALUES (?, ?, ?)`, [descricao, valor, data], function () {
        res.json({ id: this.lastID });
    });
});

app.put('/gastos/:id', (req, res) => {
    const { descricao, valor } = req.body;
    db.run(`UPDATE gastos SET descricao = ?, valor = ? WHERE id = ?`, [descricao, valor, req.params.id], () => {
        res.sendStatus(200);
    });
});

app.delete('/gastos/:id', (req, res) => {
    db.run(`DELETE FROM gastos WHERE id = ?`, [req.params.id], () => {
        res.sendStatus(200);
    });
});

app.get('/limite', (req, res) => {
    getLimite((limite) => res.json({ limite }));
});

app.post('/limite', (req, res) => {
    const { valor } = req.body;
    db.run(`INSERT OR REPLACE INTO limite (chave, valor) VALUES ('limite', ?)`, [valor], () => {
        res.sendStatus(200);
    });
});

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
