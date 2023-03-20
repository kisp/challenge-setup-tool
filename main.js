import "./style.css";
import zipWith from "lodash/zipWith";
import m from "mithril";

import { ClipboardDocument } from "./icons";

function repeatItem1AndThenSingleItem2(count, item1, item2) {
  const array = Array(count).fill(item1);
  array.push(item2);
  return array;
}

var Button = {
  view: function (vnode) {
    let colorStyles = "border-black";
    if (vnode.attrs.style === "green")
      colorStyles = "border-green-600 bg-green-300";
    if (vnode.attrs.style === "blue")
      colorStyles = "border-blue-600 bg-blue-300";
    let sizeStyles = "py-2 ";
    return m(
      "button",
      {
        class: "border border-2 px-6 rounded-xl " + sizeStyles + colorStyles,
        onclick: vnode.attrs.onclick,
      },
      vnode.attrs.title
    );
  },
};

var Card = {
  view: function (vnode) {
    let style = "";
    if (vnode.attrs.isCompleted) style = "bg-green-400 border-green-600";
    if (!vnode.attrs.isCompleted) style = "bg-blue-400 border-blue-600";
    return m(
      "article",
      {
        class:
          "card border border-2 rounded-xl m-4 p-4 flex justify-between items-baseline " +
          style,
      },
      [
        m(
          "p",
          m(
            "code",
            { class: "border border-gray-500 bg-white px-5 pb-2 pt-3" },
            vnode.attrs.command
          )
        ),
        m(Button, {
          title: vnode.attrs.isCompleted
            ? "Done"
            : m(ClipboardDocument, { class: "text-blue-500 w-6 h-6" }),
          style: vnode.attrs.isCompleted ? "green" : "blue",
          onclick: vnode.attrs.isCompleted ? null : copyToClipboard,
        }),
      ]
    );
  },
};

var command = "";
var numberOfCardsShown = 0;

function cardsForCommand(command) {
  return [{ command: command }, { command: command }, { command: command }];
}

function colorCards(cards, isAllDone) {
  if (cards.length === 0) return cards;

  if (isAllDone)
    return cards.map((card) => ({ command: card.command, isCompleted: true }));

  const styles = repeatItem1AndThenSingleItem2(cards.length - 1, true, false);

  return zipWith(cards, styles, (card, isCompleted) => {
    return { command: card.command, isCompleted: isCompleted };
  });
}

var Cards = {
  view: function () {
    const myCards = cardsForCommand(command);
    let cards = myCards.slice(0, numberOfCardsShown);
    cards = colorCards(cards, numberOfCardsShown === myCards.length);
    return m(
      "section",
      { class: "cards my-8" },
      cards.map((card) => {
        return m(Card, card);
      })
    );
  },
};

var MyComponent = {
  view: function () {
    return [
      m(
        "header",
        { class: "bg-blue-500" },
        m(
          "h1",
          { class: "text-white text-center py-6 text-2xl md:text-4xl" },
          m("a", { href: "/" }, "Challenge setup tool")
        )
      ),
      m("main", { class: "container mx-auto my-8 px-3" }, [
        m(
          "section",
          { class: "controls my-4 flex items-baseline flex-wrap gap-3" },
          [
            m("label", { for: "npx-command", class: "text-xl" }, "Npx command"),
            m("input", {
              class: "border-2 rounded text-xl px-2 pb-1 pt-2 font-mono",
              type: "text",
              id: "npx-command",
              placeholder: "npx ...",
              oninput: updateCommand,
            }),
            m(Button, {
              title: numberOfCardsShown ? "Setup in progress..." : "Start",
              onclick: startClicked,
            }),
          ]
        ),
        m(Cards),
      ]),
    ];
  },
};

function updateCommand(e) {
  command = e.target.value;
}

function startClicked() {
  numberOfCardsShown = 1;
}

function copyToClipboard() {
  numberOfCardsShown++;
}

m.mount(document.getElementById("app"), MyComponent);
