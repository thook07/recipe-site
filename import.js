const firestoreService = require('firestore-export-import');
var firebase = require('./firebase.js');
const serviceAccount = require('./recipes-servacct.json');
var fs = require('fs');


// JSON To Firestore
const jsonToFirestore = async () => {
  try {
    //console.log('Initialzing Firebase');
    //await firestoreService.initializeApp(serviceAccount, firebase.firebaseConfig.databaseURL);
    //console.log('Firebase Initialized');

    //await firestoreService.restore('./tags.json');
    //console.log('Upload Success');
    firestoreService.backup('recipes').then(function(data) {
        //console.log(JSON.stringify(data)));
        fs.writeFile('export.json', JSON.stringify(data), function (err) {
          if (err) return console.log(err);
          console.log('Hello World > helloworld.txt');
        });
        
    });
    
  }
  catch (error) {
    console.log(error);
  }
};

jsonToFirestore();