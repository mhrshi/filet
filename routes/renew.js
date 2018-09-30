const { bcrypt, database, express } = require('../globals');
const uuid = require('uuid/v4');

const renew = express.Router();

function insertIntoReset(enrollId) {
    const resetid = uuid();
    database.none(`INSERT INTO reset VALUES ('${resetid}', '${enrollId}', '${Date.now()}')`);
}

insertIntoReset('IU1641100011');

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
                        database.none(`UPDATE reset SET time='DELETED' WHERE id='${row.id}'`);
                        res.send({ code: 200, message: 'Password saved successfully' });
                    })
        });
    } catch(error) {
        res.send({ code: 401, message: 'Error saving password' });
    }
})

module.exports = renew;