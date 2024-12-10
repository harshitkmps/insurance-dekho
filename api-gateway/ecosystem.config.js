module.exports = {
    apps: [{
      name: "girnarsoft-insurancedekho-api-gateway",
      script: "dist/server.js",
      pidFile: "pids/pm2-app.pid",
      // args: 'one two',
      instances: 2,
      autorestart: true,
      kill_timeout: 2000,
  
      /**
       * new feature; increase restart delay each time after every crash or non reachable db per example
       * exp_backoff_restart_delay: 100,
       */
      watch: false,
      time: true,
      // combine multiple err/out logs in one file for each
      combine_logs: true,
      // calls combine logs
      merge_logs: true,
      // array of glob patterns to ignore, merged with contents of watchDirectory + '/.foreverignore' file
      ignore_watch: ["[\\/\\\\]\\./", "**/public/**", "**/.tmp/**", "**/node_modules/**", "**/logs/**", "**/pids/**"],
      watch_options: {
  
      },
      max_memory_restart: "1G",
      log: "logs/pm2.log", // Path to log output from forever process (when daemonized)
      output: "logs/pm2-output.log",        // Path to log output from child stdout
      error: "logs/pm2-log.err",
      //   log_type: 'json',
      //   treekill: true,
      env: {
        PORT: 7200,
        NODE_ENV: "staging",
      }
    },
    ],
    deploy: {
  
    },
  };  