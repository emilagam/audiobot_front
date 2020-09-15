import React from 'react'
import { Cell, Group, ScreenSpinner, Avatar, Button, Div } from '@vkontakte/vkui'
import LastSongs from './LastSongs'
import '@vkontakte/vkui/dist/vkui.css';
import {addFollow, deleteFollow, userFollows} from '../../modules/follow'
import Error from '../Error'
import { withModalRootContext } from '@vkontakte/vkui';
import bridge from '@vkontakte/vk-bridge'

class UserProfile extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			user: {},
			isLoaded: false,
			follows: false,
			error: false,
			lastSongs: []
		}
	}
	
	async componentDidMount() {

		this.getItem()

		const follows = await userFollows(this.props.userId)
		this.setState({follows})

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
		
	 	this.setState({ user: result.response[0], isLoaded: true })
		
		this.props.updateModalHeight();
	}

	follow = () => {
		this.setState({follows: true})
		addFollow(this.state.user.id, 'f')
	}

	unfollow = () => {
		this.setState({follows: false})
		deleteFollow(this.state.user.id, 'f')
	}
	
	songsLoadDone = () => {
		this.props.updateModalHeight();		
	}

	render() {

		const user = this.state.user
 
		if (this.state.error) {
			return <Error />
		}
		else if (!this.state.isLoaded) {
			return <ScreenSpinner />
		}
		else {
			return (
				<Group>
					<Cell
						disabled
						before={<Avatar size={75} src={user.photo_200} />}
					>
						{user.first_name} {user.last_name}
      				</Cell>
					<Div>
					<Button mode="outline" size="xl" href={`https://vk.com/id${this.props.userId}`} target="blank"> 
						Открыть VK 
					</Button>
					</Div>
					<Div>
					{this.state.follows ?
							<Button mode="secondary" size="xl" onClick={this.unfollow} > 
								Вы подписаны 
							</Button>
						:
							<Button mode="primary" size="xl" onClick={this.follow} > 
								Подписаться 
							</Button>
					}
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

export default withModalRootContext(UserProfile);

