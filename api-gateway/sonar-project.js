const sonarqubeScanner = require('sonarqube-scanner');
sonarqubeScanner({
    serverUrl: '',
    options : {
        'sonar.host.url': '',
        'sonar.login': '',
        'sonar.projectName': 'Insurance - Master Microservice - Live',
        'sonar.sources': '.',
        'sonar.inclusions' : 'src/**' ,
        'sonar.exclusions' : 'node_modules/**,types/**,dist/**,downloads/**,uploads/**,.tmp/**,test/**'
    }
}, () => {});