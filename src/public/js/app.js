// io function은 알아서 socket.io를 실행하고 있는 서버를 찾는다.
const socket = io();

const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");

const backendDone = (msg) => {
  console.log(`backend says: ${msg}`);
};

const handleRoomSubmit = (event) => {
  event.preventDefault();
  const input = form.querySelector("input");
  // 특정한 event를 emit해 줄 수 있다. 또한 object를 전송할 수 있다.
  // 마지막 인자는 함수를 frontend에 존재하는 function을 실행한다. backend에서 실행은 하지만 구현은 frontend에서 구현한다.
  // 함수는 무조건 마지막 인자여야 한다.
  socket.emit("enter_room", { payload: input.value }, backendDone);
  input.value = "";
};

form.addEventListener("submit", handleRoomSubmit);
