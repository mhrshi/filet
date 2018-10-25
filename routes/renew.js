const { bcrypt, database, express } = require('../globals');

const renew = express.Router();

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
                        res.send({ code: 200, message: 'Success. Redirecting to login...' });
                    })
        });
    } catch(error) {
        res.send({ code: 401, message: 'Error saving password' });
    }
})

module.exports = renew;