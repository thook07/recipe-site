const express = require('express');
const router = express.Router();

// -- /recipes/
//probably would just show a list ot the add/update/delete/etc.
router.get('/', (req, res) => {
    res.redirect('/account/profile');
});

router.get('/my-favorites', (req, res) => {
    res.send('Favorites');
});

router.get('/meal-plans', (req, res) => {
    res.send('Meal Plans');
});

router.get('/profile', (req, res) => {
    res.render('account-profile', {
       tags: []
    });
    
    
});





module.exports = router;

