const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./loto.db");

db.run(`
CREATE TABLE IF NOT EXISTS game_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  room TEXT,
  host TEXT,
  winner TEXT,
  prize INTEGER,
  called_numbers TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

module.exports = db;
