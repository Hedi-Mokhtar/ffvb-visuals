import express, { type Express } from "express";
import matchesRouter from "./routes/matches.js";

const app: Express = express();

app.disable("x-powered-by");

app.use("/matches", matchesRouter);

export { app };
