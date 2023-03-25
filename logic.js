const regex = /^\s*npx\s+ghcd@latest\s+([^ ]+sessions.([^ ]+))\s*$/;

export const isNpxCommandValid = (command) => {
  return regex.test(command);
};

export const sessionPath = (command) => {
  if (!isNpxCommandValid(command)) return null;
  return command.match(regex)[2];
};

export const fullSessionPath = (command) => {
  if (!isNpxCommandValid(command)) return null;
  return command.match(regex)[1];
};

const branchName = (command, date) => {
  if (!isNpxCommandValid(command)) return null;
  return `challenges/${formatDateYMDWithMinus(date)}/${sessionPath(command)}`;
};

const butlast = (array) => {
  return array.slice(0, array.length - 1);
};

const basePath = (command) => {
  return butlast(sessionPath(command).split("/")).join("/");
};

const formatWithLeadingZero = (integer) => {
  return integer.toString().padStart(2, "0");
};

const formatDateYMDWithSpaces = (date) => {
  return `${date.getFullYear()} ${formatWithLeadingZero(
    date.getMonth() + 1
  )} ${formatWithLeadingZero(date.getDate())}`;
};

const formatDateYMDWithMinus = (date) => {
  return `${date.getFullYear()}-${formatWithLeadingZero(
    date.getMonth() + 1
  )}-${formatWithLeadingZero(date.getDate())}`;
};

const minusToSpace = (string) => {
  return string.replace(/-/g, " ");
};

export function generateShellCommands(command, date) {
  const dateYMD = formatDateYMDWithSpaces(date);
  return [
    "git switch main",
    "git pull",
    `mkdir -p ${basePath(command)}`,
    `${command} ${sessionPath(command)}`,
    `git add ${sessionPath(command)}`,
    `git commit -m 'Init Challenges/${dateYMD}/${minusToSpace(
      sessionPath(command)
    )}'`,
    "git push",
    `git switch -c ${branchName(command, date)}`,
    `git push -u origin ${branchName(command, date)}`,
  ];
}

export function cardsForCommand(command, date) {
  if (!date) date = new Date();
  if (!isNpxCommandValid(command)) return [];
  return generateShellCommands(command, date).map((shellCommand) => {
    return { command: shellCommand };
  });
}
