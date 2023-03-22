export const isNpxCommandValid = (command) => {
  const regex = /^\s*npx\s+ghcd@latest\s+[^ ]+\s*$/;
  return regex.test(command);
};

export function cardsForCommand(command) {
  return [
    { command: " echo command 1" },
    { command: " echo command 2" },
    { command: " echo command 3" },
    { command: " echo command 4" },
    { command: " echo command 5" },
  ];
}
