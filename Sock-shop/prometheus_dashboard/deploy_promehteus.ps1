Write-Host "For Prometheus dashboard, we are going to create a separate namespace for monitoring stack" -ForegroundColor Red -BackgroundColor White
kubectl create namespace monitoring

Write-Host "Creating cluster role & RBAC authorization" -ForegroundColor Red -BackgroundColor White
kubectl create -f clusterRole.yaml

Write-Host "Creating config map to externalize Promn config" -ForegroundColor Red -BackgroundColor White
kubectl create -f config-map.yaml

Write-Host "Deploying ..." -ForegroundColor Red -BackgroundColor White
kubectl create -f prometheus-deployment.yaml

$pod_name = kubectl get pods -n monitoring -o name

Start-Sleep -Seconds 5
Write-Host "Starting Dashboard on port 8080" -ForegroundColor Red  -BackgroundColor White 
kubectl port-forward $pod_name 8080:9090 -n monitoring
