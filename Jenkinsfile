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
                    docker login -u $USER -p $PASS
                    docker build -t $USER/vibespace:latest .
                    docker push $USER/vibespace:latest

                    '''
                }
            }
        }

    }
}