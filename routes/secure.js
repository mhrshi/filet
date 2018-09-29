const { database, express, jwt } = require('../globals');
const request = require('request');
const async = require('async');
const archiver = require('archiver');

const secure = express.Router();

secure.use((req, res, next) => {
    jwt.verify(req.cookies.FiletLog, 'vniiCm_54GR84lsb7rYHkB9fAeM', (error, data) => {
        if (req.path.includes("check")) {
            if (error) {
                console.log(error);
                res.json({ code: 401 });
            } else {
                console.log(`jwt verified`);
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
    res.attachment('filet.zip');
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

module.exports = secure;