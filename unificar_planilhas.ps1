$folderPath = "c:\Users\eli\Downloads\planilhas_aula23-04-26"
$consolidadoPath = "$folderPath\Dashboard_Consolidado.xlsx"

if (Test-Path $consolidadoPath) {
    Remove-Item $consolidadoPath -Force
}

Write-Host "Iniciando o Excel..."
$excel = New-Object -ComObject Excel.Application
$excel.Visible = $false
$excel.DisplayAlerts = $false

# Criar arquivo consolidado
$masterWb = $excel.Workbooks.Add()
$masterWs = $masterWb.Worksheets.Item(1)
$masterWs.Name = "Dados Consolidados"

# Escrever cabeçalhos
$masterWs.Cells.Item(1, 1).Value2 = "ID_Venda"
$masterWs.Cells.Item(1, 2).Value2 = "Data"
$masterWs.Cells.Item(1, 3).Value2 = "ID_Produto"
$masterWs.Cells.Item(1, 4).Value2 = "Qtd"
$masterWs.Cells.Item(1, 5).Value2 = "Valor_Unitario"
$masterWs.Cells.Item(1, 6).Value2 = "Canal_Venda"
$masterWs.Cells.Item(1, 7).Value2 = "Receita_Total"

$masterRow = 2

# Obter arquivos (Planilha *.xlsx)
$files = Get-ChildItem -Path $folderPath -Filter "*.xlsx" | Where-Object { $_.Name -ne "Dashboard_Consolidado.xlsx" }

Write-Host "Iniciando a unificação de $($files.Count) planilhas..."

foreach ($file in $files) {
    try {
        $sourceWb = $excel.Workbooks.Open($file.FullName)
        $sourceWs = $sourceWb.Worksheets.Item(1)
        
        # Encontrar a última linha
        # xlUp = -4162
        $lastSourceRow = $sourceWs.Cells.Item($sourceWs.Rows.Count, 1).End(-4162).Row
        
        if ($lastSourceRow -ge 2) {
            # Copiar dados (da linha 2 até a última linha, colunas 1 a 6)
            $rangeSource = $sourceWs.Range($sourceWs.Cells.Item(2, 1), $sourceWs.Cells.Item($lastSourceRow, 6))
            $rangeDest = $masterWs.Cells.Item($masterRow, 1)
            
            $rangeSource.Copy() | Out-Null
            $masterWs.Paste($rangeDest) | Out-Null
            
            $linhasCopiadas = $lastSourceRow - 1
            $masterRow += $linhasCopiadas
        }
        
        $sourceWb.Close($false)
        Write-Host "  - $($file.Name) copiada."
    } catch {
        Write-Host "  - Erro ao processar $($file.Name): $_"
    }
}

# Calcular Receita Total (Coluna G = Coluna D * Coluna E)
if ($masterRow -gt 2) {
    $rangeFormulas = $masterWs.Range($masterWs.Cells.Item(2, 7), $masterWs.Cells.Item($masterRow - 1, 7))
    $rangeFormulas.Formula = "=D2*E2"
}

Write-Host "Criando o Dashboard..."

# Criar a Tabela Dinâmica e o Gráfico
# xlDatabase = 1
$sourceDataString = "'Dados Consolidados'!R1C1:R$($masterRow - 1)C7"
$pivotWs = $masterWb.Worksheets.Add()
$pivotWs.Name = "Dashboard"
$pivotCache = $masterWb.PivotCaches().Create(1, $sourceDataString) # xlDatabase, range string
$pivotTable = $pivotCache.CreatePivotTable($pivotWs.Cells.Item(3, 1), "PivotResumo")

# Adicionar Canal_Venda nas linhas
$pivotFieldCanal = $pivotTable.PivotFields("Canal_Venda")
$pivotFieldCanal.Orientation = 1 # xlRowField

# Adicionar Receita_Total nos valores
$pivotFieldReceita = $pivotTable.PivotFields("Receita_Total")
$pivotFieldReceita.Orientation = 4 # xlDataField
$pivotFieldReceita.Function = -4157 # xlSum
$pivotFieldReceita.NumberFormat = "R$ #,##0.00"

# Criar gráfico (xlColumnClustered = 51)
$chartObj = $pivotWs.Shapes.AddChart(51)
$chart = $chartObj.Chart
$chart.SetSourceData($pivotTable.TableRange1)
$chart.HasTitle = $true
$chart.ChartTitle.Text = "Receita Total por Canal de Venda"

# Ajustar tamanho do gráfico
$chartObj.Top = $pivotWs.Cells.Item(3, 4).Top
$chartObj.Left = $pivotWs.Cells.Item(3, 4).Left
$chartObj.Width = 400
$chartObj.Height = 250

$masterWb.SaveAs($consolidadoPath, 51)
$masterWb.Close($true)

$excel.Quit()
[System.Runtime.Interopservices.Marshal]::ReleaseComObject($excel) | Out-Null

Write-Host "Unificação e criação do Dashboard concluídas!"
