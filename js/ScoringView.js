const noteColors = ["#A086FF", "#ECA2C4", "#FFF9B2", "#A0D786"];

export default class ScoringView {
  constructor(
    root,
    { onNoteAdd, onNoteEdit, onNoteDelete, onNoteDragEnd } = {}
  ) {
    this.root = root;
    this.onNoteAdd = onNoteAdd;
    this.onNoteEdit = onNoteEdit;
    this.onNoteDelete = onNoteDelete;
    this.onNoteDragEnd = onNoteDragEnd;

    this.root.innerHTML = "";

    // x-axis titles and subtitles plus 'Add Button'
    this.root.innerHTML += `
      <!-- x-axis labeling -->
      <!-- First Row -->
      <div id="x-sub-0"></div>
      <div id="x-sub-1">Small</div>
      <div id="x-sub-2">Impact</div>
      <div id="x-sub-3">Big</div>

      <!-- Second Row -->
      <button class="add-note" type="button">+</button>
      <div></div>
      <div></div>
    `;
    // Column labeling
    for (let i = 1; i <= 9; ++i) {
      this.root.innerHTML += `<div id="col-label">${i}</div>`;
    }

    // y-axis titles and subtitles
    this.root.innerHTML += `
      <!-- y-axis labeling -->
      <!-- First Column -->
      <div class="y-title">Ignorance</div>

      <!-- Second Column -->
      <div id="y-sub-3">Speculative</div>
      <div id="y-sub-2">Uncomfortable</div>
      <div id="y-sub-1">Routine</div>
    `;

    // Row labeling
    for (let y = 9; y >= 1; --y) {
      this.root.innerHTML += `<div id="row-label">${y}</div>`;
      for (let x = 1; x <= 9; ++x) {
        this.root.innerHTML += `<div id="grid-box" data-x-value="${x}" data-y-value="${y}" style="background-color: ${getColor(
          y,
          x
        )};"></div>`;
      }
    }

    this.gridboxes = this.root.querySelectorAll("#grid-box");

    const btnAddNote = this.root.querySelector(".add-note");

    this.ro = new ResizeObserver((entries) => {
      for (let entry of entries) {
        this.gridWidth = this.gridboxes[0].clientWidth;
        this.gridHeight = this.gridboxes[0].clientHeight;
        console.log(
          "gridWidth:",
          this.gridWidth,
          "gridHeight: ",
          this.gridHeight
        );
        this.newNoteDim =
          this.gridWidth <= this.gridHeight ? this.gridWidth : this.gridHeight;
        this.newNoteDim = this.gridWidth;

        console.log("newNoteDim: ", this.newNoteDim);
        this.noteWidth = (this.newNoteDim - 17 - 4) / 2;
        // if (this.noteWidth > 100) this.noteWidth = 100;
        document.documentElement.style.setProperty(
          "--note-x",
          `${this.noteWidth}px`
        );
        const cr = entry.contentRect;
      }
    });

    this.ro.observe(this.gridboxes[0]);

    btnAddNote.addEventListener("click", () => {
      this.onNoteAdd();
    });

    let observer = new MutationObserver(function (mutations) {
      console.log("size changed!");
    });
    observer.observe(this.root, {
      attributes: true,
    });
  }

  _createNoteItemHTML(id, content, backgroundColor) {
    return `
      <div class="note" 
            draggable="true" 
            data-note-id="${id}" 
            contenteditable="true" 
            style="background-color: ${backgroundColor}; overflow-y: auto;"><p>
            ${content}</p>
      </div>
    `;
  }

  adjustFontSize() {
    const noteElements = document.querySelectorAll(".note");
    noteElements.forEach((element) => {
      resizeText(element);
    });
  }

  addNoteElement(note) {
    const noteObject = this._createNoteItemHTML(
      note.id,
      note.content,
      note.backgroundColor
    );
    console.log("addNoteElement", noteObject);

    const gridIndex = 9 * (9 - note.ignorance) + (note.impact - 1);
    this.gridboxes[gridIndex].insertAdjacentHTML("beforeend", noteObject);

    const noteElements = this.gridboxes[gridIndex].querySelectorAll(".note");
    noteElements.forEach((element) => {
      resizeText(element);
      if (element.dataset.noteId == note.id) {
        /* respond to input in contenteditable */
        element.addEventListener("input", () => {
          resizeText(element);
          this.onNoteEdit(element);
        });
        /* scroll to top of note on blur event */
        element.addEventListener("blur", () => {
          element.scrollTop = 0;
        });

        /* Ask to delete note on double-click */
        element.addEventListener("dblclick", () => {
          const doDelete = confirm(
            "Are you srue you want to delete this sticky note?"
          );
          if (doDelete) {
            this.onNoteDelete(element);
            this._deleteNote(element);
          }
        });

        element.addEventListener("dragstart", () => {
          element.classList.add("dragging");
        });

        element.addEventListener("dragend", () => {
          element.classList.remove("dragging");
          this.onNoteDragEnd(element);
        });
      }
    });
  }

  _deleteNote(element) {
    element.parentNode.removeChild(element);
  }

  updateNotes(notes) {
    notes.forEach((note) => {
      this.addNoteElement(note);
      // this.onNoteEdit(note);
    });
  }
}

function getColor(ignorance, impact) {
  return ignorance >= 5 && impact >= 5
    ? "#ffe1Ef"
    : ignorance >= 5 && impact < 5
    ? "#e2ebbb"
    : ignorance < 5 && impact >= 5
    ? "#D3e5FF"
    : "#E3fff5";
}
// function getColor(score) {
//   return score >= 56
//     ? "#ffe1Ef"
//     : score >= 30
//     ? "#e2ebbb"
//     : score >= 12
//     ? "#D3e5FF"
//     : "#E3fff5";
// }

const isOverflown = ({
  clientHeight,
  scrollHeight,
  // clientWidth,
  // scrollWidth,
}) => scrollHeight > clientHeight;

function resizeText(element) {
  let i = 20;
  const minSize = 2;
  if (!isOverflown(element)) {
    element.style.fontSize = "20px";
  }
  while (isOverflown(element) && i > minSize) {
    i -= 0.25;
    element.style.fontSize = `${i}px`;
  }
}

function rgbToHex(rgb) {
  // Choose correct separator
  let sep = rgb.indexOf(",") > -1 ? "," : " ";
  // Turn "rgb(r,g,b)" into [r,g,b]
  rgb = rgb.substr(4).split(")")[0].split(sep);

  let r = (+rgb[0]).toString(16),
    g = (+rgb[1]).toString(16),
    b = (+rgb[2]).toString(16);

  if (r.length == 1) r = "0" + r;
  if (g.length == 1) g = "0" + g;
  if (b.length == 1) b = "0" + b;

  return "#" + r + g + b;
}
