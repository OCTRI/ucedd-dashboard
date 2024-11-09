#!groovy
pipeline {
  agent any
  options {
    quietPeriod(30)
    buildDiscarder(logRotator(numToKeepStr: '3'))
  }
  environment {
    DEFAULT_BRANCH = 'main'
    DEPLOYMENT_FILE = 'k8s/dev/'
  }
  tools {
    nodejs 'Node 22 LTS'
  }
  triggers {
    // Needed to trigger builds via webhook
    pollSCM('')
  }
  stages {
    stage('Prepare') {
      steps {
        deleteDir()
        checkout scm
      }
    }
    stage('Build') {
      steps {
        sh '''
        npm install
        npm run build
        '''
      }
    }
    stage('Deploy to octridev') {
      when {
        branch env.DEFAULT_BRANCH
      }
      steps {
        applyKubernetesManifests(env.DEPLOYMENT_FILE)

        sh '''
        POD_ID=`kubectl get pods --no-headers -l app=ucedd-dev -o custom-columns=":metadata.name" | head -1`
        kubectl cp ucedd-dashboard $POD_ID:/workdir/webroot -c apache-sidecar

        # restart in case of ConfigMap changes
        kubectl rollout restart deploy/ucedd-dev
        '''
      }
    }
  }
  post {
    unsuccessful {
      emailStatusChange()
    }
    fixed {
      emailStatusChange()
    }
  }
}