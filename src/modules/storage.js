import bridge from '@vkontakte/vk-bridge'

export async function setStorage(key, value) {

    let saveFormat = encodeURIComponent(JSON.stringify(value))
    if (saveFormat.length > 4096) {
        return false
    }
    bridge.send("VKWebAppStorageSet", {"key": key, "value": saveFormat})
    return true
}

export async function getStorage(key) {
    try {	
        let result = await bridge.send("VKWebAppStorageGet", {"keys": [key]})	
        
        result = JSON.parse(
                decodeURIComponent(result.keys[0].value).replace(/&quot;/g,'"'))
        if (!result) {
            return undefined
        }

        return result
    }
    catch (e) {
        console.log(e)
        return undefined
    }

}
