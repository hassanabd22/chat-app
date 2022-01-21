const socket = io();

// Elements
let form  = document.querySelector('form');
let send  = document.querySelector('#send');
let input = document.querySelector('input');
let sendLocation = document.querySelector('.user-location');
let messages = document.querySelector('.messages');

// Template
let messageTemplate = document.querySelector('#messsag-template').innerHTML;
let locationTemplate = document.querySelector('#location-template').innerHTML;
let sideBarTemplat = document.querySelector('#sidebar').innerHTML;

// Options
const {username , room} = Qs.parse(location.search, {ignoreQueryPrefix:true});
socket.on("message", (message) => {
    console.log(message);
    let html = Mustache.render(messageTemplate, {
        username:message.username,
        message:message.text,
        time:moment(message.time).format('h:mm a')
    });
    messages.insertAdjacentHTML('beforeend',html)
})

socket.on('locationMessage', (messageUrl) => {
    console.log(messageUrl);
    let html = Mustache.render(locationTemplate, {
        username:messageUrl.username,
        url:messageUrl.url,
        time:moment(messageUrl.time).format('h:mm a')
    });
    messages.insertAdjacentHTML('beforeend',html)
})

socket.on('roomData', ({room,users}) => {
    const html = Mustache.render(sideBarTemplat, {
        room,
        users
    })
    document.querySelector('.chat__sidebar').innerHTML = html
})

form.addEventListener('submit', (e) => {
    e.preventDefault();
    send.setAttribute('disabled','disabled');

    let message = input.value;
    socket.emit('sendMessage', message, (mesag) => {
        send.removeAttribute('disabled');
        input.value = '';
        input.focus();

        console.log('The message is delvred ', mesag)
    });
})

sendLocation.addEventListener('click', () => {
    sendLocation.setAttribute('disabled','disabled');
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser')
    }

    navigator.geolocation.getCurrentPosition((position) => {

        let latitude  = position.coords.latitude; 
        let longitude = position.coords.longitude;
        socket.emit('sendLocation', {latitude , longitude}, () => {
            sendLocation.removeAttribute('disabled');
            console.log('The location is done')
        });
    })
})

socket.emit('jone', {username,room}, (error) => {
    if(error) {
        alert(error);
        location.href = '/'
    }
});


