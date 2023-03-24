const regex = /^\s*npx\s+ghcd@latest\s+[^ ]+sessions.([^ ]+)\s*$/;

export const isNpxCommandValid = (command) => {
  return regex.test(command);
};

export const parseNpxCommand = (command) => {
  if (!isNpxCommandValid(command)) return null;
  return command.match(regex)[1];
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
