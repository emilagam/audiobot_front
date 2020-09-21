import React, { Component } from 'react'
import { Cell, Group, ScreenSpinner, Avatar, PanelHeader, Placeholder, PanelHeaderBack, List, Header, Button, Div} from '@vkontakte/vkui'
import Error from './Error'
import '@vkontakte/vkui/dist/vkui.css';
import Icon28ChevronRightOutline from '@vkontakte/icons/dist/28/chevron_right_outline'
import {getFollows} from '../modules/follow'
import bridge from '@vkontakte/vk-bridge'

class Follows extends Component {
	constructor(props) {
		super(props);

		this.state = {
			friends: [],
			groups: [],
			isLoaded: false,
			error: false,
			lastSongs: []
		}
	}

	async componentDidMount() {

		this.getItem()
	}


	async getItem() {

		let follows = await getFollows();

		let groups = follows.filter(item => item.type === 'g')
		let friends = follows.filter(item => item.type === 'f')
		
		let groups_ids = groups.map((group) => {
			return group.id
		}).toString()

		let fiends_ids = friends.map((friend) => {
			return friend.id
		}).toString()

		friends = []
		groups = []
		console.log(groups_ids)

		if (fiends_ids !== '') {
			friends = await bridge.send("VKWebAppCallAPIMethod", {
				method: "users.get",
				params: {
					"user_ids": fiends_ids, 
					'fields': "photo_200",
					'v': '5.110',
					'access_token': this.props.authToken
				}
			})
			friends = friends.response
		}
	
		if (groups_ids !== '') {
			groups = await bridge.send("VKWebAppCallAPIMethod", {
				method: "groups.getById",
				params: {
					"group_ids": groups_ids, 
					'fields': "photo_200",
					'v': '5.110',
					'access_token': this.props.authToken
				}
			})
			groups = groups.response
		}

		this.setState({
			friends, groups,
			isLoaded: true
		})
	
	}

	render() {

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
				<PanelHeader left={<PanelHeaderBack onClick={this.props.onBack} />}> 
					Мои Кореша 
				</PanelHeader>
				{this.state.friends.length > 0 &&
					<Group header={<Header mode="secondary">Друзья</Header>}>
					<List>
						{this.state.friends.map((item, index) => (
							<Cell
								key={index}
								before={<Avatar size={40} src={item.photo_200} />} 
								asideContent={<Icon28ChevronRightOutline />}
								onClick={() => this.props.openProfile(item.id)}
							>
								{item.first_name}  {item.last_name}
							</Cell>
							) 
						)}
					</List>
					</Group>
				}

				{this.state.groups.length > 0 &&
					<Group header={<Header mode="secondary">Группы</Header>}>
					<List>
						{this.state.groups.map((item, index) => (
							<Cell
								key={index}
								before={<Avatar size={40} src={item.photo_200} />} 
								asideContent={<Icon28ChevronRightOutline />}
								onClick={() => this.props.openGroup(item.id)}
							>
								{item.name}
							</Cell>
							) 
						)}
					</List>
					</Group>
				}	

				{this.state.groups.length === 0 && this.state.friends.length === 0 && 
					<Placeholder
						header="Корешей нет"
						action={
							<Div style={{ display: "flex"}}>
								<Button mode="outline" stretched size="l" style={{ marginRight: 8 }} 
										onClick={this.props.openFriends}
								>
									Друзья
								</Button>
								<Button mode="outline" stretched size="l"
										onClick={this.props.openGroups}
								>
									Группы
								</Button>
							</Div>						
						}
					> 
						подпишись на другов и группы
					</Placeholder>
				}	
				</Group>
			)
		}
	}
}

export default Follows;

