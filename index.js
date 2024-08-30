const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
    cors: {
      origin: 'https://pokedexiagente.netlify.app',
      methods: ['GET', 'POST'],
      allowedHeaders: ['Content-Type']
    }
  });

const PORT = 3009;
let users = [];

// Quando um novo cliente se conecta
io.on('connection', (socket) => {
    console.log(`⚡: ${socket.id} user just connected!`);

    // Quando um usuário envia uma mensagem
    socket.on('message', text => {
        console.log(socket.data.username);
        io.emit('receive_message', {
            text,
            authorId: socket.id,
            author: socket.data.username // Acessa o username armazenado no socket
        });
    });

    // Quando um usuário define seu nome de usuário
    socket.on('set_username', username => {
        socket.data.username = username;
        // Adiciona o novo usuário à lista
        users.push({ socketID: socket.id, username });

        // Envia a lista de usuários atualizada para todos os clientes
        io.emit('newUserResponse', users);
    });

    // Quando um usuário se desconecta
    socket.on('disconnect', () => {
        console.log('🔥: A user disconnected');

        console.log(users)
        // Remove o usuário da lista
        users = users.filter((user) => user.socketID !== socket.id);
        console.log('desconect',users)

        // Envia a lista de usuários atualizada para todos os clientes
        io.emit('newUserResponse', users);
    });

    // Evento para debug
    socket.on('trigger', () => {
        console.log(users);
    });
});

server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
