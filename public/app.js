const noteForm = document.getElementById('noteForm');
const titleInput = document.getElementById('title');
const contentInput = document.getElementById('content');
const formStatus = document.getElementById('formStatus');
const notesGrid = document.getElementById('notesGrid');
const noteCount = document.getElementById('noteCount');
const refreshBtn = document.getElementById('refreshBtn');
const noteTemplate = document.getElementById('noteTemplate');

const setStatus = (message = '', isError = false) => {
  formStatus.textContent = message;
  formStatus.classList.toggle('error', isError);
};

const formatDate = (dateString) => new Intl.DateTimeFormat('en-IN', {
  dateStyle: 'medium',
  timeStyle: 'short'
}).format(new Date(dateString));

const renderNotes = (notes) => {
  notesGrid.innerHTML = '';
  noteCount.textContent = `${notes.length} ${notes.length === 1 ? 'note' : 'notes'}`;

  if (!notes.length) {
    notesGrid.innerHTML = '<div class="empty-state">No notes yet. Add your first note above.</div>';
    return;
  }

  for (const note of notes) {
    const fragment = noteTemplate.content.cloneNode(true);
    fragment.querySelector('.note-title').textContent = note.title;
    fragment.querySelector('.note-body').textContent = note.content;
    fragment.querySelector('.note-date').textContent = formatDate(note.updatedAt);

    fragment.querySelector('.delete-btn').addEventListener('click', async () => {
      await deleteNote(note.id);
    });

    notesGrid.appendChild(fragment);
  }
};

const loadNotes = async () => {
  notesGrid.innerHTML = '<div class="empty-state">Loading notes…</div>';
  try {
    const response = await fetch('/notes');
    if (!response.ok) throw new Error('Unable to load notes.');
    const notes = await response.json();
    renderNotes(notes);
  } catch (error) {
    notesGrid.innerHTML = `<div class="empty-state">${error.message}</div>`;
  }
};

const addNote = async (event) => {
  event.preventDefault();
  setStatus('Saving…');

  try {
    const response = await fetch('/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: titleInput.value,
        content: contentInput.value
      })
    });

    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || 'Unable to save note.');

    noteForm.reset();
    setStatus('Note added successfully.');
    await loadNotes();
    titleInput.focus();
  } catch (error) {
    setStatus(error.message, true);
  }
};

const deleteNote = async (id) => {
  try {
    const response = await fetch(`/notes/${id}`, { method: 'DELETE' });
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      throw new Error(payload.error || 'Unable to delete note.');
    }
    await loadNotes();
  } catch (error) {
    setStatus(error.message, true);
  }
};

noteForm.addEventListener('submit', addNote);
refreshBtn.addEventListener('click', loadNotes);
loadNotes();
