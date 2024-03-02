import expres from 'express';
import product from './routes/product.mjs'

const app=expres();
const port=3000;

app.use(expres.static('public'));
app.use('/products', product);

app.get('/',(req,res)=>{
res.render("index.ejs")
});


app.listen(port,()=>{
console.log(`server is running on http://localhost:${port}`)
});