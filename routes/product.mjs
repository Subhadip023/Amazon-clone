import express from "express";
const router = express.Router();

// GET route
router.get('/', (req, res) => {
    res.render('products.ejs');
});

// POST route
router.post('/submit', (req, res) => {
    // Handle the POST request here
    const data = req.body; // Access the data sent in the request body
    console.log(data); // For example, log the data to the console
    // Respond to the request as needed
    res.status(200).send('Data received successfully!'); // Correct usage of res.send()
});

export default router;
