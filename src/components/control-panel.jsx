import React from 'react'
import events from '../events'

const keyTable = [
	'q',
	'w',
	'e',
	'r',
	't',
	'y',
	'u',
	'i',
	'o',
	'p',
	'[',
	']',
	'\\',
	'a',
	's',
	'd',
	'f',
	'g',
	'h',
	'j',
	'k',
	'l',
	';',
	"'",
	'z',
	'x',
	'c',
	'v',
	'b',
	'n',
	'm',
	',',
	'.',
	'/'
]

class ControlPanel extends React.Component {
	componentDidMount() {
		this.onKeyDown = this.onKeyDown.bind(this)
		document.addEventListener('keydown', this.onKeyDown)

		events.on('youtube:skipToKey', this.skipToKey.bind(this))
	}

	skipToKey(key) {
		const number = parseInt(key, 10)
		if (Number.isFinite(number)) {
			events.emit('youtube:skipToNumber', number)
			events.emit('youtube:changeKey', key)
			return
		}

		if (key === '`') {
			events.emit('youtube:bookmark')
			return
		}

		if (key === '-') {
			events.emit('youtube:changeNudge', -0.1)
			return
		}

		if (key === '=') {
			events.emit('youtube:changeNudge', 0.1)
			return
		}

		if (key === '_') {
			events.emit('youtube:changeNudge', -1)
			return
		}

		if (key === '+') {
			events.emit('youtube:changeNudge', 1)
			return
		}

		if (key === ' ') {
			events.emit('youtube:changePlay')
			return
		}

		const i = keyTable.indexOf(key)
		if (i === -1) return

		events.emit('youtube:skipToPerc', i / (keyTable.length - 1))
		events.emit('youtube:changeKey', key)
	}

	componentWillUnmount() {
		document.removeEventListener('keydown', this.onKeyDown)
	}

	onKeyDown(event) {
		this.skipToKey(event.key)
	}

	goto(secs) {
		events.emit('youtube:skipTo', secs)
	}

	render() {
		if (!this.props.ready) {
			return <div />
		}

		return <div>{/* <button onClick={this.goto.bind(null, 10)}>Go to 10s</button> */}</div>
	}
}

export default ControlPanel
