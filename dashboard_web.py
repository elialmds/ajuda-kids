import os
import json
import webbrowser
import pandas as pd

directory = r"c:\Users\eli\Downloads\planilhas_aula23-04-26"
html_path = os.path.join(directory, "index_dashboard.html")

print("Processando dados para o Dashboard Enterprise...")
all_data = []
for file in os.listdir(directory):
    if file.startswith("Planilha") and file.endswith(".xlsx"):
        filepath = os.path.join(directory, file)
        try:
            df = pd.read_excel(filepath)
            if len(df.columns) == 1 and "," in df.columns[0]:
                col_name = df.columns[0]
                new_cols = col_name.split(",")
                df = df[col_name].str.split(",", expand=True)
                df.columns = new_cols
            all_data.append(df)
        except Exception as e:
            pass

df_completo = pd.concat(all_data, ignore_index=True)
df_completo["Qtd"] = pd.to_numeric(df_completo["Qtd"])
df_completo["Valor_Unitario"] = pd.to_numeric(df_completo["Valor_Unitario"])
df_completo["Receita_Total"] = df_completo["Qtd"] * df_completo["Valor_Unitario"]
df_completo["Data"] = pd.to_datetime(df_completo["Data"], errors='coerce')

# Cálculos KPIs
total_receita = df_completo["Receita_Total"].sum()
total_qtd = df_completo["Qtd"].sum()
top_produto = df_completo.groupby("ID_Produto")["Qtd"].sum().idxmax()
media_venda = df_completo["Receita_Total"].mean()

# Gráficos JSON
receita_canal = df_completo.groupby("Canal_Venda")["Receita_Total"].sum().sort_values(ascending=False)
labels_canal = json.dumps(receita_canal.index.tolist(), ensure_ascii=False)
data_canal = json.dumps(receita_canal.values.tolist())

produtos_venda = df_completo.groupby("ID_Produto")["Qtd"].sum().sort_values(ascending=False)
labels_produtos = json.dumps(produtos_venda.index.tolist(), ensure_ascii=False)
data_produtos = json.dumps(produtos_venda.values.tolist())

receita_tempo = df_completo.groupby(df_completo["Data"].dt.strftime('%Y-%m-%d'))["Receita_Total"].sum().sort_index()
labels_tempo = json.dumps(receita_tempo.index.tolist(), ensure_ascii=False)
data_tempo = json.dumps(receita_tempo.values.tolist())

# Tabela Top 10 Vendas (maior receita individual)
top_10_vendas = df_completo.sort_values(by="Receita_Total", ascending=False).head(10)
table_rows = ""
for index, row in top_10_vendas.iterrows():
    data_str = row['Data'].strftime('%d/%m/%Y') if pd.notnull(row['Data']) else "N/A"
    table_rows += f"""
    <tr>
        <td>#{row['ID_Venda']}</td>
        <td>{data_str}</td>
        <td>{row['ID_Produto']}</td>
        <td>{row['Canal_Venda']}</td>
        <td class="text-right">{row['Qtd']}</td>
        <td class="text-right text-accent">R$ {row['Receita_Total']:,.2f}</td>
    </tr>
    """

