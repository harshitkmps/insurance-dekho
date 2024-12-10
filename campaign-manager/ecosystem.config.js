module.exports = {
    apps: [{
        name: "CampaignManager",
        script: "npm start",
        pidFile: "pids/pm2-app.pid",
        instances: 1,
        autorestart: true,
        kill_timeout: 2000,

        /**
 *          * new feature; increase restart delay each time after every crash or non reachable db per example
 *                   * exp_backoff_restart_delay: 100,
 *                            */
        watch: false,
        time: true,
        combine_logs: true,
        merge_logs: true,
        ignore_watch: ["[\\/\\\\]\\./", "**/public/**", "**/.tmp/**", "**/node_modules/**", "**/logs/**", "**/pids/**"],
        watch_options: {

        },
        max_memory_restart: "1G",
        env: {
            PORT: 3056,
            NODE_ENV: "staging",
        }
    }, ],
    deploy: {

    },
};