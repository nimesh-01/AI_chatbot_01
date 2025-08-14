require('dotenv').config()
const app = require('./src/app')
const { createServer } = require("http");
const { Server } = require("socket.io");
const httpServer = createServer(app);
const generateRes = require('./src/service/ai.service')
const cors = require("cors");

const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:5173", // your frontend URL
    }
});
app.use(cors());
const chathistory = []
io.on("connection", (socket) => {
    console.log("user connected successfully ")
    socket.on("disconnect", () => {
        console.log("user disconnected successfully ");
    })
    socket.on("message", async (prompt) => {
        chathistory.push({
            role: "user",
            parts: [{ text: prompt.msg }]
        })
        let data = await generateRes(chathistory)
        console.log(data);
        
        chathistory.push({
            role: "model",
            parts: [{ text: data }]
        })
        socket.emit('ai-msg', { data })
    })
});
httpServer.listen(3000, () => {
    console.log("Server is running");
})