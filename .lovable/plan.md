
# Plano de atualização — CTR Fitness

O escopo enviado é grande (15 blocos de melhorias). Para não quebrar nada e manter tudo revisável, proponho implementar em **4 fases**, cada uma entregando valor sozinha. Você aprova fase a fase (ou tudo de uma vez, se preferir).

Nada da estrutura atual será removido — só adição/refinamento. Firebase Auth + Firestore, rotas e layout continuam iguais.

---

## Fase 1 — Perfil, Segurança e Configurações (Melhorias 1, 2, 11)

- Reescrever `Perfil.jsx` como formulário editável (foto, nome, telefone, nascimento, peso, altura, sexo, objetivo, nível de treino). Botões **Salvar** / **Cancelar**, toasts de sucesso/erro, salvamento no doc do aluno.
- Ações de segurança dentro do perfil:
  - Alterar senha (`updatePassword` + reauth)
  - Alterar e-mail (`updateEmail` + reauth)
  - Excluir conta (confirmação → apaga doc `alunos/{uid}`, `fichas/{uid}`, favoritos, medições, e `auth.currentUser.delete()`)
- Nova página `/configuracoes` com itens: Perfil, Alterar senha, Alterar e-mail, Sobre, Versão, Política, Termos, Sair, Excluir conta. Adicionar entrada no `BottomNav` (ou ícone no Perfil).
- Tema: manter Vermelho/Preto/Branco atuais + novo toggle claro/escuro + cor primária (azul/vermelho/verde). Preferência salva no Firestore no doc do usuário (com fallback localStorage).

## Fase 2 — Home Dashboard, Minha Ficha, Histórico (Melhorias 3, 4, 5)

- Home vira dashboard: saudação + foto, card treino de hoje, última ficha (data), contagem de vídeos, contagem de treinos cadastrados, botões “Ver minha ficha” e “Abrir biblioteca”, cards de último acesso, objetivo, peso, altura.
- Minha Ficha organizada por dia com categoria, séries, reps, descanso, obs., botão “Assistir exercício” quando houver vídeo vinculado. Topo com última atualização, personal e objetivo. Manter botões PDF e WhatsApp.
- Histórico de fichas: nova coleção `fichas_historico/{alunoId}/versoes/{id}` gravada quando o personal salva uma nova ficha. Página `/historico` para o aluno listar e visualizar fichas antigas (somente leitura).

## Fase 3 — Evolução + Vídeos + Favoritos (Melhorias 6, 7)

- Página `/evolucao`: peso inicial, peso atual, altura, objetivo, IMC calculado, formulário para nova medição, gráfico simples (Recharts — leve, ~40kb gz) plotando peso ao longo do tempo. Coleção `medicoes/{alunoId}/itens`.
- Biblioteca de vídeos: busca por nome, filtro por categoria (já existe base), abas “Recentes”, “Novos”, “Mais assistidos”, favoritar (❤). Coleção `favoritos/{uid}` com array de ids. Página `/favoritos`. Cada vídeo passa a ter miniatura, título, categoria, descrição — atualiza schema de `videos.json` (adiciona campos opcionais).

## Fase 4 — Painel do Personal + Criação de Ficha + Polimento (Melhorias 8, 9, 10, 12, 14, 15)

- Dashboard do personal: contadores, últimas fichas criadas, últimos alunos, busca e ordenação. Ações por aluno: visualizar/editar/duplicar/excluir ficha, ver histórico.
- Editor de ficha aprimorado: cabeçalho (nome, idade, peso, altura, objetivo), por dia escolhe categoria e adiciona exercícios (séries, reps, descanso, obs.), botões adicionar dia/exercício, duplicar, excluir, autosave com debounce.
- Polimento visual: transições suaves (fade/slide), cards com sombra leve e bordas arredondadas, revisão responsiva.
- Reorganização de código: criar `src/hooks/`, `src/utils/`, mover helpers, remover imports não usados. Rodar `vite build` no fim para garantir zero erro.
- Commit final é automático — todo salvamento no Lovable já sincroniza com o GitHub conectado.

---

## Notas técnicas

- **Firebase**: nenhuma credencial ou regra alterada. Novas coleções: `fichas_historico`, `medicoes`, `favoritos` (regras precisam permitir `request.auth.uid == doc owner`; te aviso o SQL/rules a aplicar).
- **Reautenticação**: alterar senha/email/excluir conta exige reauth. Para contas Google → `reauthenticateWithPopup`; para email/senha → prompt de senha atual.
- **Gráfico**: adicionar `recharts` (única dependência nova).
- **PDF/WhatsApp/PWA/SW**: mantidos.
- **Rotas novas**: `/configuracoes`, `/historico`, `/evolucao`, `/favoritos`, todas protegidas por `AlunoRoute`.

---

## Confirmação

Confirma o plano? Duas perguntas rápidas para eu já começar a Fase 1:

1. **Quer que eu implemente as 4 fases em sequência agora**, ou prefere revisar/testar cada fase antes de eu seguir?
2. **Sobre tema**: mantenho os 3 temas atuais (Vermelho/Preto/Branco) **e** adiciono claro/escuro + cor primária (azul/vermelho/verde), ou substituo o sistema atual pelo novo?
