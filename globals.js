const bcrypt = require('bcrypt');
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
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PWD,
    ssl: true
};

const database = pgp(prod);

module.exports = {
    bcrypt,
    express,
    database,
    jwt
};

