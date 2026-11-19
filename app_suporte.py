import http.server
import socketserver
import json
import time
import webbrowser
import threading
import urllib.parse
import re

PORT = 5050

import unicodedata

# ==========================================
# SIMULADOR DE INTELIGÊNCIA ARTIFICIAL AVANÇADO
# ==========================================
def remover_acentos(texto):
    return ''.join(c for c in unicodedata.normalize('NFD', texto) if unicodedata.category(c) != 'Mn').lower()

def simular_resposta_ia(mensagem):
    msg = remover_acentos(mensagem)
    time.sleep(1.2) # Tempo de "digitação"
    
    # 1. PROBLEMAS DE REDE E INTERNET
    if any(p in msg for p in ["internet", "rede", "wifi", "wi-fi", "conexao", "offline", "caiu", "caindo", "sem sinal"]):
        return ("Vejo que você está com problemas de conexão. Vamos fazer o seguinte teste:\n"
                "1. O ícone de rede no canto da tela tem um triângulo amarelo ou um globo cortado?\n"
                "2. Tente reiniciar o seu modem/roteador.\n"
                "Se estiver no escritório, por favor me informe o número da sua baia para eu verificar o switch local.")
                
    # 2. PROBLEMAS DE SENHA E ACESSO
    elif any(p in msg for p in ["senha", "acesso", "login", "entrar", "bloqueado", "esqueci", "nao entra"]):
        return ("Entendi, problema de acesso. Para garantir a segurança dos dados da empresa, o reset de senhas é automatizado.\n"
                "Acesse o portal 'meuacesso.empresa.com' e clique em 'Esqueci Minha Senha'. Você precisará do seu celular cadastrado para receber o token SMS.\n"
                "Conseguiu receber o código no seu celular?")
                
    # 3. PROBLEMAS DE LENTIDÃO / TRAVAMENTO / HARDWARE
    elif any(p in msg for p in ["lento", "travando", "computador", "pc", "congelou", "lentidao", "demorando", "carregando", "mouse", "teclado"]):
        return ("Problemas de desempenho são chatos mesmo. Vamos fazer uma limpeza rápida:\n"
                "1. Feche guias pesadas do Google Chrome.\n"
                "2. Pressione Ctrl+Shift+Esc para abrir o Gerenciador de Tarefas e veja se a 'Memória' está em 100%.\n"
                "3. Um simples 'Reiniciar o Computador' resolve 90% desses casos de acúmulo de cache.\n"
                "Você já tentou reiniciar hoje?")
                
    # 4. PROBLEMAS DE IMPRESSORA E PAPEL
    elif any(p in msg for p in ["impressora", "imprimir", "papel", "tinta", "toner", "atolou", "pdf"]):
        return ("Problema na impressão? Verifique estes passos:\n"
                "1. A impressora está com a luz verde acesa e conectada à rede?\n"
                "2. Abra a gaveta principal e veja se há papel bem encaixado.\n"
                "Se o papel atolou, desligue a impressora da tomada antes de puxá-lo para não danificar o rolo. Deu certo?")

    # 5. PROBLEMAS COM EMAIL
    elif any(p in msg for p in ["email", "e-mail", "outlook", "anexo", "nao envia", "nao recebo"]):
        return ("Problemas com E-mail? Vamos checar:\n"
                "1. Verifique se no rodapé do Outlook está escrito 'Trabalhando Offline'. Se estiver, clique para reconectar.\n"
                "2. A caixa de saída está lotada de mensagens com anexos grandes?\n"
                "Posso abrir um chamado na equipe de Servidores de Correio se o problema for geral.")

    # 6. PROBLEMAS COM O SISTEMA / ERP
    elif any(p in msg for p in ["sistema", "erp", "banco", "dados", "fora do ar", "erro"]):
        return ("Notei que você mencionou um erro no sistema. Poderia me confirmar se:\n"
                "1. Aparece algum código de erro na tela (ex: Erro 500, Timeout)?\n"
                "2. Outros colegas da sua equipe também estão sem acesso?\n"
                "Se for uma instabilidade geral, nossa equipe de infraestrutura já deve estar atuando.")

    # 7. INTERAÇÕES SOCIAIS / SAUDAÇÕES
    elif any(p in msg for p in ["obrigado", "valeu", "tchau", "resolvido", "funcionou", "top", "perfeito", "ok", "bom dia", "boa tarde", "boa noite", "ola", "oi"]):
        return ("Estou aqui para ajudar! Fico feliz que tenhamos interagido. Se o problema foi resolvido, vou encerrar o ticket. Tenha um excelente trabalho! 🚀")
        
    # 8. FALLBACK (Para qualquer problema não reconhecido)
    else:
        return ("Compreendo a sua situação. Como esse parece ser um problema técnico mais específico, a recomendação inicial padrão é: salve todos os seus arquivos abertos e reinicie o seu equipamento.\n\n"
                "Muitas vezes, falhas de sincronização ou travamentos de serviços em segundo plano são resolvidos com uma inicialização limpa.\n\n"
                "Por favor, faça isso e me avise se o problema persistir. Caso continue, eu transferirei este chamado imediatamente para a equipe de Infraestrutura (Nível 2).")

