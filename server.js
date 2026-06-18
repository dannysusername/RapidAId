import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const distPath = path.join(__dirname, 'dist');

// Serve the built static assets.
app.use(express.static(distPath));

// SPA catch-all: any unknown path returns index.html so React Router
// can handle client-side routes (e.g. a refresh on /dashboard).
// Used as a final middleware (Express 5 rejects a bare '*' route path).
app.use((req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`RapidAid server listening on port ${PORT}`);
});
