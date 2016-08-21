var Tag = mongoose.model('Tag');

module.exports = {
    run: function(callback) {
        var UPDATE_HITS_FILE = './update-hits.json';
        fs.access(UPDATE_HITS_FILE, fs.F_OK, function(err) {
            var today = new Date();
            var dates;
            if (err) {
                dates = {
                    daily: today.toISOString(),
                    weekly: today.toISOString(),
                    monthly: today.toISOString()
                }
            } else {
                dates = JSON.parse(fs.readFileSync(UPDATE_HITS_FILE, 'utf8'));
            }
            var last_daily_update = new Date(dates.daily);
            var last_weekly_update = new Date(dates.weekly);
            var last_monthly_update = new Date(dates.monthly);
            var update_daily = last_daily_update <= today;
            var update_weekly = last_weekly_update <= today;
            var update_monthly = last_monthly_update <= today;
            var tasks = [];
            tasks.push(function(callback) {
                Pack.find().exec(function(err, packs) {
                    packs.forEach(function(pack) {
                        if (update_daily) {
                            pack.hits.daily = 0;
                        }
                        if (update_weekly) {
                            pack.hits.weekly = 0;
                        }
                        if (update_monthly) {
                            pack.hits.monthly = 0;
                        }
                        pack.save(function(err, pack) {

                        });
                    });
                    callback(null);
                });
            });
            tasks.push(function(callback) {
                Sticker.find().exec(function(err, stickers) {
                    stickers.forEach(function(sticker) {
                        if (update_daily) {
                            sticker.hits.daily = 0;
                        }
                        if (update_weekly) {
                            sticker.hits.weekly = 0;
                        }
                        if (update_monthly) {
                            sticker.hits.monthly = 0;
                        }
                        sticker.save(function(err, sticker) {

                        });
                    });
                    callback(null);
                });
            });
            tasks.push(function(callback) {
                Tag.find().exec(function(err, tags) {
                    tags.forEach(function(tag) {
                        if (update_daily) {
                            tag.hits.daily = 0;
                        }
                        if (update_weekly) {
                            tag.hits.weekly = 0;
                        }
                        if (update_monthly) {
                            tag.hits.monthly = 0;
                        }
                        tag.save(function(err, tag) {

                        });
                    });
                    callback(null);
                });
            });
            tasks.push(function(callback) {
                Author.find().exec(function(err, authors) {
                    authors.forEach(function(author) {
                        if (update_daily) {
                            author.hits.daily = 0;
                        }
                        if (update_weekly) {
                            author.hits.weekly = 0;
                        }
                        if (update_monthly) {
                            author.hits.monthly = 0;
                        }
                        author.save(function(err, author) {

                        });
                    });
                    callback(null);
                });
            });
            async.parallel(tasks, function(err, results) {
                if (update_daily) {
                    var daily_future = new Date();
                    daily_future.setDate(daily_future.getDate() + 1);
                    dates.daily = daily_future.toISOString();
                }
                if (update_weekly) {
                    var weekly_future = new Date();
                    weekly_future.setDate(weekly_future.getDate() + 7);
                    dates.weekly = weekly_future.toISOString();
                }
                if (update_monthly) {
                    var monthly_future = new Date();
                    monthly_future.setMonth(monthly_future.getMonth() + 1);
                    dates.monthly = monthly_future.toISOString();
                }
                fs.writeFile(UPDATE_HITS_FILE, JSON.stringify(dates, null, 4), function(err) {
                    if (err) {
                        console.log(err);
                    } else {
                        console.log("Dates for future updates saved to " + UPDATE_HITS_FILE);
                    }
                    callback();
                });
            });
        });
    }
};
