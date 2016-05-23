'use strict'

var crypto = require('crypto');
var User = require("../models/user");
var Post = require("../models/post")


function getIndex(req, res){
   Post.get(null, function(err, posts){
      if (err) {
        posts = [];
      } 
      res.render('index', {
        title: '主页',
        posts: posts,
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
      }); 
   });
}


function getLogin(req, res){
    res.render('login', {
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
        return res.redirect('/');
    }
    if (!user) {
      req.flash('error', '用户不存在!'); 
      return res.redirect('/login');//用户不存在则跳转到登录页
    }
    //检查密码是否一致
    if (user.password != password) {
      req.flash('error', '密码错误!'); 
      return res.redirect('/login');//密码错误则跳转到登录页
    }
    //用户名密码都匹配后，将用户信息存入 session
    req.session.user = user;
    req.flash('success', '登陆成功!');
    res.redirect('/');//登陆成功后跳转到主页
  });
}


function getReg(req, res){
   res.render('reg', {
      title: '注册',
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
   })
}

function postReg(req, res){
    
    if(req.body['password'] != req.body['password-repeat']){
        req.flash('error', '两次输入的密码不一致!'); 
        return res.redirect('/reg');//返回注册页
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
            req.flash(err);
            return res.redirect('/');
        }
        
        if(user){
            req.flash('error', '用户名已经存在');
            return res.redirect('/reg');
        }
        
        newUser.save(function(err, user){
            if(err){
                req.flash(err);
                return res.redirect('/');
            }
            req.session.user = user;//用户信息存入 session
            req.flash('success', '注册成功!');
            res.redirect('/');//注册成功后返回主页
        })
      
    });
          
}


function getLogout(req, res){
    req.session.user = null;
    req.flash('success', '登出成功!');
    res.redirect('/');//登出成功后跳转到主页
}

function checkLogin(req, res, next){
    if(!req.session.user){
        req.flash('error', '未登录');
        res.redirect("/login");
    }
    next();
}

function checkLogout(req, res, next){
    if(req.session.user){
        req.flash('error', '已登录');
        res.redirect('back');
    }
    next();
}

function getPost(req, res){
    res.render('post', {
      title: '新博客',
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
   }); 
}

function postPost(req, res){
    var currentUser = req.session.user,
        post = new Post(currentUser.name, req.body.title, req.body.post);
    post.save(function (err) {
      if (err) {
        req.flash('error', err); 
        return res.redirect('/');
      }
      req.flash('success', '发布成功!');
      res.redirect('/');//发表成功跳转到主页
    });
}


function route(app){
    app.route('/')
        .get(getIndex);
  
    app.route('/login')
        .get(checkLogout)
        .get(getLogin)
        .post(checkLogout)
        .post(postLogin);
  
    app.route('/reg')
        .get(checkLogout)
        .get(getReg)
        .post(checkLogout)
        .post(postReg);
        
    app.route('/logout')
        .get(checkLogin)
        .get(getLogout);
    
    app.route('/post')
        .get(checkLogin)
        .get(getPost)
        .post(checkLogin)
        .post(postPost)
}

module.exports = route;
