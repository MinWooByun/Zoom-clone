import http from "http";
import WebSocket from "ws";
import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));

const handleListen = () => console.log("Listening on http://localhost:3000");
// 아래의 두 코드로 http 서버와 WebSocket 서버를 동시에 돌릴 수 있다. 필수로 2개를 돌릴 필요는 없다.
// 2개다 만드는 이유는 같은 3000번 포트를 사용하기 위해서이다.
// http 서버
const server = http.createServer(app);
// WebSocket 서버
const wss = new WebSocket.Server({ server });

const sockets = [];

wss.on("connection", (socket) => {
  sockets.push(socket);
  // socket 안에 아래와 같이 정보를 저장할 수 있다.
  socket["nickName"] = "unKnown";
  console.log("Connected to Browser 👍");
  socket.on("close", () => {
    console.log("Disconected from Browser 👎");
  });
  socket.on("message", (msg) => {
    const message = JSON.parse(msg);
    switch (message.type) {
      case "new_message":
        sockets.forEach((aSocket) => {
          aSocket.send(`${socket.nickName}: ${message.payload}`);
        });
      case "nickName":
        socket["nickName"] = message.payload;
    }
  });
});

server.listen(3000, handleListen);

// app.listen(3000, handleListen);