html_template = f"""
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Enterprise Analytics Dashboard</title>
    <!-- Fontes e Icones -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@600;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <!-- Dependências JS -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <!-- Script do CountUp.js via CDN (para a animação dos números) -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/countup.js/2.0.0/countUp.min.js"></script>

    <style>
        :root {{
            --bg-base: #0b0f19;
            --bg-sidebar: #111827;
            --glass-bg: rgba(30, 41, 59, 0.6);
            --glass-border: rgba(255, 255, 255, 0.08);
            --accent-blue: #3b82f6;
            --accent-cyan: #06b6d4;
            --accent-purple: #8b5cf6;
            --accent-green: #10b981;
            --text-main: #f8fafc;
            --text-muted: #94a3b8;
        }}

        body {{
            margin: 0;
            padding: 0;
            font-family: 'Inter', sans-serif;
            background-color: var(--bg-base);
            color: var(--text-main);
            display: flex;
            min-height: 100vh;
            overflow-x: hidden;
        }}

        /* Animação do Background Mesh Gradient */
        .bg-mesh {{
            position: fixed;
            top: 0; left: 0; width: 100vw; height: 100vh;
            background: radial-gradient(circle at 15% 50%, rgba(59, 130, 246, 0.08), transparent 25%),
                        radial-gradient(circle at 85% 30%, rgba(139, 92, 246, 0.08), transparent 25%);
            z-index: -1;
            animation: breathe 10s infinite alternate;
        }}

        @keyframes breathe {{
            from {{ transform: scale(1); }}
            to {{ transform: scale(1.05); }}
        }}

        /* Sidebar */
        .sidebar {{
            width: 260px;
            background-color: var(--bg-sidebar);
            border-right: 1px solid var(--glass-border);
            padding: 24px;
            display: flex;
            flex-direction: column;
            position: sticky;
            top: 0;
            height: 100vh;
        }}

        .brand {{
            font-family: 'Outfit', sans-serif;
            font-size: 1.5rem;
            font-weight: 800;
            color: #fff;
            margin-bottom: 40px;
            display: flex;
            align-items: center;
            gap: 10px;
            background: linear-gradient(135deg, var(--accent-cyan), var(--accent-blue));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }}

        .nav-item {{
            padding: 12px 16px;
            margin-bottom: 8px;
            border-radius: 8px;
            color: var(--text-muted);
            text-decoration: none;
            display: flex;
            align-items: center;
            gap: 12px;
            font-weight: 500;
            transition: all 0.2s;
        }}

        .nav-item:hover, .nav-item.active {{
            background: rgba(59, 130, 246, 0.1);
            color: var(--accent-blue);
        }}

        /* Main Content */
        .main-content {{
            flex: 1;
            padding: 32px 48px;
        }}

        header {{
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 40px;
            animation: fadeIn 0.8s ease;
        }}

        .header-title h1 {{
            font-family: 'Outfit', sans-serif;
            margin: 0;
            font-size: 2rem;
            color: #fff;
        }}

        .header-title p {{
            margin: 4px 0 0;
            color: var(--text-muted);
            font-size: 0.9rem;
        }}

        /* Filtros Simples */
        .filters {{
            display: flex;
            gap: 10px;
        }}

        .filter-btn {{
            background: var(--glass-bg);
            border: 1px solid var(--glass-border);
            color: var(--text-main);
            padding: 8px 16px;
            border-radius: 20px;
            cursor: pointer;
            font-size: 0.85rem;
            transition: all 0.2s;
        }}

        .filter-btn:hover, .filter-btn.active {{
            background: var(--accent-blue);
            border-color: var(--accent-blue);
        }}

        /* Grid de KPIs */
        .kpi-grid {{
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 24px;
            margin-bottom: 32px;
        }}

        .kpi-card {{
            background: var(--glass-bg);
            border: 1px solid var(--glass-border);
            border-radius: 16px;
            padding: 24px;
            backdrop-filter: blur(12px);
            animation: slideUp 0.6s ease forwards;
            opacity: 0;
            position: relative;
        }}

        .kpi-card:hover {{
            border-color: rgba(255,255,255,0.2);
            transform: translateY(-2px);
            transition: all 0.3s;
        }}

        .kpi-header {{
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
        }}

        .kpi-title {{
            color: var(--text-muted);
            font-size: 0.9rem;
            font-weight: 500;
        }}

        /* Ícone Didático Tooltip */
        .tooltip-icon {{
            color: var(--text-muted);
            cursor: help;
            font-size: 0.85rem;
            position: relative;
        }}

        .tooltip-icon::after {{
            content: attr(data-tooltip);
            position: absolute;
            bottom: 150%;
            right: -50px;
            background: #1e293b;
            color: #fff;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 0.75rem;
            width: 200px;
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.2s;
            pointer-events: none;
            z-index: 10;
            border: 1px solid var(--glass-border);
        }}

        .tooltip-icon:hover::after {{
            opacity: 1;
            visibility: visible;
        }}

        .kpi-value {{
            font-family: 'Outfit', sans-serif;
            font-size: 2rem;
            font-weight: 700;
            color: #fff;
            display: flex;
            align-items: baseline;
            gap: 4px;
        }}

        /* Charts Grid */
        .chart-grid {{
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 24px;
            margin-bottom: 32px;
        }}

        .chart-panel {{
            background: var(--glass-bg);
            border: 1px solid var(--glass-border);
            border-radius: 16px;
            padding: 24px;
            backdrop-filter: blur(12px);
            animation: slideUp 0.8s ease forwards;
            opacity: 0;
            min-height: 350px;
            display: flex;
            flex-direction: column;
        }}

        .panel-title {{
            font-size: 1.1rem;
            font-weight: 600;
            margin-bottom: 20px;
            color: #fff;
        }}

        .chart-container {{
            flex: 1;
            position: relative;
        }}

        /* Table Area */
        .table-panel {{
            background: var(--glass-bg);
            border: 1px solid var(--glass-border);
            border-radius: 16px;
            padding: 24px;
            animation: slideUp 1s ease forwards;
            opacity: 0;
        }}

        table {{
            width: 100%;
            border-collapse: collapse;
            margin-top: 16px;
        }}

        th {{
            text-align: left;
            padding: 16px;
            color: var(--text-muted);
            font-size: 0.85rem;
            font-weight: 600;
            border-bottom: 1px solid var(--glass-border);
        }}

        td {{
            padding: 16px;
            color: var(--text-main);
            font-size: 0.9rem;
            border-bottom: 1px solid rgba(255,255,255,0.02);
        }}

        tr:hover td {{
            background: rgba(255,255,255,0.03);
        }}

        .text-right {{ text-align: right; }}
        .text-accent {{ color: var(--accent-green); font-weight: 600; }}

        /* Utility Classes & Animations */
        .delay-1 {{ animation-delay: 0.1s; }}
        .delay-2 {{ animation-delay: 0.2s; }}
        .delay-3 {{ animation-delay: 0.3s; }}
        .delay-4 {{ animation-delay: 0.4s; }}

        @keyframes fadeIn {{
            from {{ opacity: 0; }}
            to {{ opacity: 1; }}
        }}

        @keyframes slideUp {{
            from {{ opacity: 0; transform: translateY(20px); }}
            to {{ opacity: 1; transform: translateY(0); }}
        }}

    </style>
</head>
<body>

<div class="bg-mesh"></div>

<aside class="sidebar">
    <div class="brand">
        <i class="fa-solid fa-chart-pie"></i> ApexAnalytics
    </div>
    <a href="#" class="nav-item active"><i class="fa-solid fa-border-all"></i> Visão Geral</a>
    <a href="#" class="nav-item"><i class="fa-solid fa-box-open"></i> Produtos</a>
    <a href="#" class="nav-item"><i class="fa-solid fa-store"></i> Canais</a>
    <a href="#" class="nav-item"><i class="fa-solid fa-gear"></i> Configurações</a>
</aside>

<main class="main-content">
    <header>
        <div class="header-title">
            <h1>Visão Geral de Vendas</h1>
            <p>Análise de métricas consolidadas • Atualizado Agora</p>
        </div>
        <div class="filters">
            <button class="filter-btn active" onclick="alert('Funcionalidade didática: Filtro por Todos ativado!')">Todos</button>
            <button class="filter-btn" onclick="alert('Funcionalidade didática: Filtro por Mês ativado!')">Mês Atual</button>
            <button class="filter-btn" onclick="alert('Funcionalidade didática: Filtro por Semana ativado!')">Últimos 7 dias</button>
        </div>
    </header>

    <div class="kpi-grid">
        <!-- KPI 1 -->
        <div class="kpi-card delay-1">
            <div class="kpi-header">
                <span class="kpi-title">Receita Total</span>
                <i class="fa-solid fa-circle-info tooltip-icon" data-tooltip="Soma total de todas as vendas (Quantidade × Valor Unitário)."></i>
            </div>
            <div class="kpi-value"><span style="font-size: 1.2rem; color:var(--text-muted)">R$</span><span id="kpi-receita">0</span></div>
        </div>

        <!-- KPI 2 -->
        <div class="kpi-card delay-2">
            <div class="kpi-header">
                <span class="kpi-title">Total Vendido</span>
                <i class="fa-solid fa-circle-info tooltip-icon" data-tooltip="Unidades totais vendidas em todo o período analisado."></i>
            </div>
            <div class="kpi-value"><span id="kpi-qtd">0</span></div>
        </div>

        <!-- KPI 3 -->
        <div class="kpi-card delay-3">
            <div class="kpi-header">
                <span class="kpi-title">Média por Venda</span>
                <i class="fa-solid fa-circle-info tooltip-icon" data-tooltip="Receita média obtida por cada transação individual registrada."></i>
            </div>
            <div class="kpi-value"><span style="font-size: 1.2rem; color:var(--text-muted)">R$</span><span id="kpi-media">0</span></div>
        </div>

        <!-- KPI 4 -->
        <div class="kpi-card delay-4">
            <div class="kpi-header">
                <span class="kpi-title">Produto Líder</span>
                <i class="fa-solid fa-circle-info tooltip-icon" data-tooltip="Produto que atingiu o maior número de unidades vendidas."></i>
            </div>
            <div class="kpi-value" style="color: var(--accent-blue);">{top_produto}</div>
        </div>
    </div>

    <div class="chart-grid">
        <div class="chart-panel delay-2">
            <div class="panel-title">
                Evolução da Receita <i class="fa-solid fa-circle-info tooltip-icon" style="margin-left:8px; font-size:14px" data-tooltip="Acompanhamento diário da entrada de receita. Picos mostram dias com vendas volumosas."></i>
            </div>
            <div class="chart-container">
                <canvas id="timelineChart"></canvas>
            </div>
        </div>

        <div class="chart-panel delay-3">
            <div class="panel-title">
                Distribuição por Canal <i class="fa-solid fa-circle-info tooltip-icon" style="margin-left:8px; font-size:14px" data-tooltip="Comparativo de qual plataforma está gerando o maior faturamento."></i>
            </div>
            <div class="chart-container">
                <canvas id="canalChart"></canvas>
            </div>
        </div>
    </div>

    <div class="table-panel delay-4">
        <div class="panel-title">
            Top 10 Transações <i class="fa-solid fa-circle-info tooltip-icon" style="margin-left:8px; font-size:14px" data-tooltip="Detalhamento das transações individuais mais lucrativas registradas no sistema."></i>
        </div>
        <table>
            <thead>
                <tr>
                    <th>ID Venda</th>
                    <th>Data</th>
                    <th>Produto</th>
                    <th>Canal</th>
                    <th class="text-right">Qtd</th>
                    <th class="text-right">Receita Bruta</th>
                </tr>
            </thead>
            <tbody>
                {table_rows}
            </tbody>
        </table>
    </div>

</main>

<script>
    // 1. ANIMAÇÃO DE NÚMEROS (CountUp.js)
    window.onload = function() {{
        // Verifica se a biblioteca CountUp foi carregada pelo CDN
        if (typeof countUp !== 'undefined') {{
            new countUp.CountUp('kpi-receita', {total_receita}, {{ decimalPlaces: 2, separator: '.', decimal: ',' }}).start();
            new countUp.CountUp('kpi-qtd', {total_qtd}, {{ separator: '.' }}).start();
            new countUp.CountUp('kpi-media', {media_venda}, {{ decimalPlaces: 2, separator: '.', decimal: ',' }}).start();
        }} else {{
            // Fallback caso falte internet
            document.getElementById('kpi-receita').innerText = "{total_receita:,.2f}";
            document.getElementById('kpi-qtd').innerText = "{total_qtd}";
            document.getElementById('kpi-media').innerText = "{media_venda:,.2f}";
        }}
    }};

    // 2. CONFIGURAÇÕES DOS GRÁFICOS (Chart.js)
    Chart.defaults.color = '#94a3b8';
    Chart.defaults.font.family = "'Inter', sans-serif";
    Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(15, 23, 42, 0.9)';
    Chart.defaults.plugins.tooltip.padding = 12;
    Chart.defaults.plugins.tooltip.titleFont = {{ size: 14, family: 'Outfit' }};
    Chart.defaults.plugins.tooltip.bodyFont = {{ size: 13 }};

    const commonOptions = {{
        responsive: true,
        maintainAspectRatio: false,
        animation: {{ duration: 2500, easing: 'easeOutQuart' }},
        interaction: {{ mode: 'index', intersect: false }}
    }};

    // Gráfico de Linha (Evolução)
    new Chart(document.getElementById('timelineChart'), {{
        type: 'line',
        data: {{
            labels: {labels_tempo},
            datasets: [{{
                label: 'Receita Diária (R$)',
                data: {data_tempo},
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.15)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#0b0f19',
                pointBorderColor: '#3b82f6',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6
            }}]
        }},
        options: {{
            ...commonOptions,
            plugins: {{ legend: {{ display: false }} }},
            scales: {{
                y: {{ grid: {{ color: 'rgba(255,255,255,0.05)', drawBorder: false }} }},
                x: {{ grid: {{ display: false, drawBorder: false }} }}
            }}
        }}
    }});

    // Gráfico de Doughnut (Canal)
    new Chart(document.getElementById('canalChart'), {{
        type: 'doughnut',
        data: {{
            labels: {labels_canal},
            datasets: [{{
                data: {data_canal},
                backgroundColor: [
                    '#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'
                ],
                borderWidth: 0,
                hoverOffset: 12
            }}]
        }},
        options: {{
            ...commonOptions,
            cutout: '75%',
            plugins: {{
                legend: {{ position: 'bottom', labels: {{ padding: 20, usePointStyle: true }} }}
            }}
        }}
    }});
</script>

</body>
</html>
"""

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html_template)

webbrowser.open('file://' + os.path.realpath(html_path))
