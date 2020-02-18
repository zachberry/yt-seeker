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
		this.onClickImport = this.onClickImport.bind(this)
		this.onClickExport = this.onClickExport.bind(this)

		events.on('youtube:ready', this.onYouTubeReady.bind(this))
		events.on('app:selectVideo', this.onSelectVideo.bind(this))
		events.on('youtube:changeKey', this.onChangeKey.bind(this))
		events.on('youtube:changeNudge', this.onChangeNudge.bind(this))
		events.on('app:clearNudge', this.onClearNudge.bind(this))
		events.on('youtube:bookmark', this.onBookmark.bind(this))
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

	onClearNudge(key) {
		console.log('clearNudge', key)
		if (!this.nudgeTable.videosById[this.state.videoId]) return
		delete this.nudgeTable.videosById[this.state.videoId][key]

		if (Object.keys(this.nudgeTable.videosById[this.state.videoId]).length === 0) {
			delete this.nudgeTable.videosById[this.state.videoId]
		}

		this.setState({
			nudgeTableChanges: this.nudgeTableChanges + 1
		})

		window.localStorage.nudgeTable = JSON.stringify(this.nudgeTable)
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

	onBookmark() {
		this.onChangeNudge(0)
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

	onClickImport() {
		const text = prompt('Import text?')
		if (!text) return

		const oldStorage = window.localStorage

		console.log('import', text)

		try {
			const o = JSON.parse(text)

			Object.keys(o).forEach(key => {
				window.localStorage[key] = o[key]
			})

			window.location = window.location
		} catch (e) {
			console.error(e)
			// window.localStorage = oldStorage

			Object.keys(oldStorage).forEach(key => {
				window.localStorage[key] = oldStorage[key]
			})
		}
	}

	onClickExport() {
		document.write(JSON.stringify(window.localStorage, null, 2))
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
				<VideoPlaylist apiKey={this.state.apiKey} nudgeTable={this.nudgeTable} />
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
						// nudge={nudge}
						nudgeTable={this.nudgeTable}
					/>
					<ControlPanel ready={this.state.isYouTubeReady} />
				</div>
				<div className="floating-buttons">
					<button className="settings-button" onClick={this.onClickSettings}>
						Settings
					</button>
					<button className="import-button" onClick={this.onClickImport}>
						Import
					</button>
					<button className="export-button" onClick={this.onClickExport}>
						Export
					</button>
				</div>
			</div>
		)
	}
}

export default App
