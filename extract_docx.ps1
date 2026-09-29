param([string]$Path)
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::OpenRead($Path)
$entry = $zip.GetEntry("word/document.xml")
if ($entry) {
    $reader = New-Object System.IO.StreamReader($entry.Open())
    $xml = $reader.ReadToEnd()
    $reader.Close()
    $text = $xml -replace '<[^>]*>', ' '
    $text = $text -replace '\s+', ' '
    Write-Output $text
} else {
    Write-Output "document.xml not found"
}
$zip.Dispose()
