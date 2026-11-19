import { ActivityItem, AgeGroup, SkillArea } from '@/types';

export const ACTIVITIES_DATABASE: ActivityItem[] = [
  // ==========================================
  // COMUNICAÇÃO E FALA
  // ==========================================
  {
    id: 'com_01_4-6',
    title: 'O Som das Letras',
    description: 'Ouça o som e identifique qual letrinha inicia cada palavra!',
    objective: 'Desenvolver consciência fonológica e identificação de consoantes iniciais.',
    area: 'communication',
    ageGroup: '4-6',
    durationMinutes: 5,
    instructions: 'Ouça a dica da coruja Pipoca e escolha a letra certa em cada desafio!',
    spokenInstruction: 'Qual letrinha tem o som de Bola, Boneca e Barco?',
    content: {
      type: 'choice',
      prompt: 'Qual letra faz o som inicial de BOLA e BARCO?',
      options: [
        { id: 'opt_1', text: 'Letra B (bê)', isCorrect: true },
        { id: 'opt_2', text: 'Letra D (dê)', isCorrect: false },
        { id: 'opt_3', text: 'Letra P (pê)', isCorrect: false },
        { id: 'opt_4', text: 'Letra M (eme)', isCorrect: false }
      ]
    },
    tasks: [
      {
        id: 'com_01_t1',
        title: 'Som da letra B',
        difficulty: 'facil',
        type: 'choice',
        prompt: 'Qual letra faz o som inicial de BOLA e BARCO?',
        options: [
          { id: 'opt_1', text: 'Letra B (bê)', isCorrect: true },
          { id: 'opt_2', text: 'Letra D (dê)', isCorrect: false },
          { id: 'opt_3', text: 'Letra P (pê)', isCorrect: false },
          { id: 'opt_4', text: 'Letra M (eme)', isCorrect: false }
        ]
      },
      {
        id: 'com_01_t2',
        title: 'Som da letra M',
        difficulty: 'medio',
        type: 'choice',
        prompt: 'Com qual letra começam MAÇÃ, MACACO e MALA?',
        options: [
          { id: 'com1_m1', text: 'Letra M (eme)', isCorrect: true },
          { id: 'com1_m2', text: 'Letra N (ene)', isCorrect: false },
          { id: 'com1_m3', text: 'Letra V (vê)', isCorrect: false },
          { id: 'com1_m4', text: 'Letra B (bê)', isCorrect: false }
        ]
      },
      {
        id: 'com_01_t3',
        title: 'Som da letra F',
        difficulty: 'dificil',
        type: 'choice',
        prompt: 'Qual letrinha começa FOCA, FLOR e FOGUETE?',
        options: [
          { id: 'com1_f1', text: 'Letra F (efe)', isCorrect: true },
          { id: 'com1_f2', text: 'Letra V (vê)', isCorrect: false },
          { id: 'com1_f3', text: 'Letra S (esse)', isCorrect: false },
          { id: 'com1_f4', text: 'Letra T (tê)', isCorrect: false }
        ]
      }
    ],
    offlineSuggestion: 'Procure 3 objetos em casa que comecem com a letra B e fale o nome deles em voz alta!'
  },
  {
    id: 'com_02_4-6',
    title: 'Montando Palavrinhas',
    description: 'Ordene as letrinhas para formar palavras do nosso dia a dia.',
    objective: 'Praticar alfabetização inicial e ordenação alfabética.',
    area: 'communication',
    ageGroup: '4-6',
    durationMinutes: 5,
    instructions: 'Toque nas letrinhas na ordem certa para formar cada palavra!',
    spokenInstruction: 'Vamos montar palavras com as letrinhas mágicas!',
    content: {
      type: 'word_build',
      prompt: 'Forme a palavra do astro brilhante: SOL',
      targetWord: 'SOL',
      wordParts: ['O', 'S', 'L']
    },
    tasks: [
      {
        id: 'com_02_t1',
        title: 'Palavra SOL',
        difficulty: 'facil',
        type: 'word_build',
        prompt: 'Forme a palavra do astro que ilumina o dia: SOL',
        targetWord: 'SOL',
        wordParts: ['O', 'S', 'L']
      },
      {
        id: 'com_02_t2',
        title: 'Palavra LUA',
        difficulty: 'medio',
        type: 'word_build',
        prompt: 'Forme a palavra que brilha no céu à noite: LUA',
        targetWord: 'LUA',
        wordParts: ['A', 'L', 'U']
      },
      {
        id: 'com_02_t3',
        title: 'Palavra CASA',
        difficulty: 'dificil',
        type: 'word_build',
        prompt: 'Forme a palavra do lugar onde moramos: CASA',
        targetWord: 'CASA',
        wordParts: ['S', 'A', 'C', 'A']
      }
    ],
    offlineSuggestion: 'Desenhe um sol bem quentinho no papel e escreva a palavra SOL ao lado!'
  },
  {
    id: 'com_03_7-9',
    title: 'Detetive das Rimas',
    description: 'Encontre palavras que rimam e terminam com o mesmo som.',
    objective: 'Ampliar vocabulário e percepção sonora das terminações.',
    area: 'communication',
    ageGroup: '7-9',
    durationMinutes: 6,
    instructions: 'Leia com atenção e descubra qual palavra rima em cada rodada.',
    spokenInstruction: 'Coração bate feliz. Qual palavra rima com Coração?',
    content: {
      type: 'choice',
      prompt: 'Qual palavra rima perfeitamente com CORAÇÃO?',
      options: [
        { id: 'r1', text: 'Avião', isCorrect: true },
        { id: 'r2', text: 'Cachorro', isCorrect: false },
        { id: 'r3', text: 'Amigo', isCorrect: false },
        { id: 'r4', text: 'Estrela', isCorrect: false }
      ]
    },
    tasks: [
      {
        id: 'com_03_t1',
        title: 'Rima com Coração',
        difficulty: 'facil',
        type: 'choice',
        prompt: 'Qual palavra rima perfeitamente com CORAÇÃO?',
        options: [
          { id: 'r1', text: 'Avião', isCorrect: true },
          { id: 'r2', text: 'Cachorro', isCorrect: false },
          { id: 'r3', text: 'Amigo', isCorrect: false },
          { id: 'r4', text: 'Estrela', isCorrect: false }
        ]
      },
      {
        id: 'com_03_t2',
        title: 'Rima com Janela',
        difficulty: 'medio',
        type: 'choice',
        prompt: 'Qual palavra combina em rima com JANELA?',
        options: [
          { id: 'r2_1', text: 'Estrela', isCorrect: true },
          { id: 'r2_2', text: 'Nuvem', isCorrect: false },
          { id: 'r2_3', text: 'Caderno', isCorrect: false },
          { id: 'r2_4', text: 'Tapete', isCorrect: false }
        ]
      },
      {
        id: 'com_03_t3',
        title: 'Rima com Pintor',
        difficulty: 'dificil',
        type: 'choice',
        prompt: 'Qual palavra termina igual e rima com PINTOR?',
        options: [
          { id: 'r3_1', text: 'Flor', isCorrect: true },
          { id: 'r3_2', text: 'Quadro', isCorrect: false },
          { id: 'r3_3', text: 'Pincel', isCorrect: false },
          { id: 'r3_4', text: 'Tinta', isCorrect: false }
        ]
      }
    ],
    offlineSuggestion: 'Invente uma pequena rima com o nome de alguém da sua família!'
  },
  {
    id: 'com_04_7-9',
    title: 'Completando a Frase Misteriosa',
    description: 'Escolha as palavras adequadas para dar sentido completo às frases.',
    objective: 'Fortalecer interpretação e coesão textual.',
    area: 'communication',
    ageGroup: '7-9',
    durationMinutes: 5,
    instructions: 'Leia a frase e escolha a palavra que faz mais sentido.',
    spokenInstruction: 'Complete as frases escolhendo a palavra que combina com o sentido.',
    content: {
      type: 'choice',
      prompt: 'Complete a frase: "O pássaro construiu seu ninho seguro na _____ da grande árvore."',
      options: [
        { id: 'f1', text: 'copa', isCorrect: true },
        { id: 'f2', text: 'pedra', isCorrect: false },
        { id: 'f3', text: 'nuvem', isCorrect: false },
        { id: 'f4', text: 'porta', isCorrect: false }
      ]
    },
    tasks: [
      {
        id: 'com_04_t1',
        title: 'Ninho na árvore',
        difficulty: 'facil',
        type: 'choice',
        prompt: 'Complete a frase: "O pássaro construiu seu ninho seguro na _____ da grande árvore."',
        options: [
          { id: 'f1', text: 'copa', isCorrect: true },
          { id: 'f2', text: 'pedra', isCorrect: false },
          { id: 'f3', text: 'nuvem', isCorrect: false },
          { id: 'f4', text: 'porta', isCorrect: false }
        ]
      },
      {
        id: 'com_04_t2',
        title: 'Biblioteca da escola',
        difficulty: 'medio',
        type: 'choice',
        prompt: 'Complete a frase: "Na biblioteca, abrimos um livro novo e descobrimos uma _____ fascinante."',
        options: [
          { id: 'f2_1', text: 'história', isCorrect: true },
          { id: 'f2_2', text: 'bicicleta', isCorrect: false },
          { id: 'f2_3', text: 'geladeira', isCorrect: false },
          { id: 'f2_4', text: 'chuva', isCorrect: false }
        ]
      },
      {
        id: 'com_04_t3',
        title: 'Gentileza no parque',
        difficulty: 'dificil',
        type: 'choice',
        prompt: 'Complete a frase: "Quando compartilhamos nossos brinquedos, a brincadeira fica mais _____."',
        options: [
          { id: 'f3_1', text: 'divertida', isCorrect: true },
          { id: 'f3_2', text: 'silenciosa', isCorrect: false },
          { id: 'f3_3', text: 'pesada', isCorrect: false },
          { id: 'f3_4', text: 'fechada', isCorrect: false }
        ]
      }
    ],
    offlineSuggestion: 'Conte para um responsável uma história inventada de três frases sobre um pássaro viajante.'
  },
  {
    id: 'com_05_10-12',
    title: 'Compreensão de Texto e Ideias',
    description: 'Interpretação de pequenas histórias e vocabulário em contexto.',
    objective: 'Aprimorar leitura crítica, inferência e identificação da ideia central.',
    area: 'communication',
    ageGroup: '10-12',
    durationMinutes: 6,
    instructions: 'Leia cada pequeno texto e responda ao que ele transmite.',
    spokenInstruction: 'Leia com atenção e descubra a mensagem principal de cada história.',
    content: {
      type: 'story_quiz',
      prompt: 'Sobre o que é a reflexão do texto?',
      storyText: 'Marina percebeu que quando ouvia seus amigos com atenção genuína, sem interromper para falar de si mesma, as amizades se tornavam muito mais fortes e sinceras. Ela compreendeu o verdadeiro valor da escuta ativa.',
      options: [
        { id: 'sq1', text: 'A importância de ouvir as pessoas com respeito e atenção', isCorrect: true },
        { id: 'sq2', text: 'Como falar mais alto que os outros', isCorrect: false },
        { id: 'sq3', text: 'Aprender a guardar segredos', isCorrect: false },
        { id: 'sq4', text: 'Fazer lição de casa mais rápido', isCorrect: false }
      ]
    },
    tasks: [
      {
        id: 'com_05_t1',
        title: 'O Valor da Escuta',
        difficulty: 'facil',
        type: 'story_quiz',
        prompt: 'Sobre o que é a reflexão do texto?',
        storyText: 'Marina percebeu que quando ouvia seus amigos com atenção genuína, sem interromper para falar de si mesma, as amizades se tornavam muito mais fortes e sinceras. Ela compreendeu o verdadeiro valor da escuta ativa.',
        options: [
          { id: 'sq1', text: 'A importância de ouvir as pessoas com respeito e atenção', isCorrect: true },
          { id: 'sq2', text: 'Como falar mais alto que os outros', isCorrect: false },
          { id: 'sq3', text: 'Aprender a guardar segredos', isCorrect: false },
          { id: 'sq4', text: 'Fazer lição de casa mais rápido', isCorrect: false }
        ]
      },
      {
        id: 'com_05_t2',
        title: 'Curiosidade Científica',
        difficulty: 'medio',
        type: 'story_quiz',
        prompt: 'Por que Lucas passou a anotar suas dúvidas num caderno?',
        storyText: 'Sempre que via algo diferente no jardim, Lucas anotava sua pergunta no caderno de explorador. À noite, pesquisava com a mãe e descobria respostas incríveis sobre insetos, estrelas e nuvens.',
        options: [
          { id: 'sq2_1', text: 'Para transformar sua curiosidade em descobertas reais', isCorrect: true },
          { id: 'sq2_2', text: 'Porque não gostava de olhar o céu', isCorrect: false },
          { id: 'sq2_3', text: 'Para decorar listas sem sentido', isCorrect: false },
          { id: 'sq2_4', text: 'Para evitar conversar com a família', isCorrect: false }
        ]
      },
      {
        id: 'com_05_t3',
        title: 'Trabalho em Equipe',
        difficulty: 'dificil',
        type: 'story_quiz',
        prompt: 'Qual atitude garantiu o sucesso da feira de ciências?',
        storyText: 'O grupo decidiu dividir as tarefas conforme o talento de cada um: Clara desenhou o cartaz, Pedro montou o vulcão e Lia apresentou os experimentos com entusiasmo.',
        options: [
          { id: 'sq3_1', text: 'Colaborar valorizando o talento de cada integrante', isCorrect: true },
          { id: 'sq3_2', text: 'Deixar uma única pessoa trabalhar sozinha', isCorrect: false },
          { id: 'sq3_3', text: 'Esconder os materiais dos colegas', isCorrect: false },
          { id: 'sq3_4', text: 'Desistir na primeira dificuldade', isCorrect: false }
        ]
      }
    ],
    offlineSuggestion: 'Hoje pratique a escuta ativa: quando alguém falar com você, ouça até o fim antes de responder!'
  },
  {
    id: 'com_pair_all',
    title: 'Associação de Sons e Palavras',
    description: 'Conecte cada palavra à sua sílaba inicial correspondente!',
    objective: 'Desenvolver consciência fonológica e associação entre palavra e som inicial.',
    area: 'communication',
    ageGroup: '4-6',
    durationMinutes: 5,
    instructions: 'Toque em um item da coluna esquerda e depois no seu par correspondente à direita.',
    spokenInstruction: 'Vamos ligar cada palavra ao seu som inicial!',
    content: {
      type: 'pair_matching',
      prompt: 'Conecte cada palavra à sílaba com que ela começa:',
      pairs: [
        { id: 'p1', left: 'Borboleta', right: 'Sílaba BO' },
        { id: 'p2', left: 'Casinha', right: 'Sílaba CA' },
        { id: 'p3', left: 'Banana', right: 'Sílaba BA' },
        { id: 'p4', left: 'Solzinho', right: 'Sílaba SOL' }
      ]
    },
    tasks: [
      {
        id: 'com_pair_t1',
        title: 'Sílabas da Natureza',
        difficulty: 'facil',
        type: 'pair_matching',
        prompt: 'Conecte cada palavra à sílaba inicial correta:',
        pairs: [
          { id: 'p1', left: 'Borboleta', right: 'Sílaba BO' },
          { id: 'p2', left: 'Casinha', right: 'Sílaba CA' },
          { id: 'p3', left: 'Banana', right: 'Sílaba BA' },
          { id: 'p4', left: 'Solzinho', right: 'Sílaba SOL' }
        ]
      },
      {
        id: 'com_pair_t2',
        title: 'Palavras e Opostos',
        difficulty: 'medio',
        type: 'pair_matching',
        prompt: 'Conecte cada palavra ao seu oposto divertido:',
        pairs: [
          { id: 'op1', left: 'Quente', right: 'Frio' },
          { id: 'op2', left: 'Grande', right: 'Pequeno' },
          { id: 'op3', left: 'Dia', right: 'Noite' },
          { id: 'op4', left: 'Alegre', right: 'Calmo' }
        ]
      }
    ],
    offlineSuggestion: 'Brinquem de encontrar objetos na sala e dizer com qual sílaba eles começam!'
  },

  // ==========================================
  // APRENDIZADO E RACIOCÍNIO
  // ==========================================
  {
    id: 'rac_01_4-6',
    title: 'Contando e Somando Estrelas',
    description: 'Reconhecimento numérico, contagem e pequenas somas.',
    objective: 'Estimular senso numérico e raciocínio lógico quantitativo.',
    area: 'reasoning',
    ageGroup: '4-6',
    durationMinutes: 5,
    instructions: 'Conte com calma e escolha a quantidade correta em cada etapa.',
    spokenInstruction: 'Quantas estrelinhas brilhantes você consegue contar?',
    content: {
      type: 'choice',
      prompt: 'Conte as estrelas: ★ ★ ★ ★ ★',
      options: [
        { id: 'n5', text: '5 estrelas', isCorrect: true },
        { id: 'n3', text: '3 estrelas', isCorrect: false },
        { id: 'n4', text: '4 estrelas', isCorrect: false },
        { id: 'n6', text: '6 estrelas', isCorrect: false }
      ]
    },
    tasks: [
      {
        id: 'rac_01_t1',
        title: 'Contar estrelas',
        difficulty: 'facil',
        type: 'choice',
        prompt: 'Conte as estrelas: ★ ★ ★ ★ ★',
        options: [
          { id: 'n5', text: '5 estrelas', isCorrect: true },
          { id: 'n3', text: '3 estrelas', isCorrect: false },
          { id: 'n4', text: '4 estrelas', isCorrect: false },
          { id: 'n6', text: '6 estrelas', isCorrect: false }
        ]
      },
      {
        id: 'rac_01_t2',
        title: 'Juntando estrelinhas',
        difficulty: 'medio',
        type: 'choice',
        prompt: 'Você ganhou 3 estrelas de manhã e mais 4 estrelas à tarde. Quantas tem agora?',
        options: [
          { id: 'n2_7', text: '7 estrelas', isCorrect: true },
          { id: 'n2_5', text: '5 estrelas', isCorrect: false },
          { id: 'n2_6', text: '6 estrelas', isCorrect: false },
          { id: 'n2_8', text: '8 estrelas', isCorrect: false }
        ]
      },
      {
        id: 'rac_01_t3',
        title: 'Estrelas no céu',
        difficulty: 'dificil',
        type: 'choice',
        prompt: 'Havia 9 nuvens no céu e 4 foram embora com o vento. Quantas ficaram?',
        options: [
          { id: 'n3_5', text: '5 nuvens', isCorrect: true },
          { id: 'n3_6', text: '6 nuvens', isCorrect: false },
          { id: 'n3_4', text: '4 nuvens', isCorrect: false },
          { id: 'n3_13', text: '13 nuvens', isCorrect: false }
        ]
      }
    ],
    offlineSuggestion: 'Dê 5 pulinhos no mesmo lugar contando em voz alta de 1 até 5!'
  },
  {
    id: 'rac_02_4-6',
    title: 'Padrão de Cores e Formas',
    description: 'Complete sequências lógicas descobrindo o padrão oculto.',
    objective: 'Identificar regularidades visuais e numéricas.',
    area: 'reasoning',
    ageGroup: '4-6',
    durationMinutes: 5,
    instructions: 'Observe a repetição com atenção e descubra qual elemento vem depois.',
    spokenInstruction: 'Observe o ritmo das formas e escolha a próxima!',
    content: {
      type: 'pattern_complete',
      prompt: 'Qual é o próximo elemento: Círculo Azul, Quadrado Vermelho, Círculo Azul, Quadrado Vermelho, ...',
      options: [
        { id: 'p1', text: 'Círculo Azul', isCorrect: true },
        { id: 'p2', text: 'Quadrado Vermelho', isCorrect: false },
        { id: 'p3', text: 'Estrela Amarela', isCorrect: false }
      ]
    },
    tasks: [
      {
        id: 'rac_02_t1',
        title: 'Alternância simples',
        difficulty: 'facil',
        type: 'pattern_complete',
        prompt: 'Qual é o próximo: Círculo Azul, Quadrado Vermelho, Círculo Azul, Quadrado Vermelho, ___',
        options: [
          { id: 'p1', text: 'Círculo Azul', isCorrect: true },
          { id: 'p2', text: 'Quadrado Vermelho', isCorrect: false },
          { id: 'p3', text: 'Estrela Amarela', isCorrect: false }
        ]
      },
      {
        id: 'rac_02_t2',
        title: 'Três formas em ritmo',
        difficulty: 'medio',
        type: 'pattern_complete',
        prompt: 'Continue a sequência: Sol, Nuvem, Flor, Sol, Nuvem, ___',
        options: [
          { id: 'p2_1', text: 'Flor', isCorrect: true },
          { id: 'p2_2', text: 'Sol', isCorrect: false },
          { id: 'p2_3', text: 'Nuvem', isCorrect: false }
        ]
      },
      {
        id: 'rac_02_t3',
        title: 'Números saltando',
        difficulty: 'dificil',
        type: 'pattern_complete',
        prompt: 'Descubra o próximo número: 2, 4, 6, 8, ___',
        options: [
          { id: 'p3_1', text: '10', isCorrect: true },
          { id: 'p3_2', text: '9', isCorrect: false },
          { id: 'p3_3', text: '12', isCorrect: false }
        ]
      }
    ],
    offlineSuggestion: 'Organize seus brinquedos ou tampinhas formando uma sequência alternada!'
  },
  {
    id: 'rac_03_7-9',
    title: 'Desafio Matemático dos Amigos',
    description: 'Pequenos problemas lógicos e matemáticos do cotidiano.',
    objective: 'Aplicar soma, subtração e multiplicação simples em histórias.',
    area: 'reasoning',
    ageGroup: '7-9',
    durationMinutes: 6,
    instructions: 'Resolva cada probleminha pensando passo a passo.',
    spokenInstruction: 'Sofia tinha 8 lápis de cor e deu 3 para o irmão. Com quantos ficou?',
    content: {
      type: 'choice',
      prompt: 'Sofia tinha 8 lápis de cor. Ela deu 3 para o irmão. Com quantos lápis Sofia ficou?',
      options: [
        { id: 'm1', text: '5 lápis', isCorrect: true },
        { id: 'm2', text: '6 lápis', isCorrect: false },
        { id: 'm3', text: '11 lápis', isCorrect: false },
        { id: 'm4', text: '4 lápis', isCorrect: false }
      ]
    },
    tasks: [
      {
        id: 'rac_03_t1',
        title: 'Lápis da Sofia',
        difficulty: 'facil',
        type: 'choice',
        prompt: 'Sofia tinha 8 lápis de cor. Ela deu 3 para o irmão. Com quantos lápis Sofia ficou?',
        options: [
          { id: 'm1', text: '5 lápis', isCorrect: true },
          { id: 'm2', text: '6 lápis', isCorrect: false },
          { id: 'm3', text: '11 lápis', isCorrect: false },
          { id: 'm4', text: '4 lápis', isCorrect: false }
        ]
      },
      {
        id: 'rac_03_t2',
        title: 'Caixas de figurinhas',
        difficulty: 'medio',
        type: 'choice',
        prompt: 'Pedro tem 3 saquinhos com 4 figurinhas em cada um. Quantas figurinhas ele tem ao todo?',
        options: [
          { id: 'm2_1', text: '12 figurinhas', isCorrect: true },
          { id: 'm2_2', text: '7 figurinhas', isCorrect: false },
          { id: 'm2_3', text: '10 figurinhas', isCorrect: false },
          { id: 'm2_4', text: '16 figurinhas', isCorrect: false }
        ]
      },
      {
        id: 'rac_03_t3',
        title: 'Piquenique no parque',
        difficulty: 'dificil',
        type: 'choice',
        prompt: 'Dividimos 20 morangos igualmente entre 4 amigos. Quantos morangos cada um recebeu?',
        options: [
          { id: 'm3_1', text: '5 morangos', isCorrect: true },
          { id: 'm3_2', text: '4 morangos', isCorrect: false },
          { id: 'm3_3', text: '6 morangos', isCorrect: false },
          { id: 'm3_4', text: '16 morangos', isCorrect: false }
        ]
      }
    ],
    offlineSuggestion: 'Ajude a arrumar a mesa contando quantos garfos e colheres são necessários para toda a família.'
  },
  {
    id: 'rac_04_10-12',
    title: 'Lógica e Dedução: Os Três Cofres',
    description: 'Enigmas de raciocínio dedutivo e investigação.',
    objective: 'Exercitar lógica condicional, eliminação e pensamento analítico.',
    area: 'reasoning',
    ageGroup: '10-12',
    durationMinutes: 6,
    instructions: 'Analise cada pista com cuidado para chegar à única conclusão possível.',
    spokenInstruction: 'Pense como um detetive da lógica e resolva os enigmas!',
    content: {
      type: 'choice',
      prompt: 'O livro não está na caixa verde. A caixa azul diz: "Está aqui". A caixa vermelha diz: "Não está na caixa azul". Sabendo que a caixa azul fala a verdade, onde está o livro?',
      options: [
        { id: 'e1', text: 'Na caixa azul', isCorrect: true },
        { id: 'e2', text: 'Na caixa vermelha', isCorrect: false },
        { id: 'e3', text: 'Na caixa verde', isCorrect: false }
      ]
    },
    tasks: [
      {
        id: 'rac_04_t1',
        title: 'O Enigma dos Cofres',
        difficulty: 'facil',
        type: 'choice',
        prompt: 'O livro não está na caixa verde. A caixa azul diz: "Está aqui". Sabendo que a caixa azul sempre fala a verdade, onde está o livro?',
        options: [
          { id: 'e1', text: 'Na caixa azul', isCorrect: true },
          { id: 'e2', text: 'Na caixa vermelha', isCorrect: false },
          { id: 'e3', text: 'Na caixa verde', isCorrect: false }
        ]
      },
      {
        id: 'rac_04_t2',
        title: 'Corrida de Bicicleta',
        difficulty: 'medio',
        type: 'choice',
        prompt: 'Ana chegou antes de Bruno. Carla chegou depois de Bruno. Quem venceu a corrida?',
        options: [
          { id: 'e2_1', text: 'Ana', isCorrect: true },
          { id: 'e2_2', text: 'Bruno', isCorrect: false },
          { id: 'e2_3', text: 'Carla', isCorrect: false }
        ]
      },
      {
        id: 'rac_04_t3',
        title: 'Padrão Numérico Oculto',
        difficulty: 'dificil',
        type: 'choice',
        prompt: 'Observe a sequência: 3, 6, 12, 24, ___. Qual número completa o segredo?',
        options: [
          { id: 'e3_1', text: '48 (sempre dobra o anterior)', isCorrect: true },
          { id: 'e3_2', text: '36', isCorrect: false },
          { id: 'e3_3', text: '30', isCorrect: false }
        ]
      }
    ],
    offlineSuggestion: 'Crie uma charada lógica de adivinhação e faça para alguém da casa tentar acertar!'
  },
  {
    id: 'rea_seq_all',
    title: 'Ordem da Sementinha e Histórias Lógicas',
    description: 'Coloque etapas naturais e rotinas na ordem cronológica correta sem dicas numéricas.',
    objective: 'Estimular o pensamento sequencial, noção de tempo e causa-efeito.',
    area: 'reasoning',
    ageGroup: '4-6',
    durationMinutes: 6,
    instructions: 'Ordene os acontecimentos do começo até o final e clique em Verificar Sequência!',
    spokenInstruction: 'Como uma plantinha cresce? Organize cada etapa do início até o fim!',
    content: {
      type: 'sequence',
      prompt: 'Coloque em ordem como a plantinha cresce da terra até virar flor:',
      sequence: [
        'Plantar a sementinha na terra fofa',
        'Regar com água e receber luz do sol',
        'Brotar o caule verde com as primeiras folhinhas',
        'Desabrochar uma linda flor amarela'
      ]
    },
    tasks: [
      {
        id: 'rea_seq_t1',
        title: 'Ordem da Sementinha',
        difficulty: 'facil',
        type: 'sequence',
        prompt: 'Coloque na ordem certa como a sementinha se transforma em flor:',
        sequence: [
          'Plantar a sementinha na terra fofa',
          'Regar com água e receber luz do sol',
          'Brotar o caule verde com as primeiras folhinhas',
          'Desabrochar uma linda flor amarela'
        ]
      },
      {
        id: 'rea_seq_t2',
        title: 'Metamorfose da Borboleta',
        difficulty: 'medio',
        type: 'sequence',
        prompt: 'Organize a linda transformação da borboleta no jardim:',
        sequence: [
          'Um pequeno ovinho repousa em cima da folha',
          'Nasce uma lagartinha com muita fome de folhas',
          'A lagarta forma um casulo bem protegido no galho',
          'Abre-se o casulo e voa uma borboleta colorida'
        ]
      },
      {
        id: 'rea_seq_t3',
        title: 'Preparando um Lanche Gostoso',
        difficulty: 'dificil',
        type: 'sequence',
        prompt: 'Qual a ordem certa para preparar e saborear uma salada de frutas?',
        sequence: [
          'Lavar bem as mãos e as frutas na pia',
          'Com ajuda de um adulto, picar as frutas numa tigela',
          'Misturar tudo e servir em potinhos coloridos',
          'Guardar a louça lavada após se deliciar'
        ]
      }
    ],
    offlineSuggestion: 'Plante um grãozinho de feijão no algodão úmido e observe-o crescer durante a semana!'
  },

  // ==========================================
  // ATENÇÃO E CONCENTRAÇÃO
  // ==========================================
  {
    id: 'ate_01_4-6',
    title: 'O Intruso Divertido',
    description: 'Encontre o elemento que não pertence ao mesmo grupo.',
    objective: 'Treinar atenção seletiva, categorização e discriminação visual.',
    area: 'attention',
    ageGroup: '4-6',
    durationMinutes: 5,
    instructions: 'Observe todos os elementos com calma e descubra quem não combina com o grupo.',
    spokenInstruction: 'Quem é o intruso que não faz parte do grupo?',
    content: {
      type: 'spot_odd',
      prompt: 'Qual elemento NÃO é um animal? Gatinho, Cachorrinho, Carro, Coelhinho',
      options: [
        { id: 'o1', text: 'Carro', isCorrect: true },
        { id: 'o2', text: 'Gatinho', isCorrect: false },
        { id: 'o3', text: 'Cachorrinho', isCorrect: false },
        { id: 'o4', text: 'Coelhinho', isCorrect: false }
      ]
    },
    tasks: [
      {
        id: 'ate_01_t1',
        title: 'Grupo dos animais',
        difficulty: 'facil',
        type: 'spot_odd',
        prompt: 'Qual elemento NÃO é um animalzinho?',
        options: [
          { id: 'o1', text: 'Carro', isCorrect: true },
          { id: 'o2', text: 'Gatinho', isCorrect: false },
          { id: 'o3', text: 'Cachorrinho', isCorrect: false },
          { id: 'o4', text: 'Coelhinho', isCorrect: false }
        ]
      },
      {
        id: 'ate_01_t2',
        title: 'Grupo das frutas',
        difficulty: 'medio',
        type: 'spot_odd',
        prompt: 'Qual item NÃO é uma fruta deliciosa?',
        options: [
          { id: 'o2_1', text: 'Lápis de Cor', isCorrect: true },
          { id: 'o2_2', text: 'Banana', isCorrect: false },
          { id: 'o2_3', text: 'Morango', isCorrect: false },
          { id: 'o2_4', text: 'Melancia', isCorrect: false }
        ]
      },
      {
        id: 'ate_01_t3',
        title: 'No fundo do mar',
        difficulty: 'dificil',
        type: 'spot_odd',
        prompt: 'Qual bicho NÃO vive no fundo do mar?',
        options: [
          { id: 'o3_1', text: 'Girafa', isCorrect: true },
          { id: 'o3_2', text: 'Baleia', isCorrect: false },
          { id: 'o3_3', text: 'Polvo', isCorrect: false },
          { id: 'o3_4', text: 'Peixe-palhaço', isCorrect: false }
        ]
      }
    ],
    offlineSuggestion: 'Olhe ao seu redor e encontre 3 coisas que são feitas de madeira.'
  },
  {
    id: 'ate_02_7-9',
    title: 'Foco Seletivo: Pistas do Tempo',
    description: 'Treine a concentração lendo detalhes sem cair em distrações.',
    objective: 'Fortalecer atenção sustentada e leitura precisa.',
    area: 'attention',
    ageGroup: '7-9',
    durationMinutes: 5,
    instructions: 'Leia cada pergunta duas vezes antes de tocar na resposta!',
    spokenInstruction: 'Atenção redobrada! Preste atenção em cada detalhe da pergunta.',
    content: {
      type: 'choice',
      prompt: 'Se ontem foi Terça-feira e amanhã será Quinta-feira, que dia é HOJE?',
      options: [
        { id: 'd1', text: 'Quarta-feira', isCorrect: true },
        { id: 'd2', text: 'Sexta-feira', isCorrect: false },
        { id: 'd3', text: 'Segunda-feira', isCorrect: false },
        { id: 'd4', text: 'Domingo', isCorrect: false }
      ]
    },
    tasks: [
      {
        id: 'ate_02_t1',
        title: 'Dia da semana',
        difficulty: 'facil',
        type: 'choice',
        prompt: 'Se ontem foi Terça-feira e amanhã será Quinta-feira, que dia é HOJE?',
        options: [
          { id: 'd1', text: 'Quarta-feira', isCorrect: true },
          { id: 'd2', text: 'Sexta-feira', isCorrect: false },
          { id: 'd3', text: 'Segunda-feira', isCorrect: false },
          { id: 'd4', text: 'Domingo', isCorrect: false }
        ]
      },
      {
        id: 'ate_02_t2',
        title: 'Contando vogais',
        difficulty: 'medio',
        type: 'choice',
        prompt: 'Quantas vezes a letra A aparece na palavra BANANA?',
        options: [
          { id: 'd2_1', text: '3 vezes', isCorrect: true },
          { id: 'd2_2', text: '2 vezes', isCorrect: false },
          { id: 'd2_3', text: '4 vezes', isCorrect: false },
          { id: 'd2_4', text: '1 vez', isCorrect: false }
        ]
      },
      {
        id: 'ate_02_t3',
        title: 'Pegadinha gentil',
        difficulty: 'dificil',
        type: 'choice',
        prompt: 'Em uma fila, você ultrapassou quem estava em 2º lugar. Em que posição você ficou?',
        options: [
          { id: 'd3_1', text: '2º lugar', isCorrect: true },
          { id: 'd3_2', text: '1º lugar', isCorrect: false },
          { id: 'd3_3', text: '3º lugar', isCorrect: false }
        ]
      }
    ],
    offlineSuggestion: 'Feche os olhos por 30 segundos e tente identificar 3 barulhinhos diferentes no ambiente.'
  },
  {
    id: 'ate_03_10-12',
    title: 'Memória de Detalhes e Foco',
    description: 'Observe listas e cenas para testar sua memória ativa.',
    objective: 'Ampliar memória de trabalho e retenção seletiva.',
    area: 'attention',
    ageGroup: '10-12',
    durationMinutes: 6,
    instructions: 'Leia atentamente a lista de pistas no quadro antes de responder.',
    spokenInstruction: 'Guarde na memória cada objeto descrito!',
    content: {
      type: 'story_quiz',
      prompt: 'Qual destes objetos NÃO estava na mochila do explorador?',
      storyText: 'Antes da trilha no parque, Júlio conferiu os 4 itens da mochila: Relógio, Caderno, Garrafa de água e Bússola.',
      options: [
        { id: 'm_not', text: 'Estojo', isCorrect: true },
        { id: 'm_yes1', text: 'Bússola', isCorrect: false },
        { id: 'm_yes2', text: 'Garrafa de água', isCorrect: false },
        { id: 'm_yes3', text: 'Caderno', isCorrect: false }
      ]
    },
    tasks: [
      {
        id: 'ate_03_t1',
        title: 'Mochila do Explorador',
        difficulty: 'facil',
        type: 'story_quiz',
        prompt: 'Qual destes objetos NÃO estava na lista do Júlio?',
        storyText: 'Antes da trilha no parque, Júlio conferiu os 4 itens da mochila: Relógio, Caderno, Garrafa de água e Bússola.',
        options: [
          { id: 'm_not', text: 'Estojo', isCorrect: true },
          { id: 'm_yes1', text: 'Bússola', isCorrect: false },
          { id: 'm_yes2', text: 'Garrafa de água', isCorrect: false },
          { id: 'm_yes3', text: 'Caderno', isCorrect: false }
        ]
      },
      {
        id: 'ate_03_t2',
        title: 'Detalhes da Vitrine',
        difficulty: 'medio',
        type: 'story_quiz',
        prompt: 'Qual era a cor da bicicleta descrita na história?',
        storyText: 'Na vitrine da esquina havia um globo azul, três livros vermelhos, um violão marrom e uma bicicleta amarela com cestinha verde.',
        options: [
          { id: 'v_1', text: 'Amarela com cestinha verde', isCorrect: true },
          { id: 'v_2', text: 'Azul com guidão marrom', isCorrect: false },
          { id: 'v_3', text: 'Vermelha com cestinha azul', isCorrect: false }
        ]
      }
    ],
    offlineSuggestion: 'Coloque 5 pequenos objetos numa mesa, tampe com um pano, retire um e peça para alguém adivinhar qual sumiu!'
  },
  {
    id: 'att_pair_all',
    title: 'Detetive das Sombras e Formas',
    description: 'Associe elementos do cotidiano às suas formas geométricas.',
    objective: 'Aprimorar percepção visual, foco seletivo e abstração espacial.',
    area: 'attention',
    ageGroup: '7-9',
    durationMinutes: 5,
    instructions: 'Encontre qual forma geométrica representa cada objeto observado pela Guardiã Maya.',
    spokenInstruction: 'Use a lupa da Maya para conectar cada objeto à sua forma geométrica!',
    content: {
      type: 'pair_matching',
      prompt: 'Associe cada objeto à forma geométrica correspondente:',
      pairs: [
        { id: 'ap1', left: 'Lua Cheia', right: 'Círculo Perfeito' },
        { id: 'ap2', left: 'Fatia de Pizza', right: 'Triângulo' },
        { id: 'ap3', left: 'Capa do Livro', right: 'Retângulo' },
        { id: 'ap4', left: 'Dado de Jogo', right: 'Quadrado / Cubo' }
      ]
    },
    tasks: [
      {
        id: 'att_pair_t1',
        title: 'Formas Geométricas',
        difficulty: 'facil',
        type: 'pair_matching',
        prompt: 'Associe cada objeto do dia a dia à sua forma geométrica:',
        pairs: [
          { id: 'ap1', left: 'Lua Cheia', right: 'Círculo Perfeito' },
          { id: 'ap2', left: 'Fatia de Pizza', right: 'Triângulo' },
          { id: 'ap3', left: 'Capa do Livro', right: 'Retângulo' },
          { id: 'ap4', left: 'Dado de Jogo', right: 'Quadrado / Cubo' }
        ]
      },
      {
        id: 'att_pair_t2',
        title: 'Cores e Elementos',
        difficulty: 'medio',
        type: 'pair_matching',
        prompt: 'Conecte cada elemento da natureza ao seu som ou sensação:',
        pairs: [
          { id: 'ne1', left: 'Cachoeira', right: 'Água fresca corrente' },
          { id: 'ne2', left: 'Vento nas folhas', right: 'Farfalhar suave' },
          { id: 'ne3', left: 'Sol do meio-dia', right: 'Calor e brilho dourado' },
          { id: 'ne4', left: 'Estrelas da noite', right: 'Luzes distantes no céu escuro' }
        ]
      }
    ],
    offlineSuggestion: 'Olhe pela janela e tente achar 3 triângulos e 3 círculos na paisagem!'
  },

  // ==========================================
  // INTELIGÊNCIA EMOCIONAL
  // ==========================================
  {
    id: 'emo_01_all',
    title: 'Respiração da Flor e da Vela',
    description: 'Prática de respiração consciente, calma e equilíbrio interior.',
    objective: 'Promover autorregulação emocional através da respiração guiada.',
    area: 'emotional',
    ageGroup: '4-6',
    durationMinutes: 4,
    instructions: 'Inspire pelo nariz como se cheirasse uma flor e solte pela boca apagando uma velinha bem devagar.',
    spokenInstruction: 'Vamos respirar juntos. Puxe o ar bem fundo pelo nariz e solte devagarzinho.',
    content: {
      type: 'breathing',
      prompt: 'Siga a bolha de ar na tela: Inspire... Segure... Expire...',
      breathingCycles: 4
    },
    offlineSuggestion: 'Coloque as duas mãos sobre a barriga e sinta ela subir e descer enquanto respira fundo.'
  },
  {
    id: 'emo_02_7-9',
    title: 'Entendendo a Frustração e Paciência',
    description: 'Aprenda que errar faz parte de descobrir coisas novas!',
    objective: 'Fortalecer resiliência emocional e gentileza consigo mesmo.',
    area: 'emotional',
    ageGroup: '7-9',
    durationMinutes: 5,
    instructions: 'Reflita sobre reações saudáveis quando algo não sai como queríamos.',
    spokenInstruction: 'Quando um desafio parece difícil, o que podemos escolher fazer?',
    content: {
      type: 'choice',
      prompt: 'Você estava montando um quebra-cabeça difícil e não conseguiu encaixar a peça. Qual a atitude mais saudável?',
      options: [
        { id: 'em1', text: 'Respirar fundo, beber uma água e tentar de novo com calma', isCorrect: true },
        { id: 'em2', text: 'Jogar tudo para o alto e brigar com quem está perto', isCorrect: false },
        { id: 'em3', text: 'Pensar que nunca vai conseguir aprender nada', isCorrect: false }
      ]
    },
    tasks: [
      {
        id: 'emo_02_t1',
        title: 'Lidando com erros',
        difficulty: 'facil',
        type: 'choice',
        prompt: 'Você estava montando um quebra-cabeça difícil e a peça não encaixou. Qual atitude ajuda mais?',
        options: [
          { id: 'em1', text: 'Respirar fundo, descansar um pouco e tentar com outro ângulo', isCorrect: true },
          { id: 'em2', text: 'Jogar as peças no chão e gritar', isCorrect: false },
          { id: 'em3', text: 'Dizer que nunca vai conseguir nada', isCorrect: false }
        ]
      },
      {
        id: 'emo_02_t2',
        title: 'Cuidando do coração',
        difficulty: 'medio',
        type: 'choice',
        prompt: 'Quando sentimos o coração acelerado de nervoso antes de apresentar um trabalho, o que ajuda?',
        options: [
          { id: 'em2_1', text: 'Fazer 3 respirações lentas e lembrar que errar é normal', isCorrect: true },
          { id: 'em2_2', text: 'Esconder o rosto e não pedir ajuda a ninguém', isCorrect: false },
          { id: 'em2_3', text: 'Desistir antes mesmo de tentar', isCorrect: false }
        ]
      },
      {
        id: 'emo_02_t3',
        title: 'Esperando a vez',
        difficulty: 'dificil',
        type: 'choice',
        prompt: 'Você quer muito brincar no balanço, mas outra criança chegou antes. O que fazer?',
        options: [
          { id: 'em3_1', text: 'Esperar com educação ou propor alternar os turnos', isCorrect: true },
          { id: 'em3_2', text: 'Empurrar o colega do balanço', isCorrect: false },
          { id: 'em3_3', text: 'Ir embora chorando sem conversar', isCorrect: false }
        ]
      }
    ],
    offlineSuggestion: 'Lembre-se de algo que você achava difícil antigamente e hoje já consegue fazer com facilidade!'
  },
  {
    id: 'emo_03_10-12',
    title: 'Empatia e Resolução de Conflitos',
    description: 'Colocar-se no lugar do outro para construir amizade e respeito.',
    objective: 'Desenvolver inteligência social, comunicação não violenta e acolhimento.',
    area: 'emotional',
    ageGroup: '10-12',
    durationMinutes: 6,
    instructions: 'Analise cada situação escolar ou familiar e escolha a postura empática.',
    spokenInstruction: 'Como podemos agir com empatia e respeito nos momentos difíceis?',
    content: {
      type: 'choice',
      prompt: 'Um amigo seu tirou uma nota baixa e está chateado e quieto no recreio. O que demonstra verdadeira empatia?',
      options: [
        { id: 'emp1', text: 'Sentar ao lado dele, perguntar se quer conversar ou apenas companhia', isCorrect: true },
        { id: 'emp2', text: 'Dizer que ele deveria ter estudado mais e mudar de assunto', isCorrect: false },
        { id: 'emp3', text: 'Fazer piada sobre a prova na frente dos outros', isCorrect: false }
      ]
    },
    tasks: [
      {
        id: 'emo_03_t1',
        title: 'Acolhendo um amigo',
        difficulty: 'facil',
        type: 'choice',
        prompt: 'Um amigo tirou nota baixa e está chateado no recreio. O que demonstra verdadeira empatia?',
        options: [
          { id: 'emp1', text: 'Sentar ao lado dele, perguntar se quer conversar ou apenas fazer companhia', isCorrect: true },
          { id: 'emp2', text: 'Dizer que ele devia ter estudado mais e ir embora', isCorrect: false },
          { id: 'emp3', text: 'Fazer piada na frente da turma', isCorrect: false }
        ]
      },
      {
        id: 'emo_03_t2',
        title: 'Opiniões diferentes',
        difficulty: 'medio',
        type: 'choice',
        prompt: 'Dois amigos querem brincadeiras diferentes no mesmo grupo. Como resolver em paz?',
        options: [
          { id: 'emp2_1', text: 'Ouvir os dois lados e combinar o tempo de cada brincadeira', isCorrect: true },
          { id: 'emp2_2', text: 'Falar mais alto até todo mundo ceder', isCorrect: false },
          { id: 'emp2_3', text: 'Separar o grupo em brigas', isCorrect: false }
        ]
      }
    ],
    offlineSuggestion: 'Diga algo gentil e sincero para alguém da sua casa hoje!'
  },

  // ==========================================
  // COORDENAÇÃO MOTORA & CORPO EM MOVIMENTO
  // ==========================================
  {
    id: 'mot_01_4-6',
    title: 'Desafio do Flamingo e da Estátua',
    description: 'Equilíbrio corporal e postura divertida longe da tela!',
    objective: 'Estimular equilíbrio estático, coordenação global e consciência corporal.',
    area: 'motor',
    ageGroup: '4-6',
    durationMinutes: 5,
    instructions: 'Siga as missões de movimento no espaço livre da sua casa!',
    spokenInstruction: 'Hora de mexer o corpinho! Fique em pé e faça pose de flamingo!',
    content: {
      type: 'physical_action',
      prompt: 'Fique apoiado em um pé só por 5 segundos com os braços abertos como asas.',
      physicalInstruction: 'Equilibre-se no pé direito por 5 segundos, depois troque para o pé esquerdo!'
    },
    tasks: [
      {
        id: 'mot_01_t1',
        title: 'Equilíbrio de Flamingo',
        difficulty: 'facil',
        type: 'physical_action',
        prompt: 'Fique apoiado em um pé só por 5 segundos com os braços abertos!',
        physicalInstruction: 'Conte devagar até 5 no pé direito e depois conte até 5 no pé esquerdo.'
      },
      {
        id: 'mot_01_t2',
        title: 'Pulo do Canguru',
        difficulty: 'medio',
        type: 'physical_action',
        prompt: 'Dê 5 pulinhos com os dois pés juntos no mesmo lugar!',
        physicalInstruction: 'Agache um pouquinho e dê 5 saltos macios sem fazer barulho ao cair.'
      },
      {
        id: 'mot_01_t3',
        title: 'Estátua Sorriso',
        difficulty: 'dificil',
        type: 'physical_action',
        prompt: 'Gire devagar, pare de repente e congele feito uma estátua por 5 segundos!',
        physicalInstruction: 'Dê um passo largo, levante um braço para o alto e congele sem piscar o corpo!'
      }
    ],
    offlineSuggestion: 'Desenhe uma linha reta no chão com fita ou giz e caminhe um pé na frente do outro!'
  },
  {
    id: 'mot_02_7-9',
    title: 'Direções: Direita e Esquerda',
    description: 'Orientação espacial observando movimentos animados do personagem.',
    objective: 'Treinar lateralidade (direita e esquerda) com apoio visual vivo sem setas óbvias.',
    area: 'motor',
    ageGroup: '7-9',
    durationMinutes: 6,
    instructions: 'Observe atentamente para qual lado o personagem está apontando ou caminhando na cena!',
    spokenInstruction: 'Olhe com cuidado para o personagem no caminho e diga se ele foi para a direita ou para a esquerda!',
    content: {
      type: 'direction_tap',
      prompt: 'O Guardião está de frente para a trilha e levantou um braço acenando. Para que lado ele apontou?',
      characterPose: 'wave_right',
      options: [
        { id: 'dir1', text: 'DIREITA', isCorrect: true },
        { id: 'dir2', text: 'ESQUERDA', isCorrect: false },
        { id: 'dir3', text: 'EM CIMA', isCorrect: false },
        { id: 'dir4', text: 'PARA TRÁS', isCorrect: false }
      ]
    },
    tasks: [
      {
        id: 'mot_02_t1',
        title: 'Aceno no Caminho',
        difficulty: 'facil',
        type: 'direction_tap',
        characterPose: 'wave_right',
        prompt: 'Olhando para a trilha com o personagem, qual mão ele levantou para acenar?',
        options: [
          { id: 'dir1', text: 'DIREITA', isCorrect: true },
          { id: 'dir2', text: 'ESQUERDA', isCorrect: false },
          { id: 'dir3', text: 'EM CIMA', isCorrect: false },
          { id: 'dir4', text: 'PARA TRÁS', isCorrect: false }
        ]
      },
      {
        id: 'mot_02_t2',
        title: 'A Árvore Florida',
        difficulty: 'facil',
        type: 'direction_tap',
        characterPose: 'tree_left',
        prompt: 'Em que lado da trilha cresceu a árvore florida?',
        options: [
          { id: 'dir2_1', text: 'ESQUERDA', isCorrect: true },
          { id: 'dir2_2', text: 'DIREITA', isCorrect: false },
          { id: 'dir2_3', text: 'NO MEIO', isCorrect: false },
          { id: 'dir2_4', text: 'EMBAIXO', isCorrect: false }
        ]
      },
      {
        id: 'mot_02_t3',
        title: 'Passo Lateral na Trilha',
        difficulty: 'medio',
        type: 'direction_tap',
        characterPose: 'step_right',
        prompt: 'Para que lado o Guardião deu um passo animado em direção à placa colorida?',
        options: [
          { id: 'dir3_1', text: 'DIREITA', isCorrect: true },
          { id: 'dir3_2', text: 'ESQUERDA', isCorrect: false },
          { id: 'dir3_3', text: 'PARA CIMA', isCorrect: false },
          { id: 'dir3_4', text: 'PARA BAIXO', isCorrect: false }
        ]
      },
      {
        id: 'mot_02_t4',
        title: 'Aceno Esquerdo',
        difficulty: 'dificil',
        type: 'direction_tap',
        characterPose: 'wave_left',
        prompt: 'Agora o personagem mudou de ideia e acenou para o outro lado! Qual lado foi?',
        options: [
          { id: 'dir4_1', text: 'ESQUERDA', isCorrect: true },
          { id: 'dir4_2', text: 'DIREITA', isCorrect: false },
          { id: 'dir4_3', text: 'NO CENTRO', isCorrect: false },
          { id: 'dir4_4', text: 'PARA TRÁS', isCorrect: false }
        ]
      }
    ],
    offlineSuggestion: 'Toque sua orelha esquerda com a mão direita, depois troque tocando o ombro direito com a mão esquerda!'
  },
  {
    id: 'mot_03_10-12',
    title: 'Alongamento e Postura Ativa',
    description: 'Relaxamento dos ombros, punhos e coluna entre atividades.',
    objective: 'Promover ergonomia infantil, respiração postural e mobilidade leve.',
    area: 'motor',
    ageGroup: '10-12',
    durationMinutes: 5,
    instructions: 'Afaste os olhos da tela um instante e faça cada movimento com suavidade.',
    spokenInstruction: 'Vamos alongar os braços e cuidar da postura para sentir o corpo bem leve.',
    content: {
      type: 'physical_action',
      prompt: 'Estique os dois braços lá em cima como se quisesse alcançar as nuvens.',
      physicalInstruction: 'Faça 5 círculos suaves com os ombros para trás, depois 5 para frente.'
    },
    tasks: [
      {
        id: 'mot_03_t1',
        title: 'Alcançando as nuvens',
        difficulty: 'facil',
        type: 'physical_action',
        prompt: 'Fique de pé, respire fundo e estique os dois braços bem alto!',
        physicalInstruction: 'Mantenha os braços esticados por 6 segundos sentindo as costas crescerem.'
      },
      {
        id: 'mot_03_t2',
        title: 'Círculos nos ombros e punhos',
        difficulty: 'medio',
        type: 'physical_action',
        prompt: 'Solte a tensão das mãos e dos ombros com giros lentos.',
        physicalInstruction: 'Gire os ombros 5 vezes para trás e mexa os dedos das mãos como se tocasse piano!'
      }
    ],
    offlineSuggestion: 'Dê uma volta pela casa prestando atenção na coluna reta e beba um bom copo de água!'
  },
  {
    id: 'mot_draw_all',
    title: 'Traçado Fino no Papel Mágico',
    description: 'Pratique coordenação motora fina traçando figuras no Ateliê!',
    objective: 'Estimular firmeza no traço, controle visomotor e expressão livre.',
    area: 'motor',
    ageGroup: '4-6',
    durationMinutes: 6,
    instructions: 'Desenhe usando diferentes cores e ferramentas no Ateliê e salve sua obra!',
    spokenInstruction: 'Use o dedo ou o mouse para desenhar suas formas favoritas!',
    content: {
      type: 'drawing_canvas',
      prompt: 'Desenhe uma Flor no Jardim ou o que imaginar no nosso Ateliê:',
      drawingGuide: 'flor'
    },
    offlineSuggestion: 'Pegue lápis de cor e papel para desenhar seu Guardião favorito do Mundo Ajuda KIDS!'
  },

  // ==========================================
  // CRIATIVIDADE E ARTES (NOVA ÁREA!)
  // ==========================================
  {
    id: 'cre_01_all',
    title: 'Ateliê Criativo: Desenhe e Descubra!',
    description: 'Solte a imaginação desenhando no quadro artístico com reconhecimento inteligente!',
    objective: 'Explorar cores, carimbos geométricos e invenção visual com salvamento na Galeria.',
    area: 'creativity',
    ageGroup: '4-6',
    durationMinutes: 7,
    instructions: 'Escolha o giz, caneta, spray ou carimbos, faça sua obra e clique em Descobrir meu desenho!',
    spokenInstruction: 'Bem-vindo ao Ateliê da Flora! Desenhe algo maravilhoso e veja se eu consigo adivinhar!',
    content: {
      type: 'drawing_canvas',
      prompt: 'Desenhe um Sol Radiante, uma Casinha Feliz ou invente sua própria arte!',
      drawingGuide: 'sol'
    },
    offlineSuggestion: 'Depois de salvar aqui na Galeria, mostre seu desenho para alguém da sua família explicar o que você criou!'
  },
  {
    id: 'cre_02_7-9',
    title: 'Laboratório das Cores Mágicas',
    description: 'Descubra como as cores se misturam para formar tons incríveis!',
    objective: 'Compreender cores primárias, secundárias e combinações expressivas.',
    area: 'creativity',
    ageGroup: '7-9',
    durationMinutes: 5,
    instructions: 'Misture as tintas na mente e escolha o resultado correto!',
    spokenInstruction: 'A Flora adora misturar tintas! Qual cor nasce quando juntamos duas cores?',
    content: {
      type: 'choice',
      prompt: 'Misturando tinta AZUL com tinta AMARELA, qual nova cor aparece?',
      options: [
        { id: 'c1', text: 'Verde', isCorrect: true },
        { id: 'c2', text: 'Roxo', isCorrect: false },
        { id: 'c3', text: 'Laranja', isCorrect: false },
        { id: 'c4', text: 'Marrom', isCorrect: false }
      ]
    },
    tasks: [
      {
        id: 'cre_02_t1',
        title: 'Azul + Amarelo',
        difficulty: 'facil',
        type: 'choice',
        prompt: 'Misturando tinta AZUL com tinta AMARELA, qual nova cor aparece?',
        options: [
          { id: 'c1', text: 'Verde', isCorrect: true },
          { id: 'c2', text: 'Roxo', isCorrect: false },
          { id: 'c3', text: 'Laranja', isCorrect: false },
          { id: 'c4', text: 'Rosa', isCorrect: false }
        ]
      },
      {
        id: 'cre_02_t2',
        title: 'Vermelho + Amarelo',
        difficulty: 'medio',
        type: 'choice',
        prompt: 'Quando misturamos VERMELHO e AMARELO na paleta da Flora, formamos qual cor?',
        options: [
          { id: 'c2_1', text: 'Laranja vibrante', isCorrect: true },
          { id: 'c2_2', text: 'Azul marinho', isCorrect: false },
          { id: 'c2_3', text: 'Verde folha', isCorrect: false },
          { id: 'c2_4', text: 'Roxo escuro', isCorrect: false }
        ]
      },
      {
        id: 'cre_02_t3',
        title: 'Combinações da Natureza',
        difficulty: 'dificil',
        type: 'pair_matching',
        prompt: 'Ligue cada mistura às suas cores originais:',
        pairs: [
          { id: 'mix1', left: 'Azul + Vermelho', right: 'Roxo / Violeta' },
          { id: 'mix2', left: 'Vermelho + Branco', right: 'Rosa Suave' },
          { id: 'mix3', left: 'Amarelo + Azul', right: 'Verde Menta' }
        ]
      }
    ],
    offlineSuggestion: 'Com lápis de cor no papel, pinte bem clarinho com amarelo e passe azul por cima para ver o verde surgir!'
  },
  {
    id: 'cre_03_10-12',
    title: 'Oficina de Invenções e Ilustração',
    description: 'Imagine invenções criativas e dê vida às suas ideias no Ateliê!',
    objective: 'Estimular pensamento divergente, criação artística e narrativa visual.',
    area: 'creativity',
    ageGroup: '10-12',
    durationMinutes: 8,
    instructions: 'Responda aos desafios de criatividade e depois crie um foguete ou robô no Ateliê!',
    spokenInstruction: 'Todo grande artista e inventor começa com uma pergunta curiosa!',
    content: {
      type: 'choice',
      prompt: 'Se você quisesse criar uma mochila ecológica para caminhadas, qual ideia seria mais criativa?',
      options: [
        { id: 'inv1', text: 'Usar tecido reciclado com pequeno painel solar para lanterna', isCorrect: true },
        { id: 'inv2', text: 'Fazer a mochila pesada de pedra maciça', isCorrect: false },
        { id: 'inv3', text: 'Deixar a mochila sem alças para carregar', isCorrect: false }
      ]
    },
    tasks: [
      {
        id: 'cre_03_t1',
        title: 'Pensamento Criativo',
        difficulty: 'facil',
        type: 'choice',
        prompt: 'Qual material deixaria uma mochila de explorador mais criativa e sustentável?',
        options: [
          { id: 'inv1', text: 'Lona reciclada com pequeno carregador solar para lanterna', isCorrect: true },
          { id: 'inv2', text: 'Mochila feita de blocos pesados de cimento', isCorrect: false },
          { id: 'inv3', text: 'Mochila descartável de papel fino que rasga na chuva', isCorrect: false }
        ]
      },
      {
        id: 'cre_03_t2',
        title: 'Desenhe sua Invenção',
        difficulty: 'medio',
        type: 'drawing_canvas',
        prompt: 'Use o Ateliê para desenhar um Foguetinho Espacial ou um Robô Divertido!',
        drawingGuide: 'foguete'
      }
    ],
    offlineSuggestion: 'Pegue caixas ou rolinhos recicláveis em casa e construa um foguete ou porta-lápis criativo!'
  },

  // ==========================================
  // CONHECIMENTOS GERAIS E CURIOSIDADES (NOVA ÁREA!)
  // ==========================================
  {
    id: 'kno_01_all',
    title: 'Expedição ao Sistema Solar',
    description: 'Explore planetas, o Sol, a Lua e mistérios espaciais com o Guardião Kiko!',
    objective: 'Despertar curiosidade científica sobre astronomia e nosso planeta Terra.',
    area: 'knowledge',
    ageGroup: '4-6',
    durationMinutes: 6,
    instructions: 'Viaje de planeta em planeta respondendo às curiosidades do Kiko!',
    spokenInstruction: 'Prepare o capacete de astronauta! Vamos descobrir os segredos do Sistema Solar!',
    content: {
      type: 'choice',
      prompt: 'Qual é a grande estrela brilhante que aquece e ilumina o nosso planeta Terra todos os dias?',
      options: [
        { id: 'sol_ok', text: 'O Sol', isCorrect: true },
        { id: 'sol_2', text: 'A Lua', isCorrect: false },
        { id: 'sol_3', text: 'O Planeta Saturno', isCorrect: false },
        { id: 'sol_4', text: 'Um Cometa', isCorrect: false }
      ]
    },
    tasks: [
      {
        id: 'kno_01_t1',
        title: 'Nossa Estrela Central',
        difficulty: 'facil',
        type: 'choice',
        prompt: 'Qual é a grande estrela brilhante que aquece e ilumina a Terra todos os dias?',
        options: [
          { id: 'sol_ok', text: 'O Sol', isCorrect: true },
          { id: 'sol_2', text: 'A Lua', isCorrect: false },
          { id: 'sol_3', text: 'O Planeta Saturno', isCorrect: false },
          { id: 'sol_4', text: 'Um Asteróide', isCorrect: false }
        ]
      },
      {
        id: 'kno_01_t2',
        title: 'O Planeta dos Anéis',
        difficulty: 'medio',
        type: 'choice',
        prompt: 'Qual planeta famoso do Sistema Solar possui lindos anéis brilhantes de gelo e poeira ao seu redor?',
        options: [
          { id: 'sat_1', text: 'Saturno', isCorrect: true },
          { id: 'sat_2', text: 'Mercúrio', isCorrect: false },
          { id: 'sat_3', text: 'Vênus', isCorrect: false },
          { id: 'sat_4', text: 'Marte', isCorrect: false }
        ]
      },
      {
        id: 'kno_01_t3',
        title: 'Planeta Azul e Planeta Vermelho',
        difficulty: 'dificil',
        type: 'pair_matching',
        prompt: 'Conecte cada astro espacial à sua característica especial:',
        pairs: [
          { id: 'sp1', left: 'Planeta Terra', right: 'Planeta azul cheio de água e vida' },
          { id: 'sp2', left: 'Marte', right: 'Conhecido como planeta vermelho' },
          { id: 'sp3', left: 'Lua', right: 'Satélite natural que gira ao redor da Terra' }
        ]
      }
    ],
    offlineSuggestion: 'À noite, olhe para o céu com um adulto e tente encontrar as estrelas mais brilhantes ou a fase da Lua!'
  },
  {
    id: 'kno_02_7-9',
    title: 'Segredos da Natureza e da Água',
    description: 'Descubra os habitats dos animais e a viagem incrível das gotinhas de água.',
    objective: 'Compreender ecologia básica, ciclo da água e cuidado ambiental.',
    area: 'knowledge',
    ageGroup: '7-9',
    durationMinutes: 6,
    instructions: 'Investigue a natureza em 3 desafios: ciclo da água, habitats e proteção do planeta!',
    spokenInstruction: 'Como a chuva nasce nas nuvens e volta para os rios? Vamos descobrir com o Kiko!',
    content: {
      type: 'sequence',
      prompt: 'Coloque na ordem a viagem da água na natureza (Ciclo da Água):',
      sequence: [
        'O calor do sol aquece a água dos rios e mares',
        'O vapor sobe para o céu e forma nuvens macias',
        'As nuvens pesadas derramam gotinhas de chuva',
        'A água molha a terra e volta para os rios'
      ]
    },
    tasks: [
      {
        id: 'kno_02_t1',
        title: 'O Ciclo da Água',
        difficulty: 'facil',
        type: 'sequence',
        prompt: 'Coloque em ordem como acontece a viagem da água na natureza:',
        sequence: [
          'O calor do sol aquece a água dos rios e mares',
          'O vapor sobe para o céu e forma nuvens macias',
          'As nuvens pesadas derramam gotinhas de chuva',
          'A água molha a terra e volta para os rios'
        ]
      },
      {
        id: 'kno_02_t2',
        title: 'Animais e Seus Lares',
        difficulty: 'medio',
        type: 'pair_matching',
        prompt: 'Associe cada animalzinho ao habitat onde ele vive melhor:',
        pairs: [
          { id: 'hab1', left: 'Urso Polar', right: 'Regiões geladas do Ártico' },
          { id: 'hab2', left: 'Camelo', right: 'Desertos quentes e arenosos' },
          { id: 'hab3', left: 'Tucano', right: 'Florestas tropicais cheias de árvores' },
          { id: 'hab4', left: 'Golfinho', right: 'Oceanos e águas salgadas' }
        ]
      },
      {
        id: 'kno_02_t3',
        title: 'Economizando Água',
        difficulty: 'dificil',
        type: 'choice',
        prompt: 'Qual atitude simples dentro de casa ajuda muito a economizar água todos os dias?',
        options: [
          { id: 'wat1', text: 'Fechar a torneira enquanto escova os dentes', isCorrect: true },
          { id: 'wat2', text: 'Deixar a mangueira ligada na calçada sem usar', isCorrect: false },
          { id: 'wat3', text: 'Demorar uma hora no banho sem necessidade', isCorrect: false }
        ]
      }
    ],
    offlineSuggestion: 'Crie uma missão em casa para conferir se nenhuma torneira ficou pingando hoje!'
  },
  {
    id: 'kno_03_10-12',
    title: 'Profissões e Invenções Incríveis',
    description: 'Conheça cientistas, profissões essenciais e invenções que mudaram o mundo.',
    objective: 'Ampliar repertório cultural, cidadania e conhecimento histórico-científico.',
    area: 'knowledge',
    ageGroup: '10-12',
    durationMinutes: 6,
    instructions: 'Relacione descobertas, profissões e conhecimentos de história e geografia.',
    spokenInstruction: 'O mundo funciona graças ao trabalho de muitas pessoas curiosas. Vamos conhecê-las!',
    content: {
      type: 'pair_matching',
      prompt: 'Conecte cada profissional à sua importante missão na comunidade:',
      pairs: [
        { id: 'prof1', left: 'Astrônoma', right: 'Estuda estrelas, planetas e galáxias' },
        { id: 'prof2', left: 'Botânica', right: 'Pesquisa plantas, flores e florestas' },
        { id: 'prof3', left: 'Engenheiro Civil', right: 'Projeta pontes, escolas e edifícios seguros' },
        { id: 'prof4', left: 'Educadora', right: 'Guia estudantes na construção do saber' }
      ]
    },
    tasks: [
      {
        id: 'kno_03_t1',
        title: 'Profissões da Comunidade',
        difficulty: 'facil',
        type: 'pair_matching',
        prompt: 'Conecte cada profissional ao que ele faz de especial:',
        pairs: [
          { id: 'prof1', left: 'Astrônoma', right: 'Estuda estrelas, planetas e galáxias' },
          { id: 'prof2', left: 'Botânica', right: 'Pesquisa plantas, flores e florestas' },
          { id: 'prof3', left: 'Engenheiro Civil', right: 'Projeta pontes, escolas e edifícios seguros' },
          { id: 'prof4', left: 'Educadora', right: 'Guia estudantes na construção do saber' }
        ]
      },
      {
        id: 'kno_03_t2',
        title: 'História da Aviação',
        difficulty: 'medio',
        type: 'choice',
        prompt: 'Qual famoso inventor brasileiro encantou Paris em 1906 voando com o 14-Bis?',
        options: [
          { id: 'inv_b1', text: 'Alberto Santos-Dumont', isCorrect: true },
          { id: 'inv_b2', text: 'Isaac Newton', isCorrect: false },
          { id: 'inv_b3', text: 'Galileu Galilei', isCorrect: false }
        ]
      },
      {
        id: 'kno_03_t3',
        title: 'Energia Limpa',
        difficulty: 'dificil',
        type: 'choice',
        prompt: 'Qual fonte de energia utiliza diretamente a luz do Sol para gerar eletricidade sem poluir?',
        options: [
          { id: 'en_1', text: 'Energia Solar Fotovoltaica', isCorrect: true },
          { id: 'en_2', text: 'Queima de carvão mineral', isCorrect: false },
          { id: 'en_3', text: 'Pilhas descartáveis jogadas no lixo', isCorrect: false }
        ]
      }
    ],
    offlineSuggestion: 'Pergunte a um familiar qual era a profissão que ele ou ela mais admirava quando criança!'
  },

  // ==========================================
  // MATEMÁTICA LÚDICA (Vila da Matemática - Beto)
  // ==========================================
  {
    id: 'math_01_4-6',
    title: 'Contando Estrelinhas e Frutas',
    description: 'Conte elementos concretos na tela e descubra pequenas somas com o Guardião Beto.',
    objective: 'Desenvolver senso numérico, correspondência um-a-um e adição inicial com apoio visual.',
    area: 'math',
    ageGroup: '4-6',
    durationMinutes: 6,
    instructions: 'Conte com o dedinho e use os botões de + e - ou os números abaixo para responder!',
    spokenInstruction: 'Vamos contar quantas estrelinhas e maçãs existem com o Beto!',
    content: {
      type: 'visual_math',
      prompt: 'Conte quantas estrelinhas brilhantes aparecem no quadro:',
      mathVisual: {
        emoji: '⭐',
        leftCount: 5,
        operator: '=',
        targetAnswer: 5,
        unitLabel: 'estrelinhas'
      }
    },
    tasks: [
      {
        id: 'math_01_t1',
        title: 'Contagem de Estrelinhas',
        difficulty: 'facil',
        type: 'visual_math',
        prompt: 'Conte com calma: quantas estrelinhas douradas aparecem no grupo?',
        mathVisual: {
          emoji: '⭐',
          leftCount: 5,
          operator: '=',
          targetAnswer: 5,
          unitLabel: 'estrelinhas'
        }
      },
      {
        id: 'math_01_t2',
        title: 'Cesta de Maçãs',
        difficulty: 'medio',
        type: 'visual_math',
        prompt: 'Junte as 3 maçãs da esquerda com as 2 maçãs da direita. Quantas ficam no total?',
        mathVisual: {
          emoji: '🍎',
          leftCount: 3,
          operator: '+',
          rightCount: 2,
          targetAnswer: 5,
          unitLabel: 'maçãs'
        }
      },
      {
        id: 'math_01_t3',
        title: 'Qual Vem Depois?',
        difficulty: 'dificil',
        type: 'choice',
        prompt: 'Contando na sequência: 5, 6, 7... Qual número vem logo depois do 7?',
        options: [
          { id: 'm1_t3_o1', text: 'Número 8', isCorrect: true },
          { id: 'm1_t3_o2', text: 'Número 6', isCorrect: false },
          { id: 'm1_t3_o3', text: 'Número 10', isCorrect: false },
          { id: 'm1_t3_o4', text: 'Número 4', isCorrect: false }
        ]
      }
    ],
    offlineSuggestion: 'Conte quantos pares de sapato ou quantos copos coloridos existem na mesa do lanche!'
  },
  {
    id: 'math_02_7-9',
    title: 'Desafio da Soma e Troco',
    description: 'Pratique adições e subtrações visuais em missões divertidas de feira e figurinhas.',
    objective: 'Consolidar cálculo mental básico de adição e subtração com quantidades até 20.',
    area: 'math',
    ageGroup: '7-9',
    durationMinutes: 7,
    instructions: 'Observe as figuras, faça a conta e selecione ou ajuste o resultado exato!',
    spokenInstruction: 'Hora de somar, subtrair e ligar resultados certinhos!',
    content: {
      type: 'visual_math',
      prompt: 'Você ganhou 6 balas e depois ganhou mais 5. Quantas balas tem agora?',
      mathVisual: {
        emoji: '🍬',
        leftCount: 6,
        operator: '+',
        rightCount: 5,
        targetAnswer: 11,
        unitLabel: 'balas'
      }
    },
    tasks: [
      {
        id: 'math_02_t1',
        title: 'Somando Balas',
        difficulty: 'facil',
        type: 'visual_math',
        prompt: 'Some os dois grupos: 6 balas + 5 balas dá quanto?',
        mathVisual: {
          emoji: '🍬',
          leftCount: 6,
          operator: '+',
          rightCount: 5,
          targetAnswer: 11,
          unitLabel: 'balas'
        }
      },
      {
        id: 'math_02_t2',
        title: 'Trocando Figurinhas',
        difficulty: 'medio',
        type: 'visual_math',
        prompt: 'Você tinha 9 figurinhas e trocou 4 repetidas com um amigo. Com quantas ficou?',
        mathVisual: {
          emoji: '🃏',
          leftCount: 9,
          operator: '-',
          rightCount: 4,
          targetAnswer: 5,
          unitLabel: 'figurinhas'
        }
      },
      {
        id: 'math_02_t3',
        title: 'Tabuleiro das Contas',
        difficulty: 'dificil',
        type: 'pair_matching',
        prompt: 'Ligue cada operação ao seu resultado correto:',
        pairs: [
          { id: 'm2_p1', left: '7 + 5', right: '12' },
          { id: 'm2_p2', left: '10 + 8', right: '18' },
          { id: 'm2_p3', left: '15 - 6', right: '9' }
        ]
      }
    ],
    offlineSuggestion: 'Simule uma feirinha em casa com brinquedos e etiquetas de papel usando números de 1 a 20!'
  },
  {
    id: 'math_03_7-9',
    title: 'Formas, Dobro e Multiplicação',
    description: 'Descubra como grupos iguais facilitam contar rápido e explore figuras geométricas.',
    objective: 'Introduzir multiplicação como soma de parcelas iguais e propriedades de polígonos.',
    area: 'math',
    ageGroup: '7-9',
    durationMinutes: 8,
    instructions: 'Multiplique grupos iguais, complete padrões numéricos e reconheça formas!',
    spokenInstruction: 'Com o Beto você vai dominar o dobro e as formas mágicas!',
    content: {
      type: 'visual_math',
      prompt: 'Um jardim tem 2 canteiros iguais, cada um com 4 flores. Quantas flores há no total?',
      mathVisual: {
        emoji: '🌸',
        leftCount: 4,
        operator: '×',
        rightCount: 2,
        targetAnswer: 8,
        unitLabel: 'flores'
      }
    },
    tasks: [
      {
        id: 'math_03_t1',
        title: 'O Dobro no Jardim',
        difficulty: 'facil',
        type: 'visual_math',
        prompt: 'Quantas flores existem em 2 grupos iguais de 4 flores (4 × 2)?',
        mathVisual: {
          emoji: '🌸',
          leftCount: 4,
          operator: '×',
          rightCount: 2,
          targetAnswer: 8,
          unitLabel: 'flores'
        }
      },
      {
        id: 'math_03_t2',
        title: 'Trilha de 2 em 2',
        difficulty: 'medio',
        type: 'pattern_complete',
        prompt: 'Descubra o próximo número da sequência: 2️⃣ ➡️ 4️⃣ ➡️ 6️⃣ ➡️ ?',
        options: [
          { id: 'm3_t2_o1', text: '8️⃣ (oito)', isCorrect: true },
          { id: 'm3_t2_o2', text: '7️⃣ (sete)', isCorrect: false },
          { id: 'm3_t2_o3', text: '9️⃣ (nove)', isCorrect: false },
          { id: 'm3_t2_o4', text: '🔟 (dez)', isCorrect: false }
        ]
      },
      {
        id: 'math_03_t3',
        title: 'Geometria dos Favos',
        difficulty: 'dificil',
        type: 'choice',
        prompt: 'Os favos das abelhas têm formato de hexágono. Quantos lados tem um hexágono?',
        options: [
          { id: 'm3_t3_o1', text: '6 lados iguais', isCorrect: true },
          { id: 'm3_t3_o2', text: '4 lados iguais', isCorrect: false },
          { id: 'm3_t3_o3', text: '3 lados iguais', isCorrect: false },
          { id: 'm3_t3_o4', text: '8 lados iguais', isCorrect: false }
        ]
      }
    ],
    offlineSuggestion: 'Procure objetos em casa em formato de círculo, triângulo e retângulo com um adulto!'
  },
  {
    id: 'math_04_10-12',
    title: 'Frações, Medidas e Enigmas Numéricos',
    description: 'Resolva multiplicações visuais, converta medidas e calcule horários com precisão.',
    objective: 'Aplicar multiplicação, frações cotidianas e leitura de tempo em problemas reais.',
    area: 'math',
    ageGroup: '10-12',
    durationMinutes: 9,
    instructions: 'Leia cada desafio com atenção e use a lógica matemática para vencer todas as etapas!',
    spokenInstruction: 'Missão avançada de lógica numérica na Vila da Matemática!',
    content: {
      type: 'visual_math',
      prompt: 'Uma estante tem 3 prateleiras iguais com 4 livros cada. Quantos livros há?',
      mathVisual: {
        emoji: '📘',
        leftCount: 4,
        operator: '×',
        rightCount: 3,
        targetAnswer: 12,
        unitLabel: 'livros'
      }
    },
    tasks: [
      {
        id: 'math_04_t1',
        title: 'Organizando a Biblioteca',
        difficulty: 'facil',
        type: 'visual_math',
        prompt: 'São 3 prateleiras iguais, cada uma com 4 livros (4 × 3). Quantos livros ao todo?',
        mathVisual: {
          emoji: '📘',
          leftCount: 4,
          operator: '×',
          rightCount: 3,
          targetAnswer: 12,
          unitLabel: 'livros'
        }
      },
      {
        id: 'math_04_t2',
        title: 'Equivalências e Frações',
        difficulty: 'medio',
        type: 'pair_matching',
        prompt: 'Conecte cada medida ou fração à sua equivalência exata:',
        pairs: [
          { id: 'm4_p1', left: 'Metade (1/2) de 1 hora', right: '30 minutos' },
          { id: 'm4_p2', left: '1/2 de uma pizza de 8 fatias', right: '4 fatias' },
          { id: 'm4_p3', left: '1 quilômetro', right: '1.000 metros' }
        ]
      },
      {
        id: 'math_04_t3',
        title: 'Desafio do Relógio',
        difficulty: 'dificil',
        type: 'choice',
        prompt: 'Uma partida começou às 14h20 e durou exatamente 45 minutos. A que horas terminou?',
        options: [
          { id: 'm4_t3_o1', text: '15h05', isCorrect: true },
          { id: 'm4_t3_o2', text: '14h55', isCorrect: false },
          { id: 'm4_t3_o3', text: '15h15', isCorrect: false },
          { id: 'm4_t3_o4', text: '15h00', isCorrect: false }
        ]
      }
    ],
    offlineSuggestion: 'Ajude a medir os ingredientes de uma receita usando xícaras (1/2, 1/4) ou colheres!'
  },

  // ==========================================
  // MÚSICA & RITMO (Palco da Música & Ritmo - Tom)
  // ==========================================
  {
    id: 'mus_01_4-6',
    title: 'Notas Coloridas e Eco Musical',
    description: 'Ouça as notinhas tocadas pelo Guardião Tom e repita as melodias nos sinos coloridos!',
    objective: 'Estimular percepção auditiva, memória sequencial de curto prazo e senso rítmico.',
    area: 'music',
    ageGroup: '4-6',
    durationMinutes: 6,
    instructions: 'Clique em "Ouvir Melodia", acompanhe as cores e toque as notas na mesma ordem!',
    spokenInstruction: 'Escute os sininhos coloridos do Tom e repita a música!',
    content: {
      type: 'rhythm_echo',
      prompt: 'Escute as 3 notinhas mágicas e repita a sequência: Dó, Ré, Mi!',
      rhythmNotes: [
        { id: 'do', label: 'Dó', freq: 261.63, color: '#EF4444' },
        { id: 're', label: 'Ré', freq: 293.66, color: '#F59E0B' },
        { id: 'mi', label: 'Mi', freq: 329.63, color: '#10B981' },
        { id: 'sol', label: 'Sol', freq: 392.0, color: '#3B82F6' }
      ],
      rhythmTargetIds: ['do', 're', 'mi']
    },
    tasks: [
      {
        id: 'mus_01_t1',
        title: 'Escadinha Dó-Ré-Mi',
        difficulty: 'facil',
        type: 'rhythm_echo',
        prompt: 'Clique em "Ouvir Melodia" e repita a subida musical: Dó ➡️ Ré ➡️ Mi!',
        rhythmNotes: [
          { id: 'do', label: 'Dó', freq: 261.63, color: '#EF4444' },
          { id: 're', label: 'Ré', freq: 293.66, color: '#F59E0B' },
          { id: 'mi', label: 'Mi', freq: 329.63, color: '#10B981' },
          { id: 'sol', label: 'Sol', freq: 392.0, color: '#3B82F6' }
        ],
        rhythmTargetIds: ['do', 're', 'mi']
      },
      {
        id: 'mus_01_t2',
        title: 'Pulinhos Melódicos',
        difficulty: 'medio',
        type: 'rhythm_echo',
        prompt: 'Agora com 4 notinhas! Escute e toque na ordem: Mi ➡️ Dó ➡️ Sol ➡️ Dó!',
        rhythmNotes: [
          { id: 'do', label: 'Dó', freq: 261.63, color: '#EF4444' },
          { id: 're', label: 'Ré', freq: 293.66, color: '#F59E0B' },
          { id: 'mi', label: 'Mi', freq: 329.63, color: '#10B981' },
          { id: 'sol', label: 'Sol', freq: 392.0, color: '#3B82F6' }
        ],
        rhythmTargetIds: ['mi', 'do', 'sol', 'do']
      },
      {
        id: 'mus_01_t3',
        title: 'Som Grave ou Agudo?',
        difficulty: 'dificil',
        type: 'choice',
        prompt: 'Qual desses sons é bem AGUDO (fininho e alto)?',
        options: [
          { id: 'mu1_o1', text: '🐦 Canto de um passarinho pequeno', isCorrect: true },
          { id: 'mu1_o2', text: '🥁 Batida de um tambor bem grande', isCorrect: false },
          { id: 'mu1_o3', text: '⛈️ Trovão forte no céu', isCorrect: false },
          { id: 'mu1_o4', text: '🦁 Rugido grave de um leão', isCorrect: false }
        ]
      }
    ],
    offlineSuggestion: 'Crie uma brincadeira de palmas: um adulto bate 3 palmas diferentes (lento/rápido) e a criança repete!'
  },
  {
    id: 'mus_02_7-9',
    title: 'Famílias dos Instrumentos & Ritmo',
    description: 'Combine eco melódico com as famílias sonoras de cordas, sopro e percussão.',
    objective: 'Identificar famílias instrumentais, alturas musicais e reprodução melódica.',
    area: 'music',
    ageGroup: '7-9',
    durationMinutes: 8,
    instructions: 'Toque a sequência correta e classifique os instrumentos da orquestra!',
    spokenInstruction: 'Vamos ensaiar com a banda mágica do Palco da Música!',
    content: {
      type: 'rhythm_echo',
      prompt: 'Repita o acorde arpejado da banda: Dó ➡️ Mi ➡️ Sol ➡️ Mi!',
      rhythmNotes: [
        { id: 'do', label: 'Dó', freq: 261.63, color: '#EF4444' },
        { id: 're', label: 'Ré', freq: 293.66, color: '#F59E0B' },
        { id: 'mi', label: 'Mi', freq: 329.63, color: '#10B981' },
        { id: 'sol', label: 'Sol', freq: 392.0, color: '#3B82F6' }
      ],
      rhythmTargetIds: ['do', 'mi', 'sol', 'mi']
    },
    tasks: [
      {
        id: 'mus_02_t1',
        title: 'Ensaio da Banda',
        difficulty: 'facil',
        type: 'rhythm_echo',
        prompt: 'Ouça o aquecimento e repita exatamente: Dó ➡️ Mi ➡️ Sol ➡️ Mi!',
        rhythmNotes: [
          { id: 'do', label: 'Dó', freq: 261.63, color: '#EF4444' },
          { id: 're', label: 'Ré', freq: 293.66, color: '#F59E0B' },
          { id: 'mi', label: 'Mi', freq: 329.63, color: '#10B981' },
          { id: 'sol', label: 'Sol', freq: 392.0, color: '#3B82F6' }
        ],
        rhythmTargetIds: ['do', 'mi', 'sol', 'mi']
      },
      {
        id: 'mus_02_t2',
        title: 'Famílias da Orquestra',
        difficulty: 'medio',
        type: 'pair_matching',
        prompt: 'Ligue cada instrumento musical à sua família sonora:',
        pairs: [
          { id: 'mu2_p1', left: '🎸 Violão', right: 'Cordas' },
          { id: 'mu2_p2', left: '🪈 Flauta Doce', right: 'Sopro' },
          { id: 'mu2_p3', left: '🥁 Bateria / Pandeiro', right: 'Percussão' }
        ]
      },
      {
        id: 'mus_02_t3',
        title: 'Ordem da Escala',
        difficulty: 'dificil',
        type: 'sequence',
        prompt: 'Ordene estas notas da mais GRAVE (embaixo) até a mais AGUDA (em cima):',
        sequence: [
          '1️⃣ Dó (mais grave)',
          '2️⃣ Ré',
          '3️⃣ Mi',
          '4️⃣ Sol (mais aguda)'
        ]
      }
    ],
    offlineSuggestion: 'Bata suavemente em uma colher de madeira e em um copo plástico vazio para comparar timbres!'
  },
  {
    id: 'mus_03_10-12',
    title: 'Maestro das Melodias e Tempos',
    description: 'Desafios avançados de memória melódica com 5 a 6 notas e teoria rítmica básica.',
    objective: 'Aprimorar memória auditiva longa e reconhecer conceitos de andamento musical.',
    area: 'music',
    ageGroup: '10-12',
    durationMinutes: 9,
    instructions: 'Concentre-se na sequência completa e execute como um verdadeiro maestro!',
    spokenInstruction: 'Desafio do Maestro Tom: memórias longas de ritmo e melodia!',
    content: {
      type: 'rhythm_echo',
      prompt: 'Escute a frase de 5 notas e repita com precisão!',
      rhythmNotes: [
        { id: 'do', label: 'Dó', freq: 261.63, color: '#EF4444' },
        { id: 're', label: 'Ré', freq: 293.66, color: '#F59E0B' },
        { id: 'mi', label: 'Mi', freq: 329.63, color: '#10B981' },
        { id: 'sol', label: 'Sol', freq: 392.0, color: '#3B82F6' }
      ],
      rhythmTargetIds: ['sol', 'mi', 're', 'do', 'sol']
    },
    tasks: [
      {
        id: 'mus_03_t1',
        title: 'Frase do Maestro (5 Notas)',
        difficulty: 'facil',
        type: 'rhythm_echo',
        prompt: 'Ouça o padrão descendente e repita: Sol ➡️ Mi ➡️ Ré ➡️ Dó ➡️ Sol!',
        rhythmNotes: [
          { id: 'do', label: 'Dó', freq: 261.63, color: '#EF4444' },
          { id: 're', label: 'Ré', freq: 293.66, color: '#F59E0B' },
          { id: 'mi', label: 'Mi', freq: 329.63, color: '#10B981' },
          { id: 'sol', label: 'Sol', freq: 392.0, color: '#3B82F6' }
        ],
        rhythmTargetIds: ['sol', 'mi', 're', 'do', 'sol']
      },
      {
        id: 'mus_03_t2',
        title: 'Grande Sinfonia (6 Notas)',
        difficulty: 'medio',
        type: 'rhythm_echo',
        prompt: 'Agora são 6 notas incluindo o Lá! Repita: Dó ➡️ Mi ➡️ Sol ➡️ Lá ➡️ Sol ➡️ Mi!',
        rhythmNotes: [
          { id: 'do', label: 'Dó', freq: 261.63, color: '#EF4444' },
          { id: 'mi', label: 'Mi', freq: 329.63, color: '#10B981' },
          { id: 'sol', label: 'Sol', freq: 392.0, color: '#3B82F6' },
          { id: 'la', label: 'Lá', freq: 440.0, color: '#8B5CF6' }
        ],
        rhythmTargetIds: ['do', 'mi', 'sol', 'la', 'sol', 'mi']
      },
      {
        id: 'mus_03_t3',
        title: 'O Que é Andamento?',
        difficulty: 'dificil',
        type: 'choice',
        prompt: 'Na música, o que indica se uma canção deve ser tocada mais devagar ou mais rápido?',
        options: [
          { id: 'mu3_o1', text: 'O andamento (velocidade da pulsação)', isCorrect: true },
          { id: 'mu3_o2', text: 'A cor brilhante do instrumento', isCorrect: false },
          { id: 'mu3_o3', text: 'O nome da cidade da banda', isCorrect: false },
          { id: 'mu3_o4', text: 'O tamanho da caixa de som', isCorrect: false }
        ]
      }
    ],
    offlineSuggestion: 'Escolha uma música favorita da família e tentem marcar a pulsação (tempo 1-2-3-4) batendo na perna!'
  },

  // ==========================================
  // INGLÊS & IDIOMAS (Ponte dos Idiomas - Bella)
  // ==========================================
  {
    id: 'lang_01_4-6',
    title: 'Colors & Animals em Inglês',
    description: 'Descubra bichinhos e cores em inglês brincando na Ponte dos Idiomas com a Bella!',
    objective: 'Apresentar vocabulário inicial lúdico em inglês (animais e cores básicas).',
    area: 'languages',
    ageGroup: '4-6',
    durationMinutes: 6,
    instructions: 'Conecte os nomes dos bichinhos, monte a palavra CAT e escolha a cor certa!',
    spokenInstruction: 'Hello! Vamos aprender cores e bichinhos em inglês com a Bella!',
    content: {
      type: 'pair_matching',
      prompt: 'Ligue cada bichinho ou elemento em inglês ao seu significado em português:',
      pairs: [
        { id: 'la1_p1', left: '🐱 Cat', right: 'Gato' },
        { id: 'la1_p2', left: '🐶 Dog', right: 'Cachorro' },
        { id: 'la1_p3', left: '☀️ Sun', right: 'Sol' }
      ]
    },
    tasks: [
      {
        id: 'lang_01_t1',
        title: 'Bichinhos Amigos',
        difficulty: 'facil',
        type: 'pair_matching',
        prompt: 'Conecte cada palavra em inglês ao seu par em português:',
        pairs: [
          { id: 'la1_p1', left: '🐱 Cat', right: 'Gato' },
          { id: 'la1_p2', left: '🐶 Dog', right: 'Cachorro' },
          { id: 'la1_p3', left: '☀️ Sun', right: 'Sol' }
        ]
      },
      {
        id: 'lang_01_t2',
        title: 'Escrevendo CAT',
        difficulty: 'medio',
        type: 'word_build',
        prompt: 'Toque nas letrinhas na ordem certa para escrever GATO em inglês (CAT):',
        wordParts: ['T', 'C', 'A'],
        targetWord: 'CAT'
      },
      {
        id: 'lang_01_t3',
        title: 'Cores do Arco-Íris',
        difficulty: 'dificil',
        type: 'choice',
        prompt: 'Qual palavra em inglês significa a cor AZUL (cor do céu)?',
        options: [
          { id: 'la1_o1', text: 'Blue', isCorrect: true },
          { id: 'la1_o2', text: 'Red', isCorrect: false },
          { id: 'la1_o3', text: 'Yellow', isCorrect: false },
          { id: 'la1_o4', text: 'Green', isCorrect: false }
        ]
      }
    ],
    offlineSuggestion: 'Aponte 3 objetos azuis e amarelos no quarto dizendo "Blue!" e "Yellow!" bem animado!'
  },
  {
    id: 'lang_02_7-9',
    title: 'Saudações & Dia a Dia no Exterior',
    description: 'Aprenda cumprimentos gentis em inglês para fazer amizades pelo mundo!',
    objective: 'Fixar expressões de cortesia e vocabulário essencial de saudação em inglês.',
    area: 'languages',
    ageGroup: '7-9',
    durationMinutes: 7,
    instructions: 'Combine as saudações, monte HELLO e ajude na pequena história bilíngue!',
    spokenInstruction: 'Good morning! Vamos praticar saudações e gentileza em inglês!',
    content: {
      type: 'pair_matching',
      prompt: 'Ligue cada expressão gentil em inglês à sua tradução:',
      pairs: [
        { id: 'la2_p1', left: 'Good morning', right: 'Bom dia' },
        { id: 'la2_p2', left: 'Thank you', right: 'Obrigado(a)' },
        { id: 'la2_p3', left: 'Please', right: 'Por favor' }
      ]
    },
    tasks: [
      {
        id: 'lang_02_t1',
        title: 'Palavras Mágicas em Inglês',
        difficulty: 'facil',
        type: 'pair_matching',
        prompt: 'Conecte cada expressão em inglês ao seu significado:',
        pairs: [
          { id: 'la2_p1', left: 'Good morning', right: 'Bom dia' },
          { id: 'la2_p2', left: 'Thank you', right: 'Obrigado(a)' },
          { id: 'la2_p3', left: 'Please', right: 'Por favor' }
        ]
      },
      {
        id: 'lang_02_t2',
        title: 'Dizendo Olá!',
        difficulty: 'medio',
        type: 'word_build',
        prompt: 'Ordene as letras para montar a saudação OLÁ em inglês (HELLO):',
        wordParts: ['L', 'H', 'O', 'E', 'L'],
        targetWord: 'HELLO'
      },
      {
        id: 'lang_02_t3',
        title: 'História no Café',
        difficulty: 'dificil',
        type: 'story_quiz',
        prompt: 'Qual palavra gentil o Leo usou no final para pedir água com educação?',
        storyText: 'Em uma viagem com sua família, Leo estava com sede e pediu ao atendente sorrindo: "Water, please!" Depois de receber o copo, disse "Thank you!"',
        options: [
          { id: 'la2_o1', text: 'Please (Por favor)', isCorrect: true },
          { id: 'la2_o2', text: 'Goodbye (Tchau)', isCorrect: false },
          { id: 'la2_o3', text: 'Blue (Azul)', isCorrect: false },
          { id: 'la2_o4', text: 'Apple (Maçã)', isCorrect: false }
        ]
      }
    ],
    offlineSuggestion: 'Hoje na hora do café da manhã ou jantar, experimentem dizer "Please" e "Thank you" em família!'
  },
  {
    id: 'lang_03_10-12',
    title: 'Missão Bilíngue: Viagem & Expressões',
    description: 'Amplie seu vocabulário de lugares, estudos e diálogos reais de viagem em inglês.',
    objective: 'Desenvolver compreensão leitora simples em inglês e vocabulário de locais e convivência.',
    area: 'languages',
    ageGroup: '10-12',
    durationMinutes: 9,
    instructions: 'Associe lugares de viagem, monte WORLD e interprete o diálogo da Bella!',
    spokenInstruction: 'Welcome aboard! Hora de viajar pela Ponte dos Idiomas!',
    content: {
      type: 'pair_matching',
      prompt: 'Ligue os locais e itens de viagem em inglês ao português:',
      pairs: [
        { id: 'la3_p1', left: 'Airport', right: 'Aeroporto' },
        { id: 'la3_p2', left: 'Library', right: 'Biblioteca' },
        { id: 'la3_p3', left: 'Backpack', right: 'Mochila' },
        { id: 'la3_p4', left: 'Friend', right: 'Amigo(a)' }
      ]
    },
    tasks: [
      {
        id: 'lang_03_t1',
        title: 'Vocabulário de Viagem',
        difficulty: 'facil',
        type: 'pair_matching',
        prompt: 'Conecte cada palavra em inglês à tradução correta:',
        pairs: [
          { id: 'la3_p1', left: 'Airport', right: 'Aeroporto' },
          { id: 'la3_p2', left: 'Library', right: 'Biblioteca' },
          { id: 'la3_p3', left: 'Backpack', right: 'Mochila' },
          { id: 'la3_p4', left: 'Friend', right: 'Amigo(a)' }
        ]
      },
      {
        id: 'lang_03_t2',
        title: 'Construindo WORLD',
        difficulty: 'medio',
        type: 'word_build',
        prompt: 'Organize as letras para formar MUNDO em inglês (WORLD):',
        wordParts: ['D', 'W', 'L', 'O', 'R'],
        targetWord: 'WORLD'
      },
      {
        id: 'lang_03_t3',
        title: 'Recebendo um Novo Colega',
        difficulty: 'dificil',
        type: 'story_quiz',
        prompt: 'O que significa a frase que a Bella disse ao novo estudante?',
        storyText: 'Na escola chegou um aluno intercambista chamado Sam. Bella se aproximou estendendo a mão e disse: "Hi Sam! I am Bella. Nice to meet you!"',
        options: [
          { id: 'la3_o1', text: 'Prazer em conhecer você!', isCorrect: true },
          { id: 'la3_o2', text: 'Onde fica o aeroporto?', isCorrect: false },
          { id: 'la3_o3', text: 'Que horas são agora?', isCorrect: false },
          { id: 'la3_o4', text: 'Até a semana que vem!', isCorrect: false }
        ]
      }
    ],
    offlineSuggestion: 'Escolha 5 objetos no seu estudo (caderno, caneta, mesa, mochila, livro) e escreva seus nomes em inglês em post-its!'
  }
];

export function getActivitiesForChild(ageGroup: AgeGroup, targetSkills: SkillArea[]): ActivityItem[] {
  const matching = ACTIVITIES_DATABASE.filter(
    (item) => item.ageGroup === ageGroup || item.id.includes('all')
  );
  if (!targetSkills || targetSkills.length === 0) return matching;

  return [...matching].sort((a, b) => {
    const aPri = targetSkills.includes(a.area) ? 0 : 1;
    const bPri = targetSkills.includes(b.area) ? 0 : 1;
    return aPri - bPri;
  });
}
