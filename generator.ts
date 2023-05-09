import { bgBrightGreen, black, italic } from "fmt/colors.ts";
import * as tactics from "./human-tactics.ts";

type Tactics = Array<keyof typeof tactics>;

export class SudokuGenerator {
  private readonly SIZE = 9;

  private GIVENS;
  private TACTICS;

  constructor(givens: number, humanTactics: Tactics) {
    this.GIVENS = givens;
    this.TACTICS = humanTactics;
  }

  generateSudoku(count?: number): number[][] {
    const c = count ?? 1;

    console.clear();
    console.log(bgBrightGreen(black(`attempt ${italic(c.toString())}`)));

    const puzzle: number[][] = this.createEmptyGrid();

    this.fillDiagonalBlocks(puzzle);
    this.fillRemaining(puzzle, 0);
    this.removeCells(puzzle, this.GIVENS);

    if (this.isHumanSolvable(this.copyGrid(puzzle))) {
      return puzzle;
    }

    return this.generateSudoku(c + 1);
  }

  private createEmptyGrid(): number[][] {
    const grid: number[][] = [];
    for (let i = 0; i < this.SIZE; i++) {
      grid.push(new Array(this.SIZE).fill(0));
    }
    return grid;
  }

  private fillDiagonalBlocks(puzzle: number[][]): void {
    const blockSize = Math.sqrt(this.SIZE);
    for (let i = 0; i < this.SIZE; i += blockSize) {
      this.fillBlock(puzzle, i, i);
    }
  }

  private fillBlock(puzzle: number[][], row: number, col: number): void {
    const numbers = this.shuffle(
      Array.from({ length: this.SIZE }, (_, i) => i + 1)
    );

    let numberIndex = 0;
    for (let i = 0; i < Math.sqrt(this.SIZE); i++) {
      for (let j = 0; j < Math.sqrt(this.SIZE); j++) {
        puzzle[row + i][col + j] = numbers[numberIndex++];
      }
    }
  }

  private fillRemaining(puzzle: number[][], cellIndex: number): boolean {
    if (cellIndex >= this.SIZE * this.SIZE) {
      return true;
    }

    const row = Math.floor(cellIndex / this.SIZE);
    const col = cellIndex % this.SIZE;

    if (puzzle[row][col] !== 0) {
      return this.fillRemaining(puzzle, cellIndex + 1);
    }

    const numbers = this.shuffle(
      Array.from({ length: this.SIZE }, (_, i) => i + 1)
    );
    for (const number of numbers) {
      if (this.isValidPlacement(puzzle, row, col, number)) {
        puzzle[row][col] = number;
        if (this.fillRemaining(puzzle, cellIndex + 1)) {
          return true;
        }
        puzzle[row][col] = 0; // Backtrack
      }
    }

    return false;
  }

  private removeCells(puzzle: number[][], givens: number): void {
    let cellsToRemove = this.SIZE * this.SIZE - givens;

    while (cellsToRemove > 0) {
      const row = Math.floor(Math.random() * this.SIZE);
      const col = Math.floor(Math.random() * this.SIZE);

      if (puzzle[row][col] !== 0) {
        const temp = puzzle[row][col];
        puzzle[row][col] = 0;

        // Check if the puzzle is still solvable
        if (!this.hasUniqueSolution(puzzle)) {
          puzzle[row][col] = temp; // Restore the value if unsolvable
        } else {
          cellsToRemove--;
        }
      }
    }
  }

  private hasUniqueSolution(puzzle: number[][]): boolean {
    // console.log("checking has unique solution");
    const solutions: number[][][] = [];
    this.findAllSolutions(puzzle, solutions);

    return solutions.length === 1;
  }

  private findAllSolutions(puzzle: number[][], solutions: number[][][]): void {
    if (solutions.length > 1) {
      // break recursion if more than one solution is found
      return;
    }

    const gridSize = puzzle.length;

    // Find the first empty cell in the puzzle
    const [row, col] = this.findEmptyCell(puzzle);

    // If there are no more empty cells, the puzzle is solved
    if (row === -1 && col === -1) {
      // Deep copy the puzzle and add it to the solutions array
      solutions.push(this.copyGrid(puzzle));
      return;
    }

    // Try different numbers in the empty cell
    for (let num = 1; num <= gridSize; num++) {
      if (this.isValidPlacement(puzzle, row, col, num)) {
        // Place the number in the empty cell
        puzzle[row][col] = num;

        // Recursively solve the updated puzzle
        this.findAllSolutions(puzzle, solutions);

        // Backtrack by removing the number from the cell
        puzzle[row][col] = 0;
      }
    }
  }

