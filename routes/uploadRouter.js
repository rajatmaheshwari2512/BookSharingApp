const express = require('express')
const ejs = require('ejs')
const multer = require('multer')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const Grid = require('gridfs-stream')
const GridFsStorage = require('multer-gridfs-storage')
const path = require('path')
const methodOverride = require('method-override')
const uploadRouter = express.Router();


//Middleware
uploadRouter.use(bodyParser.json())
uploadRouter.use(methodOverride("_method"))

//this variable gives the data of the files getting uploaded .
var gfs;
//Mongoose Connection
const uri = 'mongodb+srv://learn:learn@learning.nplhm.mongodb.net/bookSharing?retryWrites=true&w=majority'
mongoose.connect( uri, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true } )
const con = mongoose.connection;
con.on('open',()=>{
    gfs = Grid(con.db,mongoose.mongo)
    gfs.collection('uploads') //The folder in booksharing where all the data will be stored
    console.log("Connected to Database")
})

//storage
var storage = new GridFsStorage({
    url:uri,
    file: (req,file)=>{
        return new Promise((resolve,reject)=>{
            const filename = file.originalname  //+Date.now() + path.extname(file.originalname)
            const fileinfo = {
                filename : filename,
                bucketName : 'uploads', //same as gfs.collection
            };
            resolve(fileinfo)
        })
    }
})

const upload = multer({storage});

uploadRouter.get('/',(req,res)=>{
    gfs.files.find().toArray((err,files)=>{
        if(!files || files.length==0){
            res.render('uploadRouter',{files:false})
        }else{
            //This can be used, when we specify only pdf to be uploaded into the database , baad me add karduga only pdf
            /*files.map(file => {
                if(file.contentType =="application/pdf"){
                  file.isPDF = true;
                }
                else{
                  file.isPDF = false;
                }
              })*/
            res.render('uploadRouter',{files:files})
        }
    })
})

//This is used to upload all the documents to mongodb
uploadRouter.post('/download',upload.single('file'),async (req,res)=>{
    /*var source = gfs.createReadStream({filename:req.file.filename});

    var target = gfs.createWriteStream({
        filename:req.file.filename,
        metadata:{author:req.body.author}
    });

    source.pipe(target);*/
    try
    {
        await gfs.files.update({filename:req.file.filename},{'$set':{metadata:{title:req.body.title_book,author:req.body.author,desc:req.body.desc}}}) //mongodb command
        res.redirect('/upload')
    } catch(error){
        res.send(error)
    }
})


//This was made so that the pdf can be taken from here.
uploadRouter.get('/pdf/:nameOfFile',(req,res)=>{
    const nameOfFile = req.params.nameOfFile;
    gfs.files.find().toArray((err,file)=>{
        if(err){
            res.status(400).send("Unable to access the image")
        }
        file.map((e)=>{
            if(e.filename==nameOfFile){
                //This gives us the pdf in new tab because of _blank used in form( gridfs-stream uploading)
                var readstream = gfs.createReadStream({ filename: nameOfFile });
                readstream.pipe(res);
            }
        })
    })
})

module.exports = uploadRouter;
