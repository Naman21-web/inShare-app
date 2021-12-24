const router = require('express').Router();
const File = require('../models/file')

// ":" means it is dynamic parameter different for each case each file
router.get('/:uuid', async (req,res) => {
    try{
        //finding the file by uuid
        const file = await File.findOne({uuid: req.params.uuid });
        if(!file){
            return res.render('download',{error: 'Link has been expired'})
        }
        return res.render('download',{
            //fetched from the database from the the file
            uuid: file.uuid,
            fileName: file.filename,
            fileSize: file.size,
            downloadLink: `${process.env.APP_BASE_URL}/files/download/${file.uuid}`
            //http://localhost:3000/files/download/uuid(example-123sdget-dfwr3-ydehm)
        })
    } catch(err){
        return res.render('download',{error: 'Something went wrong'})
    }
})

module.exports = router;