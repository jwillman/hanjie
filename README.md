# Hanjie

A React-based Hanjie (Nonogram) puzzle creator and player.

## Creating a puzzle

- Click cells to toggle them black/white, or drag to draw several at once. Touch screens work too.
- **Import image**: turn a picture into a grid. Adjust the darkness threshold or invert it, preview it on the board, then choose "Use this picture".
- Choose any width and height from 5 to 25.
- Row hints (left) and column hints (top) update as you draw. The row and column under the pointer are highlighted.
- Below the grid, the app tells you whether the hints lead to exactly one picture. If they don't, "Show the cells that can differ" highlights where another valid picture differs from yours.
- **Copy link** (or **Share…** on devices that support it) gives you a link that shows only the hints. **Solve it yourself** opens it in the same tab.
- Your drawing is saved in the browser, so it survives a reload.

## Solving a puzzle

- Pick one under **Puzzles**, or open a link someone shared.
- Choose the **Fill** or **Mark empty** tool, then click or drag. Right-click always marks a cell as empty. Clicking a cell that already has the tool's state clears it.
- Hints turn grey once their row or column matches.
- The puzzle is checked automatically: as soon as your grid matches every hint, you've solved it. Any grid that fits the hints counts.
- Optional **Show mistakes** highlights wrong cells. A timer starts on your first move and pauses while the tab is hidden.
- Progress and solve times are saved in the browser, and the puzzle list marks puzzles you've solved.

## Keyboard

- Focus the grid with Tab, move with the arrow keys.
- Space/Enter: fill (or use the selected tool). X: mark empty. Delete/Backspace: clear.
- Shift+arrow: copy the current cell's state to the next cell, for drawing lines.
- Ctrl+Z: undo. Ctrl+Shift+Z or Ctrl+Y: redo. A whole drag counts as one step.
- Screen readers announce the current cell and its row and column hints.

The theme button in the header switches between automatic, light and dark.

## Getting Started

1. Install dependencies:
   `npm install`

2. Run the development server:
   `npm run dev`

3. Open http://localhost:5173 in your browser.

Other scripts: `npm test` (unit tests), `npm run lint`, `npm run build`.
