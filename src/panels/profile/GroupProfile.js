import React, { Component } from 'react'
import { Cell, Group, ScreenSpinner, Avatar, Button, Div } from '@vkontakte/vkui'
import { withModalRootContext } from '@vkontakte/vkui';
import LastSongs from './LastSongs'
import '@vkontakte/vkui/dist/vkui.css';
import {addFollow, deleteFollow, userFollows} from '../../modules/follow'
import Error from '../Error'
import bridge from '@vkontakte/vk-bridge'

class GroupProfile extends Component {
	constructor(props) {
		super(props);

		this.state = {
			group: {},
			isLoaded: false,
			follows: false,
			error: false,
			lastSongs: []
		}
	}

	async componentDidMount() {

		this.getItem()

		const follows = await userFollows(this.props.groupId)
		console.log(follows)
		this.setState({follows})
	}


	async getItem() {

		let result = await bridge.send("VKWebAppCallAPIMethod", {
			method: "groups.getById",
			params: {
				"group_id": this.props.groupId, 
				'fields': "photo_200",
				'v': '5.110',
				'access_token': this.props.authToken
			}
		})
		
	 	this.setState({ group: result.response[0], isLoaded: true })
		
		this.props.updateModalHeight()
	}

	follow = () => {
		this.setState({follows: true})
		addFollow(this.state.group.id, 'g')		
	}

	unfollow = () => {
		this.setState({follows: false})
		deleteFollow(this.state.group.id, 'g')
	}

	songsLoadDone = () => {
		this.props.updateModalHeight()
	}

	render() {

		const group = this.state.group

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
						before={<Avatar size={75} src={group.photo_200} />}
					>
						{group.name}
      				</Cell>
					<Div>
					<Button mode="outline" size="xl" href={`https://vk.com/${group.screen_name}`} target="blank"> 
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
						userId={-this.props.groupId} 
						authToken={this.props.authToken}
						loadedCallBack={this.songsLoadDone}
					/>		
				</Group>
			)
		}
	}
}

export default withModalRootContext(GroupProfile);

