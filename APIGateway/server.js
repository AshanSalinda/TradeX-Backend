const path = require('path');
const gateway = require('express-gateway');

const fs = require('fs');
const yaml = require('js-yaml');
require('dotenv').config();

const replaceEnvVariables = (content) => {
    return content.replace(/\$\{(\w+)\}/g, (_, n) => process.env[n]);
};

const loadConfig = (filePath) => {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const replacedContent = replaceEnvVariables(fileContent);
    return yaml.load(replacedContent);
};

const configFilePath = path.join(__dirname, 'config', 'gateway.config.yml');


const config = loadConfig(configFilePath);
console.log(config);

require('dotenv').config();
console.log('JWT_SECRET:', process.env.JWT_SECRET);

gateway()
  .load(path.join(__dirname, 'config'))
  .run();
