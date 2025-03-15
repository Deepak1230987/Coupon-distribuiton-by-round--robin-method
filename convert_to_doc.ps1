# Check if pandoc is installed
$pandocExists = Get-Command pandoc -ErrorAction SilentlyContinue

if (-not $pandocExists) {
    Write-Host "Pandoc is not installed. Please install it first."
    Write-Host "You can install it from: https://pandoc.org/installing.html"
    exit 1
}

# Convert markdown to docx
pandoc Technical_Documentation.md -o Technical_Documentation.docx --toc --toc-depth=3 