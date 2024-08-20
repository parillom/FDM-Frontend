#!groovy
@Library('pipeline-library@master')_

def BUILD_INFO = Artifactory.newBuildInfo()
def PROJECT_NAME = 'vsc'

pipeline {
    agent {
        label 'linux-slaves'
    }

    options {
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr:'10'))
        ansiColor('xterm')
        timestamps()
        timeout(time: 30, unit: 'MINUTES')
    }

    tools {
        jdk 'jdk-21'
        maven 'maven-3'
        nodejs 'nodejs-21'
    }

    environment {
        MAVEN_OPTS = '-Xms512m -Xmx768m -Djava.awt.headless=true' //workaround for https://gitit.post.ch/projects/JENKINS/repos/jenkins-slave-selenium/browse/Dockerfile#15
        NODE_OPTIONS = '--max-old-space-size=4096'
    }

    stages {
        stage('Prepare') {
                    steps {
                        cleanWs()
                        checkout scm
                    }
                }

         stage('Build') {
            steps {
              sh 'npm install'
           }
        }
    }


    post {
        always {
            junit(testResults:'**/target/surefire-reports/TEST-*.xml', allowEmptyResults: true)
            junit(testResults:'**/target/surefire-reports/TESTS-*.xml', allowEmptyResults: true)
            sendBuildMail(projectName: PROJECT_NAME,
                    message: 'Hi, I have a suspicion you broke the build!',
                    toRequester: false, onRecovery: false)
            cleanWs()
        }
    }
}

