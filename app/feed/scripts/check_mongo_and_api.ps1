$out = @()
$svc = Get-Service -Name MongoDB -ErrorAction SilentlyContinue
if ($svc) {
  if ($svc.Status -ne 'Running') {
    try { Start-Service MongoDB -ErrorAction Stop; Start-Sleep -Seconds 1 } catch { $out += "START_SERVICE_ERROR: $($_.Exception.Message)" }
  }
  $svc = Get-Service -Name MongoDB -ErrorAction SilentlyContinue
  $out += "SERVICE_STATUS: $($svc.Status)"
} else {
  $out += "SERVICE_MISSING"
  $cmd = Get-Command mongod -ErrorAction SilentlyContinue
  if ($cmd) {
    $out += "MONGOD_FOUND: $($cmd.Path)"
  } else {
    $out += "MONGOD_NOT_FOUND"
  }
}
try {
  $r = Invoke-WebRequest 'http://localhost:3000' -UseBasicParsing -ErrorAction Stop
  $out += "ROOT_STATUS: $($r.StatusCode)"
} catch {
  $out += "ROOT_ERROR: $($_.Exception.Message)"
}
try {
  $api = Invoke-RestMethod 'http://localhost:3000/api/communities' -ErrorAction Stop
  $out += "API_OK"
  $out += ($api | ConvertTo-Json -Depth 3)
} catch {
  $out += "API_ERROR: $($_.Exception.Message)"
}
try {
  $f = Invoke-WebRequest 'http://localhost:3000/feed' -UseBasicParsing -ErrorAction Stop
  $out += "FEED_STATUS: $($f.StatusCode)"
} catch {
  $out += "FEED_ERROR: $($_.Exception.Message)"
}
$out -join "`n"
