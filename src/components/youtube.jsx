import React from 'react'
import events from '../events'

class YouTube extends React.Component {
	constructor() {
		super()

		// this.state = {
		// 	lastSeek: ''
		// }
	}

	componentDidMount() {
		this.player = null
		this.injectedScriptTag = null

		this.onPlayerReady = this.onPlayerReady.bind(this)

		events.on('youtube:skipToNumber', this.seekToNumber.bind(this))
		events.on('youtube:skipToPerc', this.seekToPerc.bind(this))

		if (!window.onYouTubeIframeAPIReady) {
			window.onYouTubeIframeAPIReady = this.onYouTubeIframeAPIReady.bind(this)

			this.injectedScriptTag = document.createElement('script')
			this.injectedScriptTag.src = 'https://www.youtube.com/iframe_api'
			document.body.appendChild(this.injectedScriptTag)
		}
	}

	onYouTubeIframeAPIReady() {
		if (this.injectedScriptTag) {
			this.injectedScriptTag.parentElement.removeChild(this.injectedScriptTag)
			this.injectedScriptTag = null
		}

		this.setPlayer(this.props.videoId)
	}

	setPlayer(videoId) {
		console.log('setPlayer', videoId)
		this.player = new window.YT.Player('player', {
			height: '390',
			width: '640',
			videoId: videoId,
			events: {
				onReady: this.onPlayerReady
				// onStateChange: onPlayerStateChange
			}
		})
	}

	loadVideo(videoId) {
		this.player.loadVideoById(videoId)
	}

	onPlayerReady() {
		events.emit('youtube:ready')
	}

	seekToNumber(number) {
		const duration = this.player.getDuration()
		this.player.seekTo(duration * (number / 10), true)

		// this.setState({
		// 	lastSeek: number * 10 + '%'
		// })
		this.showPerc(number * 10)
	}

	seekToPerc(perc) {
		const duration = this.player.getDuration()
		this.player.seekTo(duration * perc, true)

		this.showPerc((perc * 100).toFixed(2))

		// this.setState({
		// 	lastSeek: (perc * 100).toFixed(2) + '%'
		// })
	}

	showPerc(perc) {
		document.getElementById('last-seek-container').innerHTML = ''
		const el = document.createElement('span')
		el.innerText = perc + '%'
		document.getElementById('last-seek-container').appendChild(el)
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.videoId !== this.props.videoId) {
			this.loadVideo(nextProps.videoId)
		}

		if (nextProps.seek !== this.props.seek) {
			this.seekTo(nextProps.seek)
		}
	}

	render() {
		return (
			<div>
				<div id="player" />
				<div id="last-seek-container"></div>
			</div>
		)
	}
}

export default YouTube
