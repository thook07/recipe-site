const express = require('express');
const log = require('../config/logger');
const fs = require('fs')
const router = express.Router();
const Recipe = require('../models/Recipe');
const Tag = require('../models/Tag');
const File = require('../models/File')

/*
res.sendStatus(200) // equivalent to res.status(200).send('OK')
res.sendStatus(403) // equivalent to res.status(403).send('Forbidden')
res.sendStatus(404) // equivalent to res.status(404).send('Not Found')
res.sendStatus(500) // equivalent to res.status(500).send('Internal Server Error')
*/

router.get('/', (req, res) => {
    res.send('API HOME');
});

router.get('/recipes', async (req, res) => {
    res.send( await Recipe.findAll() );
});

router.get('/recipes/id', async (req, res) => {
    res.send( await Recipe.getIds() );
});

router.get('/recipes/:recipe/images', async (req, res) => {
    log.trace('[api/recipes/recipe:/images] Entering: ' + req.params.recipe)
    var recipeId = req.params.recipe;
    recipe = await Recipe.byId(recipeId)
    if(recipe) {
        res.status(200).send( recipe.images);
    } else {
        res.status(404).send('Recipe with id '+recipeId+' not found')
    }
    
});

router.post('/recipes/add', async (req, res) => {
    const data = req.body.recipe;
    try {
        console.log(data);
        const recipe = Recipe.build(data);
        console.log(recipe);
        await recipe.save();
        


        //const recipe = await Recipe.create( data );

        res.status(200)
        res.send("Success");
    } catch(err) {
        res.status(400);
        res.send(err.errors[0].message);
    }
    
});

router.post('/upload/recipe-images', async (req, res) => {
    try {
        if(!req.files) {
            res.send({
                status: false,
                message: 'No file uploaded'
            });
        } else {
            let file = req.files.file;
            userId = 1;
            if( req.user) {
                userId = req.user.id;
            }
            
            //Use the mv() method to place the file in upload directory (i.e. "uploads")
            const uploadPath = './uploads/recipe-images/' + file.name 
            if (fs.existsSync(uploadPath)) {
                log.error('[/admin/upload/recipe-images] Error Uploading File: File Name already exists. Try renaming the file.');
                res.status(500).send('File Name already exists. Try renaming the file.');
                return
            }

            file.mv(uploadPath);
            var fileData = {
                name: file.name,
                size: file.size,
                type: file.mimetype,
                path: uploadPath,
                userId: userId
            }

            const fileObj = await File.build( fileData )
            console.log(fileObj);
            await fileObj.save();

            //send response
            log.trace('/admin/upload/recipe-images] File ['+file.name+'] Successfully upload!')
            res.send({
                status: true,
                message: 'File is uploaded',
                data: {
                    name: file.name,
                    mimetype: file.mimetype,
                    size: file.size
                }
            });
        }
    } catch (err) {
        log.error('/admin/upload/recipe-images] File Upload Error:');
        console.log(err);
        res.status(500).send(err);
    }
});

router.get('/tags/', async (req, res) => {
    res.send( await Tag.findAll())
});







module.exports = router;

