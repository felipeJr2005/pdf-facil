# 🚨 LOG DE PROBLEMAS E SOLUÇÕES - PERMISSÕES RAILWAY

**Data do problema:** 27/06/2025  
**Ambiente:** Railway + Apache + PHP 8.1  
**Sistema:** Controlador Financeiro  

---

## ❌ **PROBLEMA IDENTIFICADO**

### **Erro Principal:**
```
Warning: file_put_contents(): Failed to open stream: Permission denied
Warning: chmod(): Operation not permitted
```

### **Diagnóstico Técnico:**
- **Local:** `/var/www/html/investimento/data/aplicacoes.json`
- **Causa:** Container Railway não permite alteração de permissões via PHP
- **Impact:** Sistema não consegue salvar dados financeiros
- **Usuário PHP:** `root` (sem permissão para alterar arquivos)
- **Pasta gravável:** ❌ `/data/` | ✅ `/tmp/` (temporária)

### **Testes Realizados:**
- ✅ **Load (Carregar):** Funcionando perfeitamente
- ❌ **Save (Salvar):** Falha por permissão negada
- ✅ **Workaround /tmp:** Funciona, mas dados temporários (RISCO)

---

## ✅ **SOLUÇÕES DISPONÍVEIS**

### **🔥 SOLUÇÃO 1: DOCKERFILE (RECOMENDADA)**

**📁 Arquivo: `/Dockerfile`**
```dockerfile
FROM php:8.1-apache

# Instalar dependências
RUN apt-get update && apt-get install -y \
    libzip-dev zip unzip \
    && docker-php-ext-install zip \
    && rm -rf /var/lib/apt/lists/*

# Copiar arquivos
COPY . /var/www/html/

# CORREÇÃO DE PERMISSÕES (RESOLVE O PROBLEMA)
RUN chown -R www-data:www-data /var/www/html/ && \
    find /var/www/html/ -type d -exec chmod 755 {} \; && \
    find /var/www/html/ -type f -exec chmod 644 {} \; && \
    chmod 777 /var/www/html/investimento/data/

# Criar arquivo JSON inicial
RUN mkdir -p /var/www/html/investimento/data/ && \
    echo '{"versao":"2.0","totalAplicacoes":0,"aplicacoes":[],"taxasReferencia":{"cdi":"14.90","selic":"15.00","poupanca":"0.6721"}}' > /var/www/html/investimento/data/aplicacoes.json && \
    chmod 666 /var/www/html/investimento/data/aplicacoes.json

# Script de inicialização
RUN echo '#!/bin/bash\n\
chown -R www-data:www-data /var/www/html/\n\
chmod 777 /var/www/html/investimento/data/\n\
chmod 666 /var/www/html/investimento/data/aplicacoes.json 2>/dev/null\n\
apache2-foreground' > /usr/local/bin/start.sh && \
    chmod +x /usr/local/bin/start.sh

EXPOSE 80
CMD ["/usr/local/bin/start.sh"]
```

**📁 Arquivo: `/railway.toml`**
```toml
[build]
builder = "dockerfile"

[deploy]
startCommand = "/usr/local/bin/start.sh"
restartPolicyType = "always"
```

**🚀 Implementação:**
1. Criar arquivos na **RAIZ** do repositório
2. Git add + commit + push
3. Railway faz rebuild automático
4. ✅ Problema resolvido definitivamente

---

### **⚡ SOLUÇÃO 2: WORKAROUND /tmp (TEMPORÁRIA)**

**⚠️ RISCO:** Dados perdidos a cada redeploy!

**📁 Modificar: `/data/save.php`**
```php
// Detectar local gravável
$tentativas = [
    __DIR__ . '/aplicacoes.json',     // Ideal
    '/tmp/aplicacoes.json',           // Backup
    sys_get_temp_dir() . '/aplicacoes.json'
];

foreach ($tentativas as $arquivo) {
    $pasta = dirname($arquivo);
    if (is_writable($pasta)) {
        // Usar este local
        break;
    }
}
```

**🎯 Resultado:** Funciona, mas dados em `/tmp` são apagados!

---

### **🔄 SOLUÇÃO 3: BACKUP AUTOMÁTICO GITHUB**

**Para proteger dados enquanto usa /tmp:**

**📁 Criar: `/data/backup-github.php`**
```php
function backupGitHub($dados) {
    $token = 'SEU_TOKEN_GITHUB';
    $repo = 'felipeJr2005/pdf-facil';
    $arquivo = 'investimento/data/aplicacoes.json';
    
    // Código para upload via GitHub API
    // Salva automaticamente no repositório
}
```

**🎯 Uso:** Backup automático a cada salvamento

---

### **🛠️ SOLUÇÃO 4: COMANDOS MANUAIS (SSH)**

