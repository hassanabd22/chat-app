
const genreteMessages = (username,text) => {
    return {
        username,
        text,
        time:new Date().getTime(),
    }
    
}

const genreteLocation = (username,url) => {
    return {
        username,
        url,
        time:new Date().getTime(),
    }
    
}

module.exports = {
    genreteMessages,
    genreteLocation
}