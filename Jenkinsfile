pipeline {
    agent any

    stages {

        stage('Build') {
            steps {
                echo 'Build Started'
            }
        }

        stage('Test') {
            steps {
                echo 'Running Tests by bharat'
            }
        }

        stage('Deploy') {
            steps {
                echo 'Deployment Complete'
            }
        }
        stage('Check Docker'){
            steps{
                bat 'docker --version'
            }
        }
        stage('push'){
            steps{
                withCredentials([
                    usernamePassword(
                        credentialsId:'docker-creds',
                        usernameVariable:'USER',
                        passwordVariable:'PASS'
                    )
                ]){
                    bat ''' 
                    echo %PASS% | docker login -u %USER% --password-stdin
                    docker build --progress=plain -t test ./backend
                    docker build -t %USER%/vibespace:latest ./backend
                    docker push %USER%/vibespace:latest

                    '''
                }
            }
        }

    }
}