'use strict'
var mongoose = require('mongoose');
var markdown = require('markdown').markdown;

//创建Model
var postSchema = new mongoose.Schema({
  name: String,
  time: Object,
  title: String,
  post: String
}, {
  collection: 'posts' 
});

var postModel = mongoose.model('Post', postSchema);


//Post model
function Post(name, title, post) {
  this.name = name;
  this.title = title;
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
      post: this.post
  };
  
  var newPost = new postModel(post);

  newPost.save(function (err, post) {
    if (err) {
      return callback(err);
    }
    callback(null, post);
  });
};

Post.get = function(name, callback) {
  var option = {};
  if(name){
      option.name = name;
  }
  postModel.find(option, function (err, posts) {
    if (err) {
      return callback(err);
    }
    posts.forEach(function (doc) {
        doc.post = markdown.toHTML(doc.post);
    });
    callback(null, posts);
  });
};

module.exports = Post;