# ==========================================
# INTERFACE HTML (FRONT-END)
# ==========================================
HTML_PAGE = """
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Suporte Técnico com IA</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        :root {
            --bg-color: #f0f4f8;
            --chat-bg: #ffffff;
            --primary: #3b82f6;
            --primary-hover: #2563eb;
            --user-msg: #3b82f6;
            --ai-msg: #f1f5f9;
            --text-dark: #1e293b;
            --text-light: #f8fafc;
        }

        body {
            font-family: 'Inter', sans-serif;
            background-color: var(--bg-color);
            margin: 0;
            height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
        }

        .chat-container {
            width: 100%;
            max-width: 800px;
            height: 90vh;
            background: var(--chat-bg);
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }

        /* Header */
        .chat-header {
            background: #1e293b;
            color: white;
            padding: 20px;
            display: flex;
            align-items: center;
            gap: 15px;
        }

        .ai-avatar {
            width: 50px;
            height: 50px;
            background: linear-gradient(135deg, #3b82f6, #8b5cf6);
            border-radius: 50%;
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 1.5rem;
        }

        .header-info h2 { margin: 0; font-size: 1.2rem; }
        .header-info p { margin: 5px 0 0 0; font-size: 0.85rem; color: #94a3b8; display: flex; align-items: center; gap: 5px;}
        .status-dot { width: 8px; height: 8px; background: #10b981; border-radius: 50%; }

        /* Chat Body */
        .chat-body {
            flex: 1;
            padding: 20px;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 15px;
            background: #f8fafc;
        }

        .message {
            max-width: 75%;
            padding: 15px;
            border-radius: 12px;
            font-size: 0.95rem;
            line-height: 1.5;
            position: relative;
            animation: fadeIn 0.3s ease forwards;
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .message.ai {
            background: var(--ai-msg);
            color: var(--text-dark);
            align-self: flex-start;
            border-bottom-left-radius: 2px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.02);
            white-space: pre-wrap;
        }

        .message.user {
            background: var(--user-msg);
            color: var(--text-light);
            align-self: flex-end;
            border-bottom-right-radius: 2px;
            box-shadow: 0 2px 5px rgba(59, 130, 246, 0.3);
        }

        /* Typing Indicator */
        .typing-indicator {
            display: none;
            padding: 15px;
            background: var(--ai-msg);
            border-radius: 12px;
            align-self: flex-start;
            border-bottom-left-radius: 2px;
            width: fit-content;
        }

        .typing-indicator span {
            display: inline-block;
            width: 8px;
            height: 8px;
            background-color: #94a3b8;
            border-radius: 50%;
            margin: 0 2px;
            animation: bounce 1.4s infinite ease-in-out both;
        }

        .typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
        .typing-indicator span:nth-child(2) { animation-delay: -0.16s; }

        @keyframes bounce {
            0%, 80%, 100% { transform: scale(0); }
            40% { transform: scale(1); }
        }

        /* Input Area */
        .chat-input-area {
            padding: 20px;
            background: white;
            border-top: 1px solid #e2e8f0;
            display: flex;
            gap: 15px;
        }

        textarea {
            flex: 1;
            padding: 15px;
            border: 1px solid #cbd5e1;
            border-radius: 12px;
            resize: none;
            height: 24px;
            font-family: 'Inter', sans-serif;
            font-size: 0.95rem;
            outline: none;
            transition: border-color 0.2s;
        }

        textarea:focus { border-color: var(--primary); }

        .btn-send {
            background: var(--primary);
            color: white;
            border: none;
            width: 55px;
            border-radius: 12px;
            cursor: pointer;
            font-size: 1.2rem;
            transition: background 0.2s, transform 0.1s;
            display: flex;
            justify-content: center;
            align-items: center;
        }

        .btn-send:hover { background: var(--primary-hover); }
        .btn-send:active { transform: scale(0.95); }

    </style>
</head>
<body>

<div class="chat-container">
    <div class="chat-header">
        <div class="ai-avatar"><i class="fa-solid fa-robot"></i></div>
        <div class="header-info">
            <h2>N.E.X.U.S - Suporte Técnico Inteligente</h2>
            <p><div class="status-dot"></div> Online e pronto para ajudar</p>
        </div>
    </div>

    <div class="chat-body" id="chat-body">
        <div class="message ai">Olá! Eu sou o assistente de inteligência artificial do Helpdesk. Descreva o seu problema técnico para que eu possa abrir o chamado e tentar resolvê-lo imediatamente.</div>
        <div class="typing-indicator" id="typing">
            <span></span><span></span><span></span>
        </div>
    </div>

    <div class="chat-input-area">
        <textarea id="user-input" placeholder="Ex: Meu computador está travando..." onkeypress="handleKeyPress(event)"></textarea>
        <button class="btn-send" onclick="sendMessage()"><i class="fa-solid fa-paper-plane"></i></button>
    </div>
</div>

<script>
    const chatBody = document.getElementById('chat-body');
    const userInput = document.getElementById('user-input');
    const typingIndicator = document.getElementById('typing');

    function scrollToBottom() {
        chatBody.scrollTop = chatBody.scrollHeight;
    }

    function handleKeyPress(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    }

    async function sendMessage() {
        const text = userInput.value.trim();
        if (!text) return;

        // Adiciona a mensagem do usuário na tela
        addMessage(text, 'user');
        userInput.value = '';
        
        // Mostra que a IA está digitando
        typingIndicator.style.display = 'block';
        chatBody.appendChild(typingIndicator); // move pro final
        scrollToBottom();

        try {
            // Faz a requisição HTTP POST para o nosso servidor Python
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text })
            });

            const data = await response.json();
            
            // Esconde o digitando e adiciona a resposta da IA
            typingIndicator.style.display = 'none';
            addMessage(data.reply, 'ai');

        } catch (error) {
            typingIndicator.style.display = 'none';
            addMessage("Desculpe, ocorreu um erro de conexão com o servidor. Tente novamente.", 'ai');
        }
    }

    function addMessage(text, sender) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${sender}`;
        msgDiv.textContent = text;
        chatBody.insertBefore(msgDiv, typingIndicator);
        scrollToBottom();
    }
</script>

</body>
</html>
"""

