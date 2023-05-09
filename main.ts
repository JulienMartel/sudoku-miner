import { SudokuGenerator } from "./generator.ts";

if (import.meta.main) {
  const generator = new SudokuGenerator(27, [
    "nakedSingle",
    "hiddenSingle",
    "nakedPair",
  ]);

  console.table(generator.generateSudoku());
}
