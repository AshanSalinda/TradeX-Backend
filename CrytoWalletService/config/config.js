const typeorm = require("typeorm");
const path = require("path");

const dataSource = new typeorm.DataSource({
    type: "postgres",
    host: process.env.RDS_HOST,
    port: process.env.RDS_PORT,
    username: process.env.RDS_USERNAME,
    password: process.env.RDS_PASSWORD,
    database: "wallet_service_db",
    synchronize: true,
    logging : true,
    entities: [path.join(__dirname , ".." , "models/**/*.js")],
})


module.exports = dataSource;