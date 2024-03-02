import express from 'express'; // Correcting the import statement for Express
import productRouter from './routes/product.mjs'; // Renaming the imported router to avoid confusion
import bodyParser from 'body-parser';

const app = express();
const port = 3000;

app.use(express.static('public'));
app.use('/products', productRouter);
app.use(bodyParser.urlencoded({ extended: false }));

app.set('view engine', 'ejs'); // Setting the view engine to use EJS for rendering

app.get('/', (req, res) => {
    res.render("index.ejs");
});

// POST route
app.post('/submit', (req, res) => {
    console.log(req.body['brand']); // Log the received data to the console
    res.send('Data received successfully!');
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
