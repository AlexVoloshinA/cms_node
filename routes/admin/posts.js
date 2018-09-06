const express = require('express');
const router = express.Router();
const Post = require('../../models/Post');
const {isEmpty,uploadDir} = require('../../helpers/upload-helper');
const fs = require('fs');
const path = require('path');
const moment = require('moment');

router.all('/*', (req,res,next) => {
    req.app.locals.layout = 'admin';
    next();
});

router.get('/', async (req,res) => {

    let Posts = await Post.find();
    //debugger;
    //let photosDir = __base + 'public/uploads/';

    res.render('admin/posts/index', {posts: Posts});
});

router.get('/create', (req,res) => {
    res.render('admin/posts/create');
});

router.post('/create', async (req,res) => {

    let errors = [];

    if(!req.body.title){
        errors.push({message: 'Please add a title'});
    }

    if(!req.body.body){
        errors.push({message: 'Please add a description'});
    }

    if(errors.length > 0){
        res.render('admin/posts/create', {
           errors: errors
        });
    } else {
            let filename = 'alex.jpeg';

        if(!isEmpty(req.files)){
        let file = req.files.file;
        filename = Date.now() + '-' + file.name;
    
    
            file.mv('./public/uploads/' + filename, (err) => {
                if(err) console.log(err);
            });
         
     }


      if(req.body.allowComments){
          allowComments = true;
      } else {
          allowComments = false;
      }
    
      const newPost = new Post({
          title: req.body.title,
          status: req.body.status,
          allowComments: allowComments,
          body: req.body.body,
          file: filename
     });

    newPost.save().then(savedPost => {
        req.flash('success_message', 'Post was created successfully');

        res.redirect('/admin/posts');
     }).catch(validator => {
         res.render('admin/posts/create');
     });
         
    }

    
});

router.get('/edit/:id',async (req,res) => {

    let findPost = await Post.findById(req.params.id);

    //res.send(req.params.id);
    res.render('admin/posts/edit', {post: findPost});
});

router.put('/edit/:id', async (req,res) => {

    let post = await Post.findById(req.params.id);

    if(req.body.allowComments){
        allowComments = true;
    } else {
        allowComments = false;
    }

    post.title = req.body.title;
    post.status = req.body.status;
    post.allowComments = allowComments;
    post.body = req.body.body;

    

    if(!isEmpty(req.files)){
        let file = req.files.file;
        let filename = Date.now() + '-' + file.name;
        post.file = filename;
    
    
            file.mv('./public/uploads/' + filename, (err) => {
                if(err) console.log(err);
            });
    }

    await post.save();

    req.flash('success_message', 'Post wos seccussesfully updated');

    res.redirect('/admin/posts');
});

router.delete('/:id', async (req,res) => {
    let post = await Post.findById(req.params.id);

    await fs.unlink(uploadDir + post.file);

    await post.remove();


    res.redirect('/admin/posts');
});

module.exports = router;