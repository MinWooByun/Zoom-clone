import http from "http";
// import WebSocket from "ws";
import { Server } from "socket.io";
import { instrument } from "@socket.io/admin-ui";
import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));

// 아래의 두 코드로 http 서버와 WebSocket 서버를 동시에 돌릴 수 있다. 필수로 2개를 돌릴 필요는 없다.
// 2개다 만드는 이유는 같은 3000번 포트를 사용하기 위해서이다.
// http 서버
const httpServer = http.createServer(app);
// WebSocket 서버
// const wss = new WebSocket.Server({ httpServer });
// SoketIO 서버
const wsServer = new Server(httpServer, {
  // admin-ui를 사용하는 환경
  cors: {
    origin: ["https://admin.socket.io"],
    credentials: true,
  },
});
instrument(wsServer, {
  auth: false,
});

const publicRooms = () => {
  // const {
  //   socket: {
  //     adapter: { sids, rooms },
  //   },
  // } = wsServer;
  const publicRooms = [];
  const { sids, rooms } = wsServer.sockets.adapter;
  rooms.forEach((_, key) => {
    if (sids.get(key) === undefined) {
      publicRooms.push(key);
    }
  });
  return publicRooms;
};

const countRoom = (roomName) => {
  return wsServer.sockets.adapter.rooms.get(roomName)?.size;
};

wsServer.on("connection", (socket) => {
  socket["nickName"] = "익명";

  socket.onAny((event) => {
    console.log(`Socket Event: ${event}`);
  });

  socket.on("enter_room", (roomName, nickName, done) => {
    socket.join(roomName);
    socket["nickName"] = nickName;
    done();
    socket.to(roomName).emit("welcome", socket.nickName, countRoom(roomName));
    wsServer.sockets.emit("room_change", publicRooms());
  });

  socket.on("disconnecting", () => {
    socket.rooms.forEach((room) => socket.to(room).emit("bye", socket.nickName, countRoom(room) - 1));
  });

  socket.on("disconnect", () => {
    wsServer.sockets.emit("room_change", publicRooms());
  });

  socket.on("nickName", (nickName) => (socket["nickName"] = nickName));

  socket.on("new_message", (msg, roomName, done) => {
    socket.to(roomName).emit("new_message", `${socket.nickName}: ${msg}`);
    done();
  });
});

// const sockets = [];

// wss.on("connection", (socket) => {
//   sockets.push(socket);
//   // socket 안에 아래와 같이 정보를 저장할 수 있다.
//   socket["nickName"] = "unKnown";
//   console.log("Connected to Browser 👍");
//   socket.on("close", () => {
//     console.log("Disconected from Browser 👎");
//   });
//   socket.on("message", (msg) => {
//     const message = JSON.parse(msg);
//     switch (message.type) {
//       case "new_message":
//         sockets.forEach((aSocket) => {
//           aSocket.send(`${socket.nickName}: ${message.payload}`);
//         });
//       case "nickName":
//         socket["nickName"] = message.payload;
//     }
//   });
// });

const handleListen = () => console.log("Listening on http://localhost:3000");
httpServer.listen(3000, handleListen);

// app.listen(3000, handleListen);
