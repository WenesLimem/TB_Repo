

if ($args.Length -gt 0)
{
Write-Host "Checking on Linkerd status ..."
linkerd check
$ns = $args[0]
$p = $args[1]
Write-Host "Injecting Linkerd to sock-shop namespace"
kubectl get -n $ns deploy -o yaml | linkerd inject - | kubectl apply -f -

Write-Host "Checking on Linkerd injection status ..."
linkerd -n sock-shop check --proxy 

Write-Host "Installing viz extentsion and launching dashboard ..."
linkerd viz install | kubectl apply -f -
linkerd viz dashboard --port $p
}else {

    Write-Host "Please provide the namespace you want to mesh and the port for the dashboard as follows :" -ForegroundColor red -BackgroundColor white
Write-Host "inject_linkerd.ps1 <namespace> <port_number> " -ForegroundColor red

}