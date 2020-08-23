const express = require('express');
const router = express.Router();

// -- /recipes/
//probably would just show a list ot the add/update/delete/etc.
router.get('/', (req, res) => {
    res.send('RECIPES');
});

router.get('/add', (req, res) => {
    res.send('RECIPES ADD');
});

router.get('/update', (req, res) => {
    res.send('RECIPES ADD');
});







module.exports = router;

