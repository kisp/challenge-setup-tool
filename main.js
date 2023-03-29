import "./style.css"

import zipWith from "lodash/zipWith"
import m from "mithril"
import { createPopper } from "@popperjs/core"

import { ClipboardDocument } from "./icons"
import { isNpxCommandValid, cardsForCommand } from "./logic"
import { db, processStatus } from "./state"

const repeatItem1AndThenSingleItem2 = (count, item1, item2) => {
  const array = Array(count).fill(item1)
  array.push(item2)
  return array
}

const WithTooltip = () => {
  let beingHovered

  const shouldShowTooltip = (vnode) => {
    const { showTooltip, onlyOnHover } = vnode.attrs
    if (!onlyOnHover) {
      return showTooltip
    } else {
      return beingHovered && showTooltip
    }
  }

  const myCreatePopper = (reference, tooltip) => {
    createPopper(reference, tooltip, {
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
  }

  return {
    onupdate(vnode) {
      if (shouldShowTooltip(vnode)) {
        const [child, tooltip] = vnode.dom.children
        myCreatePopper(child, tooltip)
      }
    },

    view(vnode) {
      const tooltipStyle =
        ".tooltip.absolute.z-10.inline-block.px-3.py-2.text-sm.font-medium.text-white.bg-gray-900.rounded-lg.shadow-sm"
      const {
        classForWrapper,
        message = "Default message",
        onlyOnHover,
        child,
      } = vnode.attrs

      return m(
        ".with-tooltip",
        { class: classForWrapper },
        !onlyOnHover
          ? child
          : m(
              "div.foo",
              {
                class: "toll",
                onmouseenter: () => {
                  beingHovered = true
                },
                onmouseleave: () => {
                  beingHovered = false
                },
              },
              child
            ),
        m(tooltipStyle, { class: shouldShowTooltip(vnode) ? "" : "hidden" }, [
          message,
          m("div", { class: "tooltip-arrow", "data-popper-arrow": "" }),
        ])
      )
    },
  }
}

const Button = {
  view(vnode) {
    let classes = "border-black"
    if (vnode.attrs.style === "green")
      classes = "border-green-600 bg-green-300 "
    if (vnode.attrs.style === "blue") classes = "border-blue-600 bg-blue-300 "
    if (vnode.attrs.visuallyDisabled) classes = "border-gray-400 text-gray-400 "
    if (vnode.attrs.disabled) classes += "cursor-not-allowed "
    return m(
      "button",
      {
        class: "border border-2 px-6 py-2 rounded-xl " + classes,
        onclick: vnode.attrs.onclick,
        disabled: vnode.attrs.disabled,
      },
      vnode.attrs.title
    )
  },
}

const Card = {
  oncreate({ dom }) {
    dom.scrollIntoView()
  },
  view(vnode) {
    let style = ""
    if (vnode.attrs.isCompleted) style = "bg-green-400 border-green-600"
    if (!vnode.attrs.isCompleted) style = "bg-blue-400 border-blue-600"
    return m(
      "article",
      {
        class:
          "border border-2 rounded-xl m-4 p-4 flex gap-8 justify-between items-baseline " +
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

const colorCards = (cards, isAllDone) => {
  if (cards.length === 0) return cards

  if (isAllDone)
    return cards.map((card) => ({ command: card.command, isCompleted: true }))

  const styles = repeatItem1AndThenSingleItem2(cards.length - 1, true, false)

  return zipWith(cards, styles, (card, isCompleted) => {
    return { command: card.command, isCompleted: isCompleted }
  })
}

const Cards = {
  view() {
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

const Header = {
  view() {
    return m(
      "header",
      { class: "bg-neutral-100 py-4 shadow-lg" },
      m(
        "h1",
        {
          class: "text-xl text-black ml-4",
        },
        m("a", { href: "/" }, "Challenge setup tool")
      )
    )
  },
}

const TextInput = () => {
  let isTyping
  let timer
  return {
    oncreate({ attrs: { onUserTypingOrNotTyping } }) {
      onUserTypingOrNotTyping(false)
    },
    view({
      attrs: {
        id,
        placeholder,
        oninput,
        readonly,
        onUserTypingOrNotTyping,
        reportNotTypingDelay = 800,
        markInvalid,
      },
    }) {
      let classes =
        "bg-gray-200 appearance-none border-2 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white "
      if (markInvalid) {
        classes += "border-red-300 focus:border-red-400 "
      } else {
        classes += "border-gray-200 focus:border-blue-500 "
      }
      return m("input", {
        class: classes,
        type: "text",
        id: id,
        placeholder: placeholder,
        oninput: oninput,
        onkeydown: () => {
          if (!isTyping) {
            onUserTypingOrNotTyping(true)
            isTyping = true
          }
          if (timer) {
            clearTimeout(timer)
            timer = null
          }
          timer = setTimeout(() => {
            isTyping = false
            onUserTypingOrNotTyping(false)
            timer = null
            m.redraw()
          }, reportNotTypingDelay)
        },
        readonly: readonly,
      })
    },
  }
}

const NpxCommandInput = () => {
  let userIsTyping
  let markInvalid
  let editingHasBegun
  const isCommandEmpty = () => db.command.trim().length === 0
  const isCommandInputInvalid = () =>
    (!isCommandEmpty() || editingHasBegun) && !isNpxCommandValid(db.command)
  return {
    view() {
      const cards = cardsForCommand(db.command)
      const status = processStatus(cards, isNpxCommandValid(db.command))
      return m(WithTooltip, {
        child: m(TextInput, {
          id: "npx-command",
          placeholder: "npx ghcd@latest ...",
          oninput: (e) => {
            if (!isCommandEmpty()) editingHasBegun = true
            updateCommand(e)
          },
          readonly: status !== "Start",
          reportNotTypingDelay: 800,
          onUserTypingOrNotTyping: (isTyping) => {
            userIsTyping = isTyping
            if (!isTyping) {
              markInvalid = isCommandInputInvalid()
            }
          },
          markInvalid: markInvalid,
        }),
        classForWrapper: "flex-grow",
        message: m(
          "div",
          m("p", "Oops, that npx command does not seem to be valid!"),
          m("p", "If you believe this is a bug, please open an issue :)")
        ),
        showTooltip: isCommandInputInvalid() && !userIsTyping,
        onlyOnHover: true,
      })
    },
  }
}

const MainStartButton = {
  view() {
    const cards = cardsForCommand(db.command)
    const status = processStatus(cards, isNpxCommandValid(db.command))
    const disabled = !isNpxCommandValid(db.command) || status !== "Start"
    return m(WithTooltip, {
      child: m(Button, {
        title: status,
        onclick: startClicked,
        visuallyDisabled: disabled,
        disabled: disabled,
      }),
      message:
        "First, enter a valid npx command, and then press the Start button!",
      showTooltip: !isNpxCommandValid(db.command),
      onlyOnHover: true,
    })
  },
}

const InputControls = {
  view() {
    return m("section", { class: "my-4 flex items-baseline flex-wrap gap-3" }, [
      m("label", { for: "npx-command", class: "text-xl" }, "Npx command"),
      m(NpxCommandInput),
      m(MainStartButton),
    ])
  },
}

const Main = {
  view() {
    return [
      m(Header),
      m("main", { class: "container mx-auto my-8 px-3" }, [
        m(InputControls),
        m(Cards),
      ]),
    ]
  },
}

const updateCommand = (e) => {
  db.command = e.target.value
}

const startClicked = () => {
  db.numberOfCardsShown = 1
}

const copyToClipboard = () => {
  const c = cardsForCommand(db.command)[db.numberOfCardsShown - 1].command
  navigator.clipboard.writeText(c)
  db.copiedToClipboard = true
  setTimeout(() => {
    db.copiedToClipboard = false
    m.redraw()
  }, 2000)
  setTimeout(() => {
    db.numberOfCardsShown++
    m.redraw()
  }, 3000)
}

m.mount(document.getElementById("app"), Main)
