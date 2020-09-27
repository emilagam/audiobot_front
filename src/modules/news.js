import {setStorage, getStorage} from './storage'
import bridge from '@vkontakte/vk-bridge'
import {getFollows} from './follow'

const accessTokenGroup = '78a563645a80da88e9b973a69324ecf1fed82c71851b4bc2c04cae135c4b85697346ff6cd1397aab510c5'

export async function updateNews(userId, token, startTime) {

    let myFollows = await getFollows()

    if (myFollows.length === 0) {
        return
    }

    let follows = ""
    myFollows.forEach(follow => {
        follows = follows + (follow.type === 'f' ? follow.id : -follow.id) + ","
    })
   
    if (startTime === undefined) {
        startTime = await getStorage("startTime")	
        if (startTime === undefined) {
            startTime = (Date.now() / 1000) - (86400 * 3)
        }
    }
      
    let newsfeed = await bridge.send("VKWebAppCallAPIMethod",
        {
            "method": "newsfeed.get", "request_id": 1,
            "params": {
                "start_time": 1601122192,//startTime, 
                "filters": "audio,audio_playlist",
                "return_banned": "1",
                "count": "100",
                "source_ids": follows,
                "v": "5.110", "access_token": token
            }
        })

    let users = []
    
    newsfeed.response.profiles.map((profile) => (
        users = [...users, {id: profile.id, text: "@id" + profile.id + " (" + profile.first_name + " " + profile.last_name + ")"}]
    ))

    newsfeed.response.groups.map((group) => (
        users = [...users, { id: -group.id, text: "@public" + group.id + " (" + group.name + ")"}]
    ))

    let user = ""
    let text = "";
    let attachment = "";
    let keyboard = ""
    let messagesToSend = []

    console.log(newsfeed.response.items)
    newsfeed.response.items.forEach(post => {
        
        // Пользователь/группа которому принадлежит запись
        user = users.find(usr => post.source_id === usr.id)
        if (user === undefined) {
            return
        }

        text = user.text
        attachment = ""

        console.log(post)
        if (post.type === "post") {
            
            if (post.copy_history) {
                return 
            }

            // Посты на стене
            text = text + "\n" + post.text;
            
            post.attachments.map((attach) =>
                attachment = attachment + get_attachment(attach.type, attach[attach.type]) + ","
            )
        
            // Кнопка перехода к записи
            keyboard = {
                one_time: false,
                inline: true,
                buttons: [[{
                            action: {
                                type: "open_link",
                                label: "Открыть запись",
                                link: "https://vk.com/wall" + post.source_id + "_" + post.post_id
                            }
                        }]]	
            }
        }			 
        else if (post.source_id > 0) {
           
            // Добавление песен в прикерпеления
            post[post.type].items.map((attach) =>
                attachment = attachment + get_attachment(post.type, attach) + ","
            )
           
            keyboard = {
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
        }
       
        console.log(attachment)
        
        if (attachment === '') {
            return
        }
        
        let newMessage = {
            userId, text, attachment, keyboard
        }
        messagesToSend = [...messagesToSend, newMessage]
        
    })
 
    console.log(messagesToSend)
    
    if (messagesToSend.length > 0) {
        await sendMessage(userId, "#новыепесни:", "", "")
    }

    messagesToSend.map((msg) => {
        sendMessage(msg.userId, msg.text, msg.attachment, msg.keyboard);
    })

    let now  = Date.now() / 1000
    setStorage("startTime", now)

    return (messagesToSend.length > 0)     
}

export async function sendMessage(userId, text, attachment, keyboard) {
    
    bridge.send("VKWebAppCallAPIMethod",
    {
        "method": "messages.send", "request_id": 3,
        "params": {
            "user_id": userId,
            "random_id": Math.floor(Math.random() * 999999999),
            "message": text,
            "attachment": attachment,
            "keyboard": JSON.stringify(keyboard),
            "v": "5.110", "access_token": accessTokenGroup
        }
    });

}

export function get_attachment(type, post) {
    let this_attachment = "";

    if (type === "audio_playlist") {
        if (post.original) {
            this_attachment = type + post.original.owner_id + "_" + post.original.playlist_id + "_" + post.original.access_key
        }
        else {
            this_attachment = type + post.owner_id + "_" + post.id + "_" + post.access_key
        }
    } else if (type === "audio") {
        this_attachment = type + post.owner_id + "_" + post.id
    } else if (type === "photo") {
        this_attachment = type + post.owner_id + "_" + post.id + "_" + post.access_key
    } else if (type === "link") {
        // "https://m.vk.com/audio?act=audio_playlist-187386649_659&api_view=f9bfeacafb0772cf096e5d4f479b23"
        this_attachment = post.url.slice(27)
        this_attachment = this_attachment.replace("&api_view=", "_")
    }

    return this_attachment;

}
