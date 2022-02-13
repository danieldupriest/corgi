require("dotenv").config();
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import contactRouter from "./routes/contacts";

const port = process.env.PORT;

class ErrorWithStatus extends Error {
    status: number;
    constructor(message: string) {
        super(message);
        this.status = 0
    }
}

const app = express();
app.use(express.json());
app.use(cors());

app.use("/api/contacts", contactRouter);
app.use((req: Request, res: Response, next: NextFunction) => {
    const err = new ErrorWithStatus("Page not found");
    err.status = 404;
    next(err);
});
app.use((err: ErrorWithStatus, req: Request, res: Response, next: NextFunction) => {
    res.status(err.status || 500);
    console.error(err.message);
    return res.json({
        error: err.message,
    });
});

app.listen(port, () => {
    console.log(`CORGI server started on port ${port}.`);
});