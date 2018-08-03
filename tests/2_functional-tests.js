/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');
var nock = require('nock');
//var sinon = require('sinon');

chai.use(chaiHttp);

suite('Functional Tests', function() {

  /*
  * ----[EXAMPLE TEST]----
  * Each test should completely test the response of the API end-point including response status code!
  */
  test('#example Test GET /api/books', function(done){
    //nock('http://localhost:3000').get('/api/books').reply(500,[{_id:1,title2:'test',commentcount:1}])
     chai.request(server)
      .get('/api/books')
      .end(function(err, res){
        assert.equal(res.status, 200);
        assert.isArray(res.body, 'response should be an array');
        assert.property(res.body[0], 'commentcount', 'Books in array should contain commentcount');
        assert.property(res.body[0], 'title', 'Books in array should contain title');
        assert.property(res.body[0], '_id', 'Books in array should contain _id');
        done();
      });
  });
  /*
  * ----[END of EXAMPLE TEST]----
  */

  suite('Routing tests', function() {


    suite('POST /api/books with title => create book object/expect book object', function() {
      
      test('Test POST /api/books with title', function(done) {
        chai.request(server)
          .post('/api/books')
          .send({title:'some title'})
          .end((err,res)=>{
          //console.log(res.body)
            assert.equal(res.status,200);
            assert.property(res.body, '_id');
            assert.property(res.body, 'title');
            done();
          })
      });
      
      test('Test POST /api/books with no title given', function(done) {
        chai.request(server)
          .post('/api/books')
          .send({})
          .end((err,res)=>{
  //        console.log(res.text)
            assert.equal(res.status,200);
            assert.equal(res.text,'must provide a title')
            done();
          })
      });
      
    });


    suite('GET /api/books => array of books', function(){
      
      test('Test GET /api/books',  function(done){
        chai.request(server)
          .get('/api/books')
          .end((err,res)=>{
            assert.equal(res.status,200);
            assert.isArray(res.body,'noes isnt array');
            assert.property(res.body[0], '_id');
            assert.property(res.body[0], 'title');
            done();
          })
      });      
      
    });


    suite('GET /api/books/[id] => book object with [id]', function(){
      
      test('Test GET /api/books/[id] with id not in db',  function(done){
        //done();
        chai.request(server)
          .get('/api/books/54108337212ffb6d459f854c') //12 hex characters es un id valido
          .send({})
          .end((err,res)=>{
            assert.equal(res.status,200);
            assert.equal(res.text, 'no book exists')
            done();
          })
      });
      
      test('Test GET /api/books/[id] with valid id in db',  function(done){
        chai.request(server)
          .post('/api/books')
          .send({title:'some test title'})
          .end((err,res)=>{
            let theID=res.body._id;
        
            chai.request(server)
              .get('/api/books/'+theID)
              .end((err,res)=>{
                assert.equal(res.status,200);
                assert.property(res.body,'_id')
                assert.property(res.body,'title')
                assert.property(res.body,'comments')
                assert.isArray(res.body.comments)
                assert.equal(res.body.title,'some test title');
                done();
              })
          })
          
      });
      
    });


    suite('POST /api/books/[id] => add comment/expect book object with id', function(){
      
      test('Test POST /api/books/[id] with comment', function(done){
        // insert a book.. to get a valid id
        chai.request(server)
          .post('/api/books')
          .send({title:'some test for adding comment'})
          .end((err,res)=>{
            let theID=res.body._id;
        
            // post a comment using this id
            chai.request(server)
              .post('/api/books/'+theID)
              .send({comment:'un comentario'})
              .end((err,res)=>{
//console.log("upd comment",res.body)
              
                assert.equal(res.status,200);
                assert.property(res.body,'_id')
                assert.property(res.body,'title')
                assert.property(res.body,'comments')
                assert.isArray(res.body.comments)
              
                assert.equal(res.body.title,'some test for adding comment');
              
                assert.isOk(res.body.comments.includes('un comentario'))
                done();
              })
          })        
      });
      
    });
    
    /*
    I can delete /api/books/{_id} to delete a book from the collection. Returned will be 'delete successful' if successful.
If I try to request a book that doesn't exist I will get a 'no book exists' message.
I can send a delete request to /api/books to delete all books in the database. Returned will be 'complete delete successful' if successful.

    */
    suite('DELETE /api/books/[id] => "delete successful" if successful', function(){
      test('Test DELETE with wrong id, should return "no book exists" ', function(done){
        chai.request(server)
          .delete('/api/books/123456789012345678901234')
          .end((err,res)=>{

            assert.equal(res.status,200);
            assert.equal(res.text,'no book exists');
            done();
          })
      })
      test('Test DELETE with id, should return "delete successful" ', function(done){
        chai.request(server)
          .post('/api/books')
          .send({title:'some test title'})
          .end((err,res)=>{
            let theID=res.body._id;
          
            chai.request(server)
              .delete('/api/books/'+theID)
              .end((err,res)=>{
                assert.equal(res.status,200)
                assert.equal(res.text, 'delete successful')
                done()
              })
          });
      })
    });

    suite('DELETE /api/books => "complete delete successful" if successful', function(){
      test('Test DELETE should delete all books in database ', function(done){
        chai.request(server)
          .delete('/api/books')
          .end((err,res)=>{
            assert.equal(res.status,200);
            assert.equal(res.text,'complete delete successful');
            done();
          })
      })
    });

  });

});
