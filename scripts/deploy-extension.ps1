<#
Ouroboros Alpha Deployment Script
Builds and packages the Chrome extension for production
#>

$ErrorActionPreference = "Stop"

# 1. Clean previous builds
Write-Host "Cleaning previous builds..." -ForegroundColor Cyan
Remove-Item -Path "./dist" -Recurse -ErrorAction SilentlyContinue
Remove-Item -Path "*.zip" -ErrorAction SilentlyContinue

# 2. Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Cyan
yarn install --frozen-lockfile
if ($LASTEXITCODE -ne 0) {
    throw "Dependency installation failed"
}

# 3. Run production build
Write-Host "Building extension..." -ForegroundColor Cyan
yarn build
if ($LASTEXITCODE -ne 0) {
    throw "Build failed"
}

# 4. Package extension
$version = (Get-Content -Path "./manifest.json" | ConvertFrom-Json).version
$zipName = "ouroboros-alpha-v$version.zip"

Write-Host "Creating package: $zipName" -ForegroundColor Cyan
Compress-Archive -Path "./dist/*" -DestinationPath $zipName -CompressionLevel Optimal

# 5. Generate build info
$buildInfo = @{
    version = $version
    buildDate = Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ"
    commitHash = git rev-parse --short HEAD
} | ConvertTo-Json

$buildInfo | Out-File -FilePath "./dist/build-info.json" -Encoding utf8

Write-Host "âœ… Build successful!" -ForegroundColor Green
Write-Host "Package created: $zipName" -ForegroundColor Green
Write-Host "Upload to Chrome Web Store Developer Dashboard" -ForegroundColor Yellow