**Se tiver acesso SSH ao servidor:**
```bash
# Corrigir proprietário
chown -R www-data:www-data /var/www/html/

# Corrigir permissões
chmod 755 /var/www/html/investimento/data/
chmod 666 /var/www/html/investimento/data/aplicacoes.json

# Verificar
ls -la /var/www/html/investimento/data/
```

---

## 🎯 **PRIORIDADES DE IMPLEMENTAÇÃO**

### **IMEDIATO (Hoje):**
1. ✅ **Upload manual** dos dados do PC
2. ✅ **Usar sistema** normalmente (carregamento funciona)
3. ⚠️ **Evitar salvamento** até resolver

### **URGENTE (Esta semana):**
1. 🐳 **Implementar Dockerfile** (Solução definitiva)
2. 📁 **Testar** em ambiente de desenvolvimento
3. 🚀 **Deploy** para produção

### **SEGURANÇA (Permanente):**
1. 💾 **Backup automático** GitHub
2. 📊 **Monitoramento** de permissões
3. 🔄 **Processo** de recuperação

---

## 📊 **HISTÓRICO DE TESTES**

### **Testes Realizados (27/06/2025):**
- ❌ `chmod()` via PHP → "Operation not permitted"
- ❌ `file_put_contents()` em `/data/` → "Permission denied"  
- ✅ `file_put_contents()` em `/tmp/` → Sucesso
- ✅ Carregamento de dados → Funcionando
- ✅ Interface do sistema → Funcionando

### **Workarounds Testados:**
- ✅ **Pasta /tmp:** 2 locais graváveis encontrados
- ✅ **Load multi-local:** Encontra arquivo em 3 locais
- ❌ **Correção automática:** PHP sem privilégios

---

## 🔧 **ARQUIVOS ENVOLVIDOS**

### **Principais:**
- `/investimento/index.html` - Interface (funciona)
- `/data/save.php` - API salvamento (problema)
- `/data/load.php` - API carregamento (funciona)
- `/data/aplicacoes.json` - Dados (sem permissão escrita)

### **Para Limpeza:**
- ❌ `/data/teste-*.php` - Arquivos de debug (apagar)
- ❌ `/data/fix-permissions.php` - Debug (apagar)
- ❌ `/teste-phpmailer.php` - Teste (apagar)

---

## 🚀 **IMPLEMENTAÇÃO RECOMENDADA**

### **PASSO 1: Dockerfile (Permanente)**
```bash
# Na raiz do projeto
touch Dockerfile
touch railway.toml

# Adicionar conteúdo dos arquivos
git add .
git commit -m "Fix: Add Dockerfile for Railway permissions"
git push origin main
```

### **PASSO 2: Monitoramento**
```bash
# Verificar deploy
railway logs

# Procurar por:
# "✅ Permissões configuradas"
# "✅ Pasta data/ funcionando"
```

### **PASSO 3: Teste**
```bash
# Acessar sistema
https://seuapp.railway.app/investimento/

# Testar salvamento
# Deve funcionar sem erros
```

---

## 📞 **TROUBLESHOOTING**

### **Se Dockerfile não funcionar:**
1. Verificar se está na raiz do repositório
2. Verificar logs do Railway
3. Procurar erros de build

### **Se workaround /tmp falhar:**
1. Verificar se pasta `/tmp` existe
2. Testar outras pastas temporárias
3. Considerar backup externo obrigatório

### **Se dados forem perdidos:**
1. Restaurar do backup local (PC)
2. Verificar GitHub para backups automáticos
3. Reconfigurar sistema do zero

---

## 📝 **NOTAS TÉCNICAS**

### **Railway Specifics:**
- Container baseado em Debian
- PHP 8.1.32
- Apache/2.4.62
- Usuário: root (problema de segurança)
- Restart apaga `/tmp/`

### **Alternativas de Hospedagem:**
- Vercel (mas só arquivos estáticos)
- Heroku (similar ao Railway)
- VPS próprio (controle total)

---

**📅 Última atualização:** 27/06/2025  
**👤 Responsável:** Análise técnica completa  
**🎯 Status:** Aguardando implementação Dockerfile  
**⏰ Próxima revisão:** Após deploy com Dockerfile  

---

## ✅ **CHECKLIST DE RESOLUÇÃO**

- [ ] Criar Dockerfile na raiz
- [ ] Criar railway.toml na raiz  
- [ ] Fazer git push
- [ ] Aguardar rebuild do Railway
- [ ] Testar salvamento no sistema
- [ ] Verificar permissões via logs
- [ ] Confirmar dados persistentes
- [ ] Remover arquivos de debug
- [ ] Documentar solução final

**🎯 Meta:** Sistema 100% funcional com dados seguros