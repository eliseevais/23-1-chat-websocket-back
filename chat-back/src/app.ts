import express from "express";
import http from "http";
import soketio from "socket.io";
import * as process from "process";

const app = express();
const server = http.createServer(app);
const socket = soketio(server);

type MessageType = {
  message: string
  id: string
  user: {
    id: string,
    name: string
  }
};

app.get('/', (req, res) => {
  res.send('Hello, it is web socket server');
});

const messages: Array<MessageType> = [
  {message: "Hello Viktor", id: "1", user: {id: '11', name: "Dimych"}},
  {message: "Hello Dimych", id: "2", user: {id: '12', name: "Viktor"}},
  {message: "Yo yo", id: "3", user: {id: '12', name: "Viktor"}},
];

const usersState = new Map();

socket.on('connection', (socketChannel) => {

  usersState.set(socketChannel, {id: new Date().getTime().toString(), name: 'anonymous'});

  socket.on('disconnect', () => {
    usersState.delete(socketChannel)
  })

  socketChannel.on('client-name-sent', (name: string) => {
    if (typeof name !== "string" || name === '') {
      return
    }

    const user = usersState.get(socketChannel);
    user.name = name
  });

  socketChannel.on('client-message-sent', (message: string) => {
    if (typeof message !== "string") {
      return
    }

    const user = usersState.get(socketChannel);

    let messageItem = {
      message: message, id: new Date().getTime().toString(),
      user: {id: user.id, name: user.name}
    };
    messages.push(messageItem);

    socket.emit('new-message-sent', messageItem)
  });

  socketChannel.emit('init-messages-published', messages);

  console.log('a user connected');
});

socket.on('client-message-sent', (message: string) => {
  console.log('message', message)
});

const PORT = process.env.PORT || 3009

server.listen(PORT, () => {
  console.log('server running at http://localhost:3009');
});
