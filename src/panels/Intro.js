import React, { Component, Fragment } from 'react'
import { PanelHeader,  Button, Div, Snackbar, SimpleCell} from '@vkontakte/vkui'
import '@vkontakte/vkui/dist/vkui.css';
import bridge from '@vkontakte/vk-bridge'
import { sendMessage } from '../modules/news'
import { setStorage } from '../modules/storage'


class Follows extends Component {
	constructor(props) {
		super(props);

		this.state = {
			authorized: false,
            allowedMsg: false,
            authToken: '',
            snackbar: null,
		}
    }

    async auth() {
       
        const result = await bridge.send("VKWebAppGetAuthToken", { "app_id": 7480675, "scope": "groups,friends,wall" })
		const authToken = result.access_token
        
        this.setState({authToken, authorized: true})
        
        this.done()

    }    
    
    async allowMessages() {

        await bridge.send("VKWebAppAllowMessagesFromGroup", {"group_id": 189086616, "key": "dBuBKe1kFcdemzB"})			

        this.sendFristMessage()

        this.setState({allowedMsg: true})

        this.done()
    }    

    async sendFristMessage() {
        
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
        
        sendMessage(this.props.userId, "Здесь будут песни", "", keyboard)
       // setStorage("newUser", true)
    }
    
    notify = (text) => {
		
        this.setState({snackbar: 
            <Snackbar
                duration='3000'
                layout="vertical"
                onClose={() => this.setState({ snackbar: null })}
            >
                {text}
            </Snackbar>
		})

	}

    async done () {

        if (this.state.authorized && this.state.allowedMsg) {
            await setStorage("hasBeen", true)
            this.props.done(this.state.authToken)
        } 
        else {
            this.notify("Оп, и еще одна кнопка")
        }

    }

    render() {
        return(
        <Fragment>
            <PanelHeader>1 audiobot</PanelHeader>
            <Div style={{ paddingTop: 60, paddingBottom: 0 }}>
                 <SimpleCell multiline>
                    Привет!
                </SimpleCell>      
                <SimpleCell multiline>
                    В общем и целом бот присылает в сообщения музыку, которую добавят друзья или группы. 
                </SimpleCell>
                <SimpleCell multiline>
                    От кого присылать выбираешь ты - после следующих двух кнопок появятся менюшки и можешь там подписаться на кого захочешь. 
                </SimpleCell>
                <SimpleCell multiline>
                    Эти две кнопки критически необходимы, без них ничего вообще не будет работать, так что жмякай плиз.
                </SimpleCell>
            </Div>
            <Div >
                <Button mode={this.state.authorized ? "outline" : "secondary"} stretched size="xl" style={{ marginBottom: 5 }} onClick={() => this.auth()}>
                    Авторизоваться
                </Button>
                <Button mode={this.state.allowedMsg ? "outline" : "secondary"} stretched size="xl" onClick={() => this.allowMessages()}>
                    Разрешить сообщения
                </Button>
            </Div>	

            {this.state.snackbar}
        </Fragment>
        )}
}

export default Follows;