  private findEmptyCell(puzzle: number[][]): [number, number] {
    const gridSize = puzzle.length;

    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        if (puzzle[row][col] === 0) {
          return [row, col];
        }
      }
    }

    return [-1, -1]; // no empty cell is found
  }

  private isValidPlacement(
    puzzle: number[][],
    row: number,
    col: number,
    num: number
  ): boolean {
    // Check row and column
    for (let i = 0; i < this.SIZE; i++) {
      if (puzzle[row][i] === num || puzzle[i][col] === num) {
        return false;
      }
    }

    // Check 3x3 grid
    const gridRowStart = Math.floor(row / 3) * 3;
    const gridColStart = Math.floor(col / 3) * 3;
    for (let i = gridRowStart; i < gridRowStart + 3; i++) {
      for (let j = gridColStart; j < gridColStart + 3; j++) {
        if (puzzle[i][j] === num) {
          return false;
        }
      }
    }

    return true; // Valid placement
  }

  private shuffle<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  private isPuzzleNotesSolved(puzzleNotes: number[][][]): boolean {
    return puzzleNotes.every((row) => row.every((cell) => cell.length === 1));
  }

  private isHumanSolvable(puzzle: number[][]): boolean {
    const gridSize = this.SIZE;

    const puzzleNotes: number[][][] = [];
    for (let i = 0; i < gridSize; i++) {
      puzzleNotes.push([]);
      for (let j = 0; j < gridSize; j++) {
        if (puzzle[i][j] === 0) {
          puzzleNotes[i].push(this.getPossibleValues(puzzle, i, j));
        } else {
          puzzleNotes[i].push([puzzle[i][j]]);
        }
      }
    }

    let sinceLastChange = 0;
    let tacticCount = 0;
    while (true) {
      let hasChanged = false;

      const originalPuzzleNotes = this.copy3dGrid(puzzleNotes);
      tactics[this.TACTICS[tacticCount]](puzzleNotes);

      if (JSON.stringify(puzzleNotes) !== JSON.stringify(originalPuzzleNotes)) {
        hasChanged = true;
        sinceLastChange = 0;
        tacticCount = 0;
      }

      for (const tactic of this.TACTICS) {
        tactics[tactic](puzzleNotes);
      }

      if (this.isPuzzleNotesSolved(puzzleNotes)) {
        console.table(puzzleNotes.map((x) => x.flat()));
        return true;
      }

      if (!hasChanged) {
        if (sinceLastChange++ > this.TACTICS.length + 1) {
          return false;
        }

        tacticCount === this.TACTICS.length - 1
          ? (tacticCount = 0)
          : tacticCount++;
      }
    }
  }

  private getPossibleValues(
    puzzle: number[][],
    row: number,
    col: number
  ): number[] {
    const values = new Array(this.SIZE).fill(true);

    // Check values in the same row
    for (let i = 0; i < this.SIZE; i++) {
      const value = puzzle[row][i];
      if (value !== 0) {
        values[value - 1] = false;
      }
    }

    // Check values in the same column
    for (let i = 0; i < this.SIZE; i++) {
      const value = puzzle[i][col];
      if (value !== 0) {
        values[value - 1] = false;
      }
    }

    // Check values in the same 3x3 grid
    const gridRowStart = Math.floor(row / 3) * 3;
    const gridColStart = Math.floor(col / 3) * 3;

    for (let i = gridRowStart; i < gridRowStart + 3; i++) {
      for (let j = gridColStart; j < gridColStart + 3; j++) {
        const value = puzzle[i][j];
        if (value !== 0) {
          values[value - 1] = false;
        }
      }
    }

    // Collect possible values
    const possibleValues: number[] = [];
    for (let i = 0; i < this.SIZE; i++) {
      if (values[i]) {
        possibleValues.push(i + 1);
      }
    }

    return possibleValues;
  }

  private copyGrid(grid: number[][]): number[][] {
    return grid.map((row) => [...row]);
  }

  private copy3dGrid(grid: number[][][]): number[][][] {
    return grid.map((row) => row.map((cell) => [...cell]));
  }
}
