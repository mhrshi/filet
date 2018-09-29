const bcrypt = require('bcrypt');
const { database, express, jwt } = require('../globals');

const entrance = express.Router();

entrance.post('/', async (req, res) => {
    const username = `${req.body.prefix}${req.body.username}`;
    const password = req.body.password;
    const reply = await userAuth(req.body.prefix, username, password);
    if (reply.matched) {
        await res.cookie('FiletLog', jwt.sign({
            prefix: req.body.prefix,
            username: username
        }, process.env.LOL, { expiresIn: "1800000" }), {
            maxAge: 1800000,
        });
    }
	res.json(reply);
});

async function userAuth(prefix, username, password) {
    const reply = { matched: false, error: '', errorIn: '' };
    const type = prefix === 'IU' ? 'student' : 'faculty';
	try {
		const user = await database.one(`SELECT * from ${type} WHERE id='${username}'`);
		const result = await bcrypt.compare(password, user.pwd);
		if (result) {
            reply.matched = result;
		} else {
            reply.error = "Incorrect password";
            reply.errorIn = "pwdError";
        }
	} catch(error) {
		console.log(error);
        reply.error = "Incorrect username";
        reply.errorIn = "idError";
	}
	return reply;
}

module.exports = entrance;