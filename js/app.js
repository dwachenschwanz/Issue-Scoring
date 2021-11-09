import NotesAPI from "./NotesAPI.js";
import ScoringView from "./ScoringView.js";

const noteColors = ["#A086FF", "#ECA2C4", "#FFF9B2", "#A0D786"];

export default class App {
  constructor(root) {
    this.notes = [];
    this.view = new ScoringView(root, this._handlers());
    this._refreshNotes();

    this.view.gridboxes.forEach((container, index) => {
      container.addEventListener("dragover", (e) => {
        e.preventDefault();
        const draggable = document.querySelector(".dragging");
        container.appendChild(draggable);
      });
    });
  }

  _refreshNotes() {
    const notes = NotesAPI.getAllNotes();
    this.notes = notes;
    this.view.updateNotes(notes);
    this.view.adjustFontSize();
  }

  _handlers() {
    return {
      onNoteAdd: () => {
        const newNote = {
          id: Math.floor(Math.random() * 1000000),
          content: "",
          zone: 0,
          impact: 1,
          ignorance: 1,
          // backgroundIndex: getRandomInt(0, 3),
          backgroundColor: noteColors[getRandomInt(0, 3)],
        };
        NotesAPI.saveNote(newNote);
        this.view.addNoteElement(newNote);
      },
      onNoteEdit: (element) => {
        const notes = NotesAPI.getAllNotes();
        const targetNote = notes.filter(
          (note) => note.id == element.dataset.noteId
        )[0];
        targetNote.content = element.innerText;
        NotesAPI.saveNote(targetNote);
      },

      onNoteDelete: (element) => {
        NotesAPI.deleteNote(element.dataset.noteId);
      },

      onNoteDragEnd: (element) => {
        console.log("End of Drag");
        const notes = NotesAPI.getAllNotes();
        const updatedNote = {
          id: element.dataset.noteId,
          content: element.innerText,
          impact: element.parentNode.dataset.xValue,
          ignorance: element.parentNode.dataset.yValue,
          zone: element.zone,
        };
        NotesAPI.saveNote(updatedNote);
      },
    };
  }
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
