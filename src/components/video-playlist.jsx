import React from 'react'
import events from '../events'
import YouTubeAPI from 'simple-youtube-api'

class VideoPlaylist extends React.Component {
	constructor(props) {
		super(props)

		this.onClickRefresh = this.onClickRefresh.bind(this)
		this.onChangePlaylistURL = this.onChangePlaylistURL.bind(this)
		this.onClickFilterByBookmarkedVideos = this.onClickFilterByBookmarkedVideos.bind(this)

		this.api = null
		if (props.apiKey) {
			this.api = new YouTubeAPI(props.apiKey)
		}

		if (window.localStorage.playlistURL && window.localStorage.videos) {
			try {
				this.state = {
					nextPlaylistURL: window.localStorage.playlistURL,
					playlistURL: window.localStorage.playlistURL,
					videos: JSON.parse(window.localStorage.videos),
					isFilteringByBookmarkedVideos: false
				}
				return
			} catch (e) {
				delete window.localStorage.playlistURL
				delete window.localStorage.videos
			}

			// this.loadPlaylistFromAPI()
		}

		this.state = {
			playlistURL: '',
			nextPlaylistURL: '',
			videos: [],
			isFilteringByBookmarkedVideos: false
		}
	}

	onClickFilterByBookmarkedVideos() {
		this.setState({
			isFilteringByBookmarkedVideos: !this.state.isFilteringByBookmarkedVideos
		})
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.apiKey !== this.props.apiKey) {
			this.api = new YouTubeAPI(nextProps.apiKey)
		}
	}

	loadPlaylistFromAPI(playlistURL) {
		this.api
			.getPlaylist(playlistURL)
			.then(playlist => {
				console.log('pl', playlist)
				console.log(`The playlist's title is ${playlist.title}`)
				playlist
					.getVideos()
					.then(videos => {
						console.log(`This playlist has ${videos.length === 50 ? '50+' : videos.length} videos.`)

						videos.reverse()

						const videoDetails = videos.map(v => ({
							id: v.id,
							title: v.title,
							thumbURL: v.thumbnails ? v.thumbnails.default.url : '',
							thumbWidth: v.thumbnails ? v.thumbnails.default.width : 0,
							thumbHeight: v.thumbnails ? v.thumbnails.default.height : 0
						}))
						window.localStorage.videos = JSON.stringify(videoDetails)
						this.setState({
							videos: videoDetails
						})
					})
					.catch(console.error)
			})
			.catch(console.error)
	}

	onClickRefresh() {
		if (!this.api) {
			return
		}

		delete window.localStorage.videos

		window.localStorage.playlistURL = this.state.nextPlaylistURL
		this.setState({
			playlistURL: this.state.nextPlaylistURL,
			videos: []
		})

		this.loadPlaylistFromAPI(this.state.nextPlaylistURL)
	}

	onChangePlaylistURL(event) {
		this.setState({
			nextPlaylistURL: event.target.value
		})
	}

	onClickVideo(id) {
		events.emit('app:selectVideo', id)
	}

	render() {
		if (!this.api) {
			return <div id="playlist">No API Key Provided!</div>
		}

		return (
			<div id="playlist">
				<div className="controls">
					{/* <span>API KEY:</span>
					<input type="text" /> */}
					<div className="text-input">
						<span className="label">Playlist URL:</span>
						<input
							value={this.state.nextPlaylistURL}
							type="text"
							onChange={this.onChangePlaylistURL}
						/>
						<button onClick={this.onClickRefresh}>Refresh</button>
					</div>
					<div className="filter">
						<label>
							<input
								value={this.state.isFilteringByBookmarkedVideos}
								onClick={this.onClickFilterByBookmarkedVideos}
								type="checkbox"
							/>{' '}
							<span className="star">⭐</span>
						</label>
					</div>
				</div>
				<ul>
					{this.state.videos.map((v, index) => {
						const hasBookmarks = this.props.nudgeTable.videosById[v.id]

						if (this.state.isFilteringByBookmarkedVideos && !hasBookmarks) return null

						return (
							<li key={index} onClick={this.onClickVideo.bind(this, v.id)}>
								{v.thumbURL ? (
									<img alt="" width={v.thumbWidth} height={v.thumbHeight} src={v.thumbURL} />
								) : null}
								<span>{(hasBookmarks ? '⭐ ' : '') + v.title}</span>
							</li>
						)
					})}
				</ul>
			</div>
		)
	}
}

export default VideoPlaylist
