const { database, express, jwt } = require('../globals');
const request = require('request');
const async = require('async');
const archiver = require('archiver');

const secure = express.Router();

secure.use((req, res, next) => {
    jwt.verify(req.cookies.FiletLog, process.env.LOL, (error, data) => {
        if (req.path.includes("check")) {
            res.setHeader('Last-Modified', (new Date()).toUTCString());
            if (error) {
                console.log(`sending 401`);
                console.log(error);
                res.json({ code: 401 });
            } else {
                console.log(`logging in yo`);
                res.json({ code: 200, prefix: data.prefix, username: data.username });
            }
        } else {
            if (error) {
                res.status(401).send();
            } else {
                next();
            }
        }
    });
});

secure.get('/subjects', async (req, res) => {
    try {
        const subjects = await database.many(`SELECT id, name FROM subject`);
        res.json(subjects);
    } catch(error) {
        res.send(error);
    }
});

secure.post('/practicals', async (req, res) => {
    try {
        const practicals = await database.many(`SELECT id, name, fileid FROM ${req.body.subject} WHERE e_no='${req.body.username}' ORDER BY id ASC`);
        res.json(practicals);
    } catch(error) {
        console.log(error);
        res.status(204).send(error);
    }
});

secure.post('/revise', (req, res) => {
    database.result(`UPDATE ${req.body.subject} SET fileid='${req.body.fileid}' WHERE e_no='${req.body.username}' AND id=${req.body.pracid}`)
            .then(result => {
                if (result.rowCount === 1) {
                    res.json({ code: 200 });
                } else {
                    res.json({ code: 500 });
                }
            })
            .catch(error => {
                console.log(error);
                res.send(error);
            });
});

secure.post('/practicals/completed', async (req, res) => {
    try {
        const completed = await database.any(`SELECT * FROM ${req.body.subject} WHERE fileid <> '' ORDER BY e_no ASC, id ASC`);
        res.json(completed);
    } catch(error) {
        console.log(error);
        res.status(204).send(error);
    }
});

secure.post('/downloadFiles', (req, res) => {
    const zipArchive = archiver('zip');
    res.attachment(nameWithStamp());
    async.eachLimit(req.body.rows, 3, (row, done) => {
        let filename = "";
        let stream = request(`https://drive.google.com/uc?export=download&id=${row.fileid}`)
                            .on('response', res => {
                                let contentDisp = res.headers['content-disposition'];
                                if (contentDisp === undefined) {
                                    console.log(`couldn't fetch ${row.fileid}`);
                                    return;
                                }
                                filename = contentDisp.split('filename=')[1]
                                                      .split(';')[0]
                                                      .replace(/"/g, '');
                                zipArchive.append(stream, { name : `${row.e_no}/${filename}` });
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
});

function nameWithStamp() {
    const dateObject = (new Date()).toLocaleString();
    const [date, time] = dateObject.split(', ');
    const [month, day, year] = date.split('/');
    let [hours, mins] = time.split(':');
    if (time.endsWith('PM') && hours < 12) {
        hours = hours - 0 + 12;
    }
    if (time.endsWith('AM') && hours === '12') {
        hours = '00';
    }
    return `filet-${year}-${('0' + month).slice(-2)}-${('0' + day).slice(-2)}-${hours}${mins}.zip`;
}

console.log(nameWithStamp());

module.exports = secure;