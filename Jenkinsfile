pipeline {
    agent any

    environment {
        DOCKER_HUB_USERNAME         = "akashrajeshnair"
        DOCKER_CREDENTIALS_ID       = "docker-creds"
        KUBECONFIG_CREDENTIALS_ID   = "minikube-config"
        MINIKUBE_IP                 = "192.168.49.2"
        FRONTEND_IMAGE_NAME         = "${DOCKER_HUB_USERNAME}/shopstream-frontend"
        BACKEND_IMAGE_NAME          = "${DOCKER_HUB_USERNAME}/shopstream-backend"
        K8S_NAMESPACE               = "shopstream"
        NEXT_PUBLIC_API_URL_BUILD_ARG = "http://${MINIKUBE_IP}:30002/api"

        // Jenkins Credential IDs for your Kubernetes secrets
        SPRING_DATASOURCE_PASSWORD = "spring-datasource-password"
        POSTGRES_PASSWORD = "postgres-password"
        JWT_SECRET = "jwt-secret"
        K8S_SECRET_NAME = "shopstream-secrets"
    }

    stages {

        stage('Build & Push Frontend Image') {
            steps {
                script {
                    def dockerfilePath = 'scripts/docker/frontend.Dockerfile'
                    def imageName = "${env.FRONTEND_IMAGE_NAME}:${env.BUILD_NUMBER}"
                    docker.withRegistry('https://docker.io', env.DOCKER_CREDENTIALS_ID) {
                        def customImage = docker.build(imageName, "--build-arg NEXT_PUBLIC_API_URL_ARG=${env.NEXT_PUBLIC_API_URL_BUILD_ARG} -f ${dockerfilePath} .")
                        customImage.push()
                    }
                }
            }
        }

        stage('Build & Push Backend Image') {
            steps {
                script {
                    def dockerfilePath = 'scripts/docker/backend.Dockerfile'
                    def imageName = "${env.BACKEND_IMAGE_NAME}:${env.BUILD_NUMBER}"
                    docker.withRegistry('https://docker.io', env.DOCKER_CREDENTIALS_ID) {
                        def customImage = docker.build(imageName, "-f ${dockerfilePath} .")
                        customImage.push()
                    }
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                withKubeconfig([credentialsId: env.KUBECONFIG_CREDENTIALS_ID]) {
                    // Access the secret text credentials
                    withCredentials([
                        string(credentialsId: env.SPRING_DATASOURCE_PASSWORD, variable: 'SPRING_DATASOURCE_PASSWORD'),
                        string(credentialsId: env.POSTGRES_PASSWORD, variable: 'POSTGRES_PASSWORD'),
                        string(credentialsId: env.JWT_SECRET, variable: 'JWT_SECRET')
                    ]) {
                        script {
                            sh "kubectl config current-context"

                            sh "kubectl apply -f scripts/k8s/namespace.yaml"
                            sh "kubectl apply -f scripts/k8s/configmap.yaml"

                            // Create or update the Kubernetes secret using Jenkins credentials
                            // This command is idempotent: it creates if not exists, updates if it does.
                            sh """
                                kubectl create secret generic ${env.K8S_SECRET_NAME} \
                                  --from-literal=SPRING_DATASOURCE_PASSWORD='${env.SPRING_DATASOURCE_PASSWORD}' \
                                  --from-literal=POSTGRES_PASSWORD='${env.POSTGRES_PASSWORD}' \
                                  --from-literal=JWT_SECRET='${env.JWT_SECRET}' \
                                  -n ${env.K8S_NAMESPACE} \
                                  --dry-run=client -o yaml | kubectl apply -f -
                            """

                            sh "kubectl apply -f scripts/k8s/postgres-pvc.yaml"
                            sh "kubectl apply -f scripts/k8s/services.yaml"
                            sh "kubectl apply -f scripts/k8s/postgres-deployment.yaml" // Ensure this deployment uses K8S_SECRET_NAME

                            def frontendFullImage = "${env.FRONTEND_IMAGE_NAME}:${env.BUILD_NUMBER}"
                            def backendFullImage = "${env.BACKEND_IMAGE_NAME}:${env.BUILD_NUMBER}"

                            sh "kubectl set image deployment/shopstream-frontend frontend=${frontendFullImage} -n ${env.K8S_NAMESPACE}"
                            sh "kubectl set image deployment/shopstream-backend backend=${backendFullImage} -n ${env.K8S_NAMESPACE}"

                            sh "kubectl rollout status deployment/shopstream-frontend -n ${env.K8S_NAMESPACE} --timeout=120s"
                            sh "kubectl rollout status deployment/shopstream-backend -n ${env.K8S_NAMESPACE} --timeout=120s"
                        }
                    }
                }
            }
        }
    }

    post {
        always {
            echo 'Pipeline finished.'
            // cleanWs()
        }
    }
}