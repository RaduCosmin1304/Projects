const express = require('express');  // Importăm express
const path = require('path');        // Modul nativ pentru manipularea căilor
const { Pool } = require('pg');      // Modul pentru PostgreSQL
const bodyParser = require('body-parser'); // Pentru parsarea datelor din formulare

const app = express();               // Inițializăm aplicația Express
const PORT = 3000;                   // Portul serverului

// Middleware pentru parsarea datelor din formulare (URL-encoded și JSON)
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Conectarea la PostgreSQL
const pool = new Pool({
  user: 'postgres',                // Utilizatorul PostgreSQL
  host: 'localhost',               // Host-ul PostgreSQL
  database: 'comentarii',          // Numele bazei de date
  password: 'Postgres.SQL.1304',   // Parola ta de la PostgreSQL
  port: 5432,                      // Portul PostgreSQL (implicit 5432)
});

// Verificăm conexiunea la baza de date
pool.connect((err) => {
  if (err) {
    console.error('Eroare la conectarea cu baza de date:', err);
  } else {
    console.log('Conectat la baza de date PostgreSQL');
  }
});

// Servirea fișierelor HTML din folderul public
app.use(express.static(path.join(__dirname, 'public')));

// Ruta pentru a servi pagina `page1.html`
app.get('/page1', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'page1.html'));
});

// Ruta pentru a servi pagina `page2.html`
app.get('/page2', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'page2.html'));
});

// Ruta pentru a servi pagina `page3.html`
app.get('/page2/page3', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'page3.html'));
});

// Rută implicită - în caz că utilizatorul încearcă să acceseze o rută neexistentă
app.get('*', (req, res) => {
  res.send('404! Page not found.');
});

// POST: Ruta pentru salvarea datelor din formularul de înregistrare
app.post('/submit', async (req, res) => {
  const { userName, userEmail, userPassword } = req.body;

  try {
    // Inserare în tabela "User"
    const result = await pool.query(
      'INSERT INTO "User" (userName, userEmail, userPassword) VALUES ($1, $2, $3)',
      [userName, userEmail, userPassword]
    );
    res.send('Datele au fost salvate cu succes!');
  } catch (err) {
    console.error('Eroare la inserarea datelor:', err);  // Log detaliat al erorii
    res.status(500).send('A apărut o eroare la salvarea datelor.');
  }
});

// Pornirea serverului
app.listen(PORT, () => {
  console.log(`Serverul rulează la http://localhost:${PORT}`);
});
