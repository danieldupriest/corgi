require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const contactRouter = require("./routes/contacts");
const Merge = require("./database/merge");

const port = process.env.PORT;

app.use(express.json());
app.use(cors());

app.use("/api/contacts", contactRouter);
app.use((req, res, next) => {
    const err = new Error("Page not found");
    err.status = 404;
    next(err);
});
app.use((err, req, res, next) => {
    res.status = err.status || 500;
    console.error(err.message);
    return res.json({
        error: err.message,
    });
});

// Clear merge table and begin server
/*Merge.deleteAll().then(
    app.listen(port, () => {
        console.log(`CORGI server started on port ${port}.`);
    })
);*/

app.listen(port, () => {
    console.log(`CORGI server started on port ${port}.`);
});
