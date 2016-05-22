'use strict'
var crypto = require('crypto');
var User = require("../models/user");

module.exports = function(req, res){
    
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
            req.session.user = newUser;//用户信息存入 session
            req.flash('success', '注册成功!');
            res.redirect('/');//注册成功后返回主页
        })
      
    });
          
}