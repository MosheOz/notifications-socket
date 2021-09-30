const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const mongoose = require("mongoose");

const port = process.env.PORT || 4001;
const index = require("./routes/index");

const app = express();

app.use(cors());
app.use(index);

const server = http.createServer(app);

const userSchema = mongoose.Schema({
  userId: String,
  dataToSend: Array,
});

const User = mongoose.model("User", userSchema, "users");

mongoose.connect(
  "mongodb://localhost:27017/notifications-task",
  {
    useNewUrlParser: true,
  },
  (err, mongoClient) => {
    if (err) {
      console.log("Error: ", err);
    } else {
      console.log("Connected to DB");
    }
  }
);

const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const dataToSend = [
  { id: 1, type: "info", text: "Big sale next week" },
  { id: 2, type: "info", text: "New auction next month" },
  { id: 3, type: "warning", text: "Limited edition books for next auction" },
  {
    id: 4,
    type: "success",
    text: "New books with limited edition coming next week",
  },
  { id: 5, type: "error", text: "Last items with limited time offer" },
];

let interval;

io.on("connection", async (socket) => {
  const user = { userId: socket.client.id, dataToSend };

  // create user on new connection using socket id
  await new User(user).save();

  // update date per user on alert clicked
  socket.on("clicked", async (id) => {
    await User.updateOne(
      { userId: socket.client.id },
      { $pull: { dataToSend: { id } } }
    );
  });

  // clear interval per connection
  if (interval) {
    clearInterval(interval);
  }

  interval = setInterval(
    () => emitNewData(socket),
    Math.floor(Math.random() * (10 - 6) + 6) * 1000
  );

  // close connection on discoonnect
  socket.on("disconnect", () => {
    console.log("Client disconnected");
    clearInterval(interval);
  });
});

server.listen(port, () => console.log(`Listening on port ${port}`));

const emitNewData = async (socket) => {
  const [{ dataToSend }] = await User.find({
    userId: socket.client.id,
  });
  const response = dataToSend[Math.floor(Math.random() * dataToSend.length)];
  // Emitting a new message. Will be consumed by the client
  socket.emit("alertData", response);
};
