# React Hanjie Puzzle generator

A React-based Hanjie (Nonogram) puzzle generator and player.

## Creating a puzzle

- Click cells to toggle them black/white, or drag to draw several at once. Touch screens work too.
- Pick a width and height between 5 and 25.
- Row hints (left) and column hints (top) update as you draw.
- Below the grid the app tells you whether the hints lead to exactly one picture. If they allow more than one, players could solve it "correctly" and still end up with a different picture.
- "Get link to the puzzle" opens a shareable link that shows only the hints.

## Solving a puzzle

- Choose the **Fill** or **Mark empty** tool, then click or drag. Right-click always marks a cell as empty.
- Clicking a cell that already has the tool's state clears it.
- "Check the solution" accepts any grid that matches every hint.

## Getting Started

1. Install dependencies:
   `npm install`

2. Run the development server:
   `npm run dev`

3. Open http://localhost:5173 in your browser.

Other scripts: `npm test` (unit tests), `npm run lint`, `npm run build`.
