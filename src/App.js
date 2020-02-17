import React from 'react'
import './App.css'
import events from './events'
import YouTube from './components/youtube'
import ControlPanel from './components/control-panel'
import VideoPlaylist from './components/video-playlist'
import getYouTubeId from 'get-youtube-id'

// const nudgeTable = {
// 	changes: 0,
// 	videosById: {}
// }

class App extends React.Component {
	constructor() {
		super()

		this.onChangeVideoId = this.onChangeVideoId.bind(this)
		this.onClickLoadVideo = this.onClickLoadVideo.bind(this)
		this.onClickSettings = this.onClickSettings.bind(this)

		events.on('youtube:ready', this.onYouTubeReady.bind(this))
		events.on('app:selectVideo', this.onSelectVideo.bind(this))
		events.on('youtube:changeKey', this.onChangeKey.bind(this))
		events.on('youtube:changeNudge', this.onChangeNudge.bind(this))
		// events.on('youtube:skipTo', this.onYouTubeSkipTo.bind(this))

		if (window.localStorage.nudgeTable) {
			try {
				this.nudgeTable = JSON.parse(window.localStorage.nudgeTable)
			} catch (e) {
				// Do nothing
			}
		}

		if (!this.nudgeTable) {
			this.nudgeTable = {
				videosById: {}
			}
		}

		this.state = {
			videoId: null,
			nextVideoId: 'https://www.youtube.com/watch?v=Itg6mRZdQew&feature=youtu.be',
			// nudge: 0,
			isYouTubeReady: false,
			apiKey: window.localStorage.apiKey || '',
			nudgeTableChanges: 0,
			currentKey: ''
			// seek: 0
		}
	}

	onChangeKey(key) {
		this.setState({
			currentKey: key
		})
	}

	onChangeNudge(amount) {
		if (!this.nudgeTable.videosById[this.state.videoId]) {
			this.nudgeTable.videosById[this.state.videoId] = {}
		}

		const nudgeTableByVideoId = this.nudgeTable.videosById[this.state.videoId]

		if (!nudgeTableByVideoId[this.state.currentKey]) {
			nudgeTableByVideoId[this.state.currentKey] = 0
		}

		nudgeTableByVideoId[this.state.currentKey] += amount

		this.setState({
			nudgeTableChanges: this.state.nudgeTableChanges + 1
		})

		window.localStorage.nudgeTable = JSON.stringify(this.nudgeTable)
	}

	onSelectVideo(videoId) {
		this.setState({
			nextVideoId: videoId,
			videoId: videoId
		})
	}

	onYouTubeReady() {
		this.setState({
			isYouTubeReady: true
		})
	}

	// onYouTubeSkipTo(secs) {
	// 	this.setState({
	// 		seek: secs
	// 	})
	// }

	onChangeVideoId(event) {
		this.setState({
			nextVideoId: event.target.value
		})
	}

	onClickLoadVideo(event) {
		this.setState({
			videoId: getYouTubeId(this.state.nextVideoId)
		})
	}

	onClickSettings() {
		delete window.localStorage.apiKey

		this.promptUserForAPIKey()
	}

	componentDidMount() {
		if (!this.state.apiKey) {
			this.promptUserForAPIKey()
		}
	}

	promptUserForAPIKey() {
		const apiKey = prompt('API Key?')
		if (!apiKey) {
			alert('You must provide an API Key')
		}

		window.localStorage.apiKey = apiKey

		this.setState({
			apiKey
		})
	}

	render() {
		let nudge = 0
		if (
			this.nudgeTable.videosById[this.state.videoId] &&
			this.nudgeTable.videosById[this.state.videoId][this.state.currentKey]
		) {
			nudge = this.nudgeTable.videosById[this.state.videoId][this.state.currentKey]
		}

		return (
			<div className="App">
				<VideoPlaylist apiKey={this.state.apiKey} />
				<div className="board">
					<div className="text-input">
						<span className="label">Video ID:</span>
						<input
							value={this.state.nextVideoId}
							type="text"
							onChange={this.onChangeVideoId}
						></input>
						<button onClick={this.onClickLoadVideo}>Load</button>
					</div>
					<YouTube
						currentKey={this.state.currentKey}
						videoId={this.state.videoId}
						seek={this.state.seek}
						nudge={nudge}
					/>
					<ControlPanel ready={this.state.isYouTubeReady} />
				</div>
				<button className="settings-button" onClick={this.onClickSettings}>
					Settings
				</button>
			</div>
		)
	}
}

export default App
