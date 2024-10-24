/* eslint-env browser */

/// <reference lib="dom" />

/**
 * @import {Nodes, Parents} from 'nlcst'
 */

import {toString} from 'nlcst-to-string'
import {ParseEnglish} from 'parse-english'
import ReactDom from 'react-dom/client'
import React from 'react'
import {syllable} from 'syllable'

const $main = /** @type {HTMLElement} */ (document.querySelector('main'))
const $template = /** @type {HTMLTemplateElement} */ (
  document.querySelector('template')
)
const hues = createHues()
const parser = new ParseEnglish()

const root = ReactDom.createRoot($main)

root.render(React.createElement(Playground))

function Playground() {
  const [text, setText] = React.useState($template.innerHTML)
  const tree = parser.parse(text)

  return (
    <div>
      <section className="highlight">
        <h1>
          <code>short-words</code>
        </h1>
      </section>
      <div className="editor">
        <div className="draw">
          {all(tree)}
          {/* Trailing whitespace in a `textarea` is shown,
          but not in a `div` with `white-space: pre-wrap`;
          add a `br` to make the last newline explicit. */}
          {/\n[ \t]*$/.test(text) ? <br /> : undefined}
        </div>
        <textarea
          className="write"
          onChange={(event) => setText(event.target.value)}
          rows={text.split('\n').length + 1}
          spellCheck="false"
          value={text}
        />
      </div>
      <section className="highlight">
        <p>
          Use short words. Short words are more powerful and less pretentious.{' '}
          <em>Stop</em> is stronger than <em>discontinue</em>. Based on a tip by
          <a href="https://www.garyprovost.com">Gary Provost</a> (“Use Short
          Words”).
        </p>
        <p>
          The demo highlights words by syllable count. Short words are green.{' '}
          Longer words go through orange to red. Stay in the green.
        </p>
      </section>
      <section className="credits">
        <p>
          <a href="https://github.com/wooorm/short-words">Fork this website</a>{' '}
          •{' '}
          <a href="https://github.com/wooorm/short-words/blob/main/license">
            MIT
          </a>{' '}
          • <a href="https://github.com/wooorm">@wooorm</a>
        </p>
      </section>
    </div>
  )
}

/**
 * @param {Parents} parent
 * @returns {Array<JSX.Element | string>}
 */
function all(parent) {
  /** @type {Array<JSX.Element | string>} */
  const results = []

  for (const child of parent.children) {
    const result = one(child)
    if (Array.isArray(result)) {
      results.push(...result)
    } else {
      results.push(result)
    }
  }

  return results
}

/**
 * @param {Nodes} node
 * @returns {Array<JSX.Element | string> | JSX.Element | string}
 */
function one(node) {
  const result = 'value' in node ? node.value : all(node)

  if (node.type === 'WordNode') {
    const count = syllable(toString(node))
    const hue = count < hues.length ? hues[count] : hues[hues.length - 1]
    const backgroundColor = 'hsl(' + hue + 'deg 93% 50% / 50%)'
    return <span style={{backgroundColor}}>{result}</span>
  }

  return result
}

function createHues() {
  /** @type {Array<number>} */
  const colors = []
  colors[1] = 75
  colors[2] = 60
  colors[3] = 45
  colors[4] = 30
  colors[5] = 15
  colors.push(0)
  return colors
}
