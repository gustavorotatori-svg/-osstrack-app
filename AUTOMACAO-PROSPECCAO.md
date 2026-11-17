# Prospecção autônoma OssTrack

## Operação na Vercel

Projeto `osstrack-app`, domínio `osstrack.com.br`. Não depende do Codex, do OpenCode ou do computador ligado.

| Etapa | Brasília | Endpoint protegido |
| --- | --- | --- |
| Pesquisa e abastecimento | 07h | `/api/cron/outreach/discover` |
| Envio até completar 25 aceitos no dia | 11h | `/api/cron/outreach` |
| Pesquisa complementar e recuperação do lote | 15h | `/api/cron/outreach/recovery` |
| Conferência e relatório ao responsável | 19h | `/api/cron/outreach/monitor` |

O plano Hobby pode executar cada job dentro da hora agendada. Cada job tem frequência diária e duração máxima de 300 segundos. Uma lease persistente de cinco minutos impede execuções simultâneas. Uma reserva de destinatário antes do SMTP impede repetição após crash; resultados ambíguos nunca são reenviados automaticamente.

## Estado e critérios

- A fila e o cursor de pesquisa ficam em `RelatorioEnvio`, registro `outreach-state-v1`. Recibos individuais: tipo `outreach-receipt`; execuções: `outreach-run`; relatórios: `outreach-monitor`.
- Usa tabelas existentes. Não exige migração, seed, contas de teste ou alterações em alunos.
- Consulta população atual pela API oficial IBGE, cadastro público CBJJP e páginas próprias de escolas localizadas pela pesquisa pública. Pesquisa rotativa prioriza Norte/Nordeste e percorre outros estados autorizados. Fontes podem estar indisponíveis ou não produzir contatos qualificados; o relatório deve explicitar meta incompleta.
- Quando a API IBGE não responde, usa a cópia auditada dos dados anuais oficiais, obtida em 31/10/2026 e incluída no servidor. O fallback identifica sua origem, expira após 366 dias, exige ano atual/anterior e exclui cidades a partir de 450 mil para preservar margem ao limite de 500 mil. A validade dos dados deve ser renovada com uma consulta oficial bem-sucedida; o sistema não inventa população durante falhas.
- Contatos precisam de fonte pública, município/UF identificados, cidade abaixo de 500 mil habitantes e MX. Grandes redes são excluídas. O porte real em alunos e a independência de todas as escolas não são certificados pelas fontes: marca/operação local são inferências, documentadas na qualificação.
- Meta diária: 25 aceites SMTP, contando apenas destinatários inéditos e qualificados; os workers completam o restante do dia sem ultrapassar a meta. Sem emails inventados, compra de listas, créditos de enriquecimento ou contratação de serviços novos. Fonte ou evidência insuficiente não justifica relaxar filtros para alcançar a meta.
- Cruza enviados, usuários, log legado e descadastros. Pedidos de remoção por resposta são registrados como `AutoReplyLog.matchedRule = unsubscribe` pelo job existente de caixa de entrada.
- SMTP aceito não comprova entrega. Relatórios não devem chamar ausência de bounce de entrega comprovada.

## Qualidade comercial e tratamento de respostas

- Contato deve ser um email comercial público associado a uma academia confirmada de Jiu-Jitsu; prefira o site/canal oficial. Registre fonte e data. Confirme município/UF, população IBGE, MX e ausência de vínculo com grande rede. Fato comercial individualizado e pergunta contextual são preferência, não condição para envio.
- Diretórios servem para localizar escolas e contatos públicos associados; não provam por si só porte nem independência. Não invente endereço ou afiliação. A mensagem é curta, oferece resposta como caminho principal, inclui texto e HTML, mantém a oferta gratuita e não promete recursos inexistentes. O acesso rastreado é opção secundária.
- Antes do envio, deduplicar pelo endereço e pela academia (nome/cidade), conferir usuários, envios/reservas, supressões, respostas de recusa e descadastros. Hard bounce e recusas não voltam à fila. SMTP ambíguo nunca é reenviado.
- Respostas de prospectos não recebem resposta comercial automática. Interesse ou mensagem ambígua é encaminhada ao responsável para resposta humana; recusa fica registrada e suprimida; descadastro é respeitado. Não há sequência automática de follow-up sem cadência definida e consentimento operacional.
- Monitorar separadamente hard/soft bounce, política, autenticação, limitação de volume, respostas positivas, recusas, descadastros e sinais de interesse. Aberturas/cliques são apenas sinais sujeitos a distorção; aceitação SMTP e ausência de bounce não provam chegada à caixa de entrada.
- O cron de caixa `/api/cron/auto-reply` processa devoluções uma vez ao dia. Quando reconhecer um bounce e associá-lo a um endereço de `OutreachSent`, envia um alerta para a caixa IMAP do remetente e para `REPORT_TO` (deduplicados), registra o retorno e marca a mensagem como lida. Respostas de ausência automática não contam como bounce. Se o SMTP de alerta falhar, a mensagem permanece sem leitura para nova tentativa.
- Não contornar bloqueios, reclamações ou pedidos de remoção com outro remetente/domínio. Se houver falhas de autenticação, política ou reputação, pausar e investigar SPF/DKIM/DMARC e configuração antes de retomar.

## Credenciais e proteção

`OUTREACH_SMTP_HOST`, `OUTREACH_SMTP_PORT`, `OUTREACH_SMTP_USER`, `OUTREACH_SMTP_PASS` e `OUTREACH_ENABLED=true` estão configurados somente em Production. O remetente é validado como `passador@osstrack.com`. Preview não envia. O segredo `CRON_SECRET` autentica todos os endpoints; sessão de um dono de academia não autoriza executar a campanha global.

As páginas pesquisadas são dados não confiáveis. O coletor só aceita HTTPS, valida IP público, fixa a conexão nesse IP, revalida redirecionamentos e limita tamanho/tempo. Nome/cidade são escapados antes de entrar no template do email.

## Inspeção e recuperação

O comando abaixo apenas consulta status, sem enviar:

```powershell
node --env-file=.env --env-file=.env.outreach.local scripts/outreach-service.cjs status
```

O endpoint `/api/cron/outreach?mode=status` oferece o mesmo status e exige o segredo. Nunca use o endpoint de envio como teste de saúde. `OUTREACH_ENABLED=false` em novo deploy desabilita os workers. Não limpar reservas, recibos ou enviados para tentar novamente um resultado ambíguo.

O relatório diário usa `REPORT_TO`, com o mesmo destinatário de relatório já definido no projeto quando a variável não existe. Se o SMTP estiver indisponível, o envio do alerta também pode falhar; consultar os logs Vercel e os registros persistentes. O monitor do chat pode atuar como conferência secundária, mas não é o executor da campanha.

## Recuperação complementar às 20h

A partir de 02/11/2026, a automação deste chat chama-se **OssTrack — completar meta diária**. Quando houver menos de 25 aceitos e nenhum worker ativo, deve pesquisar contatos adicionais, verificar critérios e fontes, abastecer a fila com trava e completar o restante pelo worker oficial. Meta já cumprida e estado saudável ficam silenciosos. Isso substitui a configuração anterior de conferência somente leitura.

Essa recuperação complementar acessa arquivos locais e depende de computador ligado e aplicativo em execução. Os quatro jobs principais da Vercel continuam funcionando sem o computador. O diretório público atual CBJJE e os cadastros FBJJMMA são novas fontes de pesquisa revisada; ainda não foram integrados ao coletor automático na Vercel. Cadastros federativos não provam independência: verificar vínculos de rede, município e contato e não repetir a academia com outro email.
