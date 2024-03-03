import express from 'express';
import bodyParser from 'body-parser';
import session from 'express-session';
import bcrypt from 'bcrypt';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import pg from 'pg';

const app = express();
const port = 5500;

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
    secret: 'AMAZON-LOGIN',
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 1000 * 60 * 68 * 24,
    }
}));
app.use(passport.initialize());
app.use(passport.session());

app.set('view engine', 'ejs');

const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "amazon-clone",
    password: "subhadip@23",
    port: 5432,
});
db.connect();

app.get('/signIn', (req, res) => {
    res.render('login-register.ejs');
});

app.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);

        const query = 'INSERT INTO users (username, email, password) VALUES ($1, $2, $3)';
        await db.query(query, [username, email, hashedPassword]);

        // Redirect to home page after registration
        res.redirect('/');
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.redirect('/signIn');
        }
        req.logIn(user, (err) => {
            if (err) {
                return next(err);
            }
            req.session.username = user.username;
            return res.redirect('/');
        });
    })(req, res, next);
});

app.get('/', (req, res) => {
    const username = req.session.username;
    res.render('index', { username });
});

app.get('/products', async (req, res) => {
    try {
        const products = await db.query('SELECT * FROM products ORDER BY id ASC ');
        res.render('products.ejs', { products: products.rows, data: [] });
    } catch (err) {
        console.error('Error fetching products:', err);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/submit', (req, res) => {
    console.log(req.body['brand']);
    res.send('Data received successfully!');
});

app.post('/add-to-cart', async (req, res) => {
    try {
        if (req.isAuthenticated()) {
            const productId = req.body.product_id;
            const userId = req.user.id;

            const userData = await db.query('SELECT shopping_cart FROM users WHERE id = $1', [userId]);
            const shoppingCart = userData.rows[0].shopping_cart || [];

            shoppingCart.push(productId);

            await db.query('UPDATE users SET shopping_cart = $1 WHERE id = $2', [JSON.stringify(shoppingCart), userId]);

            res.redirect("/");
        } else {
            res.redirect("/signIn");
        }
    } catch (error) {
        console.error('Error adding product to shopping cart:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/product/:id', async (req, res) => {
    try {
        const productId = req.params.id;
        const product = await db.query('SELECT * FROM products WHERE id = $1', [productId]);

        if (product.rows.length === 0) {
            return res.status(404).send('Product not found');
        }

        res.render('productDetails.ejs', { product: product.rows[0] });
    } catch (err) {
        console.error('Error fetching product details:', err);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/add-to-cart', async (req, res) => {
    try {
        if (!req.isAuthenticated()) {
            return res.redirect("/signIn");
        }

        const userId = req.user.id;

        const userData = await db.query('SELECT shopping_cart FROM users WHERE id = $1', [userId]);
        const shoppingCart = userData.rows[0].shopping_cart || [];

        const cartItems = [];
        for (const productId of shoppingCart) {
            const productData = await db.query('SELECT * FROM products WHERE id = $1', [productId]);
            const product = productData.rows[0];
            if (product) {
                cartItems.push(product);
            }
        }

        res.render('cart.ejs', { cartItems });
    } catch (error) {
        console.error('Error fetching shopping cart items:', error);
        res.status(500).send('Internal Server Error');
    }
});

passport.use(new LocalStrategy(
    { usernameField: 'email' },
    async function(email, password, done) {
        try {
            const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
            const user = result.rows[0];

            if (!user) {
                return done(null, false, { message: 'User not found' });
            }

            const passwordMatch = await bcrypt.compare(password, user.password);

            if (passwordMatch) {
                return done(null, user);
            } else {
                return done(null, false, { message: 'Invalid credentials' });
            }
        } catch (error) {
            console.error('Error logging in:', error);
            return done(error);
        }
    }
));

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(async function(id, done) {
    try {
        const result = await db.query('SELECT * FROM users WHERE id = $1', [id]);
        const user = result.rows[0];
        if (!user) {
            // User not found in database
            return done(null, false);
        }
        return done(null, user);
    } catch (error) {
        console.error('Error deserializing user:', error);
        return done(error);
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
