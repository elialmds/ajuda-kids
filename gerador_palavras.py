import random

def gerar_palavra_pronunciavel(tamanho):
    """Gera uma palavra falsa alternando consoantes e vogais para ser pronunciável."""
    consoantes = "bcdfghjklmnpqrstvwxyz"
    vogais = "aeiou"
    palavra = ""
    
    # Define aleatoriamente se começa com vogal ou consoante
    comeca_com_vogal = random.choice([True, False])
    
    for i in range(tamanho):
        if comeca_com_vogal:
            if i % 2 == 0:
                palavra += random.choice(vogais)
            else:
                palavra += random.choice(consoantes)
        else:
            if i % 2 == 0:
                palavra += random.choice(consoantes)
            else:
                palavra += random.choice(vogais)
                
    return palavra.capitalize()

def iniciar_sistema():
    print("="*40)
    print("🤖 SISTEMA GERADOR DE PALAVRAS EM PYTHON")
    print("="*40)
    
    while True:
        print("\nMenu de Opções:")
        print("1. Gerar palavras aleatórias (novas palavras)")
        print("2. Sair do sistema")
        
        escolha = input("\nEscolha uma opção (1 ou 2): ")
        
        if escolha == '1':
            try:
                qtd = int(input("Quantas palavras você quer gerar? (Ex: 5): "))
                tam = int(input("Qual o tamanho de cada palavra? (Ex: 6): "))
                
                if qtd <= 0 or tam <= 0:
                    print("Por favor, insira números maiores que zero!")
                    continue
                    
                print(f"\n✨ Aqui estão suas {qtd} palavras geradas:")
                print("-" * 30)
                for _ in range(qtd):
                    nova_palavra = gerar_palavra_pronunciavel(tam)
                    print(f"➜ {nova_palavra}")
                print("-" * 30)
                
            except ValueError:
                print("❌ Erro: Por favor, digite apenas números inteiros válidos.")
                
        elif escolha == '2':
            print("Encerrando o sistema. Até logo! 👋")
            break
        else:
            print("❌ Opção inválida. Tente novamente.")

if __name__ == "__main__":
    iniciar_sistema()
