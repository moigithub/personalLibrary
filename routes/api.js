/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

var expect = require('chai').expect;


//var MongoClient = require('mongodb').MongoClient;
//var ObjectId = require('mongodb').ObjectId;
var mongoose = require("mongoose");
const MONGODB_CONNECTION_STRING = process.env.DB;
//Example connection: MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {});

mongoose.connect(MONGODB_CONNECTION_STRING,{useNewUrlParser: true}).then(
  () => { console.log("connected to db");/** ready to use. The `mongoose.connect()` promise resolves to undefined. */ },
  err => { console.log("error connecting to DB", err); }
);


const BookSchema = new mongoose.Schema({
   ///_id
  title: String,
  commentcount: Number,
  comments: [String]
});
const Book = mongoose.model('Book', BookSchema);

if(process.env.NODE_ENV==="test"){
  /*dummy data*/
  Book.deleteMany({}, ()=>{})
  Book.insertMany([
    { title: 'one', commentcount:1,comments:['boo'] },
    { title: 'two', commentcount:2,comments:['guau','gato'] },
    { title: 'tree', commentcount:0,comments:[] },
    { title: 'boat', commentcount:1,comments:['otro'] }
                  ], function(err) {
  console.log("dummy data added");
  });
}

module.exports = function (app) {

  app.route('/api/books')
    .get(function (req, res){
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      Book.find({},(err,books)=>{
        if(err) throw err;
//console.log("xxx",books);        
        return res.json(books);
      })
    })
    
    .post(function (req, res){
      var title = req.body.title;
      //response will contain new book object including atleast _id and title
    if(!title){
      return res.send('must provide a title');
    }
      const newBook = {
        title,
        commentcount:0,
        comments:[]
      };
      Book.create(newBook, (err,book)=>{
        if(err) throw err;
        
        return res.json(book);
      })
    })
    
    .delete(function(req, res){
      //if successful response will be 'complete delete successful'
        Book.remove({},(err,book)=>{
          if(err) throw err;

          return res.status(200).send('complete delete successful')
        })
    
    });


  app.route('/api/books/:id')
    .get(function (req, res){
      var bookid = req.params.id;
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      Book.findById(bookid, (err,book)=>{
        if(err) throw err;
        
        if(!book){
            return res.send('no book exists')
        }

        return res.json(book);
      })
    })
    
    .post(function(req, res){
      var bookid = req.params.id;
      var comment = req.body.comment;
      //json res format same as .get
    
      //if(!comment){        return res.send('no comment provided')      }
    
    
      Book.findOneAndUpdate({_id: bookid}, {$push:{comments:comment}, $inc:{commentcount:1}},{new:true,upsert:true} , (err,book)=>{
        if(err) throw err;
        
        if(!book){
          return res.send('err updating')
        }
    //    console.log(book,"dddddddddddd")
        return res.json(book);
      })
    })
    
    .delete(function(req, res){
      var bookid = req.params.id;
      //if successful response will be 'delete successful'
    
        Book.findById(bookid, (err,book)=>{
          if(err) throw err;
          
          if(!book){
            return res.send('no book exists');
          }
          
          Book.findOneAndDelete({_id: bookid}, (err, book)=>{
            if(err) throw err;

            return res.send('delete successful')
          })
          
        })
    
    });
  
};
