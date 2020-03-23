const axios = require('axios');
const log = require('./logger.js');
const API_URL = "http://3.14.147.18:1338";

exports.getToken = function(onCompletion){
    log.trace("[getToken] entering /getToken")
    var data = {}
    data.userId = "thook07@gmail.com"
    data.apiKey = "e6b6cb37-183d-4c41-b42f-57e31be79d1c";
    
    axios.post(API_URL+'/authenticate', data).then(function (response) {
        log.trace("[getToken] got token!");
        onCompletion(response,null)
    }).catch(function (error) {
        log.error("[getToken] /getToken catch Error Occurred:" + error);
        onCompletion(null,error);
    });
}

exports.getRecipes = function(recipeIds, onCompletion){
    log.trace("[getRecipes] Entering...");
    exports.getToken( function(res,err){
        if(err) {
            log.error("[getRecipes] Error Occurred:",err);
            return;
        }
        log.trace("[getRecipes] got token successfully.")
        var data = {};
        data.token = res.data.token;

        if(recipeIds != undefined){
            log.trace("[getRecipes] Getting a subset of recipes: " + recipeIds)
            data.recipeIds = recipeIds;
        }

        
        log.trace("[getRecipes] calling /getRecipes API")
        axios.post(API_URL+'/getRecipes', data).then(function (response) {
            log.trace("[getRecipes] Got recipeData successfully! Returning response.");
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

exports.getRecipeIngredientIssues = function(data, onCompletion){
    
    exports.getToken(function(res,err){
        if(err) {
            console.log("Error Occurred:",err);
            return;
        }
        
        data.token = res.data.token;

        axios.post(API_URL+'/getRecipeIngredientIssues', data).then(function (response) {
            onCompletion(response,null)
        
        }).catch(function (error) {
            onCompletion(null,error);
        });


    });
}

exports.getRecipesTable = function(data, onCompletion){

    console.log("Calling /getRecipesTable...")
    exports.getToken(function(res,err){
        if(err) {
            console.log("Error Occurred:",err);
            return;
        }
        
        data.token = res.data.token;
        console.log(data);

        axios.post(API_URL+'/getRecipesTable', data).then(function (response) {
            console.log("SUCCESS")
            onCompletion(response,null)
        
        }).catch(function (error) {
            console.log("ERROR")
            onCompletion(null,error);
        });


    });
}
  
exports.getTagTable = function(data, onCompletion){

    console.log("Calling /getTagTable...")
    exports.getToken(function(res,err){
        if(err) {
            console.log("Error Occurred:",err);
            return;
        }
        
        data.token = res.data.token;
        console.log(data);

        axios.post(API_URL+'/getTagTable', data).then(function (response) {
            console.log("/getTagTable SUCCESS")
            onCompletion(response,null)
        
        }).catch(function (error) {
            console.log("/getTagTable ERROR: ",error)
            onCompletion(null,error);
        });


    });
}
 
exports.getTags = function(data, onCompletion){
    log.trace("[getTags] Calling /getTags...")
    exports.getToken(function(res,err){
        if(err) {
            log.error("[getTags] Error Occurred:",err);
            return;
        }
        
        data.token = res.data.token;
        
        axios.post(API_URL+'/getTags', data).then(function (response) {
            log.trace("[getTags] /getTags SUCCESS")
            onCompletion(response,null)
        
        }).catch(function (error) {
            log.error("[getTags] Error" +error)
            onCompletion(null,error);
        });


    });
}

