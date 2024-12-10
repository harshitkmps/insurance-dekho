if forever list | grep -v "grep" | grep "campaign_ manager"
then
    forever stop "campaign_ manager"
    echo 'stopped'
fi
forever --minUptime 5000 --uid "campaign_ manager" -a start server.js

