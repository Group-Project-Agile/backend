const knex= require('knex');
const config = require('../knexfile');
var path = require('path');
const dbClient=knex(config);
let result;

const multer = require('multer'); //to upload the image file
var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './public/uploads/')
  },
  filename: (req, file, cb) => {
    // console.log(file.originalname);
    // console.log(file.fieldname);
    let ext=path.extname(file.originalname);
    cb(null, file.fieldname + '-' + Date.now() + '.jpg')
  }
});
var upload = multer({storage: storage}).single('imageFile');

//to upload image
function uploadHandler(req,res){
  upload(req,res,function(err) {
      if(err) {
        console.log(err);
          return res.end("Error uploading file.");
      }
      res.json(req.file);
  });

}

function addBidHandler(req,res){
  let userId = req.body.userId;
  let bidImage = req.body.bidImage;
  let bidTitle = req.body.bidTitle;
  let startingPrice = req.body.startingPrice;
  let maxPrice = req.body.maxPrice;
  let marketValue = req.body.marketValue;
  let endingDate = req.body.endingDate;
  let category = req.body.category;
  let bidCount = req.body.bidCount;
  let status = req.body.status;


  console.log("this is end time" + endingDate);
      
      dbClient
      .table('bids')
      .insert({
        //this must be same for database's column
        userId :userId,
        bidImage : bidImage,
        bidTitle: bidTitle,
        startingPrice: startingPrice,
        maxPrice: maxPrice,
        marketValue: marketValue,
        endingDate : endingDate,
        category : category,
        bidCount : bidCount,
        status : status
      })
      .then(data => {
        console.log("this is data", data);
        
        res.json({
          success: 'true',
          status: 'success',
          data: {
            bidTitle: bidTitle,
          }
        })
      })
      .catch(error => {
        console.log(error);
        res.json({
          success: 'fail',
          status: 'fail',
        })
      })
  .catch(function(error) {
    console.log(error);
  });
}

async  function getBids(req,res){
  dbClient('bids as b')
  .select(dbClient.raw('bidID,bidImage,userId,bidTitle,startingPrice,bidCount, CASE WHEN bidCount > 0 THEN (select bidAmount from bids_fight WHERE b.bidId=bidId ORDER BY bidAmount DESC LIMIT 1) ELSE startingPrice END AS bidAmount ,maxPrice,marketValue,endingDate,category,bidCount,status'))
  
  .where( 'status', '=', 'Ongoing')
  .then(data =>{
    res.json(data)
  })
  .catch(error => {
        console.log(error);
        res.json({
            status : 'fail',
            data: null,
            error: true
        })
    })
}

  module.exports = {
    'addbid' : addBidHandler,
    'upload' : uploadHandler,
    'getbids' : getBids,
 }