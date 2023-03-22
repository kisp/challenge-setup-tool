export const db = {
  command: "",
  numberOfCardsShown: 0,
  copiedToClipboard: false,
};

export function processStatus(cards) {
  return db.numberOfCardsShown === cards.length
    ? "Done"
    : db.numberOfCardsShown
    ? "Setup in progress..."
    : "Start";
}
