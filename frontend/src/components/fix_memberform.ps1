$header = (Get-Content 'c:\xampp\htdocs\LTSDA2\frontend\src\components\MemberFormView.vue' -Encoding UTF8)[0..20]
$template = Get-Content 'c:\xampp\htdocs\LTSDA2\frontend\src\components\MemberFormView_template.tmp' -Encoding UTF8
$combined = @()
$combined += $header
$combined += ''
$combined += $template
[System.IO.File]::WriteAllLines('c:\xampp\htdocs\LTSDA2\frontend\src\components\MemberFormView.vue', $combined)
Write-Host "Done - MemberFormView.vue fixed"
