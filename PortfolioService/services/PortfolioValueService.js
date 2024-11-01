const dataSource = require("../config/config");


const getPortfolioValueData = async (userId) => {
    try {
        const queryResult = await dataSource.query(
        `   SELECT 'Hourly' AS "type", "time", "value"
            FROM "portfolioHourlyValue"
            WHERE "userId" = $1
            
            UNION ALL
            
            SELECT 'Daily' AS "type", "time", "value"
            FROM "portfolioDailyValue"
            WHERE "userId" = $1
            
            UNION ALL
            
            SELECT 'Weekly' AS "type", "time", "value"
            FROM "portfolioWeeklyValue"
            WHERE "userId" = $1
            
            ORDER BY "type" ASC, "time" ASC; 
        `, 
        [userId]);

            
        return {
            Hourly: { showTime: true,   data: queryResult.filter(data => data.type === 'Hourly')},
            Daily:  { showTime: true,  data: queryResult.filter(data => data.type === 'Daily')},
            Weekly: { showTime: true,  data: queryResult.filter(data => data.type === 'Weekly')}
        };

    } catch (error) {
        console.log("\nError fetching value Data:", error);
        return res.status(500).json({ message: error.message });
    }
};





const getAvgValuesFrom = async (fromTable) => {
    try {
        const avgValues = await dataSource
            .getRepository(`Portfolio${fromTable}Value`)
            .createQueryBuilder("p")
            .select("p.userId", "userId")
            .addSelect('AVG("value")', 'value')
            .groupBy("p.userId")
            .getRawMany();

        return avgValues;
    }

    catch (error) {
        console.log("\nError getting grouped avg values:", error);
    }
}





const updateValueOf = async (dataToUpdate, intoTable) => {
    try {
        await dataSource
            .getRepository(`Portfolio${intoTable}Value`)
            .createQueryBuilder()
            .insert()
            .into(`portfolio${intoTable}Value`)
            .values(dataToUpdate)
            .orIgnore()
            .execute();
    }

    catch (error) {
        console.log(`\nError inserting ${intoTable} value:`, error);
    }
};





module.exports = {
    getPortfolioValueData,
    getAvgValuesFrom,
    updateValueOf
};