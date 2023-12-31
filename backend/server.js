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

const connectDB = require('./configuration/config');
const path = require('path');

app.use('/api/user', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/message', messageRoutes);

// --------------------------deployment------------------------------

const __dirname1 = path.resolve(__dirname, '..'); // Go up one directory
app.use(express.static(path.join(__dirname1, "./frontend/build")));

if (process.env.NODE_ENV === "production") {
  console.log('running file')
  app.get("*", (req, res) =>
    res.sendFile(path.resolve(__dirname1, "./frontend/build/index.html"))
  );
} else {
  app.get("*", (req, res) => {

    res.send("API is running..");
    console.log('error running production')
  });
}

//serving the front end
// app.use(express.static(path.join(__dirname1, "./frontend/build")))

// app.get("*", (req, res) => {
//   res.sendFile(path.join(__dirname1, "./frontend/build/index.html")
//     , function (err) {
//       res.status(500).send(err)
//     }
//   )
// })

// --------------------------deployment------------------------------

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
      if (user._id === newMessageRecieved.sender._id) return;
      socket.in(user._id).emit("message received", newMessageRecieved);
    });
  });

  socket.off("setup", () => {
    console.log("USER DISCONNECTED");
    socket.leave(userData._id);
  });
});