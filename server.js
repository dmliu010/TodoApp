let express = require('express')
let mongodb = require('mongodb')
let credentials = require('./credentials')
let safeTxt = require('sanitize-html')

let db

let app = express()
let port = process.env.PORT
if (port == null || port == "") {
    port=3000
}


// create your own "credentials.js file and put your own MongoDB credentials in mongoCred variable"
let connectionString = credentials.mongoCred

app.use(express.static('public'))

mongodb.connect(connectionString, {useNewUrlParser: true, useUnifiedTopology: true}, (err, client) => {
    db = client.db()
    app.listen(3000)
})

app.use(express.json())
app.use(express.urlencoded({extended: false}))

//Password Protection Function
function passwordProtection(req, res, next) {
    res.set('WWW-Authenticate', 'Basic realm="Deming\'s Amazon Essentials Thrifty Budget Todo App"')
    if (req.headers.authorization == credentials.siteCred) {
        next()
    } else {
        res.status(401).send("Authorization required")
    }
}

app.use(passwordProtection)

app.get('/', (req, res) => {
    db.collection('items').find().toArray((err, items) => {
        res.send(`
        <!DOCTYPE html>
        <html>
        <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Deming's BasicAF Todo App</title>
        <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/css/bootstrap.min.css" integrity="sha384-GJzZqFGwb1QTTN6wy59ffF1BuGJpLSa9DkKMp0DgiMDm4iYMj70gZWKYbI706tWS" crossorigin="anonymous">
        </head>
        <body>
        <div class="container">
            <h1 class="display-4 text-center p-1">Deming's BasicAF Todo App >:)</h1>
            
            <div class="jumbotron p-3 shadow-sm">
            <form id="create-form" action="/mk-item" method="POST">
                <div class="d-flex align-items-center">
                <input id="create-field" name="item" autofocus autocomplete="off" class="form-control mr-3" type="text" style="flex: 1;">
                <button class="btn btn-primary">Add New Task</button>
                </div>
            </form>
            </div>
            
            <ul id="item-list" class="list-group pb-5">
            </ul>
            <div class="p-3 text-light font-weight-bold bg-dark footer-copyright text-right py-3">Deming's Amazon Essentials Thrifty Budget Todo App © 2021</div>
        </div>

        <script>
        let items = ${JSON.stringify(items)}
        </script>

        <script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
        <script src="/browser.js"></script>
        </body>
        </html>
    `)
        console.log(items)
    })    
})

app.post('/mk-item', (req, res) => {
    let sanitized = safeTxt(req.body.text, { allowedTags:[], allowedAttributes:{} })
    db.collection('items').insertOne({text: sanitized}, 
        (err, info) => {
            res.json(info.ops[0])
        }
    )
})

app.post('/update-item', function(req, res) {
    db.collection('items').findOneAndUpdate({_id: new mongodb.ObjectId(req.body.id)}, {$set: {text: req.body.text}}, () => {
        res.send("Success")
    })

})

app.post('/delete-item', function(req, res) {
    db.collection('items').deleteOne({_id: new mongodb.ObjectId(req.body.id)}, () => {
        res.send("Success")
    })

})

