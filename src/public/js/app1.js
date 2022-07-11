const messageList = document.querySelector("ul");
const nickNameForm = document.querySelector("#nickName");
const messageForm = document.querySelector("#message");
const socket = new WebSocket(`ws://${window.location.host}`);

const makeMessage = (type, payload) => {
  const msg = { type, payload };
  return JSON.stringify(msg);
};

socket.addEventListener("open", () => {
  console.log("Connected to Server 👍");
});

socket.addEventListener("message", (message) => {
  const li = document.createElement("li");
  li.innerText = message.data;
  messageList.append(li);
});

socket.addEventListener("close", () => {
  console.log("Disconected from Server 👎");
});

const handleSubmit = (event) => {
  event.preventDefault();
  const input = messageForm.querySelector("input");
  socket.send(makeMessage("new_message", input.value));
  const li = document.createElement("li");
  li.innerText = `You : ${input.value}`;
  messageList.append(li);
  input.value = "";
};

const handleNickNameSubmit = (event) => {
  event.preventDefault();
  const input = nickNameForm.querySelector("input");
  socket.send(makeMessage("nickName", input.value));
  input.value = "";
};

messageForm.addEventListener("submit", handleSubmit);
nickNameForm.addEventListener("submit", handleNickNameSubmit);
