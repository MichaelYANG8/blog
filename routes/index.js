'use strict'

var crypto = require('crypto');
var User = require("../models/user");
var PostModel = require("../models/post");
var formidable = require("formidable");
var fs = require("fs");

var findLimit = 4;

function getIndexU(req, res){
  
  PostModel.find({}, null, {limit: findLimit, sort:{time: -1}} , findHandler);
  
  function findHandler(err, docs){
    if (err) {
      console.error(err);
      docs = [];
    } 
    PostModel.count(function(err, number){
      if(err){
        console.error(err);
      }
      res.render('u_index', {
                 title: '主页',
                 posts: docs,
                 end: (number <= docs.length),
                 user: req.session.user,
                 success: req.flash('success').toString(),
                 error: req.flash('error').toString()
                }, jadeHandler); 
    });
  }
  
  function jadeHandler(err, html){
    if(err){
      console.error(err.message);
      html = err.message;
    }
    res.end(html);
  }
}

function getAboutU(req, res){
    res.render('u_about', {
      title: '关于',
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
   });
}

function getContactU(req, res){
    res.render('u_contact', {
      title: '联系我们',
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
   });
}

function getArticalU(req, res){
    PostModel.findById(req.query.id, function(err, post){
        if(err){
            req.flash('error', err);
            return res.redirect('/');
        }
        res.render('u_post', {
       // myurl: 'index', //myrul error caused by c9 env issue
        post: post,
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
      }); 
        
    });
}

function checkLogin(req, res, next){
    if(!req.session.user){
        req.flash('error', '未登录');
        return res.redirect("/m/login"); //return or not?
    }
    next();
}

function checkLogout(req, res, next){
    if(req.session.user){
        req.flash('error', '已登录');
        return res.redirect('back');  //return or not?
    }
    next();
}


function getIndex(req, res){
  
  PostModel.find({}, null, {sort:{time: -1}}, findHandler);
  
  function findHandler(err, docs){
    if (err) {
      req.flash('error', err);
      docs = [];
    } 
    res.render('m_index', {
               title: '主页',
               posts: docs,
               user: req.session.user,
               success: req.flash('success').toString(),
               error: req.flash('error').toString()
              }, jadeHandler); 
 
  }
  
  function jadeHandler(err, html){
    if(err){
      console.error(err.message);
      html = err.message;
    }
    res.end(html);
  }
}


function getLogin(req, res){
    res.render('m_login', {
      title: '登录',
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
   });
}

function postLogin(req, res){
  //生成密码的 md5 值
  var md5 = crypto.createHash('md5');
  var password = md5.update(req.body.password).digest('hex');
  //检查用户是否存在
  User.get(req.body.name, function (err, user) {
    if(err){
        req.flash('error', '未知错误');
        return res.redirect('/m/');
    }
    if (!user) {
      req.flash('error', '用户不存在!'); 
      return res.redirect('/m/login');//用户不存在则跳转到登录页
    }
    //检查密码是否一致
    if (user.password != password) {
      req.flash('error', '密码错误!'); 
      return res.redirect('/m/login');//密码错误则跳转到登录页
    }
    //用户名密码都匹配后，将用户信息存入 session
    req.session.user = user;
    req.flash('success', '登陆成功!');
    res.redirect('/m/');//登陆成功后跳转到主页
  });
}


function getReg(req, res){
   res.render('m_reg', {
      title: '注册',
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
   })
}

function postReg(req, res){
    
    if(req.body['password'] != req.body['password-repeat']){
        req.flash('error', '两次输入的密码不一致!'); 
        return res.redirect('/m/reg');//返回注册页
    }

    var md5 = crypto.createHash('md5');
    var password = md5.update(req.body.password).digest('hex');
    
    var newUser = new User({
        name : req.body.name,
        password: password,
        email: req.body.email
    });
    
    User.get(newUser.name, function(err,user){
      
        if(err){
            req.flash('error', err);
            return res.redirect('/m/');
        }
        
        if(user){
            req.flash('error', '用户名已经存在');
            return res.redirect('/m/reg');
        }
        
        newUser.save(function(err, user){
            if(err){
                req.flash('error', err);
                return res.redirect('/m/');
            }
            req.session.user = user;//用户信息存入 session
            req.flash('success', '注册成功!');
            res.redirect('/m/');//注册成功后返回主页
        })
      
    });
          
}


function getLogout(req, res){
    req.session.user = null;
    req.flash('success', '登出成功!');
    res.redirect('/m/');//登出成功后跳转到主页
}



function getPost(req, res){
    res.render('m_post', {
      title: '新博客',
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
   }); 
}

function getTime(){
  var date = new Date();
  //存储各种时间格式，方便以后扩展
  return {
      date: date,
      year : date.getFullYear(),
      month : date.getFullYear() + "-" + (date.getMonth() + 1),
      day : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
      minute : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + 
      date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) 
  }
}

