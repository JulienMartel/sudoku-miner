export function nakedSingle(puzzleNotes: number[][][]): void {
  const gridSize = puzzleNotes.length;

  // Iterate over each cell in the puzzle
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const notes = puzzleNotes[row][col];

      // If the cell has only one note, remove the note from other cells
      if (notes.length === 1) {
        const noteToRemove = notes[0];

        // Remove the note from the same row
        for (let c = 0; c < gridSize; c++) {
          if (c !== col) {
            const otherNotes = puzzleNotes[row][c];
            removeNoteFromCellNotes(otherNotes, noteToRemove);
          }
        }

        // Remove the note from the same column
        for (let r = 0; r < gridSize; r++) {
          if (r !== row) {
            const otherNotes = puzzleNotes[r][col];
            removeNoteFromCellNotes(otherNotes, noteToRemove);
          }
        }

        // Remove the note from the same box
        const boxRow = Math.floor(row / 3) * 3;
        const boxCol = Math.floor(col / 3) * 3;
        for (let r = boxRow; r < boxRow + 3; r++) {
          for (let c = boxCol; c < boxCol + 3; c++) {
            if (r !== row || c !== col) {
              const otherNotes = puzzleNotes[r][c];
              removeNoteFromCellNotes(otherNotes, noteToRemove);
            }
          }
        }
      }
    }
  }
}

export function hiddenSingle(puzzleNotes: number[][][]): void {
  const gridSize = puzzleNotes.length;

  // Iterate over each cell in the puzzle
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      const notes = puzzleNotes[row][col];

      // Skip cells that already have a determined value
      if (notes.length === 1) {
        continue;
      }

      // Check if any note is unique within the row, column, or box
      for (const note of notes) {
        if (isHiddenSingle(note, puzzleNotes, row, col)) {
          // remove the other notes from the cell
          puzzleNotes[row][col] = [note];
          break;
        }
      }
    }
  }
}

export function nakedPair(puzzleNotes: number[][][]): void {
  const gridSize = puzzleNotes.length;

  // Check rows for naked pairs
  for (let row = 0; row < gridSize; row++) {
    findAndRemoveNakedPair(puzzleNotes[row]);
  }

  // Check columns for naked pairs
  for (let col = 0; col < gridSize; col++) {
    const columnNotes = puzzleNotes.map((rowNotes) => rowNotes[col]);
    findAndRemoveNakedPair(columnNotes);
    columnNotes.forEach(
      (notes, rowIndex) => (puzzleNotes[rowIndex][col] = notes)
    );
  }

  // Check boxes for naked pairs
  for (let boxRow = 0; boxRow < gridSize; boxRow += 3) {
    for (let boxCol = 0; boxCol < gridSize; boxCol += 3) {
      const boxNotes: number[][] = [];
      for (let row = boxRow; row < boxRow + 3; row++) {
        for (let col = boxCol; col < boxCol + 3; col++) {
          boxNotes.push([...puzzleNotes[row][col]]);
        }
      }
      findAndRemoveNakedPair(boxNotes);
      let index = 0;
      for (let row = boxRow; row < boxRow + 3; row++) {
        for (let col = boxCol; col < boxCol + 3; col++) {
          puzzleNotes[row][col] = [...boxNotes[index++]];
        }
      }
    }
  }
}

// export function hiddenPair(
//   puzzle: number[][],
//   row: number,
//   col: number,
//   possibleValues: number[],
//   size: number
// ): number {}

// export function pointingPair(
//   puzzle: number[][],
//   row: number,
//   col: number,
//   possibleValues: number[],
//   size: number
// ): number {}

// export function pointingTriple(
//   puzzle: number[][],
//   row: number,
//   col: number,
//   possibleValues: number[],
//   size: number
// ): number {}

// export function nakedTriple(
//   puzzle: number[][],
//   row: number,
//   col: number,
//   possibleValues: number[],
//   size: number
// ): number {}

// export function hiddenTriple(
//   puzzle: number[][],
//   row: number,
//   col: number,
//   possibleValues: number[],
//   size: number
// ): number {}

// export function nakedQuad(
//   puzzle: number[][],
//   row: number,
//   col: number,
//   possibleValues: number[],
//   size: number
// ): number {}

// export function hiddenQuad(
//   puzzle: number[][],
//   row: number,
//   col: number,
//   possibleValues: number[],
//   size: number
// ): number {}

// helpers

function removeNoteFromCellNotes(notes: number[], noteToRemove: number): void {
  const noteIndex = notes.indexOf(noteToRemove);
  if (noteIndex !== -1) {
    notes.splice(noteIndex, 1);
  }
}

function isHiddenSingle(
  note: number,
  puzzleNotes: number[][][],
  row: number,
  col: number
): boolean {
  const gridSize = puzzleNotes.length;

  // Check if the note exists in any other cell in the row
  for (let c = 0; c < gridSize; c++) {
    if (c !== col && puzzleNotes[row][c].includes(note)) {
      return false;
    }
  }

  // Check if the note exists in any other cell in the column
  for (let r = 0; r < gridSize; r++) {
    if (r !== row && puzzleNotes[r][col].includes(note)) {
      return false;
    }
  }

  // Check if the note exists in any other cell in the box
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      if ((r !== row || c !== col) && puzzleNotes[r][c].includes(note)) {
        return false;
      }
    }
  }

  return true;
}

function findAndRemoveNakedPair(notesArr: number[][]): void {
  const notesMap = new Map<string, number[]>();

  // Count the occurrences of each set of notes
  for (const notes of notesArr) {
    if (notes.length !== 2) {
      continue;
    }

    const key = JSON.stringify(notes);
    const count = notesMap.get(key) || [];
    count.push(1);
    notesMap.set(key, count);
  }

  // Find naked pairs and remove the notes from other cells
  for (const [key, count] of notesMap.entries()) {
    if (count.length === 2) {
      const notes = JSON.parse(key);
      for (const otherNotes of notesArr) {
        if (!areArraysEqual(notes, otherNotes)) {
          removeNotes(otherNotes, notes);
        }
      }
    }
  }
}

function areArraysEqual(arr1: number[], arr2: number[]): boolean {
  if (arr1.length !== arr2.length) {
    return false;
  }

  return arr1.every((value) => arr2.includes(value));
}

function removeNotes(notes: number[], notesToRemove: number[]): void {
  for (const noteToRemove of notesToRemove) {
    const index = notes.indexOf(noteToRemove);
    if (index !== -1) {
      notes.splice(index, 1);
    }
  }
}
