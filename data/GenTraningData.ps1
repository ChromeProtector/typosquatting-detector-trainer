param (
    $protectedDomains,
    $otherDomains,
    $typogeneratorPath,
    $outFile
)

Push-Location
Set-Location $typogeneratorPath

$i = 0 
foreach ($protectedDomain in $protectedDomains)
{ 
    $i += 1
    $lines = [System.Collections.ArrayList]@()


    foreach ($otherDomain in $otherDomains)
    { 
        $null = $lines.Add("['" + $otherDomain + "',0]")
    }

    $cmd = 'go run .\cmd\typogen\main.go -s "$protectedDomain"'
    $out = Invoke-Expression -Command "$cmd"
    
    $null = $lines.Add("['" + $protectedDomain + "',2]")

    $i = 0
    foreach ($line in $out)
    {     
        if ($i -ne 0)
        {        
            $parts = $line.Split(",")
            $domain = $parts[3].Trim("""")

            if ($domain -ne $protectedDomain)
            {
                $null = $lines.Add("['" + $domain + "',1]")
            }
        }
        $i += 1
    }
    ("[" + [string]::Join(",", $lines.ToArray()) + "]") | Out-File -FilePath $($outFile + "_$i") -Encoding ascii
    Write-Host $lines.Count
}

Pop-Location