require('dotenv').config();
const { express } = require('./globals');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const bodyParser = require('body-parser');
const request = require('request');
const async = require('async');
const archiver = require('archiver');
const cookieParser = require('cookie-parser');
const compression = require('compression');

const entranceRouter = require('./routes/entrance');
const secureRouter = require('./routes/secure');

const PORT = process.env.PORT || 5000;
const app = express();

app.use(cors())
   .use(helmet())
   .use(compression())
   .use(cookieParser(process.env.LOL))
   .use(bodyParser.json())
   .use(bodyParser.urlencoded({ extended: false }))
   .use('/secure', secureRouter)
   .use('/entrance', entranceRouter);

app.use(express.static(path.join(__dirname, 'frontend/dist')))
   .listen(PORT, () => console.log(`Listening on ${ PORT }`));

app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/dist'), (error) => {
        if (error) {
            res.status(500).send(error);
        }
    });
});

app.post('/inFile', (req, res) => {
    console.log(req.body);
    console.log('inFile called');
    let urls = req.body.fileIds.split(/,\s*/).map(id => `https://drive.google.com/uc?export=download&id=${id}`);
    console.log(urls);
    const zipArchive = archiver('zip');
    res.attachment('files.zip');
    async.eachLimit(urls, 3, (url, done) => {
        let filename = "";
        let stream = request(url)
                            .on('response', res => {
                                let contentDisp = res.headers['content-disposition'];
                                if (contentDisp === undefined) {
                                    console.log(`couldn't fetch ${url}`);
                                    return;
                                }
                                filename = contentDisp.split('filename=')[1]
                                                      .split(';')[0]
                                                      .replace(/"/g, '');
                                zipArchive.append(stream, { name : filename });
                            })
                            .on('error', err => done(err))
                            .on('end', () => done());
    }, err => {
        if (err) {
            throw err;
        } else {
            zipArchive.pipe(res);
            zipArchive.finalize();
        }
    });
})