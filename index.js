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
const DBHOST = process.env.MYSQLHOST || 'localhost';
const DBUSER = process.env.MYSQLUSER || 'root';
const DBPASSWORD = process.env.MYSQLPASSWORD || 'root';
const DBPORT = process.env.MYSQLPORT || 3306;
const DBDATABASE = process.env.MYSQLDATABASE || 'proyectoapi';
const HOST = process.env.HOST || 'http://localhost:'
console.log(HOST + PORT)
console.log(`host:${DBHOST}, user: ${DBUSER}, password: ${DBPASSWORD}, database: ${DBDATABASE}`)
app.use(cors());
app.use(express.json());
const def = fs.readFileSync("./swagger.json", {encoding: "utf8", flag: "r"});
//const read = fs.readFileSync("./README.MD", {encoding: "utf8", flag: "r"});
const defObj = JSON.parse(def);
// defObj.info.description = read;
defObj.servers = [{"url":HOST+PORT}];
const swaggerOptions = {
    definition : defObj,
    apis : [path.join(__dirname,"./index.js")]
}
const Theme = new SwaggerTheme('v3');
const option = {
    explorer: true,
    customCss: Theme.getBuffer("dark")
}
const swaggerDocs = swaggerJsDoc(swaggerOptions);                       //Definicion de mi API
app.use("/api-docs",swaggerUI.serve,swaggerUI.setup(swaggerDocs, option));
app.get('/api-docs-redoc', redoc({
    title: 'API Docs Json',
    specUrl: '/api-docs-json',
    redocOptions: {
        theme: {
            colors: {
                primary: {
                main: '#6EC5AB'
                }
            },
            typography: {
                fontFamily: `"museo-sans", 'Helvetica Neue', Helvetica, Arial, sans-serif`,
                fontSize: '15px',
                lineHeight: '1.5',
                code: {
                code: '#87E8C7',
                backgroundColor: '#4D4D4E'
                }
            },
            menu: {
                backgroundColor: '#ffffff'
            }
        }
    }
}));
app.use("/api-docs-json", (req, res) => {
    res.json(swaggerDocs);
})

/**
 * @swagger
 * tags:
 *      name: Oceano
 *      description: Datos Curiosos Del Oceano En General, Su Flora Y Fauna. 
 */

/**
 * @swagger
 * /:
 *      get:
 *          summary: Ruta principal del API
 *          description: Ruta principal que mostrará una respuesta en JSON para comprobar su correcto funcionamiento
 *          tags:
 *              - Oceano
 *          response:
 *              200:
 *                  description: res.Json con mensaje de conexión exitosa a la API
 *              500:
 *                  description: Error de conexión
 */
app.get('/', (req, res, next) => {
    try {
        res.status(200).json({"message":"Conexión Exitosa a la API","test":"Hola mundo"})
    } catch (error) {
        next(error)
    }
})
/**
 * @swagger
 * /oceano:
 *      get:
 *          summary: Obtiene todos los datos curiosos
 *          description: Obtiene un arreglo JSON con todos los datos curiosos del oceano
 *          tags: 
 *              - Oceano
 *          response:
 *              200:
 *                  description: JSON Con todos los datos curiosos del oceano
 *              400:
 *                  description: "No existen registros"
 *              500:
 *                  description: "Error de conexión"
 */
