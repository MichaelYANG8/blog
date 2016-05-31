'use strict'
var mongoose = require('mongoose');


//创建Model
var postSchema = new mongoose.Schema({
  name: String,
  time: Object,
  title: String,
  subtitle: String,
  post: String
});

module.exports = mongoose.model('Post', postSchema, 'posts');

