import compression from "compression";
import bodyParser from "body-parser";
import cors from "cors";
import errorHandler from "errorhandler";
import express from "express";
import cookieParser from "cookie-parser";
import { router } from "./routes";

export const app = express();

app.use(compression());
app.use(cookieParser());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(cors());
app.use("/api/v1/", router);
app.use((req, res, next) => {
  console.log(`Route not found: ${req.method} ${req.url}`);
  res.status(404).send("Sorry, that route doesn't exist.");
});
if (process.env.NODE_ENV === "development") {
  app.use(errorHandler());
}
