// Your web app's Firebase configuration
var firebaseConfig = {
    apiKey: "AIzaSyBNMCq_OiijT-Xtpx06-TurDmh_RE9ZnhY",
    authDomain: "recipes-71c4b.firebaseapp.com",
    databaseURL: "https://recipes-71c4b.firebaseio.com",
    projectId: "recipes-71c4b",
    storageBucket: "recipes-71c4b.appspot.com",
    messagingSenderId: "414454595052",
    appId: "1:414454595052:web:a35f538d49f4b77827d4c9",
    measurementId: "G-QF2R2JF843"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

firebase.firestore().settings({
  cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED
});

firebase.firestore().enablePersistence()
  .catch(function(err) {
      if (err.code == 'failed-precondition') {
          // Multiple tabs open, persistence can only be enabled
          // in one tab at a a time.
          // ...
      } else if (err.code == 'unimplemented') {
          // The current browser does not support all of the
          // features required to enable persistence
          // ...
      }
  });


var db = firebase.firestore();



$(document).ready(function(){
    /*db.collection("users").add({
        first: "Ada",
        last: "Lovelace",
        born: 1815
    })
    .then(function(docRef) {
        console.log("Document written with ID: ", docRef.id);
    })
    .catch(function(error) {
        console.error("Error adding document: ", error);
    });*/
    
    /*db.collection("users").get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            console.log(`${doc.id} => ${doc.data()}`);
        });
    });
    */
})

