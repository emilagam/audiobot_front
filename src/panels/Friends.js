import React, { Component } from 'react'
import { List, Cell, Avatar, ScreenSpinner, Group, Search, Header } from '@vkontakte/vkui'
import Icon28ChevronRightOutline from '@vkontakte/icons/dist/28/chevron_right_outline'
import '@vkontakte/vkui/dist/vkui.css'
import Error from './Error'
import bridge from '@vkontakte/vk-bridge'

const OFFSET_COUNT = 20

class Friends extends Component {
	constructor (props) {
		super(props);

		this.state = {
			search: "",
			searchItems: [],
			searchItemsGlobal: [],
			friends: [],
			isLoaded: false,
			error: false,
			searchTimeoutId: 0
		}
	}

	async componentDidMount () {

		await this.getItems(0)

	}

	async getItems (offset) {

		let result = await bridge.send("VKWebAppCallAPIMethod", {
			method: "friends.get",
			params: {
				'fields': "photo_100",
				"offset": offset,
				"count": OFFSET_COUNT,
				'v': '5.110',
				'access_token': this.props.authToken
			}
		})

		if (result.response.items.length === 0) {
			return
		}

		await this.setState({ 
			friends : [...this.state.friends, ...result.response.items], 
			isLoaded: true
		})

		setTimeout(500)
		this.getItems(offset + OFFSET_COUNT)

	}

	openProfile = (id) => {
		this.props.openProfile(id)
	}

	onChange = (e) => {

		// Большое спасибо Владиимиру Смирнову за подсказку: 
		const value = e.target.value
		this.setState({
			search: value
		})

		clearTimeout(this.state.searchTimeoutId);
		let timeoutId = setTimeout(() => this.search(value), 500);
		this.setState({
			searchTimeoutId : timeoutId
		})
	}
	
	async search(value) {
	
		let result = await bridge.send("VKWebAppCallAPIMethod", {
			method: "friends.search",
			params: {
				"q": value,
				'fields': "photo_100",
				'v': '5.110',
				'access_token': this.props.authToken
			}
		})

		this.setState({
			searchItems: result.response.items
		})

		let resultGlobal = await bridge.send("VKWebAppCallAPIMethod", {
			method: "users.search",
			params: {
				"q": value,
				'fields': "photo_100",
				'v': '5.110',
				'access_token': this.props.authToken
			}
		})

		this.setState({
			searchItemsGlobal: resultGlobal.response.items
		})

	}
		  
	render () {

		if (this.state.error) {
		return <Error />
		}
		else if (!this.state.isLoaded) {
			return <ScreenSpinner />
		}
		else {
			return (
			<Group>
			<Search value={this.state.search} onChange={this.onChange} />
			{this.state.search === '' &&
			<List>
				{this.state.friends.map((item, index) => (
						<Cell
							key={index}
							before={<Avatar size={40} src={item.photo_100} />} 
							asideContent={<Icon28ChevronRightOutline />}
							onClick={() => this.openProfile(item.id)}
						>
							{item.first_name}  {item.last_name}
						</Cell>
					) 
				)}
			</List>
			}
			{this.state.search !== '' &&
			<Group>
			<Group header={<Header mode="secondary">Друзья</Header>}>
			<List>
				{this.state.searchItems.map((item, index) => (
						<Cell
							key={index}
							before={<Avatar size={40} src={item.photo_100} />} 
							asideContent={<Icon28ChevronRightOutline />}
							onClick={() => this.openProfile(item.id)}
						>
							{item.first_name}  {item.last_name}
						</Cell>
					) 
				)}
			</List>
			</Group>		
			<Group header={<Header mode="secondary">Глобальный поиск</Header>}>
			<List>
				{this.state.searchItemsGlobal.map((item, index) => (
						<Cell
							key={index}
							before={<Avatar size={40} src={item.photo_100} />} 
							asideContent={<Icon28ChevronRightOutline />}
							onClick={() => this.openProfile(item.id)}
						>
							{item.first_name}  {item.last_name}
						</Cell>
					) 
				)}
			</List>
			</Group>
			</Group>
			}
							
			</Group>
			)	
		}		
	}
}

export default Friends;

