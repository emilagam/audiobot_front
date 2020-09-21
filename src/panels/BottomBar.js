import React from 'react'
import { Tabbar, TabbarItem } from '@vkontakte/vkui'
import Icon28NewsfeedOutline from '@vkontakte/icons/dist/28/newsfeed_outline'
import Icon28UserAddOutline from '@vkontakte/icons/dist/28/user_add_outline';
import Icon28GhostSimleOutline from '@vkontakte/icons/dist/28/ghost_simle_outline';
import Icon28Users3Outline from '@vkontakte/icons/dist/28/users_3_outline';
import Icon28PawOutline from '@vkontakte/icons/dist/28/paw_outline';
import '@vkontakte/vkui/dist/vkui.css';
import bridge from '@vkontakte/vk-bridge'

class BottomBar extends React.Component {
	
	constructor (props) {
		super(props);
	
		this.state = {
			activeStory: 'profile',		
		}

	}
	onStoryChange = (activeStory) => {

		this.props.onStoryChange(activeStory)
		this.setState({activeStory})

	}

	render() {
		return (
			<Tabbar>
				<TabbarItem
					href="https://vk.me/1audiobot"
					target="blank"
					onClick={() => bridge.send("VKWebAppClose", { "status": "success" })}
					data-story="feed"
					text="Лента"
				>
					<Icon28NewsfeedOutline />
				</TabbarItem>
				<TabbarItem
					onClick={() => this.onStoryChange('recomends')}
					selected={this.state.activeStory === 'recomends'}
					data-story="recomends"
					text="Подборки"
				>
					<Icon28PawOutline />
				</TabbarItem>
				<TabbarItem
					onClick={() => this.onStoryChange('groups')}
					selected={this.state.activeStory === 'groups'}
					data-story="groups"
					text="Группы"
				>
					<Icon28Users3Outline />
				</TabbarItem>
				<TabbarItem
					onClick={() => this.onStoryChange('friends')}
					selected={this.state.activeStory === 'friends'}
					data-story="friends"
					text="Друзья"
				>
					<Icon28UserAddOutline />
				</TabbarItem>
				<TabbarItem
					onClick={() => this.onStoryChange('profile')}
					selected={this.state.activeStory === 'profile'}
					data-story="profile"
					text="Профиль"
				>
					<Icon28GhostSimleOutline />
				</TabbarItem>
			</Tabbar>
		)
	}
}

export default BottomBar;

