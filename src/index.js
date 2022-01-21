const path     = require('path');
const http     = require('http');
const express  = require('express');
const soctetio = require('socket.io');
const {genreteMessages}= require('./utils/messages.js');
const {genreteLocation}= require('./utils/messages.js');
const {addUser,getUser,getUserRoom,removeUser}  = require('./utils/username.js');

const app      = express();
const server   = http.createServer(app);
const io       = soctetio(server);


const port = process.env.PORT || 3000;
const puplicPath = path.join(__dirname,'../puplic');

io.on('connection', (socket) => {
    console.log('new websoket connection');

    socket.on('jone', ({username , room}, callback) => {
        const {error,user} = addUser({id:socket.id,username,room});

        if(error) {
            return callback(error)
        }

        socket.join(user.room);
        socket.emit('message', genreteMessages('Admin','welcome'));
        socket.broadcast.to(user.room).emit('message', genreteMessages('Admin' ,user.username + " has joined"));
        io.to(user.room).emit('roomData', {
            room:user.room,
            users:getUserRoom(user.room)
        })
        callback()
    })

    socket.on('sendMessage', (message , callback) => {
        const user = getUser(socket.id);
            io.to(user.room).emit('message',genreteMessages(user.username,message)  );
            callback();
        
    })

    socket.on('sendLocation', (cordes , callback) => {
        const user = getUser(socket.id);
        io.to(user.room).emit('locationMessage',genreteLocation(user.username,`https://www.google.com/maps?q=${cordes.latitude},${cordes.longitude}`) );
        callback();
    })

    socket.on('disconnect' , () => {
        const user = removeUser(socket.id);

        if (user) {
            io.to(user.room).emit('message',genreteMessages('Admin',`${user.username} has left`));
            io.to(user.room).emit('roomData', {
                room:user.room,
                users:getUserRoom(user.room)
            })
        }
        
    })

})

app.use(express.static(puplicPath));

server.listen(port, () => {
    console.log('The masege is send at Port '+ port)
})