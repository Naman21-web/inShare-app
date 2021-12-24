const router = require('express').Router();
const multer = require('multer');
const path = require('path');//inbuilt moduke no need to install
const File = require('../models/file');
const {v4: uuid4} = require('uuid');

let storage = multer.diskStorage({
    destination : (req,file,cb) => cb(null,'uploads/'),
    filename : (req,file,cb) => {
        const uniqueName = `${Date.now()}-${Math.round(Math.random()*1E9)}${path.extname(file.originalname)}`;
        //14153456768-234651342.jpg this type of unique file name
        cb(null,uniqueName);
    }
});

let upload = multer({
    storage : storage,
    limit : {fileSize: 1000000*100},
}).single('myFile');//name attribute of form in frontend

router.post('/', (req,res) => { 
    //Store file
    upload(req,res, async (err) => {
        //Validate request
        if(!req.file){
            return res.json({error : 'All felds are required'})
        }

        if(err){
            return res.status(500).send({error:error.message})
        }

    //Store data in the database
        const file = new File({
            filename: req.file.filename,
            uuid: uuid4(),
            path: req.file.path,
            size: req.file.size
        });
        const response = await file.save();
        return res.json({file:`${process.env.APP_BASE_URL}/files/${response.uuid}`})
        //http://localhost:3000/files/uuid(bkjsbjkygkbv12112-r3jfd)
    })

    //Response -> link
})

router.post('/send', async (req,res) => {
    const {uuid,emailTo,emailFrom} = req.body;
    //Validate request
    if(!uuid || !emailTo || !emailFrom){
        return res.status(422).send({error : 'All fields are required'});
    }
    //Get data from database
    //If uuid equals our uuid then give data
    const file = await File.findOne({uuid : uuid});
    if(file.sender){
        return res.status(422).send({error : 'Email already sent'});
    }
    file.sender = emailFrom;
    file.receiver = emailTo;
    const response = await file.save();

    //send email
    const sendMail = require('../services/emailService')
    sendMail({
        from: emailFrom,
        to: emailTo,
        subject: 'inShare file sharing',
        text: `${emailFrom} shared a file with you`,
        html: require('../services/emailTemplate')({
            emailFrom: emailFrom,
            downloadLink: `${process.env.APP_BASE_URL}/files/${file.uuid}}`,
            size: parseInt(file.size/1000)+'KB',
            expires: '24hours'
        })
    });
    return res.send({success: true});
})

module.exports = router;