try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -ErrorAction Stop
    Write-Host "Server is responding with status code: $($response.StatusCode)"
} catch {
    Write-Host "Error: $_"
} 