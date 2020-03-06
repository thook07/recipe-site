const firestoreService = require('firestore-export-import');
var firebase = require('./firebase.js');
const serviceAccount = require('./recipes-servacct.json');

// JSON To Firestore
const jsonToFirestore = async () => {
  try {
    //console.log('Initialzing Firebase');
    //await firestoreService.initializeApp(serviceAccount, firebase.firebaseConfig.databaseURL);
    //console.log('Firebase Initialized');

    await firestoreService.restore('./tags.json');
    console.log('Upload Success');
  }
  catch (error) {
    console.log(error);
  }
};

jsonToFirestore();