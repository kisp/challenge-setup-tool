const regex = /^\s*npx\s+ghcd@latest\s+[^ ]+sessions.([^ ]+)\s*$/;

export const isNpxCommandValid = (command) => {
  return regex.test(command);
};

export const sessionPath = (command) => {
  if (!isNpxCommandValid(command)) return null;
  return command.match(regex)[1];
};

const butlast = (array) => {
  return array.slice(0, array.length - 1);
};

const basePath = (command) => {
  return butlast(sessionPath(command).split("/")).join("/");
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

export function generateShellCommands(command) {
  return [
    "git switch main",
    `mkdir -p ${basePath(command)}`,
    `${command} ${sessionPath(command)}`,
  ];
}
