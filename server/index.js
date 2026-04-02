import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Needed for __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the 'dist' directory (if it exists)
const distPath = resolve(__dirname, '..', 'dist');
app.use(express.static(distPath));

// Database Setup
const dbPath = resolve(__dirname, '..', 'bookings.db');

const sqlite = sqlite3.verbose();

const db = new sqlite.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database at ' + dbPath);

        // 1. Create table if not exists (Original schema)
        db.run(`CREATE TABLE IF NOT EXISTS bookings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            serviceId TEXT,
            date TEXT,
            time TEXT,
            clientName TEXT,
            clientEmail TEXT,
            clientPhone TEXT,
            bikeModel TEXT
        )`, (err) => {
            if (!err) {
                // 2. Migration: Try to add adminNotes column if it doesn't exist.
                // SQLite doesn't have "ADD COLUMN IF NOT EXISTS", so we try and ignore error if it exists.
                db.run(`ALTER TABLE bookings ADD COLUMN adminNotes TEXT`, (err) => {
                    if (err && !err.message.includes('duplicate column name')) {
                        console.log("Error adding adminNotes:", err.message);
                    }
                });

                // 3. Migration: Add 'completed' column (integer 0 or 1)
                db.run(`ALTER TABLE bookings ADD COLUMN completed INTEGER DEFAULT 0`, (err) => {
                    if (err && !err.message.includes('duplicate column name')) {
                        console.log("Error adding completed column:", err.message);
                    } else {
                        console.log("Schema updated: completed column added.");
                    }
                });

                // 4. Create Settings table
                db.run(`CREATE TABLE IF NOT EXISTS settings (
                    key TEXT PRIMARY KEY,
                    value TEXT
                )`, (err) => {
                    if (!err) {
                        // Initialize default settings if they don't exist
                        const defaults = [
                            ['businessName', 'CycleFix'],
                            ['adminPassword', 'admin123'],
                            ['businessLogo', 'bike'] // key of lucide icon or a URL
                        ];

                        defaults.forEach(([key, val]) => {
                            db.run(`INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)`, [key, val]);
                        });
                    }
                });

                // 5. Create Services table
                db.run(`CREATE TABLE IF NOT EXISTS services (
                    id TEXT PRIMARY KEY,
                    title TEXT,
                    description TEXT,
                    price TEXT,
                    icon TEXT
                )`, (err) => {
                    if (!err) {
                        const defaultServices = [
                            ['tuneup', 'Tune-Up Completo', 'Limpieza profunda, ajuste de cambios y frenos, lubricación premium.', '$50.000', 'wrench'],
                            ['flatfix', 'Reparación Pinchazo', 'Solución rápida para pinchazos y ajustes menores en el acto.', '$15.000', 'bike'],
                            ['repair', 'Reparación General', 'Desarme completo, revisión de rodamientos y centrado de ruedas.', '$40.000', 'zap']
                        ];
                        defaultServices.forEach(([id, title, desc, price, icon]) => {
                            db.run(`INSERT OR IGNORE INTO services (id, title, description, price, icon) VALUES (?, ?, ?, ?, ?)`, [id, title, desc, price, icon]);
                        });
                    }
                });
            }
        });
    }
});

// Routes

// Get all bookings
app.get('/api/bookings', (req, res) => {
    db.all("SELECT * FROM bookings ORDER BY createdAt DESC", [], (err, rows) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({ data: rows });
    });
});

// Create a new booking
app.post('/api/bookings', (req, res) => {
    const { service, date, time, userData } = req.body;

    // Validate basic data
    if (!service || !date || !time || !userData) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const { name, email, phone, bikeModel } = userData;

    const sql = `INSERT INTO bookings (serviceId, date, time, clientName, clientEmail, clientPhone, bikeModel) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const params = [service, date, time, name, email, phone, bikeModel];

    db.run(sql, params, function (err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({
            message: 'Booking created successfully',
            data: { id: this.lastID, ...req.body }
        });
    });
});

// Update booking (notes, status, or client info)
app.patch('/api/bookings/:id', (req, res) => {
    const { adminNotes, completed, clientName, clientPhone, bikeModel } = req.body;
    const { id } = req.params;

    let sql = `UPDATE bookings SET `;
    let params = [];
    const updates = [];

    if (adminNotes !== undefined) {
        updates.push(`adminNotes = ?`);
        params.push(adminNotes);
    }

    if (completed !== undefined) {
        updates.push(`completed = ?`);
        params.push(completed ? 1 : 0);
    }

    if (clientName !== undefined) {
        updates.push(`clientName = ?`);
        params.push(clientName);
    }

    if (clientPhone !== undefined) {
        updates.push(`clientPhone = ?`);
        params.push(clientPhone);
    }

    if (bikeModel !== undefined) {
        updates.push(`bikeModel = ?`);
        params.push(bikeModel);
    }

    if (updates.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
    }

    sql += updates.join(', ') + ` WHERE id = ?`;
    params.push(id);

    db.run(sql, params, function (err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({
            message: 'Booking updated successfully',
            data: { id, ...req.body },
            changes: this.changes
        });
    });
});

// Delete a booking
app.delete('/api/bookings/:id', (req, res) => {
    const { id } = req.params;
    
    db.run("DELETE FROM bookings WHERE id = ?", [id], function (err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({ message: 'Booking deleted successfully', changes: this.changes });
    });
});

// Settings Endpoints
app.get('/api/settings', (req, res) => {
    db.all("SELECT * FROM settings", [], (err, rows) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        const settings = {};
        rows.forEach(row => settings[row.key] = row.value);
        res.json({ data: settings });
    });
});

app.patch('/api/settings', (req, res) => {
    const updates = req.body; // e.g., { businessName: 'New Name', ... }
    const keys = Object.keys(updates);

    if (keys.length === 0) {
        return res.status(400).json({ error: 'No settings to update' });
    }

    db.serialize(() => {
        const stmt = db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)");
        keys.forEach(key => {
            stmt.run(key, updates[key]);
        });
        stmt.finalize((err) => {
            if (err) {
                res.status(400).json({ error: err.message });
                return;
            }
            res.json({ message: 'Settings updated successfully' });
        });
    });
});

// Services Endpoints
app.get('/api/services', (req, res) => {
    db.all("SELECT * FROM services", [], (err, rows) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({ data: rows });
    });
});

app.patch('/api/services/:id', (req, res) => {
    const { title, description, price, icon } = req.body;
    const { id } = req.params;

    let sql = `UPDATE services SET `;
    let params = [];
    const updates = [];

    if (title !== undefined) { updates.push(`title = ?`); params.push(title); }
    if (description !== undefined) { updates.push(`description = ?`); params.push(description); }
    if (price !== undefined) { updates.push(`price = ?`); params.push(price); }
    if (icon !== undefined) { updates.push(`icon = ?`); params.push(icon); }

    if (updates.length === 0) return res.status(400).json({ error: 'No fields to update' });

    sql += updates.join(', ') + ` WHERE id = ?`;
    params.push(id);

    db.run(sql, params, function (err) {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ message: 'Service updated successfully', changes: this.changes });
    });
});

// Catch-all route to serve the React index.html for SPA (essential for React Router)
app.get('*', (req, res) => {
    res.sendFile(resolve(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
