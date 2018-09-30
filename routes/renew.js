const { bcrypt, database, express } = require('../globals');
const nodemailer = require('nodemailer');
const uuid = require('uuid/v4');

const renew = express.Router();

function insertIntoReset(enrollId) {
    const resetid = uuid();
    database.none(`INSERT INTO reset VALUES ('${resetid}', '${enrollId}', '${Date.now()}')`);
}

async function sendMail() {
    const row = await database.one(`SELECT * FROM reset WHERE e_no='IU1641100036'`);
    console.log(row);
    const mailConfig = {
        from: 'Filet App <maharshibhavsar.16.it@iite.indusuni.ac.in>',
        to: 'bhavsarm99@gmail.com',
        subject: 'Password Reset',
        generateTextFromHTML: true,
        html: `Hello IU1641100036,<br/><br/>Please access the following link to reset your password:<br/>http://filet.herokuapp.com/reset/${row.id}<br/><br/>Note that above link will stay active only for an hour from now.<br/><br/>Regards,<br/>Filet`
    };
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

renew.post('/check', async (req, res) => {
    database.one(`SELECT * from reset WHERE id='${req.body.resetid}'`)
            .then(data => {
                if (Date.now() - data.time > 3600000) {
                    database.none(`DELETE FROM reset WHERE id='${data.id}'`);
                    res.send({ code: 401 });
                }
                res.send({ code: 200 });
            }).catch(error => {
                res.send({ code: 401 });
            })
});

renew.post('/getInfo', async (req, res) => {
    database.one(`SELECT * from reset WHERE id='${req.body.resetid}'`)
            .then(data => {
                if (Date.now() - data.time > 3600000) {
                    database.none(`DELETE FROM reset WHERE id='${data.id}'`);
                    res.send({ code: 401, username: 'Expired link!' });
                }
                res.send({ code: 200, username: data.e_no });
            }).catch(error => {
                console.log(error);
                res.send({ code: 401, username: 'Expired link!' });
            })
});

renew.post('/password', async (req, res) => {
    try {
        const row = await database.one(`SELECT * from reset WHERE id='${req.body.resetid}'`);
        if (Date.now() - row.time > 3600000) {
            throw new Error('reset link expired');
        }
        const type = row.e_no.startsWith('IU') ? 'student' : 'faculty';
        bcrypt.hash(req.body.password, 5, (error, hash) => {
            database.none(`UPDATE ${type} SET pwd='${hash}' WHERE id='${row.e_no}'`)
                    .then(out => {
                        database.none(`DELETE FROM reset WHERE id='${row.id}'`);
                        console.log(`reset done for ${row.e_no}`);
                        res.send({ code: 200, message: 'Password saved successfully' });
                    })
        });
    } catch(error) {
        res.send({ code: 401, message: 'Error saving password' });
    }
})

module.exports = renew;