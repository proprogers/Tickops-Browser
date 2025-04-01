const crypto = require('crypto');

const algorithm = 'aes-256-cbc';

function getHash({ data, salt }) {
  return crypto.createHash('sha256')
    .update(data + salt, 'utf8')
    .digest('hex');
}

function getDoubleHash({ data, salt }) {
  const hash = getHash({ data, salt });
  return getHash({ data: hash, salt });
}

function encrypt({ data, masterPasswordHash, iv }) {
  const outputEncoding = 'hex';
  const inputEncoding = 'utf8';
  const key = Buffer.from(masterPasswordHash, outputEncoding);
  const cipher = crypto.createCipheriv(algorithm, key, Buffer.from(iv));
  let encrypted = cipher.update(data, inputEncoding, outputEncoding);
  encrypted += cipher.final(outputEncoding);
  return encrypted;
}

function decrypt({ data, masterPasswordHash, iv }) {
  const outputEncoding = 'utf8';
  const inputEncoding = 'hex';
  const key = Buffer.from(masterPasswordHash, inputEncoding);
  const decipher = crypto.createDecipheriv(algorithm, key, Buffer.from(iv));
  let dec = decipher.update(data, inputEncoding, outputEncoding);
  dec += decipher.final(outputEncoding);
  return dec;
}

module.exports = { encrypt, decrypt, getHash, getDoubleHash };
