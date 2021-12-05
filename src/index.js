import doc from 'global/document.js'
import win from 'global/window.js'
import createElement from 'virtual-dom/create-element.js'
import diff from 'virtual-dom/diff.js'
import patch from 'virtual-dom/patch.js'
import h from 'virtual-dom/h.js'
import {unified} from 'unified'
import retextEnglish from 'retext-english'
import {syllable} from 'syllable'
import {toString} from 'nlcst-to-string'
import debounce from 'debounce'

const processor = unified().use(retextEnglish)
const hue = hues()
const main = doc.querySelectorAll('main')[0]
let tree = render(doc.querySelectorAll('template')[0].innerHTML)
let dom = main.appendChild(createElement(tree))

function onchange(ev) {
  const next = render(ev.target.value)
  dom = patch(dom, diff(tree, next))
  tree = next
}

function resize() {
  dom.lastChild.rows = rows(dom.firstChild)
}

function render(text) {
  const tree = processor.runSync(processor.parse(text))
  const change = debounce(onchange, 4)
  let key = 0

  setTimeout(resize, 4)

  return h('div', [
    h('section.highlight', [h('h1', {key: 'title'}, 'short words')]),
    h('div', {key: 'editor', className: 'editor'}, [
      h('div', {key: 'draw', className: 'draw'}, pad(all(tree, []))),
      h('textarea', {
        key: 'area',
        value: text,
        oninput: change,
        onpaste: change,
        onkeyup: change,
        onmouseup: change
      })
    ]),
    h('section.highlight', [
      h('p', {key: 'intro'}, [
        'Use short words. Short words are more powerful and less pretentious. ',
        h('em', 'Stop'),
        ' is stronger than ',
        h('em', 'discontinue'),
        '. Based on a tip by ',
        h('a', {href: 'https://www.garyprovost.com'}, 'Gary Provost'),
        ' (“Use Short Words”).'
      ]),
      h('p', {key: 'description'}, [
        'The demo highlights words by syllable count. Short words are green. ',
        'Longer words go through orange to red. Stay in the green.'
      ])
    ]),
    h('section.credits', {key: 'credits'}, [
      h('p', [
        h('a', {href: 'https://github.com/wooorm/short-words'}, 'GitHub'),
        ' • ',
        h(
          'a',
          {href: 'https://github.com/wooorm/short-words/blob/src/license'},
          'MIT'
        ),
        ' • ',
        h('a', {href: 'https://wooorm.com'}, '@wooorm')
      ])
    ])
  ])

  function all(node, parentIds) {
    const children = node.children
    const length = children.length
    let index = -1
    let results = []

    while (++index < length) {
      results = results.concat(one(children[index], parentIds.concat(index)))
    }

    return results
  }

  function one(node, parentIds) {
    let result = 'value' in node ? node.value : all(node, parentIds)
    const styles = style(node)
    const id = parentIds.join('-') + '-' + key

    if (styles) {
      result = h('span', {key: id, id, style: styles}, result)
      key++
    }

    return result
  }

  // Trailing white-space in a `textarea` is shown, but not in a `div` with
  // `white-space: pre-wrap`.
  // Add a `br` to make the last newline explicit.
  function pad(nodes) {
    const tail = nodes[nodes.length - 1]

    if (typeof tail === 'string' && tail.charAt(tail.length - 1) === '\n') {
      nodes.push(h('br', {key: 'break'}))
    }

    return nodes
  }
}

function style(node) {
  const result = {}

  if (node.type === 'WordNode') {
    result.backgroundColor = color(syllable(toString(node)))
    return result
  }
}

function color(count) {
  const value = count < hue.length ? hue[count] : hue[hue.length - 1]
  return 'hsla(' + [value, '93%', '50%', '0.5'].join(', ') + ')'
}

function hues() {
  const colors = []
  colors[1] = 75
  colors[2] = 60
  colors[3] = 45
  colors[4] = 30
  colors[5] = 15
  colors.push(0)
  return colors
}

function rows(node) {
  if (!node) {
    return
  }

  return Math.ceil(
    node.getBoundingClientRect().height /
      Number.parseInt(win.getComputedStyle(node).lineHeight, 10)
  )
}
