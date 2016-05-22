'use strict'
var regHandler = require("./reg");
var loginHandler = require("./login")


function route(req,res){
    
  req.route('/')
      .get(function(req, res){
         res.render('index', {
            title: '主页',
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
         });
      });

  req.route('/login')
      .get(function(req, res){
         res.render('login', {
            title: '登录',
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
         });
      })
      .post(loginHandler);

  req.route('/reg')
      .get(function(req, res){
         
         res.render('reg', {
            title: '注册',
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
         });
         
      })
      .post(regHandler);
   req.route('/logout')
       .get(function(req, res){
            req.session.user = null;
            req.flash('success', '登出成功!');
            res.redirect('/');//登出成功后跳转到主页
       })
}

module.exports = route;
