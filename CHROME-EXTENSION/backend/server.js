const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors({
  origin: "*", // allow all origins
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]

}));



app.use(express.json());

///mongodb connect///

mongoose.connect("mongodb://127.0.0.1:27017/timeTracker");

// for server//

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});

const logSchema = new mongoose.Schema({
  domain: String,
  time: Number,
  type: String,
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const Log = mongoose.model("Log", logSchema);

//  Save time log//

app.post("/api/log", async (req, res) => {
  const { domain, time, type } = req.body;
  const log = new Log({ domain, time, type });
  await log.save();
  res.sendStatus(200);
});

// Weekly Report API//

app.get("/api/weekly", async (req, res) => {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const logs = await Log.aggregate([
    {
      $match: {
        timestamp: { $gte: oneWeekAgo }
      }
    },
    {
      $group: {
        _id: { domain: "$domain", type: "$type" },
        totalTime: { $sum: "$time" }
      }
    },
    {
      $project: {
        _id: 0,
        domain: "$_id.domain",
        type: "$_id.type",
        totalTime: 1
      }
    }
  ]);

  res.json(logs);
});
