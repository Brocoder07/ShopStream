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
                    // Ensure the full image name includes the registry for clarity in the sh step
                    def fullImageNameWithRegistry = "docker.io/${imageName}" 

                    // Build the image first (this part seems to be working)
                    docker.build(imageName, "--build-arg NEXT_PUBLIC_API_URL_ARG=${env.NEXT_PUBLIC_API_URL_BUILD_ARG} -f ${dockerfilePath} .")

                    // Explicit login and push
                    withCredentials([usernamePassword(credentialsId: env.DOCKER_CREDENTIALS_ID, usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                        sh "echo 'Attempting to login to Docker Hub...'"
                        sh "echo \"${DOCKER_PASS}\" | docker login -u \"${DOCKER_USER}\" --password-stdin docker.io"
                        echo "Attempting to push image: ${fullImageNameWithRegistry}"
                        sh "docker push ${fullImageNameWithRegistry}"
                    }
                }
            }
        }

        stage('Build & Push Backend Image') {
            steps {
                script {
                    def dockerfilePath = 'scripts/docker/backend.Dockerfile'
                    def imageName = "${env.BACKEND_IMAGE_NAME}:${env.BUILD_NUMBER}"
                    def fullImageNameWithRegistry = "docker.io/${imageName}"

                    docker.build(imageName, "-f ${dockerfilePath} .")

                    withCredentials([usernamePassword(credentialsId: env.DOCKER_CREDENTIALS_ID, usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                        sh "echo 'Attempting to login to Docker Hub...'"
                        sh "echo \"${DOCKER_PASS}\" | docker login -u \"${DOCKER_USER}\" --password-stdin docker.io"
                        echo "Attempting to push image: ${fullImageNameWithRegistry}"
                        sh "docker push ${fullImageNameWithRegistry}"
                    }
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                withKubeConfig([credentialsId: 'minikube-config']) {
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
                                  --from-literal=SPRING_DATASOURCE_PASSWORD="${SPRING_DATASOURCE_PASSWORD}" \
                                  --from-literal=POSTGRES_PASSWORD="${POSTGRES_PASSWORD}" \
                                  --from-literal=JWT_SECRET="${JWT_SECRET}" \
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