function postPost(req, res){
  var currentUser = req.session.user;
  //要存入数据库的文档
  var post = {
      name: currentUser.name,
      time: getTime(),
      title: req.body.title,
      subtitle: req.body.subtitle,
      post: req.body.post
  };
  var newPost = new PostModel(post);
  newPost.save(function (err) {
    if (err) {
      req.flash('error', err); 
      return res.redirect('/m/');
    }
    req.flash('success', '发布成功!');
    res.redirect('/m/');//发表成功跳转到主页
  });
}

function postUpload(req, res){
  
    var form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.uploadDir = __dirname + '/../public/upload';
    
    form.parse(req, function (err, fields, files) {
        if (err) {
            req.flash('error', err);
            return res.redirect('/m/');
        }
  
        var image = files.imgFile;
        var path = image.path;
        var url = '/upload' + path.substr(path.lastIndexOf('/'), path.length);
  
        var info = {
            "error": 0,
            "url": url
        };
        res.send(info);
    });
}

function getArtical(req, res){
    PostModel.findById(req.query.id, function(err, post){
        if(err){
            req.flash('error', err);
            return res.redirect('/m/');
        }
        res.render('m_index', {
       // myurl: 'index', //myrul error caused by c9 env issue
        title: post.title,
        posts: [post],
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
      }); 
        
    });
}

function getUser(req, res){
    PostModel.find({name: req.query.name}, function(err, posts){
      if (err) {
          req.flash('error', err);
          return res.redirect('/m');
      } 
      res.render('m_index', {
       // myurl: 'index', //myrul error caused by c9 env issue
        title: req.query.name,
        posts: posts,
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
      }); 
    })
}

function getDelete(req, res){
    PostModel.findById(req.query.id, function(err, posts){
        if(err){
            req.flash('error', err);
            return res.redirect('/m');
        }
        if(!req.session.user || posts[0].name != req.session.user.name){
            req.flash('error', '权限不足');
            return res.redirect('/m');//登出成功后跳转到主页
        }
        
        PostModel.findOneAndRemove({_id: req.query.id}, function(err, post){
          if (err) {
            req.flash('error', err);
            return res.redirect('/m');
          } 
          
          //try to remove the uploaded image file here
          //but even done, there is still some issue with the uploaded files at the editor
          /*
          if(post){
            console.log(post.post);
          }
          */
          res.redirect('/m');
        })
    })
 
}

function getEdit(req, res){
  
  PostModel.findById(req.query.id, function(err, post){
    if(err){
        req.flash('error', err);
        return res.redirect('/m');
    }
    
    res.render('m_edit', {
      title: "编辑",
      post: post,
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
      
    })
  })
}

function postEdit(req, res){
  
  PostModel.findById(req.query.id, function(err, post){
    if(err){
        req.flash('error', err);
        return res.redirect('/m');
    }
    if(!req.session.user || post.name != req.session.user.name){
        req.flash('error', '权限不足');
        return res.redirect('/m');//登出成功后跳转到主页
    }
        
   
    post.title = req.body.title;
    post.subtitle = req.body.subtitle;
    post.post = req.body.post;
    post.time = getTime();
    
    post.save( function (err) {
      if (err) {
        req.flash('error', err); 
        return res.redirect('/m');
      }
      req.flash('success', '编辑成功!');
      res.redirect('/m');//编辑成功跳转到主页
    });
  });
}



function getListApi(req, res){
  var result = {};
  
  PostModel.find({}, null, {limit: findLimit, skip: req.query.skip, sort: {time: -1}}, function(err, docs){
    if(err){
      console.error(err);
      return res.end();
    }
    
    var currentNum = req.query.skip + docs.length;
    
    PostModel.count(function(err, number){
   
      result.docs = docs;
      if(err){
        console.log(err);
        result.end = 1;
      }
      else{
        result.end = (number <= currentNum);
      }
      res.send(JSON.stringify(result));
    })
  })

}

function route(app){
    app.route('/')
        .get(getIndexU);
    
    app.route('/about')
        .get(getAboutU);
    
    app.route('/contact')
        .get(getContactU);
        
    app.route('/artical')
        .get(getArticalU);
        
    
    app.route('/m/')
        .get(getIndex);
  
    app.route('/m/login')
        .get(checkLogout)
        .get(getLogin)
        .post(checkLogout)
        .post(postLogin);
  
    app.route('/m/reg')
        .get(checkLogout)
        .get(getReg)
        .post(checkLogout)
        .post(postReg);
        
    app.route('/m/logout')
        .get(checkLogin)
        .get(getLogout);
    
    app.route('/m/post')
        .get(checkLogin)
        .get(getPost)
        .post(checkLogin)
        .post(postPost);
        
    app.route('/m/uploadimg')
       .post(checkLogin)
       .post(postUpload);
    
    app.route('/m/artical')
       .get(getArtical);
       
    app.route('/m/user')
        .get(getUser);
        
    app.route('/m/delete')
        .get(getDelete);
        
    app.route('/m/edit')
        .get(getEdit)
        .post(postEdit);
        
    app.route('/api/list')
        .get(getListApi);
        

}

module.exports = route;
