# Validação da abertura de identidade

04/11/2026, Windows, Node 24 e Chromium real. Esta revisão substitui os planos de projetos da abertura por identidade tipográfica e campo óptico contínuo. Nenhuma imagem ou card de projeto permanece na abertura.

## Verificações

- Doze testes Node de catálogo, schema, filtros, ordenação e segurança de metadados passaram. Astro check: zero erros, avisos ou hints. Build: 14 páginas; npm audit: zero vulnerabilidades reportadas.
- Canvas decorativo inicializa no navegador real. Atos 00, 01 e 02 percorridos com rolagem nativa; tipografia e fundo acompanham a jornada. Sem malha, imagens ou cards na seção inicial.
- Dark/light e inglês inspecionados. Viewports 320×740 e 390×844 sem overflow (305/305 e 375/375 com scrollbar). Desktop 1440×900 e viewport nativo também conferidos.
- Movimento reduzido persistiu após reload, com abertura da altura do viewport e composição estática. Nome acessível “Gustavo Paz” no H1; conteúdo e links são HTML.
- Limites implementados: 1,4 milhão de pixels, DPR até 1,1 desktop / 0,85 mobile e até 25 desenhos/s. Pausa por visibilidade e preferência de movimento. São limites de implementação, não uma medição de desempenho universal.

## Publicação e segurança

Deploy 41841779678 concluído com sucesso no commit 55195d6. Na demo pública: campo óptico inicializado, zero cards/imagens na abertura; atos 01 e 02 percorridos por rolagem; busca Lastro em inglês retorna um projeto. Movimento reduzido persistiu em reload e manteve a cena em 1305 px, igual ao viewport nativo. Capturas públicas atualizadas em dark/light desktop 1440×900, mobile 390×844 e dois atos narrativos no viewport nativo. Artefato publicado comparado: 33 arquivos, 685.088 bytes; 29 idênticos, quatro diferem somente pelo timestamp de sincronização. Os 68 repositórios foram comparados integralmente. GitHub Pages e Actions em runner público padrão, sem cartão, faturamento ou serviço novo. Commits com noreply e somente gustapaz como contribuidor. Gitleaks examina staged, export e histórico alcançável antes da publicação; a entrega pública é comparada ao artefato local.

## Limites

Sem telefone físico/Safari, auditoria integral com leitor de tela ou medição Lighthouse/Core Web Vitals de campo. Fallback para WebGL indisponível/perdido implementado; perda de contexto não foi simulada no teste público. API/schedules têm cotas e atrasos. Erros de extensões do navegador não são tratados como falhas da aplicação nem como prova de console universalmente limpo.

## Refinamentos posteriores

14 testes Node aprovados, incluindo repetição idempotente sem alteração do estado de entrada e correspondência de exatamente três formas iguais. Astro check sem diagnósticos, build de 14 páginas e npm audit sem vulnerabilidades reportadas. Sem novas dependências.

Comparação do CSS/JS diretamente referenciado na home: versão pública anterior 197.506 bytes brutos / estimativa gzip 68.753 bytes; nova versão 210.389 / 71.550 bytes. Acréscimo gzip estimado: 2.797 bytes. É comparação de artefatos, não medição de transferência, FPS ou Core Web Vitals.

No navegador local: Lastro reservou de 3 para 2 e repetir manteve 2; Interface no Tandem avançou até Ship por teclado; Confete reconheceu três círculos; slider de enquadramento atingiu 100%. Estudo Vértice e home em 320 px sem overflow horizontal (305/305 com scrollbar). Composições de Tandem, Lastro e Confete percorridas no desktop. Publicação e capturas da revisão registradas após o deploy.

Tandem e Confete em inglês inspecionados em 390×844, sem overflow (375/375); modo reduzido persistiu no reload, com quatro painéis visíveis e aria-hidden removido. Assinatura móvel conferida no encerramento.

Deploy 41846162315 aprovado, commit 9bb6210. Export público comparado ao build: 33 arquivos, 727.685 bytes; 29 idênticos e quatro com diferença apenas no timestamp de sincronização. Os 68 repositórios são iguais integralmente. Capturas dos quatro destaques e da assinatura atualizadas a partir da demo pública.

Smoke público adicional: os quatro capítulos foram selecionados por teclado; Lastro manteve estoque 2 após repetição da chave; Confete em inglês reconheceu o trio. Modo reduzido persistiu após reload, com quatro painéis sem aria-hidden. Assinatura com ponto roxo capturada no encerramento.
