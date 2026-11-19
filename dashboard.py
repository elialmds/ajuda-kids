import os
import pandas as pd
import matplotlib.pyplot as plt
from openpyxl import load_workbook
from openpyxl.drawing.image import Image

directory = r"c:\Users\eli\Downloads\planilhas_aula23-04-26"
consolidated_file = os.path.join(directory, "Dashboard_Python.xlsx")

print("Lendo as planilhas...")
all_data = []
for file in os.listdir(directory):
    if file.startswith("Planilha") and file.endswith(".xlsx") and file != "Dashboard_Python.xlsx" and file != "Dashboard_Consolidado.xlsx":
        filepath = os.path.join(directory, file)
        try:
            df = pd.read_excel(filepath)
            
            # Corrige o problema do Excel não ter separado as colunas por causa da vírgula (Locale PT-BR)
            if len(df.columns) == 1 and "," in df.columns[0]:
                col_name = df.columns[0]
                new_cols = col_name.split(",")
                # O pandas leu os dados todos na primeira coluna também
                df = df[col_name].str.split(",", expand=True)
                df.columns = new_cols
            
            all_data.append(df)
            print(f"Lida: {file}")
        except Exception as e:
            print(f"Erro ao ler {file}: {e}")

if not all_data:
    print("Nenhuma planilha encontrada!")
    exit()

# 1. Unificando os dados
df_completo = pd.concat(all_data, ignore_index=True)

# Converter tipos numéricos corretos
df_completo["Qtd"] = pd.to_numeric(df_completo["Qtd"])
df_completo["Valor_Unitario"] = pd.to_numeric(df_completo["Valor_Unitario"])

# 2. Calculando Receita Total
df_completo["Receita_Total"] = df_completo["Qtd"] * df_completo["Valor_Unitario"]

# Salvando a aba de dados no Excel
print("Salvando dados consolidados...")
with pd.ExcelWriter(consolidated_file, engine='openpyxl') as writer:
    df_completo.to_excel(writer, sheet_name="Dados Consolidados", index=False)
    # Criar uma aba em branco para o Dashboard
    workbook = writer.book
    workbook.create_sheet("Dashboard")

print("Gerando gráficos...")

# 3. Gráfico 1: Receita por Canal de Venda
receita_por_canal = df_completo.groupby("Canal_Venda")["Receita_Total"].sum().sort_values(ascending=False)

plt.figure(figsize=(8, 5))
receita_por_canal.plot(kind='bar', color='skyblue', edgecolor='black')
plt.title("Receita Total por Canal de Venda")
plt.ylabel("Receita (R$)")
plt.xlabel("Canal de Venda")
plt.xticks(rotation=45)
plt.tight_layout()
chart1_path = os.path.join(directory, "chart_canal.png")
plt.savefig(chart1_path)
plt.close()

# 4. Gráfico 2: Produtos Mais Vendidos
produtos_vendidos = df_completo.groupby("ID_Produto")["Qtd"].sum().sort_values(ascending=False)

plt.figure(figsize=(8, 5))
produtos_vendidos.plot(kind='bar', color='lightgreen', edgecolor='black')
plt.title("Produtos Mais Vendidos (Por Quantidade)")
plt.ylabel("Quantidade Vendida")
plt.xlabel("ID do Produto")
plt.xticks(rotation=0)
plt.tight_layout()
chart2_path = os.path.join(directory, "chart_produtos.png")
plt.savefig(chart2_path)
plt.close()

print("Inserindo gráficos na planilha Excel...")
# Inserir as imagens no arquivo Excel
wb = load_workbook(consolidated_file)
ws_dash = wb["Dashboard"]

img1 = Image(chart1_path)
ws_dash.add_image(img1, 'B2')

img2 = Image(chart2_path)
ws_dash.add_image(img2, 'B22')

wb.save(consolidated_file)

# Limpar imagens temporárias
os.remove(chart1_path)
os.remove(chart2_path)

print(f"Sucesso! Planilha gerada em: {consolidated_file}")
