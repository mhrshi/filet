require('dotenv').config();
const { express } = require('./globals');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const nodemailer = require('nodemailer');

const entranceRouter = require('./routes/entrance');
const secureRouter = require('./routes/secure');
const renewRouter = require('./routes/renew');

const PORT = process.env.PORT || 5000;
const app = express();

app.use(cors())
   .use(helmet())
   .use(compression())
   .use(cookieParser(process.env.LOL))
   .use(bodyParser.json())
   .use(bodyParser.urlencoded({ extended: false }))
   .use('/secure', secureRouter)
   .use('/entrance', entranceRouter)
   .use('/renew', renewRouter);

app.use(express.static(path.join(__dirname, 'frontend/dist')))
   .listen(PORT, () => console.log(`Listening on ${ PORT }`));

app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/dist/index.html'), (error) => {
        if (error) {
            res.status(500).send(error);
        }
    });
});

const mailConfig = {
    from: 'Filet App <maharshibhavsar.16.it@iite.indusuni.ac.in>',
    to: 'bhavsarm99@gmail.com',
    subject: 'First Filet Test Email',
    generateTextFromHTML: true,
    html: 'Test mail sent from Filet server'
};

function sendMail() {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            type: 'OAuth2',
            user: 'maharshibhavsar.16.it@iite.indusuni.ac.in',
            clientId: process.env.GCP_CID,
            clientSecret: process.env.GCP_SEC,
            refreshToken: process.env.REF_TOK,
            accessToken: 'generateYourself'
        }
    });
    transporter.sendMail(mailConfig, (error, res) => {
        error ? console.log(error) : console.log(res);
        transporter.close();
    })
}

// app.post('/inFile', (req, res) => {
//     console.log(req.body);
//     console.log('inFile called');
//     let urls = req.body.fileIds.split(/,\s*/).map(id => `https://drive.google.com/uc?export=download&id=${id}`);
//     console.log(urls);
//     const zipArchive = archiver('zip');
//     res.attachment('files.zip');
//     async.eachLimit(urls, 3, (url, done) => {
//         let filename = "";
//         let stream = request(url)
//                             .on('response', res => {
//                                 let contentDisp = res.headers['content-disposition'];
//                                 if (contentDisp === undefined) {
//                                     console.log(`couldn't fetch ${url}`);
//                                     return;
//                                 }
//                                 filename = contentDisp.split('filename=')[1]
//                                                       .split(';')[0]
//                                                       .replace(/"/g, '');
//                                 zipArchive.append(stream, { name : filename });
//                             })
//                             .on('error', err => done(err))
//                             .on('end', () => done());
//     }, err => {
//         if (err) {
//             throw err;
//         } else {
//             zipArchive.pipe(res);
//             zipArchive.finalize();
//         }
//     });
// })