import React, { Component } from 'react'
import { List, Cell, Avatar, ScreenSpinner, Group, Search, Header } from '@vkontakte/vkui'
import Icon28ChevronRightOutline from '@vkontakte/icons/dist/28/chevron_right_outline'
import '@vkontakte/vkui/dist/vkui.css'
import Error from './Error'
import bridge from '@vkontakte/vk-bridge'

class Groups extends Component {
	constructor (props) {
		super(props);

		this.state = {
			search: "",
			searchItems: [],
			searchItemsGlobal: [],
			groups: [],
			isLoaded: false,
			error: false,
			searchTimeoutId: 0
		}
	}

	async componentDidMount () {

		this.getItems()

	}

	async getItems () {
		
		let result = await bridge.send("VKWebAppCallAPIMethod", {
			method: "groups.get",
			params: {
				"extended": 1,
				'fields': "photo_100",
				'v': '5.110',
				'access_token': this.props.authToken
			}
		})
		
		this.setState({ 
			groups : result.response.items, 
			isLoaded: true
		})
	}

	openGroup = (id) => {
		this.props.openGroup(id)
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
			method: "search.getHints",
			params: {
				"q": value,
				"filters": "groups,publics",
				"search_global": 1,
				'fields': "photo_100",
				'v': '5.110',
				'access_token': this.props.authToken
			}
		})

		this.setState({ 
			searchItems : result.response.items
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
				{this.state.groups.map((item, index) => (
						<Cell
							key={index}
							before={<Avatar size={40} src={item.photo_100} />} 
							asideContent={<Icon28ChevronRightOutline />}
							onClick={() => this.openGroup(item.id)}
						>
							{item.name}
						</Cell>
					) 
				)}
			</List>
			}
			{this.state.search !== '' &&
			<Group>
			<Group header={<Header mode="secondary">Мои группы</Header>}>
			<List>
				{this.state.searchItems.map((item, index) => (
						Boolean(item.group && item.group.is_member) &&
						<Cell
							key={index}
							before={<Avatar size={40} src={item.group.photo_100} />} 
							asideContent={<Icon28ChevronRightOutline />}
							onClick={() => this.openGroup(item.group.id)}
						>
							{item.group.name}
						</Cell>
					) 
				)}
			</List>
			</Group>		
			<Group header={<Header mode="secondary">Глобальный поиск</Header>}>
			<List>
				{this.state.searchItems.map((item, index) => (
						Boolean(item.group && !item.group.is_member) &&
						<Cell
							key={index}
							before={<Avatar size={40} src={item.group.photo_100} />} 
							asideContent={<Icon28ChevronRightOutline />}
							onClick={() => this.openGroup(item.group.id)}
						>
							{item.group.name}
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

export default Groups;

