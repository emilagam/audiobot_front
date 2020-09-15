import React, { Component } from 'react'
import { ScreenSpinner, Placeholder } from '@vkontakte/vkui'
import '@vkontakte/vkui/dist/vkui.css'
import Icon56FireOutline from '@vkontakte/icons/dist/56/fire_outline';
import Error from './Error'

class Recomends extends Component {
	constructor (props) {
		super(props);

		this.state = {
			isLoaded: true,
			error: false
		}
	}

	async componentDidMount () {

		await this.getItems()

	}

	async getItems () {

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
				<Placeholder 
					icon={<Icon56FireOutline />}
					header="Здесь пока ничего нет"
				>
					Но скоро будет, обещаю, хотя может и нет, но я все равно обещаю!
				</Placeholder>
			)	
		}		
	}
}

export default Recomends;

