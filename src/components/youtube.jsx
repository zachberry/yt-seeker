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
		events.on('youtube:changePlay', this.changePlay.bind(this))

		if (!window.onYouTubeIframeAPIReady) {
			window.onYouTubeIframeAPIReady = this.onYouTubeIframeAPIReady.bind(this)

			this.injectedScriptTag = document.createElement('script')
			this.injectedScriptTag.src = 'https://www.youtube.com/iframe_api'
			document.body.appendChild(this.injectedScriptTag)
		}
	}

	changePlay() {
		if (this.player.getPlayerState() === 1) {
			this.player.pauseVideo()
		} else {
			this.player.playVideo()
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
		const nudge = this.getNudgeForCurrentKey()
		const duration = this.player.getDuration()
		this.player.seekTo(duration * (number / 10) + nudge, true)

		this.showPerc(duration * (number / 10) + nudge)
	}

	seekToPerc(perc) {
		const nudge = this.getNudgeForCurrentKey()
		const duration = this.player.getDuration()
		this.player.seekTo(duration * perc + nudge, true)

		this.showPerc(duration * perc + nudge)
	}

	showPerc(secs) {
		const duration = this.player.getDuration()
		const perc = (secs / duration) * 100

		document.getElementById('last-seek-container').innerHTML = ''
		const el = document.createElement('span')
		const mins = parseInt(secs / 60, 10)
		let secsStr = '0' + (secs - mins * 60).toFixed(0)
		if (secsStr.length > 2) {
			secsStr = secsStr.substr(1, 2)
		}
		el.innerText = perc.toFixed(2) + '%' + ' (' + mins + ':' + secsStr + ')'
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

	getNudgeForCurrentKey() {
		const nudgesForVideo = this.props.nudgeTable.videosById[this.props.videoId]
		if (!nudgesForVideo) return 0
		return nudgesForVideo[this.props.currentKey] || 0
	}

	clearNudge(key) {
		console.log('clearNudge', key)
		events.emit('app:clearNudge', key)
	}

	onClickKey(key) {
		events.emit('youtube:skipToKey', key)
	}

	render() {
		const nudges = this.props.nudgeTable.videosById[this.props.videoId]
			? this.props.nudgeTable.videosById[this.props.videoId]
			: []
		return (
			<div>
				<div id="player" />
				{/* {this.props.currentKey ? (
					<div className="nudge">
						<span className="key">{this.props.currentKey.toUpperCase()}</span>
						{` Nudge: ${this.props.nudge.toFixed(1)}s`}
					</div>
				) : null} */}

				<div className="bookmarks">
					{Object.keys(nudges).map(key => {
						return (
							<div onClick={this.onClickKey.bind(this, key)} className="nudge">
								<span className="key">{key.toUpperCase()}</span>
								{`${nudges[key].toFixed(1)}s`}
								<button className="delete-button" onClick={this.clearNudge.bind(this, key)}>
									&times;
								</button>
							</div>
						)
					})}
				</div>
				<div id="last-seek-container"></div>
			</div>
		)
	}
}

export default YouTube
