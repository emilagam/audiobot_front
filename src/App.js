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
import Follows from './panels/Follows'
import Intro from './panels/Intro'

import { updateNews } from './modules/news'
import { updateBD } from "./modules/follow"
import { getStorage } from './modules/storage'

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
			snackbar: null,
			activeModal: undefined,
		}

	}

	async componentDidMount() {

		const queryParam = this.parseQueryString(window.location.search);
		let userId = await Number(queryParam["vk_user_id"]);
		
		// поменять тему на блак (черный)
		let schemeAttribute = document.createAttribute('scheme');
		schemeAttribute.value = "space_gray";
		document.body.attributes.setNamedItem(schemeAttribute);
		
		const hasBeen = await getStorage("hasBeen") 
		const activePanel = hasBeen ? "main" : "intro" 
		let authToken = ''

		if (hasBeen) {

			const result = await bridge.send("VKWebAppGetAuthToken", { "app_id": 7480675, "scope": "groups,friends,wall" })
			authToken = result.access_token
			
			this.setState({
				userId, authToken, isLoaded: true
			})
				  
			console.log(authToken)
			let sendedNews = await updateNews(userId, authToken)
			this.notifyNews(sendedNews)	
		}

		this.setState({
			userId, authToken, activePanel,
			isLoaded: true
		})


		bridge.subscribe(async (e) => {
			switch (e.detail.type) {
				case "VKWebAppViewRestore":
					let sendedNews = await updateNews(this.state.userId, this.state.authToken)
					this.notifyNews(sendedNews)					
					break
				default:
					console.log("чет происходит: " + e.detail.type);
			}
		})
		
		updateBD(userId)

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

	notifyNews = (isNews) => {
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

	onStoryChange = (activeStory) => { this.setState({ activeStory }) }	

	openProfile    = (profileId) => { this.setState({ profileId, activeModal: "userProfile" }) }
	
	openGroup     = (groupId) => { this.setState({ groupId, activeModal: "groupProfile" }) }

	openFollows  = () => { this.setState({ activePanel: "MyFollows" }) }

	openFriends = () => { this.setState({ activePanel: "main", activeStory: "friends" }) }

	openGroups = () => { this.setState({ activePanel: "main", activeStory: "groups"}) }

	modalBack = () => { this.setState({ activeModal: null }) }

	onBack  = () => { this.setState({ activePanel: "main" }) }

	doneIntro = (authToken) => { this.setState({ authToken, activePanel: "main" }) }
	
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
						onClose={this.modalBack} 
						dynamicContentHeight
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
							<BottomBar onStoryChange={this.onStoryChange} activeStory={this.state.activeStory} />
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
							openFriends={this.openFriends}
							openProfile={this.openProfile} 
							openGroup={this.openGroup} 
							openGroups={this.openGroups}
							onBack={this.onBack}
							authToken={this.state.authToken}
						/>
					</Panel>
					<Panel id="intro" >
						<Intro done={this.doneIntro} userId={this.state.userId} />
					</Panel>
				</View>	
			)		
		}
	}
}

export default App;

