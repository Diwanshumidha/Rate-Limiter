import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import RateLimit from "./middleware/RateLimiting";
import { Redis } from "@upstash/redis";

dotenv.config();
const port = process.env.PORT || 5000;
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get("/", RateLimit as any, function (req, res) {
  res.send("Hello World");
});

app.get("*", function (req, res) {
  res.status(404).json({ ERROR: "URL NOT FOUND" });
});

app.listen(port, function () {
  console.log(`Serve at http://localhost:${port}`);
});
