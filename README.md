# Quick Note Application

A single-page full-stack note-taking web application built for a CRUD/REST API assignment.

## Live Demo

[Open Quick Note Application](https://quick-note-application-9aji.onrender.com/)

## Tech Stack

- **Backend:** Node.js + Express
- **Frontend:** HTML + CSS + Vanilla JavaScript
- **Persistence:** Local JSON file (`data/notes.json`)
- **Communication:** REST API + asynchronous `fetch()`
- **Frontend Hosting:** Netlify
- **Backend Hosting:** Render

## Features

- Create notes without page reloads
- Display all notes from the backend
- Delete individual notes asynchronously
- Bonus: Edit API endpoint (`PUT /notes/:id`) is included for complete CRUD coverage
- Responsive single-page interface
- Health endpoint for deployment platforms

## API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/notes` | Get all notes |
| POST | `/notes` | Create a note |
| PUT | `/notes/:id` | Update a note (bonus) |
| DELETE | `/notes/:id` | Delete a note |
| GET | `/health` | Deployment health check |

### POST/PUT body

```json
{
  "title": "My note",
  "content": "This is the note content."
}
```

## Run Locally

```bash
npm install
npm start
```

Open: `http://localhost:3000`

For development with automatic restart:

```bash
npm run dev
```

## Deploy the backend on Render

1. Push this project to a GitHub repository.
2. In Render, create a **Web Service** from the repository.
3. Use:
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Health Check Path: `/health`
4. Deploy and copy the generated `https://...onrender.com` URL.

## Deploy the frontend on Netlify

The `public/_redirects` file is already included. It proxies `/notes` requests from the Netlify site to the Render backend, so the browser can keep using the same `/notes` API paths.

After the Render service is deployed:

1. Open `public/_redirects`.
2. Replace both occurrences of `https://YOUR-RENDER-APP.onrender.com` with your real Render URL.
3. Save and upload/push that change to GitHub.
4. In Netlify, choose **Add new project → Import an existing project → GitHub** and select this repository.
5. Set **Publish directory** to `public` and leave the build command empty.
6. Deploy.

Netlify will serve the HTML/CSS/JS from `public`, while the rewrite rules send `/notes` API requests to Render.

### Important persistence note

This assignment uses a local JSON store because the brief allows a local JSON store. On a typical free cloud web service, the local filesystem should not be treated as durable production storage. For a production-grade version, replace `data/notes.json` with MongoDB/PostgreSQL.

## GitHub web upload

You do not need Git commands.

1. Create a new public GitHub repository named `quick-note-application`.
2. Open **Add file → Upload files**.
3. Extract the ZIP and upload the contents of this project folder, including the `data`, `public`, and project files.
4. Commit the upload.

Submit:

- GitHub Repository: `https://github.com/<your-username>/quick-note-application`
- Live App: your Netlify URL
