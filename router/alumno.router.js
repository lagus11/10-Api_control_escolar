const router = require('express').Router();

const mongoose = require('mongoose');
var status = require('http-status');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/alumnos',{
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const Alumno = require('../models/alumno.model');

module.exports = () =>{
    router.post('/',(req,res)=>{
        alumno = req.body;

        //creacion de los alumnos
        Alumno.create(alumno)
            .then(
                (data) => {
                    //console.log(data);
                    res.json(
                        {
                            code: status.OK,
                            msg: 'Se insertó correctamente',
                            data: data
                        }
                    )
                    //console.log(res);
                }
            )
            .catch(
                (err) => {
                    res.status(status.BAD_REQUEST)
                        .json(
                            {
                                code: status.BAD_REQUEST,
                                msg: 'Ocurrió un error',
                                err: err.name,
                                detal: err.message
                            }
                        )
                }
            )
    });
    /** Consulta genera de alumnos */
    router.get('/',(req, res)=>{
        Alumno.find({})
        .then(
            (alumnos)=>{
                res.json({
                    code: status.OK,
                    msg: 'Consulta correcta',
                    data: alumnos
                })
            })
        .catch(
            (err)=>{
                res.status(status.BAD_REQUEST)
                    .json({
                    code: status.BAD_REQUEST,
                    msg: 'Error en la peticion',
                    err: err.name,
                    detail: err.message
                    })
            })
    });

    /** Consulta de un alumno por controlnumber */
    router.get("/:controlnumber", (req, res) => {
        Alumno.findOne({ controlnumber: req.params.controlnumber })
          .then((alumnos) => {
            if (alumnos == null)
              res.json({
                code: status.NOT_FOUND,
                msg: "No se encontro el numero de control",
              })
            else
              res.json({
                code: status.OK,
                msg: "Consulta correcta",
                data: alumnos,
              })
          })
          .catch((err) => {
            res.status(status.BAD_REQUEST).json({
              code: status.BAD_REQUEST,
              msg: "Error en la petición",
              err: err.name,
              detail: err.message,
            })
          })
      });

    /**acttualizar un pais por id */
    router.put("/:controlnumber", (req, res) => {
        Alumno.updateOne(
          { controlnumber: req.params.controlnumber },
          { $set: { grade: req.body.grade } },
          { new: true }
        )
          .then((Alumno) => {
            if (Alumno)
              res.json({
                code: status.OK,
                msg: "Actualizacion correcta",
                data: Alumno,
              })
            else
              res.status(status.BAD_REQUEST).json({
                code: status.BAD_REQUEST,
                msg: "Actualizacion fallida",
              })
          })
          .catch((err) => {
            res.status(status.BAD_REQUEST).json({
              code: status.BAD_REQUEST,
              msg: "Error en la petición",
              err: err.name,
              detail: err.message,
            })
          })
      });

      //Eliminicacion estudiante por numero de control 
      router.delete("/:controlnumber", (req, res) => {
        Alumno.deleteOne({ controlnumber: req.params.controlnumber })
          .then((alumnos) => {
            res.json({
              code: status.OK,
              msg: "Se eliminó correctamente",
              date: alumnos,
            })
          })
          .catch((err) => {
            res.status(status.BAD_REQUEST).json({
              code: status.BAD_REQUEST,
              msg: "Error en la peticion",
              err: err.name,
              detail: err.message,
            })
          })
      });



      //estadistica******************************************************
      //Consulta de los estudiantes aprobados
      router.get("/Estadistica/Aprobados", (req, res) => {
        Alumno.aggregate([
          {
            $match: { grade: { $gte: 70 } },
          },
          {
            $group: {
              _id: "$carrer",
              count: { $sum: 1 },
            },
          },
        ])
          .then((Aprobado) => {
            Alumno.aggregate([
              {
                $match: { grade: { $lt: 70 } },
              },
              {
                $group: {
                  _id: "$carrer",
                  count: { $sum: 1 },
                },
              },
            ])
              .then((Reprobado) => {
                res.json({
                  code: status.OK,
                  msg: "Resultado",
                  Reprobados: Reprobado,
                  Aprobados: Aprobado,
                })
              })
              .catch((err) => {
                res.status(status.BAD_REQUEST).json({
                  code: status.BAD_REQUEST,
                  msg: "Error en la petición",
                  err: err.name,
                  detail: err.message,
                })
              })
          })
          .catch((err) => {
            res.status(status.BAD_REQUEST).json({
              code: status.BAD_REQUEST,
              msg: "Error en la petición",
              err: err.name,
              detail: err.message,
            })
          })
      });



      //Consulta de los generos de los estudiantes 
      router.get("/Estadistica/Genero", (req, res) => {
        Alumno.aggregate([
          {
            $match: { curp: /^.{10}[h,H].*/ },
          },
          {
            $group: {
              _id: "$carrer",
              count: { $sum: 1 },
            },
          },
        ])
          .then((Hombre) => {
            Alumno.aggregate([
              {
                $match: { curp: /^.{10}[m,M].*/ },
              },
              {
                $group: {
                  _id: "$carrer",
                  count: { $sum: 1 },
                },
              },
            ])
              .then((Mujer) => {
                res.json({
                  code: status.OK,
                  msg: "Resultado",
                  Hombres: Hombre,
                  Mujeres: Mujer,
                })
              })
              .catch((err) => {
                res.status(status.BAD_REQUEST).json({
                  code: status.BAD_REQUEST,
                  msg: "Error en la petición",
                  err: err.name,
                  detail: err.message,
                })
              })
          })
          .catch((err) => {
            res.status(status.BAD_REQUEST).json({
              code: status.BAD_REQUEST,
              msg: "Error en la petición",
              err: err.name,
              detail: err.message,
            })
          })
      });

      ///^.{10}[m,M].*/
      //Consulta de los estudiantes foraneos de nayarit
      router.get("/Estadistica/Foraneos", (req, res) => {
        Alumno.aggregate([
          {
            $match: { curp: /^.{11}nt.*/ig },
          },
          {
            $group: {
              _id: "$carrer",
              count: { $sum: 1 },
            },
          },
        ])
          .then((Local) => {
            Alumno.aggregate([
              {
                $match: { curp: /^.{11}(?!(nt)).*/ig },
              },
              {
                $group: {
                  _id: "$carrer",
                  count: { $sum: 1 },
                },
              },
            ])
              .then((Foraneo) => {
                res.json({
                  code: status.OK,
                  msg: "Resultado",
                  Locales: Local,
                  Foraneos: Foraneo,
                })
              })
              .catch((err) => {
                res.status(status.BAD_REQUEST).json({
                  code: status.BAD_REQUEST,
                  msg: "Error en la petición",
                  err: err.name,
                  detail: err.message,
                })
              })
          })
          .catch((err) => {
            res.status(status.BAD_REQUEST).json({
              code: status.BAD_REQUEST,
              msg: "Error en la petición",
              err: err.name,
              detail: err.message,
            })
          })
      });


      //Consulta de los estudiantes mayores de edad
      router.get("/Estadistica/MayorE", (req, res) => {
        Alumno.aggregate([
        { $match: { curp: /(.{4}[0-9][0-9][0-9][0-9][0-9][0-9].{6}[0-9][0-9])|(.{4}[0][0-3][0-9][0-9][0-9][0-9].{6}[A-Z,a-z][0-9])/ } },
          { $group: { _id: "$carrer", count: { $sum: 1 } } },
        ])
          .then((Mayor) => {
            Alumno.aggregate([
              { $match: { curp: /^(?!((.{4}[0-9][0-9][0-9][0-9][0-9][0-9].{6}[0-9][0-9])|(.{4}[0][0-3][0-9][0-9][0-9][0-9].{6}[A-Z,a-z][0-9])))/ } },
              { $group: { _id: "$carrer", count: { $sum: 1 } } },
            ])
              .then((Menor) => {
                res.json({
                  code: status.OK,
                  msg: "Resultado",
                  Mayores: Mayor,
                  Menores: Menor,
                })
              })
              .catch((err) => {
                res.status(status.BAD_REQUEST).json({
                  code: status.BAD_REQUEST,
                  msg: "Error en la petición",
                  err: err.name,
                  detail: err.message,
                })
              })
          })
          .catch((err) => {
            res.status(status.BAD_REQUEST).json({
              code: status.BAD_REQUEST,
              msg: "Error en la petición",
              err: err.name,
              detail: err.message,
            })
          })
      });


    return router;
}