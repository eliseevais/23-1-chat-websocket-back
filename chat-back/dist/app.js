"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = __importDefault(require("socket.io"));
const process = __importStar(require("process"));
const app = express_1.default();
const server = http_1.default.createServer(app);
const socket = socket_io_1.default(server);
app.get('/', (req, res) => {
    res.send('Hello, it is web socket server');
});
const messages = [
    { message: "Hello Viktor", id: "1", user: { id: '11', name: "Dimych" } },
    { message: "Hello Dimych", id: "2", user: { id: '12', name: "Viktor" } },
    { message: "Yo yo", id: "3", user: { id: '12', name: "Viktor" } },
];
const usersState = new Map();
socket.on('connection', (socketChannel) => {
    usersState.set(socketChannel, { id: new Date().getTime().toString(), name: 'anonymous' });
    socket.on('disconnect', () => {
        usersState.delete(socketChannel);
    });
    socketChannel.on('client-name-sent', (name) => {
        if (typeof name !== "string" || name === '') {
            return;
        }
        const user = usersState.get(socketChannel);
        user.name = name;
    });
    socketChannel.on('client-message-sent', (message) => {
        if (typeof message !== "string") {
            return;
        }
        const user = usersState.get(socketChannel);
        let messageItem = {
            message: message, id: new Date().getTime().toString(),
            user: { id: user.id, name: user.name }
        };
        messages.push(messageItem);
        socket.emit('new-message-sent', messageItem);
    });
    socketChannel.emit('init-messages-published', messages);
    console.log('a user connected');
});
socket.on('client-message-sent', (message) => {
    console.log('message', message);
});
const PORT = process.env.PORT || 3009;
server.listen(PORT, () => {
    console.log('server running at http://localhost:3009');
});
//# sourceMappingURL=app.js.map