# Create directories for the navbar structure

# Main category directories
$dirs = @(
    "src\app\best-selling",
    "src\app\best-buy",
    "src\app\perfumes",
    "src\app\perfumes\value-for-money",
    "src\app\perfumes\premium",
    "src\app\perfumes\luxury",
    "src\app\perfumes\combo",
    "src\app\aesthetic-attars",
    "src\app\aesthetic-attars\premium",
    "src\app\aesthetic-attars\luxury",
    "src\app\aesthetic-attars\combo",
    "src\app\air-fresheners",
    "src\app\air-fresheners\room",
    "src\app\air-fresheners\car",
    "src\app\waxfume"
)

# Create each directory
foreach ($dir in $dirs) {
    if (-not (Test-Path $dir)) {
        Write-Host "Creating directory: $dir"
        New-Item -Path $dir -ItemType Directory -Force | Out-Null
    } else {
        Write-Host "Directory already exists: $dir"
    }
}

Write-Host "All directories created successfully!" 