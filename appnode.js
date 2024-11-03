const http = require('http'); // Modul HTTP nativ din Node.js pentru crearea unui server
const path = require('path'); // Modul pentru manipularea căilor fișierelor și directoarelor
const fs = require('fs');     // Modul pentru lucrul cu fișiere (citire, scriere, etc.)
const { Pool } = require('pg'); // Modul pentru interacțiunea cu o bază de date PostgreSQL

const PORT = 3000; // Portul pe care serverul va asculta cererile (localhost:3000)

// Configurarea conexiunii la PostgreSQL cu detalii despre utilizator și bază de date
const pool = new Pool({
  user: 'postgres',         // Numele utilizatorului pentru PostgreSQL
  host: 'localhost',        // Host-ul bazei de date (local în acest caz)
  database: 'comentarii',   // Numele bazei de date
  password: 'Postgres.SQL.1304', // Parola pentru baza de date
  port: 5432,               // Portul PostgreSQL (implicit 5432)
});

// Verificăm conexiunea la baza de date
pool.connect((err) => {
  if (err) {
    console.error('Eroare la conectarea cu baza de date:', err); // Mesaj de eroare în caz de eșec
  } else {
    console.log('Conectat la baza de date PostgreSQL'); // Confirmare pentru conexiune reușită
  }
});

// Funcție pentru parsarea datelor din cererile POST (formulare) într-un obiect JavaScript
function parseRequestBody(req, callback) {
  let body = ''; // Inițializăm un string gol pentru a colecta datele corpului cererii
  req.on('data', chunk => { // În fiecare pachet de date primit:
    body += chunk.toString(); // Adăugăm conținutul la `body` ca string
  });
  req.on('end', () => { // La sfârșitul transmiterii:
    const parsedBody = new URLSearchParams(body); // Parsăm datele într-un URLSearchParams
    const result = {}; // Creăm un obiect pentru a stoca datele
    for (const [key, value] of parsedBody.entries()) { // Parcurgem toate perechile cheie-valoare
      result[key] = value; // Adăugăm fiecare pereche în obiectul `result`
    }
    callback(result); // Returnăm obiectul rezultat prin callback
  });
}

// Creăm serverul HTTP pentru a răspunde la cererile de GET și POST
const server = http.createServer((req, res) => {
  if (req.method === 'GET') { // Dacă metoda cererii este GET:
    // Verificăm ruta pentru `page1.html`
    if (req.url === '/page1') {
      fs.readFile(path.join(__dirname, 'public', 'page1.html'), (err, data) => {
        if (err) { // Dacă apare o eroare la citirea fișierului:
          res.writeHead(500, { 'Content-Type': 'text/plain' }); // Setăm headerul de eroare
          res.end('Eroare la încărcarea paginii.'); // Trimitem un mesaj de eroare
        } else { // Dacă citirea fișierului reușește:
          res.writeHead(200, { 'Content-Type': 'text/html' }); // Setăm headerul pentru HTML
          res.end(data); // Trimitem conținutul fișierului HTML
        }
      });
    }
    // Verificăm ruta pentru `page2.html`
    else if (req.url === '/page2') {
      fs.readFile(path.join(__dirname, 'public', 'page2.html'), (err, data) => {
        if (err) {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Eroare la încărcarea paginii.');
        } else {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(data);
        }
      });
    }
    // Verificăm ruta pentru `page3.html`
    else if (req.url === '/page2/page3') {
      fs.readFile(path.join(__dirname, 'public', 'page3.html'), (err, data) => {
        if (err) {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Eroare la încărcarea paginii.');
        } else {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(data);
        }
      });
    }
    // Dacă nicio rută specificată nu este găsită:
    else {
      res.writeHead(404, { 'Content-Type': 'text/plain' }); // Setăm statusul pentru 404
      res.end('404! Page not found.'); // Mesaj de pagină negăsită
    }
  } 
  // Dacă metoda cererii este POST și ruta este `/submit`:
  else if (req.method === 'POST' && req.url === '/submit') {
    // Folosim `parseRequestBody` pentru a obține datele trimise în formular
    parseRequestBody(req, async (parsedBody) => {
      const { userName, userEmail, userPassword } = parsedBody; // Extragem câmpurile

      try {
        // Inserăm datele în baza de date
        await pool.query(
          'INSERT INTO "User" (userName, userEmail, userPassword) VALUES ($1, $2, $3)',
          [userName, userEmail, userPassword]
        );
        res.writeHead(200, { 'Content-Type': 'text/plain' }); // Status pentru succes
        res.end('Datele au fost salvate cu succes!'); // Mesaj de succes
      } catch (err) { // În caz de eroare la inserare:
        console.error('Eroare la inserarea datelor:', err); // Logăm eroarea în consolă
        res.writeHead(500, { 'Content-Type': 'text/plain' }); // Status de eroare
        res.end('A apărut o eroare la salvarea datelor.'); // Mesaj de eroare
      }
    });
  }
});

// Pornim serverul pe portul specificat și afișăm un mesaj în consolă
server.listen(PORT, () => {
  console.log(`Serverul rulează la http://localhost:${PORT}`);
});