# ==========================================
# SERVIDOR HTTP (BACK-END)
# ==========================================
class RequestHandler(http.server.SimpleHTTPRequestHandler):
    
    # Rota GET para servir a interface HTML
    def do_GET(self):
        if self.path == '/':
            self.send_response(200)
            self.send_header('Content-type', 'text/html; charset=utf-8')
            self.end_headers()
            self.wfile.write(HTML_PAGE.encode('utf-8'))
        else:
            self.send_error(404)

    # Rota POST para receber a mensagem do usuário e retornar a resposta da IA
    def do_POST(self):
        if self.path == '/api/chat':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            try:
                data = json.loads(post_data.decode('utf-8'))
                user_msg = data.get('message', '')
                
                # Chama o simulador de IA
                ai_reply = simular_resposta_ia(user_msg)
                
                # Retorna a resposta em JSON
                response_data = json.dumps({'reply': ai_reply})
                self.send_response(200)
                self.send_header('Content-type', 'application/json; charset=utf-8')
                self.end_headers()
                self.wfile.write(response_data.encode('utf-8'))
                
            except Exception as e:
                self.send_error(400, "Bad Request")
        else:
            self.send_error(404)

def run_server():
    with socketserver.TCPServer(("", PORT), RequestHandler) as httpd:
        print(f"Servidor Helpdesk com IA rodando na porta {PORT}...")
        httpd.serve_forever()

if __name__ == "__main__":
    # Abre o navegador automaticamente
    threading.Timer(1.0, lambda: webbrowser.open(f'http://localhost:{PORT}')).start()
    run_server()
