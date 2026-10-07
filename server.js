const express = require('express');
const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'notes.json');

app.use(express.json({ limit: '50kb' }));
app.use(express.static(path.join(__dirname, 'public')));

async function ensureStore() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, '[]\n', 'utf8');
  }
}

async function readNotes() {
  await ensureStore();
  const raw = await fs.readFile(DATA_FILE, 'utf8');
  try {
    const notes = JSON.parse(raw);
    return Array.isArray(notes) ? notes : [];
  } catch {
    throw new Error('The notes store contains invalid JSON.');
  }
}

async function writeNotes(notes) {
  await ensureStore();
  await fs.writeFile(DATA_FILE, JSON.stringify(notes, null, 2) + '\n', 'utf8');
}

function validateNoteInput(body) {
  const title = typeof body.title === 'string' ? body.title.trim() : '';
  const content = typeof body.content === 'string' ? body.content.trim() : '';

  if (!title || !content) {
    return { error: 'Title and content are required.' };
  }
  if (title.length > 120) {
    return { error: 'Title must be 120 characters or fewer.' };
  }
  if (content.length > 5000) {
    return { error: 'Content must be 5000 characters or fewer.' };
  }
  return { title, content };
}

// GET /notes - return all notes
app.get('/notes', async (req, res, next) => {
  try {
    const notes = await readNotes();
    notes.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    res.json(notes);
  } catch (error) {
    next(error);
  }
});

// POST /notes - create a note
app.post('/notes', async (req, res, next) => {
  try {
    const input = validateNoteInput(req.body || {});
    if (input.error) return res.status(400).json({ error: input.error });

    const notes = await readNotes();
    const now = new Date().toISOString();
    const note = {
      id: crypto.randomUUID(),
      title: input.title,
      content: input.content,
      createdAt: now,
      updatedAt: now
    };

    notes.push(note);
    await writeNotes(notes);
    res.status(201).json(note);
  } catch (error) {
    next(error);
  }
});

// PUT /notes/:id - update a note (bonus CRUD endpoint)
app.put('/notes/:id', async (req, res, next) => {
  try {
    const input = validateNoteInput(req.body || {});
    if (input.error) return res.status(400).json({ error: input.error });

    const notes = await readNotes();
    const index = notes.findIndex((note) => note.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Note not found.' });

    notes[index] = {
      ...notes[index],
      title: input.title,
      content: input.content,
      updatedAt: new Date().toISOString()
    };

    await writeNotes(notes);
    res.json(notes[index]);
  } catch (error) {
    next(error);
  }
});

// DELETE /notes/:id - delete a single note
app.delete('/notes/:id', async (req, res, next) => {
  try {
    const notes = await readNotes();
    const exists = notes.some((note) => note.id === req.params.id);
    if (!exists) return res.status(404).json({ error: 'Note not found.' });

    const remaining = notes.filter((note) => note.id !== req.params.id);
    await writeNotes(remaining);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// Health check for deployment platforms
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'quick-note-application' });
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ error: 'Internal server error.' });
});

ensureStore()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Quick Note running at http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Failed to initialize note store:', error);
    process.exit(1);
  });
