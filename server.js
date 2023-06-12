const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const { engine } = require("express-handlebars");

const http = require("http");
const server = http.createServer(app);
const socket = require("./socket/socket");
socket(server);
// app.use(function (req, res, next) {
//     // Website you wish to allow to connect
//     res.setHeader("Access-Control-Allow-Origin", "*");

//     // Request methods you wish to allow
//     res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");

//     // Request headers you wish to allow
//     res.setHeader("Access-Control-Allow-Headers", "X-Requested-With,content-type");

//     // Set to true if you need the website to include cookies in the requests sent
//     // to the API (e.g. in case you use sessions)
//     res.setHeader("Access-Control-Allow-Credentials", true);

//     // Pass to next layer of middleware
//     next();
// });

app.use(cors());

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.engine(".hbs", engine({ extname: ".hbs" }));
app.set("view engine", ".hbs");
app.set("views", "./views");

app.use(express.static("public"));
app.use(express.static("public/img"));
app.use(express.static("public/css"));
app.use(express.static("public/js"));

require("./routes/index")(app);

app.get("/", (req, res, next) => {
    return res.render("home", { APP_URL: process.env.APP_URL });
});

app.get("/game", (req, res, next) => {
    return res.render("game", { APP_URL: process.env.APP_URL });
});

server.listen(process.env.PORT || 8000, () => {
    console.log("Server is running");
});
