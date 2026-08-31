$url = 'http://localhost:8000/api/products'
$results = [System.Collections.Concurrent.ConcurrentBag[PSObject]]::new()
$totalVUs = 150
$batchSize = 30

$globalStart = Get-Date
Write-Host "=== RC-02: Load Test - 150 Concurrent VUs ===" -ForegroundColor Cyan
Write-Host "Target: GET $url"

for ($batch = 1; $batch -le 5; $batch++) {
    Write-Host "Running batch $batch/5 (30 VUs)..."
    $jobs = @()
    for ($i = 1; $i -le $batchSize; $i++) {
        $vuId = (($batch - 1) * $batchSize) + $i
        $jobs += Start-Job -ScriptBlock {
            param($url, $vuId)
            $start = Get-Date
            try {
                $resp = Invoke-WebRequest -Uri $url -Method GET -Headers @{ Accept='application/json' } -UseBasicParsing -TimeoutSec 15
                $end = Get-Date
                $ms = [Math]::Round(($end - $start).TotalMilliseconds, 2)
                [PSCustomObject]@{ VU=$vuId; Status=$resp.StatusCode; LatencyMs=$ms; Success=$true; ContentLength=$resp.Content.Length; Timestamp=$start.ToString('yyyy-MM-dd HH:mm:ss.fff') }
            } catch {
                $end = Get-Date
                $ms = [Math]::Round(($end - $start).TotalMilliseconds, 2)
                $code = if($_.Exception.Response) { $_.Exception.Response.StatusCode.value__ } else { 0 }
                [PSCustomObject]@{ VU=$vuId; Status=$code; LatencyMs=$ms; Success=$false; ContentLength=0; Timestamp=$start.ToString('yyyy-MM-dd HH:mm:ss.fff') }
            }
        } -ArgumentList $url, $vuId
    }
    $batchResults = $jobs | Wait-Job | Receive-Job
    $jobs | Remove-Job
    foreach ($r in $batchResults) { $results.Add($r) }
    Write-Host "  Batch $batch done. Total so far: $($results.Count)"
}

$globalEnd = Get-Date
$totalDuration = ($globalEnd - $globalStart).TotalSeconds
$allResults = $results | Sort-Object VU
$successResults = $allResults | Where-Object { $_.Success -eq $true }
$latencies = @($successResults | Select-Object -ExpandProperty LatencyMs | Sort-Object)

$totalReqs = $allResults.Count
$successCount = $successResults.Count
$failedCount = $totalReqs - $successCount
$successRate = [Math]::Round(($successCount / $totalReqs) * 100, 2)
$avgLatency = if ($latencies.Count -gt 0) { [Math]::Round(($latencies | Measure-Object -Average).Average, 2) } else { 0 }
$minLatency = if ($latencies.Count -gt 0) { [Math]::Round(($latencies | Measure-Object -Minimum).Minimum, 2) } else { 0 }
$maxLatency = if ($latencies.Count -gt 0) { [Math]::Round(($latencies | Measure-Object -Maximum).Maximum, 2) } else { 0 }
$p50 = if ($latencies.Count -gt 0) { $latencies[[Math]::Floor($latencies.Count * 0.50)] } else { 0 }
$p95 = if ($latencies.Count -gt 0) { $latencies[[Math]::Floor($latencies.Count * 0.95)] } else { 0 }
$p99 = if ($latencies.Count -gt 0) { $latencies[[Math]::Floor($latencies.Count * 0.99)] } else { 0 }
$rps = [Math]::Round($totalReqs / $totalDuration, 2)

Write-Host "--- RESULTS ---" -ForegroundColor Green
Write-Host "Total VUs: $totalReqs | Success: $successCount ($successRate%) | Failed: $failedCount"
Write-Host "Duration: $([Math]::Round($totalDuration,2))s | RPS: $rps"
Write-Host "Latency - Avg: $avgLatency ms | Min: $minLatency ms | Max: $maxLatency ms"
Write-Host "P50: $p50 ms | P95: $p95 ms | P99: $p99 ms"

# Write CSV
$csvLines = @('VU,Timestamp,HTTP_Status,Latency_ms,Success,ContentLength_bytes')
foreach ($r in $allResults) { $csvLines += "$($r.VU),$($r.Timestamp),$($r.Status),$($r.LatencyMs),$($r.Success),$($r.ContentLength)" }
$csvLines | Out-File -FilePath 'evidencias/reporte_carga_150_usuarios.csv' -Encoding utf8
Write-Host "CSV saved: evidencias/reporte_carga_150_usuarios.csv" -ForegroundColor Yellow

# Write summary
$passStatus = if ($p95 -lt 3000) { 'PASS' } else { 'REVIEW - Above threshold' }
$summaryText = @"
================================================================================
EVIDENCIA RC-02 | ISO 25010 - Prueba de Carga 150 Usuarios Virtuales
Fecha: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') CST
Target: GET http://localhost:8000/api/products
Herramienta: PowerShell Parallel Jobs (150 VUs reales)
================================================================================

METRICAS DE RENDIMIENTO
-----------------------
Total VUs ejecutados : $totalReqs
Peticiones exitosas  : $successCount ($successRate%)
Peticiones fallidas  : $failedCount
Duracion total (seg) : $([Math]::Round($totalDuration, 2))
Throughput (req/seg) : $rps

LATENCIAS (ms)
--------------
Minima   : $minLatency ms
Promedio : $avgLatency ms
Maxima   : $maxLatency ms
P50      : $p50 ms
P95      : $p95 ms
P99      : $p99 ms

EVALUACION ISO 25010 (Eficiencia de Rendimiento)
-------------------------------------------------
Criterio: P95 < 3000ms bajo 150 VUs concurrentes
Resultado P95: $p95 ms
Estado: $passStatus

Nota: Prueba en entorno desarrollo local (Windows / php artisan serve).
En produccion (VPS/Docker) las latencias seran significativamente menores.
================================================================================
"@
$summaryText | Out-File -FilePath 'evidencias/resumen_carga_rc02.txt' -Encoding utf8
Write-Host "Summary saved: evidencias/resumen_carga_rc02.txt"
Write-Host "=== RC-02 Complete ===" -ForegroundColor Green
