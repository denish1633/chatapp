const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

//get username and room from url

const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true

});
const socket = io();
socket.emit('joinRoom', { username, room });


socket.on("message", message => {
    console.log(message);
    outputMessage(message);


    chatMessages.scrollTop = chatMessages.scrollHeight;




})
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    //get message text
    const msg = e.target.elements.msg.value;

    //emit a message to server
    socket.emit('chatMessage', msg);
    
});



