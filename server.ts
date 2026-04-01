import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import nodemailer from 'nodemailer';
import { createServer as createViteServer } from 'vite';
import path from 'path';

const app = express();
app.use(cors());
app.use(express.json());

// Inicializace SQLite databáze
const db = new Database('leads.db');
db.pragma('journal_mode = WAL');

// Vytvoření tabulky pro leady
db.exec(`
  CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    service TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Přidání sloupce current_price, pokud ještě neexistuje
try {
  db.exec('ALTER TABLE leads ADD COLUMN current_price TEXT');
} catch (e) {
  // Sloupec už pravděpodobně existuje
}

// Přidání sloupce status, pokud ještě neexistuje
try {
  db.exec("ALTER TABLE leads ADD COLUMN status TEXT DEFAULT 'Nové'");
} catch (e) {
  // Sloupec už pravděpodobně existuje
}

// Přidání sloupce notes, pokud ještě neexistuje
try {
  db.exec("ALTER TABLE leads ADD COLUMN notes TEXT DEFAULT ''");
} catch (e) {
  // Sloupec už pravděpodobně existuje
}

// Nastavení e-mailového klienta (Nodemailer)
// Pro produkci doplňte SMTP údaje do .env souboru
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// API endpoint pro uložení leadu
app.post('/api/leads', async (req, res) => {
  const { name, phone, services, currentPrice } = req.body;
  
  if (!name || !phone) {
    return res.status(400).json({ error: 'Jméno a telefon jsou povinné.' });
  }

  try {
    // Uložení do databáze
    const stmt = db.prepare('INSERT INTO leads (name, phone, service, current_price) VALUES (?, ?, ?, ?)');
    const info = stmt.run(name, phone, services || 'Nezadáno', currentPrice || 'Nezadáno');

    // Odeslání e-mailu
    try {
      await transporter.sendMail({
        from: process.env.SMTP_FROM || '"Lead Systém" <no-reply@example.com>',
        to: 'ludvikremesekwork@gmail.com',
        subject: 'Nový lead z webu!',
        text: `Nová poptávka:\n\nJméno: ${name}\nTelefon: ${phone}\nSlužby: ${services}\nAktuálně platí: ${currentPrice || 'Nezadáno'}\nČas: ${new Date().toLocaleString('cs-CZ')}`,
      });
      console.log('E-mail úspěšně odeslán.');
    } catch (emailErr) {
      console.error('Chyba při odesílání e-mailu:', emailErr);
      // Nechceme, aby selhání e-mailu zablokovalo uložení leadu
    }

    res.json({ success: true, id: info.lastInsertRowid });
  } catch (err) {
    console.error('Chyba databáze:', err);
    res.status(500).json({ error: 'Chyba při ukládání do databáze.' });
  }
});

const ADMIN_USER = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASSWORD || 'VelmiDlouheAHodnetajneHesloProAdmina2026!!!';
const SECRET_TOKEN = 'super-secret-admin-token-987654321';

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    res.json({ success: true, token: SECRET_TOKEN });
  } else {
    res.status(401).json({ error: 'Neplatné přihlašovací údaje.' });
  }
});

const requireAuth = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (authHeader === `Bearer ${SECRET_TOKEN}`) {
    next();
  } else {
    res.status(401).json({ error: 'Neautorizovaný přístup.' });
  }
};

// API endpoint pro získání všech leadů (pro Admin panel)
app.get('/api/leads', requireAuth, (req, res) => {
  try {
    const leads = db.prepare('SELECT * FROM leads ORDER BY created_at DESC').all();
    res.json(leads);
  } catch (err) {
    console.error('Chyba databáze:', err);
    res.status(500).json({ error: 'Chyba při načítání dat z databáze.' });
  }
});

// API endpoint pro aktualizaci statusu
app.put('/api/leads/:id/status', requireAuth, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  try {
    const stmt = db.prepare('UPDATE leads SET status = ? WHERE id = ?');
    stmt.run(status, id);
    res.json({ success: true });
  } catch (err) {
    console.error('Chyba databáze:', err);
    res.status(500).json({ error: 'Chyba při aktualizaci statusu.' });
  }
});

// API endpoint pro aktualizaci poznámky
app.put('/api/leads/:id/notes', requireAuth, (req, res) => {
  const { id } = req.params;
  const { notes } = req.body;
  
  try {
    const stmt = db.prepare('UPDATE leads SET notes = ? WHERE id = ?');
    stmt.run(notes, id);
    res.json({ success: true });
  } catch (err) {
    console.error('Chyba databáze:', err);
    res.status(500).json({ error: 'Chyba při aktualizaci poznámky.' });
  }
});

async function startServer() {
  // Integrace Vite pro vývojové prostředí
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Statické soubory pro produkci
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server běží na portu ${PORT}`);
  });
}

startServer();
