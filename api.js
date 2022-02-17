const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcrypt')
const hbs = require('hbs');
const bodyParser = require('body-parser');
const async = require('hbs/lib/async');
const res = require('express/lib/response');

const port = process.env.PORT || 3120;

// ...............DB SCHEMA MODELS(MONGODB).........................

const user = require('./src/models/user_model')
const api = require('./src/models/api_model')
const URL = require('./src/models/URL_model')

//.................DATABASE Connection.................................
const mongo_connection = require('./src/db/config');
const { url } = require('inspector');
mongo_connection();

const app = express();


// ...........................middleWares...........

app.set("view engine","hbs");
app.use(express.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(__dirname + "/views"))

// .......................defining end-points................

//...........home route..............

app.get('/', async (req, res) => {
    try {
        var Base_ApiEndPoint = req.protocol + '://' + req.get('host') + req.originalUrl;
        // await res.status(200).send('welcome')

        res.render('index.hbs',{base_api:Base_ApiEndPoint})
    } catch (e) {
        res.status(400).send(e);
        console.log(e);
    }
})

//..............get api details.............

app.get('/api', async (req, res) => {
    try {
        var result = await api.find();

        if (result.length == 0) {
            await new api(req.body).save();
            var result = await api.find();
            res.status(200).send(result);
        } else {
            res.status(200).send(result);
        }
    } catch (error) {
        res.status(417).send(error);
    }
})
//...........GET USER DATA.....................................................
app.get('/user/:id',async (req,res)=>{

    try {

        var result = await user.findOne({user_id:req.params.id})
        var url_data = await URL.find({user_id:req.params.id})

        result.links = url_data;
        res.status(200).send(result)

    } catch (e) {
        res.status(400).send(e)
    }

    
} )
//...........LOGIN.............................................................
app.post('/login', async (req, res) => {

    var result = await user.find({ email: req.body.email });
    if (result.length != 0) {
        bcrypt.compare(req.body.pwd, result[0].pwd, async (err, data) => {
            // res == true or res == false
            if (err) {
                res.send(err);
                //console.log(result[0].user_id)
            } else {
                // res.send(data);
                // console.log("line 76"+data);

                if (data) {
                    var total_urls = await URL.find({
                        user_id:result[0].user_id
                    })

                    result[0].links = total_urls

                    res.status(200).send(result[0])
                    //console.log(result[0])
                    // console.log(total_urls)
                } else { 
                    console.log(data)
                    res.status(200).send("invalid") 
                }

            }
        })
    } else {
        res.send('invalid')
    }
})

//.................SIGNUP (USER REGISTER)..........................
//.........note:- 422 = Unprocessable Entity

app.post('/signup', async (req, res) => {
    try {

        var user_data = new user(req.body);
        var api_detail = await api.findOne();
        var temp = await user.find({ email: user_data.email })


        if (temp.length !== 0) {
            // console.log(temp.length)

            res.status(400).send('email already exist')
        } else {
            user_data.user_id = user_data.user_id + (api_detail.total_user + 1).toString();
            await user_data.save();
            await api.updateOne({ id: "API_POLYNOMIAL_01" }, { $set: { total_user: api_detail.total_user + 1 } });
            res.status(201).send('line 105 saved successfully \n');
        }

    } catch (error) {
        //422 = Unprocessable Entity
        res.status(422).send('line 110 error in saving \n' + error);
    }
})

// ........................SHORTING THE URL......................................

app.post('/shorturl', async (req, res) => {

    try {

        var Base_ApiEndPoint = req.protocol + '://' + req.get('host');
        var user_data = await user.findOne({ user_id: req.body.id })

        var su_endPoint = "url" + user_data.total_links.toString();
        su_endPoint = `${Base_ApiEndPoint}/${req.body.id}/${su_endPoint}`

        // await user.updateOne(
        //     { user_id: req.body.id },
        //     { $push: { links: { URL: req.body.URL, short_string: su_endPoint } } }
        // )

        var url_data = new URL();
        url_data.user_id = req.body.id;
        url_data.URL = req.body.URL;
        url_data.SURL = su_endPoint;
        url_data.sstr = "url" + user_data.total_links.toString();

        console.log(url_data)

        await url_data.save()

        await user.updateOne({ user_id: req.body.id }, { $set: { total_links: user_data.total_links + 1 } })

        res.status(200).send(su_endPoint)
        
        // var Base_ApiEndPoint = req.protocol + '://' + req.get('host');
        // console.log()
        
        

    } catch (e) {
        res.status(400).send(e)
        console.log(e)
    }

})

//...........................GET ORIGINAL URL THROUGH SHORT URL...........................
app.get('/:userID/:shortUrl', async (req, res) => {

    try {

        var result = await URL.findOne({user_id:req.params.userID,sstr:req.params.shortUrl})
        console.log(result.URL);
        // res.status(200).send(result.URL)

        await res.render('popup.hbs',{link:result.URL})

    } catch (e) {
        console.log(e)
        res.status(400).send(e)
    }


})


app.listen(port, (req, res) => {
    console.log(`server running @ localhost:${port}`)
});