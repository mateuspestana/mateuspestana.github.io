# Dicionário de dados — Observatório Conexão Bairro

## Origem e limites

As duas bases foram criadas sinteticamente para a prova. Cada linha representa uma publicação fictícia do perfil Observatório Conexão Bairro, em agosto ou setembro de 2026. As relações entre variáveis foram simuladas para permitir exercícios de limpeza, métricas, visualização e modelagem; elas não descrevem uma plataforma real e não sustentam conclusão causal.

`publicacoes_brutas.csv` contém erros intencionais de padronização, duplicidade e valores ausentes. `publicacoes_analise.csv` é a versão tratada e não contém os mesmos problemas.

## Campos

| Campo | Descrição | Tipo/unidade |
| --- | --- | --- |
| `id_publicacao` | Identificador da publicação | texto |
| `data_publicacao` | Data e hora de publicação | data/hora |
| `tema` | Assunto editorial | categoria |
| `formato` | Formato da publicação | categoria |
| `alcance` | Contas alcançadas | número de contas |
| `curtidas` | Curtidas recebidas | contagem |
| `comentarios` | Comentários recebidos | contagem |
| `compartilhamentos` | Compartilhamentos recebidos | contagem |
| `salvamentos` | Salvamentos recebidos | contagem |
| `seguidores_autor` | Seguidores antes da publicação | contagem |
| `videos_autor` | Vídeos já publicados antes do post | contagem |
| `duracao_segundos` | Duração do vídeo; zero nos formatos não audiovisuais | segundos |
| `tamanho_legenda` | Número de caracteres da legenda | caracteres |
| `n_emojis` | Número de emojis na legenda | contagem |
| `n_hashtags` | Número de hashtags na legenda | contagem |
| `hora` | Hora de publicação | 0 a 23 |
| `dia_semana` | Dia da semana; segunda = 0 e domingo = 6 | 0 a 6 |
| `taxa_engajamento_pct` | Interações / alcance × 100 | porcentagem |

Na Questão 4, `alcance`, reações e `taxa_engajamento_pct` só existem depois da publicação. Portanto, não podem ser usadas para prever o engajamento antecipadamente.
