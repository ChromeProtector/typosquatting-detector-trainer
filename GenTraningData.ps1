param (
    $protectedDomains,
    $otherDomains,
    $typogeneratorPath,
    $outFile
)

$lines = [System.Collections.ArrayList]@()

Push-Location

Set-Location $typogeneratorPath

foreach ($otherDomain in $otherDomains)
{ 
    $null = $lines.Add("['" + $otherDomain + "',0]")
}

foreach ($protectedDomain in $protectedDomains)
{ 
    $cmd = 'go run .\cmd\typogen\main.go -s "$protectedDomain"'
    $out = Invoke-Expression -Command "$cmd"
    
    $null = $lines.Add("['" + $protectedDomain + "',0]")

    $i = 0
    foreach ($line in $out)
    {     
        if ($i -ne 0)
        {        
            $parts = $line.Split(",")
            $null = $lines.Add("['" + $parts[3].Trim("""") + "',1]")
        }
        $i += 1
    }
}
("[" + [string]::Join(",", $lines.ToArray()) + "]") | Out-File -FilePath $outFile -Encoding ascii

Pop-Location

Write-Host $lines.Count