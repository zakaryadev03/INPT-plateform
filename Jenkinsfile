pipeline {
    agent any
    tools {
        nodejs "NODE_18"
    }


    environment {
        registryCredential = 'ecr:us-east-1:awscreds'
        appRegistry = "951401132355.dkr.ecr.us-east-1.amazonaws.com/inptappimg"
        inptRegistry = "https://951401132355.dkr.ecr.us-east-1.amazonaws.com"
        cluster = "inpt"
        service = "inptappsvc"
    }
    stages {
   
        stage('Fetch code') {
            steps {
               git branch: 'master', url: 'https://github.com/zakaryadev03/INPT-plateform.git'
            }

        }


        stage('Build'){
            steps{
               sh 'npm run build'
            }

            post {
               success {
                  echo 'Now Archiving it...'
                  archiveArtifacts artifacts: 'frontend/dist/**'
               }
            }
        }

        stage("Sonar Code Analysis") {
    		environment {
        		scannerHome = tool 'sonar6.2'
    		}
    		steps {
        		withSonarQubeEnv('sonarserver') {
            		sh '''${scannerHome}/bin/sonar-scanner \
                		-Dsonar.projectKey=inpt-plateform \
                		-Dsonar.projectName=inpt-plateform \
                		-Dsonar.projectVersion=1.0 \
                		-Dsonar.sources=src/ \
                		-Dsonar.language=js \
                		-Dsonar.exclusions=node_modules/**,infra/** \
                		-Dsonar.sourceEncoding=UTF-8'''
        		}
    		}
		}

        stage("Quality Gate") {
            steps {
              timeout(time: 1, unit: 'HOURS') {
                waitForQualityGate abortPipeline: true
              }
            }
          }

        stage('Build App Image') {
          steps {
       
            script {
                dockerImage = docker.build( appRegistry + ":$BUILD_NUMBER", "./")
                }
          }
    
        }

        stage('Upload App Image') {
          steps{
            script {
              docker.withRegistry( inptRegistry, registryCredential ) {
                dockerImage.push("$BUILD_NUMBER")
                dockerImage.push('latest')
              }
            }
          }
        }

        stage('Remove Container Images'){
            steps{
                sh 'docker rmi -f $(docker images -a -q)'
            }
        }

  }
}
