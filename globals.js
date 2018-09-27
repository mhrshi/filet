const express = require('express');
const pgp = require('pg-promise')();
const jwt = require('jsonwebtoken');

const dev = {
    host: process.env.LOCAL_DB_HOST,
    port: process.env.LOCAL_DB_PORT,
    database: process.env.LOCAL_DB_NAME,
    user: process.env.LOCAL_DB_USER,
    password: process.env.LOCAL_DB_PWD
};
const prod = {
    host: 'ec2-54-217-235-159.eu-west-1.compute.amazonaws.com',
    port: 5432,
    database: 'd969iig46vueu2',
    user: 'fgbwqhvucckgiy',
    password: 'bd73433389b2c2f05c16672b053a389680c299742a599e22606a598a7be05c71',
    ssl: true
};

const database = pgp(prod);

module.exports = {
    express,
    database,
    jwt
};

