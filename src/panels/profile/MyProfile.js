import React, { Component } from 'react'
import { Cell, Group, ScreenSpinner, Avatar, Button, Counter, Div } from '@vkontakte/vkui'
import Error from '../Error'
import LastSongs from './LastSongs'
import '@vkontakte/vkui/dist/vkui.css';
import {getFollowCount} from '../../modules/follow'
import bridge from '@vkontakte/vk-bridge'

class MyProfile extends Component {
	constructor(props) {
		super(props);

		this.state = {
			user: {},
			isLoaded: false,
			error: false,
			lastSongs: [],
			followsCount: 0,
		}
	}

	async componentDidMount() {
		this.getItem()
	}

	async getItem() {

		let result = await bridge.send("VKWebAppCallAPIMethod", {
			method: "users.get",
			params: {
				"user_ids": this.props.userId, 
				'fields': "photo_200",
				'v': '5.110',
				'access_token': this.props.authToken
			}
		})

		this.setState({ 
			user: result.response[0], 
			isLoaded: true, 
			followsCount: 0 
		})

		let followsCount = await getFollowCount()
		this.setState({ 
			followsCount 
		})

	}

	songsLoadDone = () => {
			
	}

	render() {

		const user = this.state.user

		if (this.state.error) {
			return (
				<Error />	
			)
		}
		else if (!this.state.isLoaded) {
			return (
				<ScreenSpinner />
			)
		}
		else {
			return (
				<Group>
					<Cell disabled before={<Avatar size={100} src={user.photo_200} />}>
						{user.first_name} {user.last_name}
      				</Cell>
					<Div style={{ display: "flex"}}>
						<Button 
							mode="outline" 
							stretched 
							size="l" 
							style={{ marginRight: 8 }} 
							after={<Counter>{this.state.followsCount}</Counter>}
							onClick={this.props.openFollows}
						>
							Подписки
						</Button>
						<Button mode="outline" stretched size="l" after={<Counter>0</Counter>}>Подписчики</Button>
					</Div>
					<LastSongs 						
						userId={this.props.userId} 
						authToken={this.props.authToken}
						loadedCallBack={this.songsLoadDone}
					/>						
				</Group>
			)
		}
	}
}

export default MyProfile;

