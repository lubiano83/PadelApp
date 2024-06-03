/* Servidor Express */
import express from "express";
import userRouter from "./src/router/user.routes.js";
import matchRouter from "./src/router/match.routes.js";

const PORT = 8080;
const HOST = "localhost"; // 127.0.0.1
const APP = express();

APP.use(express.urlencoded({extended: true})); // para recibir los datos en urlencoded desde postman
APP.use(express.json());

APP.use("/api/users", userRouter);
APP.use("/api/matches", matchRouter);

// Metodo que gestiona las rutas inexistentes.
APP.use("*", (req, res) => { 
    return res.status(404).send("<h1>Error 404: Not Found</h1>");
});

APP.listen(PORT, () => {
    console.log(`Ejecutandose en http://${HOST}:${PORT}`);
});