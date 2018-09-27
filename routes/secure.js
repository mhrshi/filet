const { database, express, jwt } = require('../globals');

const secure = express.Router();

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

module.exports = secure;