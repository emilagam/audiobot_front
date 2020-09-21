import {setStorage, getStorage} from './storage'

export async function getFollows () {
    const result = await getStorage("follows")
    return result ? result : []

}

export async function addFollow (id, type) {
    let follows = await getFollows()
    let newFollow = {id,type}
    follows = [...follows, newFollow]
    const result = setStorage("follows", follows)
    return result    
}

export async function deleteFollow (id, type) {
    let follows = await getFollows()
    const followToDelete = follows.findIndex(item => item.id === id)
    follows = [...follows.slice(0, followToDelete), ...follows.slice(followToDelete + 1)]
    const result = await setStorage("follows", follows)    
    return result
}

export async function userFollows (userId) {
    let follows = await getFollows()
    const findFollow = follows.findIndex(item => item.id === userId)

    return findFollow !== -1
}

export async function getFollowCount() {
    let follows = await getFollows()
    return follows.length
} 

export async function updateBD(user_id, follows) {

    follows = await getFollows()
    
    let followsToSend = ''
    
    follows.forEach(follow => {
        followsToSend = followsToSend + (follow.type === 'f' ? follow.id : -follow.id) + ","
    })

    const servAddrs = "https://1d842aeb719b.ngrok.io" 
    let api = servAddrs + "/update_follows/" + user_id + "/" + followsToSend
    fetch(api)

}