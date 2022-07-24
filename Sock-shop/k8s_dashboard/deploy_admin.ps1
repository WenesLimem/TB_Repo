Write-Host  "Searching for token ..." -ForegroundColor red -BackgroundColor white
$encoded_token = $(kubectl get secret -n kubernetes-dashboard $(kubectl get serviceaccount admin-user -n kubernetes-dashboard -o jsonpath="{.secrets[0].name}") -o jsonpath="{.data.token}")
if ($encoded_token)
{
    Write-Host "Decoding token"-ForegroundColor red -BackgroundColor white
    $token = [System.Text.Encoding]::ASCII.GetString([System.Convert]::FromBase64String($encoded_token))
    Write-Host "Here is the decoded token "  -ForegroundColor red -BackgroundColor white
    Write-Host $token -ForegroundColor yellow -BackgroundColor Red
    Write-Host "Follow the next uri and paste the token where you need."
    Write-Host "http://localhost:8001/api/v1/namespaces/kubernetes-dashboard/services/https:kubernetes-dashboard:/proxy/#/login" -ForegroundColor DarkCyan -BackgroundColor Cyan
    Write-Host "Starting proxy ..."
    kubectl proxy 
}else {
    Write-Host "Could not find token" -ForegroundColor red -BackgroundColor white
}