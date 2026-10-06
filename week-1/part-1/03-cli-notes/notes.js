#!/usr/bin/env node
// NJ-W1-03 — CLI Notes app (add / list / remove) stored in notes.json via fs/promises
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

export const NOTES_FILE = fileURLToPath(new URL('./notes.json', import.meta.url));

export async function loadNotes() {
  try {
    return JSON.parse(await readFile(NOTES_FILE, 'utf8'));
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    throw err;
  }
}

async function saveNotes(notes) {
  await writeFile(NOTES_FILE, JSON.stringify(notes, null, 2));
}

async function add(text) {
  if (!text) throw new Error('Usage: notes add "<text>"');
  const notes = await loadNotes();
  const id = notes.length ? Math.max(...notes.map((n) => n.id)) + 1 : 1;
  const note = { id, text, createdAt: new Date().toISOString() };
  notes.push(note);
  await saveNotes(notes);
  console.log(`Added note #${id}`);
}

async function list() {
  const notes = await loadNotes();
  if (!notes.length) return console.log('No notes yet.');
  for (const n of notes) console.log(`#${n.id}  ${n.text}  (${n.createdAt})`);
}

async function remove(idArg) {
  const id = Number(idArg);
  if (!Number.isInteger(id)) throw new Error('Usage: notes remove <id>');
  const notes = await loadNotes();
  const remaining = notes.filter((n) => n.id !== id);
  if (remaining.length === notes.length) throw new Error(`Note #${id} not found`);
  await saveNotes(remaining);
  console.log(`Removed note #${id}`);
}

async function main() {
  const [command, ...args] = process.argv.slice(2);
  switch (command) {
    case 'add':
      return add(args.join(' '));
    case 'list':
      return list();
    case 'remove':
      return remove(args[0]);
    default:
      console.log('Usage:\n  node notes.js add "<text>"\n  node notes.js list\n  node notes.js remove <id>');
  }
}

// Only run the CLI when executed directly (not when imported by the HTTP server)
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error(`Error: ${err.message}`);
    process.exitCode = 1;
  });
}
