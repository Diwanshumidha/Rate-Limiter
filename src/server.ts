import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import RateLimit from "./middleware/RateLimiting";
import compression from "compression";
import responseTime from "response-time";

dotenv.config();
const port = process.env.PORT || 5000;
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// *************************************************************
// ---------------------- Compressor ---------------------------
// *************************************************************

app.use(
  compression({
    filter: (req, res) => {
      if (req.headers["x-no-compression"]) {
        return false;
      }

      return compression.filter(req, res);
    },
  })
);

// *************************************************************
// ------------------ Response Time ----------------------------
// *************************************************************

app.use(responseTime());

app.get("/", RateLimit, function (req, res) {
  res.send("Hello World");
});

app.get("*", function (req, res) {
  res.status(404).json({ ERROR: "URL NOT FOUND" });
});

app.listen(port, function () {
  console.log(`Serve at http://localhost:${port}`);
});
