const axios = require('axios');
const log = require('./logger.js');
const API_URL = "http://3.14.147.18:1338";

exports.getToken = function(onCompletion){
    
    var data = {}
    data.userId = "thook07@gmail.com"
    data.apiKey = "e6b6cb37-183d-4c41-b42f-57e31be79d1c";
    
    axios.post(API_URL+'/authenticate', data).then(function (response) {
        console.log(response);
        onCompletion(response,null)
    }).catch(function (error) {
        log.error("/getToken catch Error Occurred:" + error);
        onCompletion(null,error);
    });
}

exports.getRecipes = function(onCompletion){
    
    exports.getToken( function(res,err){
        if(err) {
            console.log("Error Occurred:",err)
            return
        }
        
        var data = {}
        data.token = res.data.token
        
        axios.post(API_URL+'/getRecipes', data).then(function (response) {
            onCompletion(response,null)
        
        }).catch(function (error) {
            onCompletion(null,error);
        });


    });
}

exports.getRecipe = function(recipeId, onCompletion){
    
    exports.getToken( function(res,err){
        if(err) {
            console.log("/getRecipe Error Occurred:",err)
            onCompletion(null, err);
            return
        }
        var data = {}
        data.token = res.data.token
        data.recipeId = recipeId
        
        axios.post(API_URL+'/getRecipe', data).then(function (response) {
            onCompletion(response,null)
        
        }).catch(function (error) {
            log.error("/getRecipe catch Error Occurred" + error);
            onCompletion(null,error);
        });


    });
}

exports.getGroceryList = function(recipeIds, onCompletion){
    
    exports.getToken( function(res,err){
        if(err) {
            log.error("Error Occurred:",err);
            onCompletion(null,err);
            return;
        }
        
        log.trace("Got Token! :" + res.data.token);
        
        var data = {}
        data.token = res.data.token
        data.recipeIds = recipeIds
        
        axios.post(API_URL+'/getGroceryList', data).then(function (response) {
            onCompletion(response,null)
        
        }).catch(function (error) {
            log.error("/getGroceryList Error Occurred:"+error)
            onCompletion(null,error);
        });


    });
}


  

