import express from "express";
import bodyParser from 'body-parser'; // Import bodyParser

const router = express.Router();

// Configure body parsing middleware
router.use(bodyParser.urlencoded({ extended: true }));

// GET route to display products
router.get('/', async (req, res) => {
  try {
      // Fetch product data from the database (replace this with your actual database query)
      const products = await req.db.query('SELECT * FROM products');
      // Render the 'products.ejs' template with the product data
      res.render('products.ejs', { products: products.rows });
  } catch (err) {
      console.error('Error fetching products:', err);
      res.status(500).send('Internal Server Error');
  }
});


// POST route
router.post('/', (req, res) => {
    // Handle the POST request here
    const formData = req.body['brand']; // Access the data sent in the request body
    // console.log(formData); // For example, log the data to the console
    // Respond to the request as needed

    // You might want to perform some processing with the form data here before rendering the view

    // Example: If you want to render the view with the same form data that was submitted
    res.render('products.ejs', {
        data: formData
    });
});

export default router;
