const mongoose = require("mongoose");
const Document = require("./database");

mongoose.connect('mongodb://127.0.0.1:27017/Docs-Clone');

const io = require('socket.io')(3001, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  }
});

const defaultValue = "";

io.on('connection', socket => {
  socket.on("get-document", async documentId => {
    const document = await findOrCreate(documentId);
    socket.join(documentId);

    // FIXED: Use document.data instead of undefined 'data'
    socket.emit("load-document", document.data);

    socket.on('send-changes', delta => {
      socket.broadcast.to(documentId).emit('receive-changes', delta);
    });

    socket.on("save-document", async data => {
      await Document.findByIdAndUpdate(documentId, { data });
    });
  });
});

async function findOrCreate(id) {
  if (!id) return;

  const document = await Document.findById(id);
  if (document) return document;

  return await Document.create({ _id: id, data: defaultValue });
}
