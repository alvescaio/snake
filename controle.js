var socket = io();
function buttonClick(e) {
  socket.emit('chat message', e);
  return false;
}
