export default class NotesAPI {
  static getAllNotes() {
    const notes = JSON.parse(localStorage.getItem("stickynotes-notes") || "[]");
    return notes;
  }

  static saveNote(noteToSave) {
    console.log("saving:");
    console.log(noteToSave);
    const notes = NotesAPI.getAllNotes();
    const existing = notes.find((note) => note.id == noteToSave.id);
    // Edit/Update
    if (existing) {
      existing.content = noteToSave.content;
      existing.zone = noteToSave.zone;
      existing.impact = noteToSave.impact;
      existing.ignorance = noteToSave.ignorance;
      existing.updated = new Date().toISOString();
    } else {
      noteToSave.id = Math.floor(Math.random() * 1000000);
      noteToSave.updated = new Date().toISOString();
      notes.push(noteToSave);
    }
    localStorage.setItem("stickynotes-notes", JSON.stringify(notes));
  }

  static deleteNote(id) {
    const notes = NotesAPI.getAllNotes();
    const filteredNotes = notes.filter((note) => note.id != id);
    localStorage.setItem("stickynotes-notes", JSON.stringify(filteredNotes));
  }
}
