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
        const subjects = await database.any(`SELECT id, name FROM subject`);
        res.json(subjects);
    } catch(error) {
        res.send(error);
    }
});

secure.post('/practicals', async (req, res) => {
    try {
        const practicals = await database.any(`SELECT id, name, fileid from ${req.body.subject} WHERE e_no='${req.body.username}'`);
        res.json(practicals);
    } catch(error) {
        res.status(204).send(error);
    }
});

secure.post('/revise', (req, res) => {
    // database.none(`UPDATE ${req.body.table} SET file_id='${req.body.fileId}' WHERE e_no='${}'`)
});

module.exports = secure;