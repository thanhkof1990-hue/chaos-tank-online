const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static(__dirname));

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

let players = {};

io.on('connection', (socket) => {
    console.log('Có người chơi mới kết nối:', socket.id);

    players[socket.id] = {
        x: 400, y: 400, angle: 0,
        hp: 100, score: 0, id: socket.id,
        color: "#" + Math.floor(Math.random()*16777215).toString(16)
    };

    socket.emit('currentPlayers', players);
    socket.broadcast.emit('newPlayer', players[socket.id]);

    socket.on('playerMovement', (movementData) => {
        if (players[socket.id]) {
            players[socket.id].x = movementData.x;
            players[socket.id].y = movementData.y;
            players[socket.id].angle = movementData.angle;
            socket.broadcast.emit('playerMoved', players[socket.id]);
        }
    });

    socket.on('playerShoot', (bulletData) => {
        bulletData.ownerId = socket.id;
        io.emit('bulletFired', bulletData);
    });

    socket.on('disconnect', () => {
        console.log('Người chơi thoát:', socket.id);
        delete players[socket.id];
        io.emit('playerDisconnected', socket.id);
    });
});

const PORT = process.env.PORT || 3000;

http.listen(PORT, () => {
    console.log(`Server đang chạy tại link: http://localhost:${PORT}`);
});
