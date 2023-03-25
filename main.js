import "./style.css"

import zipWith from "lodash/zipWith"
import m from "mithril"
import { createPopper } from "@popperjs/core"

import { ClipboardDocument } from "./icons"
import { isNpxCommandValid, cardsForCommand } from "./logic"
import { db, processStatus } from "./state"

function repeatItem1AndThenSingleItem2(count, item1, item2) {
  const array = Array(count).fill(item1)
  array.push(item2)
  return array
}

function WithTooltip() {
  let popperInstance
  return {
    oncreate: function (vnode) {
      const [child, tooltip] = vnode.dom.children
      popperInstance = createPopper(child, tooltip, {
        placement: "top",
        modifiers: [
          {
            name: "offset",
            options: {
              offset: [0, 8],
            },
          },
        ],
      })
    },
    onupdate: function () {
      popperInstance.update()
    },
    view: function (vnode) {
      return m(
        ".with-tooltip",
        { class: vnode.attrs.classForWrapper },
        vnode.attrs.child,
        m(
          ".tooltip.absolute.z-10.inline-block.px-3.py-2.text-sm.font-medium.text-white.bg-gray-900.rounded-lg.shadow-sm",
          {
            class: vnode.attrs.showTooltip ? "" : "hidden",
            // id: "tooltip",
            // hidden: !vnode.attrs.showTooltip,
          },
          [
            vnode.attrs.message,
            m("div", { class: "tooltip-arrow", "data-popper-arrow": "" }),
          ]
        )
      )
    },
  }
}

const Button = {
  view: function (vnode) {
    let colorStyles = "border-black"
    if (vnode.attrs.style === "green")
      colorStyles = "border-green-600 bg-green-300"
    if (vnode.attrs.style === "blue")
      colorStyles = "border-blue-600 bg-blue-300"
    let sizeStyles = "py-2 "
    let disabledStyles = ""
    if (vnode.attrs.visuallyDisable) disabledStyles = "disabled:opacity-75 "
    return m(
      "button",
      {
        class:
          "border border-2 px-6 rounded-xl disabled:cursor-not-allowed " +
          disabledStyles +
          sizeStyles +
          colorStyles,
        onclick: vnode.attrs.onclick,
        disabled: vnode.attrs.disabled,
      },
      vnode.attrs.title
    )
  },
}

const Card = {
  view: function (vnode) {
    let style = ""
    if (vnode.attrs.isCompleted) style = "bg-green-400 border-green-600"
    if (!vnode.attrs.isCompleted) style = "bg-blue-400 border-blue-600"
    return m(
      "article",
      {
        class:
          "card border border-2 rounded-xl m-4 p-4 flex gap-8 justify-between items-baseline " +
          style,
      },
      [
        m(
          "p",
          {
            class: "border border-gray-500 bg-white px-5 pb-2 pt-3",
          },
          m("code", vnode.attrs.command)
        ),
        m(WithTooltip, {
          message: "Copied to clipboard!",
          showTooltip: db.copiedToClipboard && !vnode.attrs.isCompleted,
          child: m(Button, {
            title: vnode.attrs.isCompleted
              ? "Done"
              : m(ClipboardDocument, { class: "text-blue-500 w-6 h-6" }),
            style: vnode.attrs.isCompleted ? "green" : "blue",
            onclick: vnode.attrs.isCompleted ? null : copyToClipboard,
            disabled: vnode.attrs.isCompleted,
          }),
        }),
      ]
    )
  },
}

function colorCards(cards, isAllDone) {
  if (cards.length === 0) return cards

  if (isAllDone)
    return cards.map((card) => ({ command: card.command, isCompleted: true }))

  const styles = repeatItem1AndThenSingleItem2(cards.length - 1, true, false)

  return zipWith(cards, styles, (card, isCompleted) => {
    return { command: card.command, isCompleted: isCompleted }
  })
}

const Cards = {
  view: function () {
    const myCards = cardsForCommand(db.command)
    let cards = myCards.slice(0, db.numberOfCardsShown)
    cards = colorCards(cards, db.numberOfCardsShown === myCards.length)
    return m(
      "section",
      { class: "cards my-8" },
      cards.map((card) => {
        return m(Card, card)
      })
    )
  },
}

const Main = {
  view: function () {
    const cards = cardsForCommand(db.command)
    const status = processStatus(cards, isNpxCommandValid(db.command))
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
            m(WithTooltip, {
              classForWrapper: "flex-grow",
              message: m(
                "div",
                m("p", "Oops, that npx command does not seem to be valid!"),
                m("p", "If you believe this is a bug, please open an issue :)")
              ),
              showTooltip:
                db.command.trim().length && !isNpxCommandValid(db.command),
              child: m("input", {
                class:
                  "border-2 rounded text-sm px-2 pb-1 pt-2 font-mono w-full",
                type: "text",
                id: "npx-command",
                placeholder: "npx ghcd@latest ...",
                oninput: updateCommand,
                readonly: status !== "Start",
              }),
            }),
            m(Button, {
              title: status,
              onclick: startClicked,
              visuallyDisable: true,
              disabled: !isNpxCommandValid(db.command) || status !== "Start",
            }),
          ]
        ),
        m(Cards),
      ]),
    ]
  },
}

function updateCommand(e) {
  db.command = e.target.value
}

function startClicked() {
  db.numberOfCardsShown = 1
}

function copyToClipboard() {
  const c = cardsForCommand(db.command)[db.numberOfCardsShown - 1].command
  navigator.clipboard.writeText(c)
  db.copiedToClipboard = true
  setTimeout(() => {
    m.redraw()
  }, 10)
  setTimeout(() => {
    db.copiedToClipboard = false
    m.redraw()
  }, 2000)
  setTimeout(() => {
    db.numberOfCardsShown++
    m.redraw()
  }, 4000)
}

m.mount(document.getElementById("app"), Main)
