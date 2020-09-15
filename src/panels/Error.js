import React from 'react'
import { Placeholder } from '@vkontakte/vkui'
import '@vkontakte/vkui/dist/vkui.css'
import Icon56FireOutline from '@vkontakte/icons/dist/56/fire_outline';

const Error = () => {
	return (
			<Placeholder 
				icon={<Icon56FireOutline />}
				header="Что-то пошло не так"
			>
				Я уже пытаюсь тип починить, а если не чиниться давно, то напиши мне, не стесняйся, я не кусаюсь (обычно) 
			</Placeholder>
		)
	}

export default Error;

