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

// Přidání sloupce email, pokud ještě neexistuje
try {
  db.exec("ALTER TABLE leads ADD COLUMN email TEXT DEFAULT ''");
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
  const { name, phone, email, services, currentPrice } = req.body;
  
  if (!name || !phone) {
    return res.status(400).json({ error: 'Jméno a telefon jsou povinné.' });
  }

  try {
    // Uložení do databáze
    const stmt = db.prepare('INSERT INTO leads (name, phone, email, service, current_price) VALUES (?, ?, ?, ?, ?)');
    const info = stmt.run(name, phone, email || '', services || 'Nezadáno', currentPrice || 'Nezadáno');

    // Odeslání e-mailu administrátorovi
    try {
      await transporter.sendMail({
        from: process.env.SMTP_FROM || '"Optiva Lead" <info@optiva.cz>',
        to: process.env.SMTP_TO || 'info@optiva.cz',
        subject: 'Nový lead z webu Optiva!',
        text: `Nová poptávka:\n\nJméno: ${name}\nTelefon: ${phone}\nE-mail: ${email || 'Nezadáno'}\nSlužby: ${services}\nAktuálně platí: ${currentPrice || 'Nezadáno'}\nČas: ${new Date().toLocaleString('cs-CZ')}`,
      });
      console.log('E-mail adminovi úspěšně odeslán.');
    } catch (emailErr) {
      console.error('Chyba při odesílání e-mailu adminovi:', emailErr);
    }

    // Odeslání potvrzovacího e-mailu zákazníkovi
    if (email) {
      try {
        await transporter.sendMail({
          from: process.env.SMTP_FROM || '"Optiva" <info@optiva.cz>',
          to: email,
          subject: 'Potvrzení přijetí poptávky - Optiva',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6;">
              <div style="background-color: #1e3a8a; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Optiva</h1>
              </div>
              <div style="padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
                <h2 style="color: #1e3a8a; margin-top: 0;">Dobrý den, ${name},</h2>
                <p>děkujeme za Vaši poptávku. Úspěšně jsme ji přijali a brzy se Vám ozveme s návrhem řešení, jak ušetřit na telekomunikačních službách.</p>
                
                <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0;">
                  <h3 style="margin-top: 0; color: #4b5563; font-size: 16px;">Shrnutí Vaší poptávky:</h3>
                  <ul style="margin: 0; padding-left: 20px; color: #4b5563;">
                    <li><strong>Služby:</strong> ${services || 'Nezadáno'}</li>
                    <li><strong>Aktuální měsíční útrata:</strong> ${currentPrice || 'Nezadáno'}</li>
                    <li><strong>Telefon:</strong> ${phone}</li>
                  </ul>
                </div>
                
                <p>Naši specialisté nyní analyzují aktuální nabídky na trhu, aby pro Vás našli to nejlepší řešení.</p>
                <p>S pozdravem,<br><strong>Tým Optiva</strong></p>
              </div>
              <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
                Toto je automaticky generovaný e-mail, prosím neodpovídejte na něj.
              </div>
            </div>
          `
        });
        console.log('Potvrzovací e-mail zákazníkovi úspěšně odeslán.');
      } catch (customerEmailErr) {
        console.error('Chyba při odesílání e-mailu zákazníkovi:', customerEmailErr);
      }
    }

    res.json({ success: true, id: info.lastInsertRowid });
  } catch (err) {
    console.error('Chyba databáze:', err);
    res.status(500).json({ error: 'Chyba při ukládání do databáze.' });
  }
});

const SECRET_TOKEN = 'super-secret-admin-token-987654321';

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const expectedUser = process.env.ADMIN_USERNAME || 'admin';
  const expectedPass = process.env.ADMIN_PASSWORD || 'VelmiDlouheAHodnetajneHesloProAdmina2026!!!';
  
  if (username === expectedUser && password === expectedPass) {
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
