import React from 'react'
import './App.css'
import events from './events'
import YouTube from './components/youtube'
import ControlPanel from './components/control-panel'
import VideoPlaylist from './components/video-playlist'
import getYouTubeId from 'get-youtube-id'

class App extends React.Component {
	constructor() {
		super()

		this.onChangeVideoId = this.onChangeVideoId.bind(this)
		this.onClickLoadVideo = this.onClickLoadVideo.bind(this)
		this.onClickSettings = this.onClickSettings.bind(this)

		events.on('youtube:ready', this.onYouTubeReady.bind(this))
		events.on('app:selectVideo', this.onSelectVideo.bind(this))
		events.on('youtube:changeNudge', this.onChangeNudge.bind(this))
		// events.on('youtube:skipTo', this.onYouTubeSkipTo.bind(this))

		this.state = {
			videoId: null,
			nextVideoId: 'https://www.youtube.com/watch?v=Itg6mRZdQew&feature=youtu.be',
			nudge: 0,
			isYouTubeReady: false,
			apiKey: window.localStorage.apiKey || ''
			// seek: 0
		}
	}

	onChangeNudge(amount) {
		this.setState({
			nudge: this.state.nudge + amount
		})
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
					<YouTube videoId={this.state.videoId} seek={this.state.seek} nudge={this.state.nudge} />
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
