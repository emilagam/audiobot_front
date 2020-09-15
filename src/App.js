import React, { Component } from 'react'
import { View, Panel, PanelHeader, Epic, ScreenSpinner, Snackbar, Avatar, ModalRoot, ModalPage, ModalPageHeader, PanelHeaderButton } from '@vkontakte/vkui'
import Icon16Done from '@vkontakte/icons/dist/16/done'
import bridge from '@vkontakte/vk-bridge'
import '@vkontakte/vkui/dist/vkui.css'
import UserProfile from './panels/profile/UserProfile'
import GroupProfile from './panels/profile/GroupProfile'
import Groups from './panels/Groups'
import Friends from "./panels/Friends"
import BottomBar from './panels/BottomBar'
import MyProfile from './panels/profile/MyProfile'
import Recomends from './panels/Recomends'
import Follows from './panels/profile/Follows'
import { updateNews, sendMessage } from './modules/news'
import { updateBD, getFollows } from "./modules/follow"
import { getStorage, setStorage } from './modules/storage'

const blueBackground = {
	backgroundColor: 'var(--accent)'
};

const IS_PLATFORM_IOS = true

class App extends Component {
	constructor (props) {
		super(props);
	
		this.state = {
		  activeStory: 'profile',
		  activePanel: 'main',
		  userId: 0,
		  groupId: 0,
		  authToken: "",
		  profileId: 0,
		  isLoaded: false,
		  snackbar: undefined,
		  activeModal: null
		}

	}

	async componentDidMount() {
		const queryParam = this.parseQueryString(window.location.search);
		let userId = await Number(queryParam["vk_user_id"]);
		
		// поменять тему на блак (черный)
		let schemeAttribute = document.createAttribute('scheme');
		schemeAttribute.value = "space_gray";
		document.body.attributes.setNamedItem(schemeAttribute);
		
		let allowMessages = await bridge.send("VKWebAppAllowMessagesFromGroup", {"group_id": 189086616, "key": "dBuBKe1kFcdemzB"})			
		const first_time = await getStorage("first_time") 
		console.log(first_time)
		if (!first_time) {
			const keyboard = {
                one_time: false,
                buttons: [
                    [
                        {
                            action: {
                                type: "open_app",
                                app_id: 7480675,
                                owner_id: -189861798,
                                label: "Обновить ленту / Открыть приложение"
                            }
                        }
                    ]
                ],
                inline: false	
			}
			
			sendMessage(userId, "Здесь будут песни", "", keyboard)
			setStorage("first_time", true)
		}
		
		let result = await bridge.send("VKWebAppGetAuthToken", { "app_id": 7480675, "scope": "groups,friends,wall" })
		const authToken = result.access_token

		this.setState({
			userId, authToken,
			isLoaded: true
		})

		let sendedNews = await updateNews(userId, authToken)
		this.notifyNews(sendedNews)

		bridge.subscribe(async (e) => {
			switch (e.detail.type) {
				case "VKWebAppViewRestore":
					let sendedNews = await updateNews(this.state.userId, this.state.authToken)
					this.notifyNews(sendedNews)					
					break
				default:
					console.log("чет происходит");
			}
		})
		
		let follows = await getFollows()
		updateBD(userId, follows)

	}
	
	parseQueryString = (string) => {
		return string.slice(1).split('&')
			.map((queryParam) => {
				let kvp = queryParam.split('=');
				return { key: kvp[0], value: kvp[1] }
			})
			.reduce((query, kvp) => {
				query[kvp.key] = kvp.value;
				return query
			}, {})
	}		

