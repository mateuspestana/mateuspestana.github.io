# Dicionário de dados — Missão Festival ViraBairro

## O caso e seus limites

O **Observatório Conexão Bairro (OCB)** é uma iniciativa fictícia que está organizando o Festival ViraBairro: uma programação de cultura, mobilidade, saúde e trabalho construída com moradores. Nas semanas antes do evento, a equipe publicou pistas, guias e convites nas redes. Cada linha das bases representa uma dessas publicações fictícias.

As relações entre os campos também são sintéticas, criadas somente para permitir exercícios de inspeção, limpeza, métricas, visualização, segmentação e classificação. Os dados não representam pessoas, bairros, organizações ou plataformas reais e não permitem concluir causalidade nem generalizar para outras contas.

`publicacoes_brutas.csv` é um recorte de chegada: contém falhas intencionais de padronização, duplicidade, tipos e ausências. `publicacoes_analise.csv` é a versão já tratada para as missões analíticas; ela não depende da limpeza feita pelo estudante.

## Unidade de análise

Uma linha representa **uma publicação da campanha**. Alcance e interações são resultados observados depois da publicação. Características da conta, do texto, do horário e do formato podem ser conhecidas antes dela.

## Campos

| Campo | Descrição | Tipo/unidade | Disponível antes de publicar? |
| --- | --- | --- | --- |
| `id_publicacao` | Identificador da publicação | texto | Não é feature: apenas identificador |
| `data_publicacao` | Data e hora de publicação | data/hora | Sim, na hora de agendar |
| `tema` | Trilha editorial da publicação | categoria | Sim |
| `formato` | Formato da peça | categoria | Sim |
| `alcance` | Contas alcançadas | contagem | Não |
| `curtidas` | Curtidas recebidas | contagem | Não |
| `comentarios` | Comentários recebidos | contagem | Não |
| `compartilhamentos` | Compartilhamentos recebidos | contagem | Não |
| `salvamentos` | Salvamentos recebidos | contagem | Não |
| `seguidores_autor` | Seguidores do perfil antes da publicação | contagem | Sim |
| `videos_autor` | Vídeos publicados pelo perfil antes da peça | contagem | Sim |
| `duracao_segundos` | Duração do vídeo; zero em formatos não audiovisuais | segundos | Sim |
| `tamanho_legenda` | Caracteres da legenda | caracteres | Sim |
| `n_emojis` | Emojis na legenda | contagem | Sim |
| `n_hashtags` | Hashtags na legenda | contagem | Sim |
| `hora` | Hora de publicação | 0 a 23 | Sim |
| `dia_semana` | Dia da semana; segunda = 0 e domingo = 6 | 0 a 6 | Sim |
| `taxa_engajamento_pct` | `(curtidas + comentarios + compartilhamentos + salvamentos) / alcance × 100` | porcentagem | Não |

Nas Missões 4 e 5, não use `id_publicacao`, alcance, reações ou taxas como características para decidir antecipadamente sobre uma nova publicação. Isso mistura informação posterior à decisão e cria **vazamento de dados**.