app.get('/oceano', async (req, res, next) => {
        try
        {
            const connection = await mysql.createConnection({ host:DBHOST, user: DBUSER, password: DBPASSWORD, database: DBDATABASE, port: DBPORT });
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

/**
 * @swagger
 * /oceano/cat/:category:
 *      get:
 *          summary: Obtiene todos los datos curiosos del oceano según la categoria solicitada
 *          description: Obtiene un objeto JSON de los datos curiosos según la categoría establecida (General, Flora o Fauna)
 *          parameters:
 *              - in: /oceano/cat
 *                name: category
 *                schema:
 *                  type: string
 *                required: true
 *                description: Filtra los registros por categoría (General, flora o fauna).
 *          tags:
 *              - Oceano
 *          response:
 *              200:
 *                  description: JSON Con todos los datos curiosos del oceano según la categoría
 *              400:
 *                  description: "No existen registros para la categoría [category]"
 *              500:
 *                  description: "Error de conexión"
 */
app.get('/oceano/cat/:category', async (req, res, next) => {
    try
    {
        const connection = await mysql.createConnection({ host:DBHOST, user:DBUSER, password:DBPASSWORD, database:DBDATABASE, port: DBPORT });
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

/**
 * @swagger
 * /oceano/ent/:entity:
 *      get:
 *          summary: Obtiene todos los datos curiosos del oceano según el animal o criatura pedida
 *          description: Obtiene un objeto JSON de los datos curiosos según la entidad solicitada (Oceano, tiburon, delfin, coral, etc...)
 *          parameters:
 *              - in: /oceano/ent
 *                name: entity
 *                schema:
 *                  type: string
 *                required: true
 *                description: Filtra los registros por la entidad ingresada (tiburon, delfin, coral, etc.).
 *          tags:
 *              - Oceano
 *          response:
 *              200:
 *                  description: JSON Con todos los datos curiosos del oceano según la entidad
 *              400:
 *                  description: "No existen registros para la entidad [entity]"
 *              500:
 *                  description: "Error de conexión"
 */
app.get('/oceano/ent/:entity', async (req, res, next) => {
    try
    {
        const connection = await mysql.createConnection({ host:DBHOST, user:DBUSER, password:DBPASSWORD, database:DBDATABASE, port: DBPORT });
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

/**
 * @swagger
 * /oceano/random:
 *      get:
 *          summary: Obtiene un dato curioso aleatorio
 *          description: Obtiene un objeto JSON de un dato curioso del oceano de forma aleatoria
 *          tags:
 *              - Oceano
 *          response:
 *              200:
 *                  description: JSON Con un dato curioso aleatorio
 *              400:
 *                  description: "Error al obtener un dato curioso aleatorio"
 *              404:
 *                  description: "No existen registros en la base de datos"
 *              500:
 *                  description: "Error de conexión"
 */
app.get('/oceano/random', async (req, res, next) => {
    try
    {
        const connection = await mysql.createConnection({ host:DBHOST, user:DBUSER, password:DBPASSWORD, database:DBDATABASE, port: DBPORT });
        const [rows, fields] = await connection.query(`SELECT id FROM oceano`)
        if (rows.length > 0){
            rand = Math.floor(Math.random() * rows.length)
            const [data, field] = await connection.query('SELECT * FROM oceano WHERE id = ' + rows[rand].id)
            if (data.length > 0){
                res.status(200).json(data);
            }
            else{
                res.status(400).json({"message":"Error al obtener un dato curioso aleatorio"});
            }
        }
        else{
            res.status(404).json({"message":"No existen registros en la base de datos"});
        }
    }
    catch (Error)
    {
        console.log(Error.mensaje)
        next(Error)
    }
});

/**
 * @swagger
 * /oceano:
 *      post:
 *          summary: Inserta un nuevo dato curioso
 *          description: Ruta con el método POST para insertar un dato curioso, ingresando en el body el dato, la categoría y la entidad
 *          tags: 
 *              - Oceano
 *          requestBody:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              dato:
 *                                  type: string
 *                              categoria:
 *                                  type: string
 *                              entidad:
 *                                  type: string
 *      response:
 *          200:
 *              description: "Registro insertado"
 *          400:
 *              description: "No se insertaron los registros"
 *          500:
 *              description: "Error de conexión"
 */
app.post('/oceano', async (req, res, next) => {
    try
    {
        let sent = `INSERT INTO oceano(dato, categoria, entidad) Values('${req.body.dato}', '${req.body.categoria}', '${req.body.entidad}')`;
        const connection = await mysql.createConnection({ host:DBHOST, user: DBUSER, password: DBPASSWORD, database: DBDATABASE, port: DBPORT });
        const [rows, fields] = await connection.query(sent)
        if (rows.affectedRows > 0){
            res.status(200).json({"message":"Registro insertado"});
        }
        else{
            res.status(400).json({"message":"No se insertaron los registros"});
        }
    }
    catch(Error)
    {
        console.log(Error);
        next(Error);
    }
});

/**
 * @swagger
 * /oceano?id=id:
 *      patch:
 *          summary: Actualiza la información de un alumno
 *          description: Ruta con el método PATCH para actualizar un nuevo estudiante para ingresarlo en la bd
 *          parameters:
 *              - in: /oceano
 *                name: id
 *                schema:
 *                  type: integer
 *                required: true
 *                description: Id del registro a actualizar
 *          tags: 
 *            - Oceano
 *          requestBody:
 *              required: true
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              dato:
 *                                  type: string
 *                              categoria:
 *                                  type: string
 *                              entidad:
 *                                  type: string
 *      response:
 *        200:
 *          description: "Registro Actualizado Correctamente"
 *        400:
 *          description: "Registro No Actualizado"
 *        500:
 *          description: "Error de conexión"
 */

app.patch('/oceano', async (req, res, next) => {
    try
    {
        const connection = await mysql.createConnection({ host:DBHOST, user: DBUSER, password: DBPASSWORD, database: DBDATABASE, port: DBPORT })
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
            res.status(200).json({ "message" : "Registro Actualizado Correctamente"});
        }
        else{
            res.status(400).json({"message" : "Registro No Actualizado"});
        }
    }
    catch(Error)
    {
        next(Error);
    }
});

/**
 * @swagger
 * /oceano?id=id:
 *      delete:
 *          summary: Elimina el dato curioso de la base de datos
 *          description: Ruta con el método DELETE para eliminar un dato curioso de la base de datos
 *          parameters:
 *              - in: /oceano
 *                name: id
 *                schema:
 *                  type: integer
 *                required: true
 *                description: Id del registro a eliminar
 *          tags: 
 *              - Oceano
 *      response:
 *          200:
 *              description: "Registro Eliminado Exitosamente."
 *          400:
 *              description: "Registro No Existe."
 *          500:
 *              description: "Error de conexión"
 */

app.delete('/oceano', async (req, res, next) => {
    try
    {
        console.log(req.query);
        const connection = await mysql.createConnection({ host:DBHOST, user: DBUSER, password: DBPASSWORD, database: DBDATABASE, port: DBPORT });
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

module.exports.app = app;