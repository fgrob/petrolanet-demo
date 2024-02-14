module.exports = (server) => {
  const io = require("socket.io")(server, {
    cors: {
      origin: `${process.env.CLIENT_URL}`,
    },
  });
  io.on("connection", (socket) => {
    console.log("socket.io: user connected");

    socket.on("disconnect", () => {
      console.log("socket.io: user disconnected");
    });

  });

  return io;
};
