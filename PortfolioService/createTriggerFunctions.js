const dataSource = require('./config/config');


const createTriggerFunctions = async () => {
    await portfolioValueQueueHandler();
    await emptyAssetsRemover();
}




const portfolioValueQueueHandler = async () => {

    const sqlQuery = `
    CREATE OR REPLACE FUNCTION portfolio_value_queue_handler() RETURNS TRIGGER AS $$
    DECLARE
        maxRecordCount INT;
    BEGIN

        CASE TG_TABLE_NAME
            WHEN 'portfolioHourlyValue' THEN maxRecordCount := 24;
            WHEN 'portfolioDailyValue' THEN maxRecordCount := 31;
            WHEN 'portfolioWeeklyValue' THEN maxRecordCount := 53;
        END CASE;
    
        EXECUTE format('
            DELETE FROM %I
            WHERE "userId" = $1 AND "time" IN (
                SELECT "time"
                FROM %I
                WHERE "userId" = $1
                ORDER BY "time" DESC
                OFFSET $2
            )', TG_TABLE_NAME, TG_TABLE_NAME)
        USING NEW."userId", maxRecordCount;

        return null;
    END;
    $$ LANGUAGE plpgsql;



    CREATE OR REPLACE TRIGGER hourly_value_queue_trigger
        AFTER INSERT ON "portfolioHourlyValue"
        FOR EACH ROW
        EXECUTE FUNCTION portfolio_value_queue_handler();


    CREATE OR REPLACE TRIGGER daily_value_queue_trigger
        AFTER INSERT ON "portfolioDailyValue"
        FOR EACH ROW
        EXECUTE FUNCTION portfolio_value_queue_handler();


    CREATE OR REPLACE TRIGGER weekly_value_queue_trigger
        AFTER INSERT ON "portfolioWeeklyValue"
        FOR EACH ROW
        EXECUTE FUNCTION portfolio_value_queue_handler();
    `;
    

    try {
        await dataSource.query(sqlQuery);
    } catch (error) {
        console.error('\n\nError creating trigger function:\n\n', error);
    }
}




const emptyAssetsRemover = async () => {

    const sqlQuery = `
        CREATE OR REPLACE FUNCTION empty_assets_remover()
        RETURNS TRIGGER AS $$
        DECLARE
            total_balance FLOAT;
        BEGIN
            IF NEW.symbol = 'USD' THEN
                RETURN NEW;
            END IF;
        
        
            SELECT "tradingBalance" + "holdingBalance" + "fundingBalance" INTO total_balance
            FROM asset
            WHERE "userId" = NEW."userId" AND "symbol" = NEW."symbol";
        
            IF total_balance <= 0 THEN
                DELETE FROM asset WHERE "userId" = NEW."userId" AND "symbol" = NEW."symbol";
            END IF;
        
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        
        CREATE OR REPLACE TRIGGER check_and_delete_asset_on_insert_trigger
        AFTER INSERT ON asset
        FOR EACH ROW
        EXECUTE FUNCTION empty_assets_remover();
        
        CREATE OR REPLACE TRIGGER check_and_delete_asset_on_update_trigger
        AFTER UPDATE ON asset
        FOR EACH ROW
        EXECUTE FUNCTION empty_assets_remover();`
    ;

    try {
        await dataSource.query(sqlQuery);
    } catch (error) {
        console.error('\n\nError creating emptyAssetsRemover trigger function:\n\n', error);
    }
}

module.exports = createTriggerFunctions;