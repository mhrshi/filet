const { database, express, jwt } = require('../globals');
const request = require('request');
const async = require('async');
const archiver = require('archiver');
const nodemailer = require('nodemailer');
const uuid = require('uuid/v4');
const axios = require('axios');

const secure = express.Router();

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

secure.use((req, res, next) => {
    jwt.verify(req.cookies.FiletLog, process.env.LOL, (error, data) => {
        if (req.path.includes("check")) {
            if (error) {
                res.json({ code: 401 });
            } else {
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

secure.post('/restricted/resetter', async (req, res) => {
    jwt.verify(req.cookies.FiletLog, process.env.LOL, (error, data) => {
        if (data.username !== 'IU1641100011') {
            res.status(401).send();
            return;
        }
    });
    let userId = req.body.eno;
    if (req.body.eno.includes(',')) {
        const [id, mail] = req.body.eno.split(', ');
        userId = id;
        await database.none(`UPDATE student
                             SET mail='${mail}'
                             WHERE id='${id}'`);
    }
    try {
        const resetid = uuid();
        const type = userId.startsWith('IU') ? 'student' : 'faculty';
        await database.none(`INSERT INTO reset VALUES ('${resetid}', '${userId}', '${Date.now()}')`);
        const row = await database.one(`SELECT name, mail FROM ${type} WHERE id='${userId}'`);
        const firstName = row.name.split(' ')[0];
        const name = firstName[0] + firstName.slice(1).toLowerCase();
        const greet = type === 'student' ? `Hello ${name}` : 'Dear Madam/Sir';
        const mailConfig = {
            from: 'Filet App <maharshibhavsar.16.it@iite.indusuni.ac.in>',
            to: row.mail,
            subject: 'Password Reset',
            generateTextFromHTML: true,
            html: `${greet},<br/><br/>Please access the following link to reset your password:<br/>http://filet.herokuapp.com/reset/${resetid}<br/><br/>Note that above link will stay active only for an hour from now.<br/><br/>Regards,<br/>Filet`
        };
        transporter.sendMail(mailConfig, (error, result) => {
            if (error) {
                console.log(error);
                res.send({ code: 500, message: 'Error in sending mail' });
            } else {
                console.log(result);
                res.send({ code: 200, message: 'Mail sent' });
            }
            transporter.close();
        });
    } catch(error) {
        console.log(error);
        res.send({ code: 500, message: 'Error in process' });
    }

})

secure.get('/subjects', async (req, res) => {
    try {
        const subjects = await database.many(`SELECT id, name FROM subject WHERE id='IT0501'`);
        res.json(subjects);
    } catch(error) {
        res.send(error);
    }
});

secure.post('/practicals', async (req, res) => {
    try {
        const practicals = await database.many(`SELECT ${req.body.subject}.id, ${req.body.subject}.fileid, ${req.body.subject}.status, ${req.body.subject}_pracs.name
                                                FROM ${req.body.subject}
                                                INNER JOIN ${req.body.subject}_pracs ON ${req.body.subject}.id = ${req.body.subject}_pracs.id
                                                WHERE e_no='${req.body.username}'
                                                ORDER BY id ASC`);
        res.json(practicals);
    } catch(error) {
        console.log(error);
        res.status(204).send(error);
    }
});

secure.post('/revise', async (req, res) => {
    try {
        const prac = await database.one(`SELECT * FROM ${req.body.subject}_pracs
                                         WHERE id=${req.body.pracid}`);
        if (prac.deadline && (new Date()).getTime() > prac.deadline) {
            res.json({ code: 500, message: "Sorry, you're late :(" });
            return;
        }
    } catch(error) {
        console.log(error);
        res.status(204).send();
        return;
    } 
    if (req.body.fileid.length !== 0) {
        const reply = await validateFile(req.body.fileid, req.body.pracid);
        if (!reply.valid) {
            res.json({ code: 500, message: reply.message });
            return;
        }
    }
    database.result(`UPDATE ${req.body.subject} SET fileid='${req.body.fileid}' WHERE e_no='${req.body.username}' AND id=${req.body.pracid}`)
            .then(result => {
                if (result.rowCount === 1) {
                    res.json({ code: 200, message: 'File ID saved' });
                } else {
                    res.json({ code: 500, message: 'Error code 500' });
                }
            }).catch(error => {
                console.log(error);
                res.send(error);
            });
});

async function validateFile(fileid, pracid) {
    const reply = { valid: false, message: 'Error code 500' };
    try {
        const axres = await axios.head(`https://drive.google.com/uc?export=download&id=${fileid}`);
        const filename = axres.headers['content-disposition']
                              .split('filename=')[1]
                              .split(';')[0]
                              .replace(/"/g, '');
        console.log(filename);
        if (pracid > 5) {
            if (/.(png|jpe?g)$/i.test(filename)) {
                reply.valid = true;
            } else {
                reply.message = 'Only PNG/JP(E)G file allowed';
            }
        } else {
            if (/.(c|cpp)$/i.test(filename)) {
                reply.valid = true;
            } else {
                reply.message = 'Only C/C++ file allowed';
            }
        }
    } catch(error) {
        console.log(error);
    }
    return reply;
}

secure.post('/practicals/list', async (req, res) => {
    try {
        const list = await database.any(`SELECT *
                                         FROM ${req.body.subject}_pracs
                                         ORDER BY id ASC`);
        res.json(list);
    } catch(error) {
        console.log(error);
        res.status(204).send();
    }
});

secure.post('/practicals/update/status', async (req, res) => {
    try {
        const updations = req.body.updations;
        for (update of updations) {
            await database.none(`UPDATE ${req.body.subject}
                                 SET status=${update.status}
                                 WHERE e_no='${update.e_no}' AND id=${update.pracid}`);
        }
        res.json({ code: 200, message: 'Status(es) updated' });
    } catch (error) {
        console.log(error);
        res.send(error);
    }
});

secure.post('/practicals/deadline', async (req, res) => {
    const message = req.body.deadline === '' ? 'Deadline reset' : 'Deadline updated';
    database.result(`UPDATE ${req.body.subject}_pracs
                     SET deadline='${req.body.deadline}'
                     WHERE id=${req.body.pracid}`)
            .then(result => {
                if (result.rowCount === 1) {
                    res.json({ code: 200, message: message });
                } else {
                    res.json({ code: 500, message: 'Error code 500' });
                }
            }).catch(error => {
                console.log(error);
                res.send(error);
            });
});

secure.post('/practicals/submitted', async (req, res) => {
    try {
        const submitted = await database.any(`SELECT ${req.body.subject}.id, ${req.body.subject}.e_no, ${req.body.subject}.fileid, ${req.body.subject}.status, ${req.body.subject}_pracs.name
                                              FROM ${req.body.subject}
                                              INNER JOIN ${req.body.subject}_pracs ON ${req.body.subject}.id = ${req.body.subject}_pracs.id
                                              WHERE fileid <> ''
                                              ORDER BY e_no ASC, id ASC`);
        res.json(submitted);
    } catch(error) {
        console.log(error);
        res.status(204).send(error);
    }
});

secure.post('/downloadBlob', (req, res) => {
    axios({
        url: `https://drive.google.com/uc?export=download&id=${req.body.fileid}`,
        responseType: 'arraybuffer'
    }).then(axres => {
            const filename = axres.headers['content-disposition']
                                  .split('filename=')[1]
                                  .split(';')[0]
                                  .replace(/"/g, '');
            if (/.(png|jpe?g)$/i.test(filename)) {
                const base64Image = Buffer.from(axres.data, 'binary').toString('base64');
                const extension = filename.slice(filename.lastIndexOf('.') + 1).toLowerCase();
                res.json({ content: `data:image/${extension};base64,${base64Image}` });
            } else {
                res.json({ content: Buffer.from(axres.data, 'utf-8').toString() });
            }
        });
});

secure.post('/downloadFiles', (req, res) => {
    const files = JSON.parse(req.body.incoming);
    const zipArchive = archiver('zip');
    res.attachment(nameWithStamp());
    async.eachLimit(files, 3, (row, done) => {
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
    let [hours, mins, secs] = time.split(':');
    if (time.endsWith('PM') && hours < 12) {
        hours = hours - 0 + 12;
    }
    if (time.endsWith('AM') && hours === '12') {
        hours = '00';
    }
    hours = ('0' + hours).slice(-2);
    mins = ('0' + mins).slice(-2);
    secs = ('0' + secs.split('')[0]).slice(-2);
    return `filet-${year}-${('0' + month).slice(-2)}-${('0' + day).slice(-2)}-${hours}${mins}${secs}.zip`;
}

module.exports = secure;