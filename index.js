const express = require('express');
const env = require('dotenv');
const cors = require('cors');
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const swaggerUI = require('swagger-ui-express');
const swaggerJsDoc = require('swagger-jsdoc');
const { SwaggerTheme } = require('swagger-themes');
const redoc = require('redoc-express');

env.config();
const app = express();

const PORT = process.env.PORT || 8082;
const DBHOST = process.env.DBHOST || 'localhost';
const DBUSER = process.env.DBUSER || 'root';
const DBPASSWORD = process.env.DBPASSWORD || 'root';
const DBPORT = process.env.DBPORT || 3306;
const DBDATABASE = process.env.DBDATABASE || 3306;

app.use(cors());
app.use(express.json());

app.get('/oceano', async (req, res, next) => {
        try
        {
            const connection = await mysql.createConnection({ host:DBHOST, user: DBUSER, password: DBPASSWORD, database: DBDATABASE });
            const [rows, fields] = await connection.query('SELECT * FROM oceano')
            if (rows.length > 0){
                res.status(200).json(rows);
            }
            else{
                res.status(400).json({"message":"No existen registros"});
            }
        }
        catch (Error)
        {
            console.log(Error.message)
            next(Error);
        }
    })
app.get('/oceano/cat/:category', async (req, res, next) => {
    try
    {
        const connection = await mysql.createConnection({ host:DBHOST, user:DBUSER, password:DBPASSWORD, database:DBDATABASE });
        const [rows, fields] = await connection.query(`SELECT * FROM oceano WHERE categoria = '${req.params.category}'`)
        if (rows.length > 0){
            res.status(200).json(rows);
        }
        else{
            res.status(400).json({"message":"No existen registros para la categoría [" + req.params.category} + "]");
        }
    }
    catch (Error)
    {
        console.log(Error.mensaje)
        next(Error)
    }
});
app.get('/oceano/ent/:entity', async (req, res, next) => {
    try
    {
        const connection = await mysql.createConnection({ host:DBHOST, user:DBUSER, password:DBPASSWORD, database:DBDATABASE });
        const [rows, fields] = await connection.query(`SELECT * FROM oceano WHERE entidad = '${req.params.entity}'`)
        if (rows.length > 0){
            res.status(200).json(rows);
        }
        else{
            res.status(400).json({"message":"No existen registros para la entidad [" + req.params.entity + "]"});
        }
    }
    catch (Error)
    {
        console.log(Error.mensaje)
        next(Error)
    }
});
app.get('/oceano/random', async (req, res, next) => {
    try
    {
        const connection = await mysql.createConnection({ host:DBHOST, user:DBUSER, password:DBPASSWORD, database:DBDATABASE });
        const [rows, fields] = await connection.query(`SELECT id FROM oceano`)
        if (rows.length > 0){
            rand = Math.floor(Math.random() * rows.length)
            console.log(rand);
            const [data, field] = await connection.query('SELECT * FROM oceano WHERE id = ' + rows[rand].id)
            if (data.length > 0){
                res.status(200).json(data);
            }
            else{
                res.status(400).json({"message":"Error al obtener un dato curioso aleatorio"});
            }
        }
        else{
            res.status(400).json({"message":"No existen registros en la base de datos"});
        }
    }
    catch (Error)
    {
        console.log(Error.mensaje)
        next(Error)
    }
});
app.post('/oceano/insert', async (req, res, next) => {
    try
    {
        let sent = `INSERT INTO oceano(dato, categoria, entidad) Values('${req.body.dato}', '${req.body.categoria}', '${req.body.entidad}')`;
        const connection = await mysql.createConnection({ host:DBHOST, user: DBUSER, password: DBPASSWORD, database: DBDATABASE });
        const [rows, fields] = await connection.query(sent)
        if (rows.affectedRows > 0){
            res.status(200).json({message:"Registro insertado"});
        }
        else{
            res.status(400).json({message:"No se insertaron los registros"});
        }
    }
    catch(Error)
    {
        // let e = new Error("Error en la ruta POST, revise la conexión a la base de datos.");
        console.log(Error);
        next(Error);
    }
});
app.patch('/oceano/update', async (req, res, next) => {
    try
    {
        const connection = await mysql.createConnection({ host:DBHOST, user: DBUSER, password: DBPASSWORD, database: DBDATABASE })
        let objeto = req.body;
        let campos = Object.keys(objeto);
        let sentencia = "UPDATE oceano SET ";
        let columnas = "";
        let condicion = `WHERE id = ${req.query.id}`;
        campos.forEach(columna => {
            if (Number.isInteger(objeto[columna])){
                columnas += `${columna} = ${objeto[columna]} ,`;
            }
            else {
                columnas += `${columna} = '${objeto[columna]}' ,`;
            }
        });
        let correccion = columnas.split(',').join(',').slice(0, columnas.length - 1);
        sentencia += correccion + condicion;
        console.log(sentencia);
        const [rows, fields] = await connection.query(sentencia);
        if (rows.affectedRows != 0){
            res.status(200).json({ mensaje : "Registro Actualizado Correctamente"});
        }
        else{
            res.status(400).json({mensaje : "Registro No Actualizado"});
        }
    }
    catch(Error)
    {
        // let e = new Error("Error en la ruta PATCH, revise la conexión a la base de datos.");
        next(Error);
    }
});
app.delete('/oceano/delete', async (req, res, next) => {
    try
    {
        console.log(req.query);
        const connection = await mysql.createConnection({ host:DBHOST, user: DBUSER, password: DBPASSWORD, database: DBDATABASE });
        const [rows, fields] = await connection.query('DELETE FROM oceano WHERE id = '+ req.query.id);
        if (rows.affectedRows != 0){
            res.status(200).json({mensaje: "Registro Eliminado Exitosamente."});
        }
        else{
            res.status(200).json({mensaje: "Registro No Existe"});
        }
    }
    catch (Error)
    {
        console.log(Error.message)
        next(Error);
    }
});

app.use((err, req, res, next) => {
    res.status(500).json({"message":err.message})
})

app.listen(PORT, (req, res) => {
    console.log(`Servidor Express escuchando en el puerto ${PORT}`);
});