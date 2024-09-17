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
  triggers {
    // Needed to trigger builds from Bitbucket
    pollSCM('')
  }
  stages {
    stage('Prepare') {
      steps {
        deleteDir()
        checkout scm
      }
    }
    stage('Deploy to octridev') {
      when {
        branch env.DEFAULT_BRANCH
      }
      steps {
        applyKubernetesManifests(env.DEPLOYMENT_FILE)

        // TODO: Copying build tool output to the container would be safer
        sh '''
        mkdir ucedd-dashboard
        cp *.html ucedd-dashboard
        cp *.css ucedd-dashboard
        cp *.js ucedd-dashboard
        cp data.csv ucedd-dashboard
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