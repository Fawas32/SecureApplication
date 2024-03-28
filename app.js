// app.js
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const PORT = 3000;

// Database setup
const db = new sqlite3.Database(':memory:', (err) => {
  if (err) {
    return console.error(err.message);
  }
  console.log('Connected to the in-memory SQlite database.');
});

// Create a table
db.run('CREATE TABLE greetings(id INTEGER PRIMARY KEY, message TEXT)', (err) => {
  if (err) {
    return console.log(err.message);
  }
  console.log('Table created');
  // Insert a row into the table
  const sql = `INSERT INTO greetings (message) VALUES (?)`;
  db.run(sql, ['Hello, world!'], (err) => {
    if (err) {
      return console.log(err.message);
    }
    console.log('A row has been inserted');
  });
});

// Serve static files from the 'public' folder
app.use(express.static('public'));

// Route setup
app.get('/notes', (req, res) => {
  db.all('SELECT message FROM greetings', (err, rows) => {
    if (err) {
      return console.error(err.message);
    }
    res.json(rows);
  });
});

app.post('/add-note', express.json(), (req, res) => {
  const note = req.body.note;
  if (!note || typeof note !== 'string') {
    return res.status(400).send('Invalid note format');
  }

  const sql = 'INSERT INTO greetings (message) VALUES (?)';
  db.run(sql, [note], (err) => {
    if (err) {
      return res.status(500).send('Failed to add note');
    }
    res.sendStatus(200);
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Close the database connection when the application is terminated
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log('Database connection closed.');
    server.close(() => {
      console.log('Server closed.');
      process.exit(0);
    });
  });
});
