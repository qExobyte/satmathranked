'use strict';

var dbm;
var type;
var seed;

exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function(db) {
  const triggerSql = `
    CREATE TRIGGER update_streak_after_problem
    AFTER INSERT ON PROBLEM_HISTORY
    FOR EACH ROW
    BEGIN
        DECLARE last_date DATE;
        DECLARE curr_streak INT;
        DECLARE long_streak INT;
        
        SELECT last_activity_date, current_streak, longest_streak 
        INTO last_date, curr_streak, long_streak
        FROM STREAKS 
        WHERE user_id = NEW.user_id;
        
        IF DATE(NEW.timestamp) = last_date THEN
            UPDATE STREAKS 
            SET latest_problem = NEW.problem_id
            WHERE user_id = NEW.user_id;
            
        ELSEIF DATE(NEW.timestamp) = DATE_ADD(last_date, INTERVAL 1 DAY) THEN
            UPDATE STREAKS 
            SET current_streak = curr_streak + 1,
                longest_streak = GREATEST(long_streak, curr_streak + 1),
                last_activity_date = DATE(NEW.timestamp),
                latest_problem = NEW.problem_id
            WHERE user_id = NEW.user_id;
            
        ELSE
            UPDATE STREAKS
            SET current_streak = 1,
                last_activity_date = DATE(NEW.timestamp),
                latest_problem = NEW.problem_id
            WHERE user_id = NEW.user_id;
        END IF;
    END
  `;

  return db.runSql(triggerSql);
};

exports.down = function(db) {
  return db.runSql('DROP TRIGGER IF EXISTS update_streak_after_problem');
};

exports._meta = {
  "version": 1
};