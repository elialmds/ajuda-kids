# 🌟 Ajuda KIDS — Plataforma de Desenvolvimento Infantil

O **Ajuda KIDS** é uma plataforma digital completa, funcional, responsiva e acolhedora, projetada para apoiar o desenvolvimento integral de crianças entre 4 e 12 anos através de rotinas saudáveis e guiadas de **20 a 30 minutos por dia**, sem incentivar o uso excessivo de telas.

---

## 🎨 Identidade Visual e Princípios de Design

A interface foi concebida sob uma estética minimalista, acolhedora e com tipografia amigável (`Comfortaa` e `Nunito`), priorizando espaços em branco, cartões com cantos arredondados (`rounded-3xl`), sombras suaves e ausência de estímulos visuais agressivos.

### Paleta de Cores Oficial:
* **Azul-claro**: `#DCEFFA` (Fundos suaves e elementos ativos)
* **Azul principal**: `#72B7DE` (Destaque primário, botões e barras de progresso)
* **Azul escuro**: `#315B78` (Tipografia principal e contraste seguro)
* **Branco**: `#FFFFFF` (Cards e superfícies limpas)
* **Cinza suave**: `#F4F6F8` (Fundo geral da aplicação)
* **Verde suave**: `#DCEFE3` (Aprovação, natureza e bem-estar)
* **Amarelo pastel**: `#F8EBC6` (Acolhimento, calor e recompensas)
* **Lilás suave**: `#EAE2F5` (Sensibilidade e tranquilidade)

---

## 🏗️ Arquitetura e Tecnologias

* **React 18 & TypeScript**: Componentização modular com tipagem estrita e separação clara de responsabilidades.
* **Vite**: Build veloz e otimizado com empacotamento enxuto.
* **Tailwind CSS**: Estilização utilitária customizada com tokens de design para o público infantil.
* **Web Audio API**: Síntese procedural de efeitos sonoros suaves (fanfarras, cliques gentis, tons de sino) sem depender de arquivos de áudio externos.
* **Web Speech API**: Narração em voz natural em português brasileiro (`pt-BR`) para instruções faladas acessíveis a crianças em fase de alfabetização.
* **Web Crypto API (SHA-256 com Salt)**: Proteção criptográfica real do PIN dos responsáveis, evitando armazenamento em texto puro.
* **Persistência Estruturada**: Camada de repositório abstraída (`StorageService`) pronta para futura integração com Supabase ou backend relacional.
* **Testes Automatizados (Vitest)**: Validação das regras de negócio (limite de 3 jogadas, desbloqueio de jornada, jogos ilimitados, PIN hash e relatórios).

---

## 👶 Ambiente Infantil

Interface simplificada, tátil e adaptada à faixa etária (4-6 anos, 7-9 anos e 10-12 anos):

1. **Início Personalizado**: Saudação contextual (Bom dia / Boa tarde), avatar interativo, frase motivacional e status do dia.
2. **"Como estou me sentindo?"**: Check-in de inteligência emocional com 8 sentimentos (Feliz, Calmo, Animado, Cansado, Ansioso, Triste, Bravo, Com medo) com mensagens acolhedoras e atalho para a prática de respiração guiada ("Flor e Velinha").
3. **Minha Jornada Diária**:
   * Estrutura de 4 a 5 etapas sequenciais (15 a 25 min no total).
   * Barra de progresso do dia com salvamento de estado de cada atividade.
   * Feedback sonoro positivo e desbloqueio da "Hora de Brincar".
4. **Biblioteca de Atividades**:
   * *Comunicação e Fala*: Som das letras, formação de palavras, rimas, interpretação de histórias e vocabulário.
   * *Aprendizado e Raciocínio*: Contagem numérica, sequências lógicas, padrões e dedução.
   * *Atenção e Concentração*: O intruso divertido, foco seletivo e memória visual de detalhes.
   * *Inteligência Emocional*: Respiração consciente da flor e da vela, empatia e frustração.
   * *Coordenação Motora*: Desafios físicos fora da tela (equilíbrio do flamingo, lateralidade direita/esquerda e alongamentos).
5. **Meu Progresso**:
   * Medalhas de conhecimento por pilar de desenvolvimento.
   * Tempo total praticado e constância sem pressão competitiva.

---

## 🎮 "Hora de Brincar" (7 Jogos Interativos e Recompensas)

A área de jogos permanece **bloqueada** até que a jornada diária seja concluída.
* **Regra Padrão**: Conclusão da jornada libera **3 jogadas diárias**. Cada partida finalizada consome 1 jogada.
* **Regra Especial Parental**: O responsável pode habilitar **"Jogos Ilimitados"** no painel, liberando o acesso contínuo.

### Catálogo dos 7 Jogos:
1. **Batata Quente**: Versão digital com tique-taque sonoro acelerado e prendas divertidas para brincar em grupo presencialmente.
2. **Pato, Pato, Ganso!**: Guia interativo da brincadeira de roda clássica com contador de participantes e alarme de perseguição/corrida.
3. **Morto-Vivo**: Desafio interativo de comandos com comandos sonoros de "VIVO!" e "MORTO!" e reações rápidas.
4. **Jogo da Memória dos Bichinhos**: Cartas com ilustrações amigáveis, animação de virada, contador de tentativas e celebração.
5. **Sequência de Cores**: Jogo de memória no estilo Genius com 4 blocos sonoros e níveis progressivos.
6. **O Mestre Mandou (Simon Says)**: Jogo de atenção e reflexos onde a ação só é executada se o comando contiver "O Mestre Mandou".
7. **Detetive da Observação**: Puzzles visuais para encontrar o intruso ou o detalhe modificado.

---

## 🛡️ Painel dos Responsáveis (Protegido por PIN)

Acesso restrito por PIN de 4 a 6 dígitos (PIN padrão inicial: `1234`):

* **Visão Geral**: Resumo de jornadas concluídas, minutos totais, gráfico semanal de engajamento (minutos por dia) e nota de esclarecimento pedagógico.
* **Evolução**: Indicadores percentuais individuais para as 5 áreas de desenvolvimento e **sugestões educativas personalizadas para atividades fora da tela**.
* **Controle de Uso**:
  * Configuração de tempo máximo diário (20, 25, 30 ou 45 minutos).
  * Faixa horária permitida (horário de início e término).
  * Interruptor de **Jogos Ilimitados** (persistente).
  * Configurações de som e narração de voz.
* **Gestão de Perfis**: Cadastro de múltiplas crianças, edição de nome, apelido, idade, avatar e habilidades prioritárias.
* **Segurança & LGPD**: Alteração de PIN criptografado, exportação completa de dados em formato JSON e opção de exclusão definitiva dos dados locais.

---

## 🚀 Como Executar o Projeto

### Pré-requisitos
* Node.js v18+ e npm instalados.

### Comandos:
```bash
# Instalar dependências
npm install

# Executar servidor de desenvolvimento
npm run dev

# Executar testes unitários e de regras de negócio (Vitest)
npm test

# Gerar build de produção
npm run build

# Executar preview da versão de produção
npm run preview -- --port 3000
```
