export const db = {
  command: "",
  numberOfCardsShown: 0,
  copiedToClipboard: false,
}

export function processStatus(cards, isNpxCommandValid) {
  if (!isNpxCommandValid) return "Start"
  return db.numberOfCardsShown === cards.length
    ? "Done"
    : db.numberOfCardsShown
    ? "Setup in progress..."
    : "Start"
}
