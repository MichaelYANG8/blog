'use strict'
var mongoose = require('mongoose');
var markdown = require('markdown').markdown;

//创建Model
var postSchema = new mongoose.Schema({
  name: String,
  time: Object,
  title: String,
  subtitle: String,
  post: String
}, {
  collection: 'posts' 
});

var postModel = mongoose.model('Post', postSchema);


//Post model
function Post(name, title,subtitle, post) {
  this.name = name;
  this.title = title;
  this.subtitle = subtitle;
  this.post = post;
}

Post.prototype.save = function(callback) {
  var date = new Date();
  //存储各种时间格式，方便以后扩展
  var time = {
      date: date,
      year : date.getFullYear(),
      month : date.getFullYear() + "-" + (date.getMonth() + 1),
      day : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
      minute : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + 
      date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) 
  }
  //要存入数据库的文档
  var post = {
      name: this.name,
      time: time,
      title: this.title,
      subtitle: this.subtitle,
      post: this.post
  };
  var newPost = new postModel(post);
  newPost.save(callback);
};

Post.prototype.update = function(id, callback){
  var date = new Date();
  //存储各种时间格式，方便以后扩展
  var time = {
      date: date,
      year : date.getFullYear(),
      month : date.getFullYear() + "-" + (date.getMonth() + 1),
      day : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
      minute : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + 
      date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) 
  }
  //要存入数据库的文档
  var post = {
      name: this.name,
      time: time,
      title: this.title,
      subtitle: this.subtitle,
      post: this.post
  };
  
  postModel.findOneAndUpdate({_id: id}, post, callback);
}


/*
posts.forEach(function (doc) {
    doc.post = markdown.toHTML(doc.post);
});
*/
Post.getAll = function(callback) {
    postModel.find({}, callback);
};

//keep the same with getAll, the the index.ejs can by reused
Post.getOne = function(id, callback){
    postModel.find({_id: id}, callback);//findById will return doc  find will return docs
}

Post.getByUser = function(userName, callback){
    postModel.find({name: userName}, callback);
}

Post.deleteOne = function(id, callback){
    postModel.findOneAndRemove({_id: id}, callback);
}




module.exports = Post;