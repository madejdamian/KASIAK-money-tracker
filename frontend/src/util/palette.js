// Colours for the parts of a chart. Stable: a category keeps its colour (its place among its siblings
// in the tree), so the same category looks the same in every chart and in every month.
export const PALETTE = [
  "#fcbc05", // yellow, the brand colour
  "#f08a30", // orange
  "#e05d4b", // coral
  "#c9b27a", // sand
  "#5fa8a0", // teal
  "#9d8fc7", // lilac
  "#8aa65c", // olive
];

export const REST_COLOR = "#5e5848";
export const GAIN_COLOR = "#7cc9a0"; // a fall in spending
export const LOSS_COLOR = "#ff7a68"; // a rise in spending

// `rows` are the siblings in a fixed order (the tree order), `id` the one to colour
export function colorFor(siblingIds, id) {
  const position = siblingIds.indexOf(id);
  return position === -1 ? REST_COLOR : PALETTE[position % PALETTE.length];
}
