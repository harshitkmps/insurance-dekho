if forever list | grep -v "grep" | grep "commonwidgets"
then
    forever stop "commonwidgets"
    echo 'stopped'
fi
forever --minUptime 5000 --uid "commonwidgets" -a start -c node server.js
