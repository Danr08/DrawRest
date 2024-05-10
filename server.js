const express = require("express")
const mysql = require("mysql")
const jwt = require("jsonwebtoken")
const bodyParser = require("body-parser")

const app = express()
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.use(bodyParser.raw())

const port = 3000
 app.listen (port, () => {
    console.log(`Servidor escuchando en el puerto ${port}`)
 })

 app.get("/", (req,res) =>{
    res.send("servidor funcionando")
 })

 const pool = mysql.createPool({
    connectionLimit: 10,
    host: "localhost",
    user: "adminbd",
    password: "admin123",
    database: "project_web",
    port: 8889,
 })

 app.get("/login", (req, res) => {
    const usuario = req.body.usuario;
    const pwd = req.body.password;
    const query = `SELECT * FROM usuarios WHERE usuario ='${usuario}' AND pwd ='${pwd}'`
    pool.query(query, (error, result) => {
        if (error) throw error;
        if (!result || result.length === 0) {
        return res.status(401).send({
            status: 401,
            msg: "Usuario o contraseña invalido, por favor intente nuevamente"
        })
        }
        user = result[0]
        const token = jwt.sign(
            {
            sub: user.id_user,
            name: user.usuario,
            rol: "viewer",
            exp: Date.now() + 900 * 1000,
            },
            process.env.SECRET
        );
      res.status(200).send({ 
        status: 200,
        data: token
     })
    })
 })

 app.post("/createUser", (req, res) => {
    const usuario = req.body.usuario
    const pwd = req.body.pwd
    const nombre = req.body.nombre
    const apellido = req.body.apellido
    const telefono = req.body.telefono 
    const direccion = req.body.direccion 

    const query = `INSERT INTO usuarios (usuario, pwd, nombre, apellido, telefono, direccion) VALUES (?,?,?,?,?,?)`
    const values = [usuario, pwd, nombre, apellido, telefono, direccion]
    pool.query(query, values, (error, result) => {
        if (error) throw error;
        const newUserId = result.insertID
        const token = jwt.sign(
            {
            sub: newUserId,
            user: usuario,
            rol: "viewer",
            exp: Date.now() + 900 * 1000,
            },
            process.env.SECRET
        );
      res.status(200).send({ 
        status: 200,
        msg: `El usuario ${usuario} ha sido creado correctamente :)`,
        data: token
     })
    })
 })

app.post("/logout", (req, res) => {
    const token = req.headers.authorization.split(" ")[1]
    try {
      const payload = jwt.verify(token, process.env.SECRET);
      if (Date.now() > payload.exp) {
        return res.status(401).send({ error: "Su token expiro" })
      }
    } catch (error) {
      return res.status(401).send({ error: "Se requiere un token" })
    }

    return res.status(200).json({msg: "Se cerró sesión exitosamente"})
})




