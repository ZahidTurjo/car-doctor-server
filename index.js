const express = require('express');
const cors = require('cors');
require('dotenv').config()
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
const app = express();
const port = process.env.PORT || 5000;

// middleware

app.use(cors({
    origin:['http://localhost:5173','http://localhost:5174'],
    credentials:true
}));
app.use(express.json())
app.use(cookieParser())

const verifyToken= async(req,res,next)=>{
    const token= req.cookies?.token;
    console.log("value of token in middleware",token);
    if(!token){
        return res.status(401).send({message:'not authorized'})
    }
    jwt.verify(token, process.env.ACCESS_SECRET_TOKEN, (err,decoded)=>{
        if(err){
            return res.status(401).send({message:'forbidden'})
        }
        console.log('value in  the token', decoded);
        req.user=decoded
        next()
    })
    
}



// iwsnX5ylb2c3WIlB
// docUser
// console.log(process.env.DB_PASS,process.env.DB_USER);

// const verifyToken=(req,res,next)=>{
//     const token = req?.cookies?.token
//     console.log('token form vifiry and middleware', token);
//     if(!token){
//         return res.status(401).send('not authorized')
//     }
//     jwt.verify(token, process.env.ACCESS_SECRET_TOKEN, (err, decoded)=>{
//         if(err){
//             return res.status(403).send('forbidden')
//         }
//         req.user= decoded
//         next()
//     })
  

// }


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.whoa8gp.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        const serviceCollection = client.db('carDoctor').collection('services')
        const bookingCollection = client.db('carDoctor').collection('bookings')
        // AAPPP JWT
        // app.post('/jwt', async (req, res) => {
        //     const user = req.body;
        //     console.log(user);
        //     const token = jwt.sign(user, process.env.ACCESS_SECRET_TOKEN,
        //         { expiresIn: '1h' })

        //     res
        //         .cookie('token', token, {
        //             httpOnly: true,
        //             secure: false,
        //             sameSite: 'none'
        //         })
        //         .send({ succes: true })

        // })
        // app.post('/jwt', async (req, res) => {
        //     const user = req.body;
        //     console.log(user);

        //     const token = jwt.sign(user, process.env.ACCESS_SECRET_TOKEN, {
        //         expiresIn: '1h'
        //     });

        //     res
        //         .cookie('token', token, {
        //             httpOnly: true,
        //             secure: false
        //         })
        //         .send({ success: true })
        // })
app.post('/jwt', async(req,res)=>{
    const user= req.body;
    console.log(user);
    const token=jwt.sign(user,process.env.ACCESS_SECRET_TOKEN,{
        expiresIn:'1h'
    })
    console.log(token);
    res
    .cookie('token', token, {
        httpOnly:true,
        secure:true,
        sameSite:'none'
    })
    .send({success:true})
  
})
app.post('/logout', async(req,res)=>{
    const user=req.body;
    res.clearCookie('token', {maxAge:0}).send({success:true})
})
        app.get('/services', async (req, res) => {
            const cursor = serviceCollection.find()
            const result = await cursor.toArray()
            res.send(result)
        })

        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            // const options = {

            //     // Include only the `title` and `imdb` fields in the returned document
            //     projection: {  title: 1, price: 1 },
            //   };
            const result = await serviceCollection.findOne(query)
            res.send(result)
        })


        // bookings

        app.post('/bookings', async (req, res) => {
            const booking = req.body;
            console.log(booking);
            const result = await bookingCollection.insertOne(booking)
            res.send(result)
        })

        app.get('/bookings',verifyToken, async (req, res) => {
            // console.log('user from verified token',req.user);
            // if(req.query.email!== req.user.email){
            //     return res.status(403).send({message: 'email mile nai'})
            // }
            // console.log('cook cuk cokies', req.cookies);
            if(req.query.email !== req.user.email){
               return res.status(401).send('not authorized')
            }
            let query = {}
            if (req.query?.email) {
                query = { email: req.query.email }
            }
            const cursor = bookingCollection.find(query)
            const result = await cursor.toArray()
            res.send(result)
        })
        app.patch('/bookings/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const updatedBooking = req.body;
            console.log(updatedBooking);
            const updateDoc = {
                $set: {
                    status: updatedBooking.status
                },
            };
            const result = await bookingCollection.updateOne(filter, updateDoc);
            res.send(result);
        })

        app.delete('/bookings/:id', async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await bookingCollection.deleteOne(query)
            res.send(result)

        })
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);




app.get('/', (req, res) => {
    res.send('doctor is running')

})

app.listen(port, () => {
    console.log(`Doctor is running is om POrt${port}`);
})