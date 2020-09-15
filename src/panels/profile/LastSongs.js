import React from 'react'
import { Cell, Group, ScreenSpinner, List, Banner, Header, Placeholder } from '@vkontakte/vkui'
import '@vkontakte/vkui/dist/vkui.css';
import fetchJsonp from 'fetch-jsonp'
import Icon56ErrorOutline from '@vkontakte/icons/dist/56/error_outline';

function Post (props) {

	if (props.post.copy_history) {
		return ""
	} 

	return (
		props.post.attachments.map((item, index) => (	
			<Group key={index}>
			{item.type === "audio" &&
				<Audio key={index} audio={item.audio} />
			}
			{item.type === "audio_playlist" &&
				<AudioPlaylist key={index} playlist={item.audio_playlist}/>
			}
			{item.type === "link" &&
				<Link key={index} audio={item.link}/>
			}
			</Group>
		))
	)	
}

function Link (props) {
	return (
		<Banner
			header="Пост"
			subheader={props.audio.title}
		/>
	)

}


function Audio (props) {
	return (
		<Banner
			header={props.audio.title}
			subheader={props.audio.artist}
		/>
	)
}

function AudioPlaylist (props) {
	const item = props.playlist	
	return (
		<Banner
			size="m"
			mode="image"
			header={item.title}
			subheader={(item.main_artists && item.main_artists.length > 0 ? item.main_artists[0].name: "")}
			background={
				<div
					style={{
					backgroundColor: '#000',
					backgroundPosition: 'right bottom',
					backgroundImage: 'url('+ (item.photo ? item.photo.photo_300 : '') + ')',
					backgroundSize: 340,
					backgroundRepeat: 'no-repeat',
					}}
				/>
				}
			asideMode="expand" 
			text={item.description}
		/>
	)
}

class LastSongs extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			isLoaded: false,
			error: false,
			lastSongs: []
		}
	}

	async componentDidMount() {

		this.getSongs()
	}

	async getSongs () {
		
		let api = `https://api.vk.com/method/newsfeed.get?v=5.122&access_token=${this.props.authToken}&filters=audio,audio_playlist&source_ids=${this.props.userId}`	
		await fetchJsonp(api)
			.then(res => res.json())
			.then(data => this.setState({lastSongs: data.response.items, isLoaded: true}))
			//.then(data => console.log(data))
			.catch(e => this.setState({ error: true }))

		this.props.loadedCallBack()
	}

	render() {

		if (this.state.error) {
			return <Cell>Произошла ошибка</Cell>
		}
		else if (!this.state.isLoaded) {
			return <ScreenSpinner />
		}
		else {
			return (
				<Group>
				<Header>
					Последние песни
				</Header>
				{this.state.lastSongs.length > 0 ?
					<List>
					{this.state.lastSongs.map((item, index) => (
						<Group key={index}>
						{item.type === "post" &&
							<Post key={index} post={item}/>
						}								
						
						{item.type === "audio" &&
							item.audio.items.map((audio, indexA) => (
								<Audio key={indexA} audio={audio} />
							))
						}

						{item.type === "audio_playlist" &&
							item.audio_playlist.items.map((playlist, indexP) => (
								<AudioPlaylist key={indexP} playlist={playlist} />
							))
						}		
						</Group>	
					))}
					</List>
				:
					<Placeholder
						icon={<Icon56ErrorOutline />}
						header="Нет актуальных песен"
					>
						Песни закрыты или давно ничего не добавлялось <br /> 
						*этот текст здесь потому что без него ничего не показывает*
					</Placeholder>
				}		
				</Group>
			)
		}
	}
}

export default LastSongs;

