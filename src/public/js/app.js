// io function은 알아서 socket.io를 실행하고 있는 서버를 찾는다.
const socket = io();

const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");
const room = document.getElementById("room");

room.hidden = true;

let roomName;

const addMessage = (message) => {
  const ul = room.querySelector("ul");
  const li = document.createElement("li");
  li.innerText = message;
  ul.appendChild(li);
};

const handleMessageSubmit = (event) => {
  event.preventDefault();
  const input = room.querySelector("input");
  const value = input.value;
  socket.emit("new_message", input.value, roomName, () => {
    addMessage(`You: ${value}`);
  });
  input.value = "";
};

const handleNickNameSubmit = (event) => {
  event.preventDefault();
  const input = room.querySelector("#name input");
  socket.emit("nickName", input.value);
  input.value = "";
};

const userCount = (newCount) => {
  const h3 = room.querySelector("h3");
  h3.innerText = `Room ${roomName} (${newCount})`;
};

const showRoom = () => {
  welcome.hidden = true;
  room.hidden = false;
  const h3 = room.querySelector("h3");
  h3.innerText = `Room ${roomName}`;
  const form = room.querySelector("form");
  form.addEventListener("submit", handleMessageSubmit);
};

const handleRoomSubmit = (event) => {
  event.preventDefault();
  const roomNameInput = form.querySelector("#roomName");
  const nickNameInput = form.querySelector("#nickName");
  // 특정한 event를 emit해 줄 수 있다. 또한 object를 전송할 수 있다.
  // 마지막 인자는 함수를 frontend에 존재하는 function을 실행한다. backend에서 실행은 하지만 구현은 frontend에서 구현한다.
  // 함수는 무조건 마지막 인자여야 한다.
  socket.emit("enter_room", roomNameInput.value, nickNameInput.value, showRoom);
  roomName = roomNameInput.value;
  // roomNameInput.value = "";
  // nickNameInput.value = "";
};

form.addEventListener("submit", handleRoomSubmit);

socket.on("welcome", (nickName, newCount) => {
  addMessage(`${nickName}님이 입장하셨습니다.`);
  userCount(newCount);
});

socket.on("bye", (nickName, newCount) => {
  addMessage(`${nickName}님이 퇴장하셨습니다.`);
  userCount(newCount);
});

socket.on("new_message", addMessage);

socket.on("room_change", (rooms) => {
  const roomList = welcome.querySelector("ul");
  roomList.innerHTML = "";
  if (rooms.length === 0) {
    return;
  }
  rooms.forEach((room) => {
    const li = document.createElement("li");
    li.innerText = room;
    roomList.append(li);
  });
});
