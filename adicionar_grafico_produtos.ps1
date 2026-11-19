$folderPath = "c:\Users\eli\Downloads\planilhas_aula23-04-26"
$consolidadoPath = "$folderPath\Dashboard_Consolidado.xlsx"

Write-Host "Abrindo o Excel..."
$excel = New-Object -ComObject Excel.Application
$excel.Visible = $false
$excel.DisplayAlerts = $false

try {
    $masterWb = $excel.Workbooks.Open($consolidadoPath)
    $masterWs = $masterWb.Worksheets.Item("Dados Consolidados")
    $pivotWs = $masterWb.Worksheets.Item("Dashboard")

    # Encontrar a última linha dos dados consolidados
    $lastRow = $masterWs.Cells.Item($masterWs.Rows.Count, 1).End(-4162).Row
    $sourceDataString = "'Dados Consolidados'!R1C1:R$($lastRow)C7"

    Write-Host "Criando Nova Tabela Dinâmica..."
    # Criar novo PivotCache
    $pivotCache = $masterWb.PivotCaches().Create(1, $sourceDataString) # xlDatabase = 1

    # Inserir Tabela Dinâmica na linha 25 (abaixo da tabela anterior)
    $pivotTable2 = $pivotCache.CreatePivotTable($pivotWs.Cells.Item(25, 1), "PivotProdutos")

    # Adicionar ID_Produto nas linhas
    $pivotFieldProduto = $pivotTable2.PivotFields("ID_Produto")
    $pivotFieldProduto.Orientation = 1 # xlRowField

    # Adicionar Qtd nos valores
    $pivotFieldQtd = $pivotTable2.PivotFields("Qtd")
    $pivotFieldQtd.Orientation = 4 # xlDataField
    $pivotFieldQtd.Function = -4157 # xlSum
    $pivotFieldQtd.Name = "Soma de Qtd"

    # Ordenar por mais vendidos (Decrescente)
    $pivotFieldProduto.AutoSort(2, "Soma de Qtd") # xlDescending = 2

    Write-Host "Criando Gráfico de Produtos Mais Vendidos..."
    # Criar gráfico (xlColumnClustered = 51 ou xlBarClustered = 57)
    $chartObj = $pivotWs.Shapes.AddChart(51)
    $chart = $chartObj.Chart
    $chart.SetSourceData($pivotTable2.TableRange1)
    $chart.HasTitle = $true
    $chart.ChartTitle.Text = "Produtos Mais Vendidos (Por Quantidade)"

    # Ajustar posição do gráfico
    $chartObj.Top = $pivotWs.Cells.Item(25, 4).Top
    $chartObj.Left = $pivotWs.Cells.Item(25, 4).Left
    $chartObj.Width = 400
    $chartObj.Height = 250

    $masterWb.Save()
    $masterWb.Close($false)
    Write-Host "Gráfico adicionado com sucesso!"

} catch {
    Write-Host "Erro: $_"
    if ($masterWb) { $masterWb.Close($false) }
} finally {
    $excel.Quit()
    [System.Runtime.Interopservices.Marshal]::ReleaseComObject($excel) | Out-Null
}
