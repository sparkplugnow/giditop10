import React from 'react';
import ReactDOM from 'react-dom';
import './styles.css';
import result from './json/result.json';
import {Howl} from 'howler';
import playButton from './images/play.png';
import pauseButton from './images/pause.png';
import prevButton from './images/prev.png';
import nextButton from './images/next.png';

class Control extends React.Component {
	render() {
		return (
				<img id={this.props.id} src={this.props.imageUrl} alt="control" onClick={this.props.controlAction} />
			);
	}
}

class Info extends React.Component {
	render() {
		return (
			<span id={this.props.id}>{this.props.text}</span>
			);
	}
}

class AlbumArt extends React.Component {
	render() {
		return (
			<img id={this.props.id} alt="album" />
			);
	}
}

class MusicPlayer extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			initial: true,
			tracks: [],
			songCount: 0,
			nowPlaying: undefined,
			status: "play",
		};
	}

	componentDidMount() {
		// Get the array of tracks from the json supplied in result.
		let tracks = result.tracks;
		// After setting the state, load the first song and then proceed to create and display the appropriate thumbnail.
		// The second action (creating of thumbnail) is passed as a callback function to the createSong function where the 
		// callback is handled.
		this.setState((prevState) => {
			return {
				tracks: tracks,
			}
		}, () => this.createSong(this.createThumb));
	}

	createSong(callback) {
		// Get the 'play' button.
		let playImage = document.getElementById('play');
		// If there's a song currently playing, stop it and clear it.
		if (this.state.nowPlaying) {
			this.state.nowPlaying.stop();
			this.setState({
				nowPlaying: undefined,
			});
		}

		// Create a new Howler object and load the appropriate song.
		
		let song = new Howl({
			src: [(this.state.tracks[this.state.songCount].url)],
			onload: () => {
				// If this is the first time a song is being loaded, don't play automatically.
				// Otherwise, play the song automatically.
				if (this.state.initial) this.setState({initial: false});
				else this.state.nowPlaying.play();				
				this.createDuration(this);
			},
			onplay: () => {
				playImage.src = pauseButton;
				this.setState({
						status: "pause",
					});
			},
			onpause: () => {
				playImage.src = playButton;
				this.setState({
					status: "play",
				})
			},
			onend: () => {
				// When a song is finished playing, proceed to the next one in queue.
				playImage.src = playButton;
				this.skipTrack();
			}
		});
	
		// Save the current song in state, and then proceed to execute the callback function passed in parameters
		// if defined.
		this.setState((prevState) => {
			return {
				nowPlaying: song,
			}
		}, () => {callback ? callback(this, this.createInfo) : 0;});
	}

	createThumb(caller, callback) {
		let art =(caller.state.tracks[caller.state.songCount].thumbnail);
		document.getElementById('thumbnail').src = art;
		callback ? callback(caller) : 0;
	}

	createInfo(caller, callback) {
		let artist = caller.state.tracks[caller.state.songCount].artist.name;
		let title = caller.state.tracks[caller.state.songCount].title;
		document.getElementById('artist').textContent = artist;
		document.getElementById('title').textContent = title;
		callback ? callback(caller) : 0;
	}

	createDuration(caller) {
		let durationSeconds =  caller.state.nowPlaying.duration();
		let minutes = Math.floor(durationSeconds / 60);
		let seconds = durationSeconds%60;
		function quickFormat(string,pad,length) {
			return (new Array(length+1).join(pad)+string).slice(-length);
		}
		let finalDuration = quickFormat(minutes,'0',2)+':'+quickFormat(seconds,'0',2);
		document.getElementById('duration').textContent = finalDuration;
	}

	handlePlayAndPause() {
		if (this.state.status === "play") {
			if(!this.state.nowPlaying) {
				this.createSong(this.createThumb);
			} else this.state.nowPlaying.play();
		} else if (this.state.status === "pause") {
			this.state.nowPlaying.pause();
		}
	}

	skipTrack() {
		this.setState((prevState) => {
			return {songCount: ((prevState.songCount === this.state.tracks.length - 1) ? 0 : prevState.songCount + 1)}
		}, () => this.createSong(this.createThumb));
	}

	backTrack() {
		this.setState((prevState) => {
			return {songCount: ((prevState.songCount === 0) ? this.state.tracks.length - 1 : prevState.songCount - 1)}
		}, () => this.createSong(this.createThumb));
	}

	render() {
		return (
			<div className="wrapper">
				<div className="top">
					<AlbumArt id="thumbnail" />
					<div className="info">
							<Info text="-" id="artist" />
							<Info text="-" id="title" />
							<Info text="--:--" id="duration" />
					</div>
				</div>
				<div className="bottom">
					<Control id="previous" imageUrl={prevButton} controlAction={() => this.backTrack()} />
					<Control id="play" imageUrl={playButton} controlAction={() => this.handlePlayAndPause()} />
					<Control id="next" imageUrl={nextButton} controlAction={() => this.skipTrack()} />
				</div>
			</div>
			);
	}
}


// ========================================

ReactDOM.render(
  <MusicPlayer />,
  document.getElementById('root')
);
