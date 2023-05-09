# ⛏️Sudoku Miner

_generate sudoku puzzles of a given human difficulty_

Generate sudokus with a certain amount of givens, and that you know can be solved using **only a certain list of human tactics**. Learn all about sudoku tactics [on this sudoku wiki](https://www.sudokuwiki.org/Getting_Started)

---

## TODO

- add more human solving tactics
  - [x] nakedSingle
  - [x] hiddenSingle
  - [x] nakedPair
  - [ ] hiddenPair
  - [ ] pointingPair
  - [ ] pointingTriple
  - [ ] nakedTriple
  - [ ] hiddenTriple
- make it faster

---

## Usage

```ts
import { SudokuGenerator } from "./generator.ts";

const generator = new SudokuGenerator(27, [
  "nakedSingle",
  "hiddenSingle",
  "nakedPair",
]);

console.table(generator.generateSudoku());
```

**result**

<p align="center"><img src="https://github.com/JulienMartel/sudoku-miner/assets/33211907/a0457bde-4ce2-4c1a-817e-4a2394c03bdd" /></p>

---

## Contributing

Feel free to make a pull request. Heads up, using [Deno](https://deno.com/manual@v1.33.2/introduction) instead of node.js