	async notifyNews(isNews) {
		if (this.state.snackbar) return
		
		const snackbar = 
			isNews ?
				<Snackbar
					duration='3000'
					layout="vertical"
					onClose={() => this.setState({ snackbar: null })}
					action="Открыть ленту"
					onActionClick={() => bridge.send("VKWebAppClose", { "status": "success" })}
					before={<Avatar size={24} style={blueBackground}><Icon16Done fill="#fff" width={14} height={14} /></Avatar>}
				>
					Лента обновлена, можешь чекнуть
				</Snackbar>
			:
				<Snackbar
					duration='2000'
					layout="vertical"
					onClose={() => this.setState({ snackbar: null })}
					before={<Avatar size={24} style={blueBackground}><Icon16Done fill="#fff" width={14} height={14} /></Avatar>}
				>
					На этот раз музыки нет
				</Snackbar>

		this.setState({snackbar})

	}

	onStoryChange = (e) => {
		this.setState({ activeStory: e.currentTarget.dataset.story })
	}	

	openProfile = (id) => {
		this.setState({ 
			profileId: id,
			activeModal: "userProfile" 
		})
	}
	
	openGroup = (id) => {
		this.setState({ 
			groupId: id,
			activeModal: "groupProfile" 
		})
	}

	openFollows = () => {
		this.setState({ 
			activePanel: "MyFollows"
		})
	}

	openFriends = () => {
		this.setState({
			activePanel: "main",
			activeStory: "friends"
		})
	}

	openGroups = () => {
		this.setState({ 
			activePanel: "main",
			activeStory: "groups"
		})
	}

	modalBack = () => {
		this.setState({ 
			activeModal: null 
		})
	}

	onBack = () => {
		this.setState({ 
			activePanel: "main" 
		})
	}
	
	render () {
		if (!this.state.isLoaded) {
			return (
				<ScreenSpinner />
			)
		}
		else {	

			const modalPageHeader = (
				<ModalPageHeader
					right={<PanelHeaderButton onClick={this.modalBack}>{IS_PLATFORM_IOS ? 'Готово' : <Icon16Done />}</PanelHeaderButton>}
				>
					Карточка	
				</ModalPageHeader>
			)
			const modal = (
				<ModalRoot activeModal={this.state.activeModal}>
					<ModalPage 
						id="userProfile" 
						onClose={this.modalBack} dynamicContentHeight
						header={modalPageHeader} 
					>
						<UserProfile authToken={this.state.authToken} userId={this.state.profileId}/>
					</ModalPage>
					<ModalPage 
						id="groupProfile" 
						onClose={this.modalBack} 
						dynamicContentHeight
						header={modalPageHeader} 
					>
						<GroupProfile authToken={this.state.authToken} groupId={this.state.groupId}/>
					</ModalPage>
				</ModalRoot>
			  );

			return (
				<View modal={modal} activePanel={this.state.activePanel}>
					<Panel id="main">
					<PanelHeader>1 audiobot</PanelHeader>
					<Epic activeStory={this.state.activeStory} tabbar={
						<BottomBar onStoryChange={this.onStoryChange}/>
					}>
						<View id="feed" activePanel="feed">
							<Panel id="feed">
								<PanelHeader>Лента</PanelHeader>
							</Panel>
						</View>
						<View id="recomends" activePanel="recomends">
							<Panel id="recomends">
								<Recomends />
							</Panel>
						</View>
						<View id="groups" activePanel="groups">
							<Panel id="groups">
								<Groups authToken={this.state.authToken} openGroup={this.openGroup}></Groups>
							</Panel>
						</View>
						<View id="friends" activePanel="friends">
							<Panel id="friends">
								<Friends authToken={this.state.authToken} openProfile={this.openProfile}/>
							</Panel>
						</View>
						<View id="profile" activePanel="profile">
							<Panel id="profile">
								<MyProfile authToken={this.state.authToken} userId={this.state.userId} openFollows={this.openFollows}/>
							</Panel>
						</View>
					</Epic>
					{this.state.snackbar}
					</Panel>
					<Panel id="MyFollows">
						<Follows 
							openProfile={this.openProfile} 
							openGroup={this.openGroup} 
							openFriends={this.openFriends}
							openGroups={this.openGroups}
							onBack={this.onBack}
							authToken={this.state.authToken}
						/>
					</Panel>
				</View>	
			)		
		}
	}
}

export default App;

