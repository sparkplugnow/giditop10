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
			<div onClick={this.props.controlAction}>
				<img id={this.props.id} src={this.props.imageUrl} alt="control" />
			</div>
			);
	}
}

class InfoContainer extends React.Component {
	render() {
		let artist = this.props.tracks[this.props.songCount]["artist"];
		let title = this.props.tracks[this.props.songCount]["music"].replace(/.mp3|.m4a/, '');
		let initialDuration = (this.props.song ? this.props.song.duration() : 0);
		let minutes = Math.floor(initialDuration / 60);
		let seconds = initialDuration%60;
		function quickFormat(string,pad,length) {
			return (new Array(length+1).join(pad)+string).slice(-length);
		}
		let finalDuration = quickFormat(minutes,'0',2)+':'+quickFormat(seconds,'0',2);
		return (
			<div className="info">
				<Info text={artist} id="artist" />
				<Info text={title} id="title" />
				<Info text={finalDuration} id="duration" />
			</div>
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

class AlbumArtContainer extends React.Component {
	render() {
		let art = require('./album_art/' + this.props.tracks[this.props.songCount]["albumArt"] + '.jpg');
		return (
			<AlbumArt src={art} />
			);
	}
}

class AlbumArt extends React.Component {
	render() {
		return (
			<img id="thumbnail" src={this.props.src} alt="album" />
			);
	}
}

class MusicPlayer extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			initial: true,
			songCount: 0,
			song: undefined,
			tracks: [],
			status: "play",
			playPauseButton: playButton,
		};
	}

	componentWillMount() {
		// Get the array of tracks from the json supplied in result.
		let tracks = result["main"];
		// After setting the state, load the first song and then proceed to create and display the appropriate thumbnail.
		// The second action (creating of thumbnail) is passed as a callback function to the createSong function where the 
		// callback is handled.
		this.setState((prevState) => {
			return {
				tracks: tracks,
			}
		}, () => {
			let song = this.createSong();
			this.setState({
				song: song,
			});
		});
	}

	createSong() {
		// Create a new Howler object and load the appropriate song.
		let song = new Howl({
			src: [require('./music/' + this.state.tracks[this.state.songCount]["music"])],
			onload: () => {
				// If this is the first time a song is being loaded, don't play automatically.
				// Otherwise, play the song automatically.
				if (this.state.initial) this.setState({initial: false});
				else this.state.song.play();
			},
			onplay: () => {
				this.setState({
						playPauseButton: pauseButton,
						status: "pause",
					});
			},
			onpause: () => {
				this.setState({
					playPauseButton: playButton,
					status: "play",
				});
			},
			onend: () => {
				// When a song is finished playing, proceed to the next one in queue.
				this.setState({
					playPauseButton: pauseButton,
					status: "play",
				});
				this.skipTrack();
			}
		});
	
		return song;
	}

	handlePlayAndPause() {
		this.state.status === "play" ? this.state.song.play() : this.state.song.pause();
	}

	handlePreviousOrNext(direction) {
		this.state.song.unload();
		this.setState((prevState) => {
			return {
				songCount: (direction ? 
					(prevState.songCount === this.state.tracks.length - 1 ? 0 : prevState.songCount + 1) : 
					(prevState.songCount === 0 ? this.state.tracks.length - 1 : prevState.songCount - 1)),
				}
		}, () => {
			let song = this.createSong();
			this.setState({
				song: song,
			});
		});
	}

	render() {
		return (
			<div className="wrapper">
				<div className="top">
					<AlbumArtContainer tracks={this.state.tracks} songCount={this.state.songCount} />
						<InfoContainer
							tracks={this.state.tracks}
							songCount={this.state.songCount}
							song={this.state.song} />
				</div>
				<div className="bottom">
					<Control id="previous" imageUrl={prevButton} controlAction={() => this.handlePreviousOrNext(0)} />
					<Control id="play" imageUrl={this.state.playPauseButton} controlAction={() => this.handlePlayAndPause()} />
					<Control id="next" imageUrl={nextButton} controlAction={() => this.handlePreviousOrNext(1)} />
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
