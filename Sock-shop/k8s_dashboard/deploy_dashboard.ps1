#Step I 
#Deploy dashboard from the recommended github account 
kubectl apply -f https://raw.githubusercontent.com/kubernetes/dashboard/v2.2.0/aio/deploy/recommended.yaml
Write-Host "You need to execute deploy_admin to deploy admin user and bind the role to the cluster" -ForegroundColor Cyan -BackgroundColor Black
