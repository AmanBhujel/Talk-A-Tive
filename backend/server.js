const express = require('express');
const app = express();
require('dotenv').config();
const colors = require('colors')
const cors = require('cors')

const userRoutes = require('./routes/userRoutes')
const chatRoutes = require('./routes/chatRoutes')
const messageRoutes = require('./routes/messageRoutes')
app.use(cors());

const { notFound, errorHandler } = require("./middlewares/errorMiddleware")
app.use(express.json())

const connectDB = require('./configuration/config')
// app.use('/',(req,res)=>{
//     res.send('hi')
// })
app.use('/api/user', userRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/message', messageRoutes)

//error handling middleware
app.use(notFound)
app.use(errorHandler)

const PORT = process.env.PORT || 5000;

connectDB();
const server = app.listen(5000, console.log(`Server started on ${PORT} `.yellow.bold));
const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: "http://localhost:3000",
    // credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("Connected to socket.io");
  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User Joined Room: " + room);
  });
  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("new message", (newMessageRecieved) => {
    var chat = newMessageRecieved.chat;

    if (!chat.users) return console.log("chat.users not defined");

    chat.users.forEach((user) => {
      if (user === newMessageRecieved.sender._id) return;
      console.log(user)
      socket.in(user).emit("message received", newMessageRecieved);
    });
  });

  socket.off("setup", () => {
    console.log("USER DISCONNECTED");
    socket.leave(userData._id);
  });
});