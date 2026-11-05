$baseUrl = "http://localhost:3000/api/v1"

Write-Host "`nTesting Health API..." -ForegroundColor Cyan

try {
    $response = Invoke-RestMethod `
        -Uri "http://localhost:3000/api/health" `
        -Method GET

    $response | ConvertTo-Json -Depth 10
}
catch {
    Write-Host "Health API Failed: $($_.Exception.Message)" -ForegroundColor Red
}