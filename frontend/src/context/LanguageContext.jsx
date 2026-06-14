import { createContext, useContext, useState, useCallback, useEffect } from 'react'

/* Lightweight i18n — no dependencies. EN / PT-PT dictionaries + useT() hook. */

const DICT = {
  en: {
    brand: { subtitle: 'League Manager' },
    nav: {
      dashboard: 'Dashboard', players: 'Players', coaches: 'Coaches',
      teams: 'Teams', tournaments: 'Tournaments', matches: 'Matches', transfers: 'Transfers',
    },
    common: {
      search: 'Search…', mode: 'Mode', collapse: 'Collapse', expand: 'Expand',
      viewAll: 'View all', details: 'Details', cancel: 'Cancel', save: 'Save',
      create: 'Create', saving: 'Saving…', edit: 'Edit', delete: 'Delete',
      loading: 'Loading', clearFilters: 'Clear filters', noResults: 'No results',
      teams: 'teams', matches: 'matches', players: 'players', back: 'Back to {target}',
      allGames: 'All Games', allStatus: 'All Status', allFormats: 'All Formats',
      allTeams: 'All Teams', allNations: 'All Nations', allAges: 'All Ages',
      allTournaments: 'All Tournaments', winRate: 'Win Rate', trophies: 'Trophies',
    },
    theme: { label: 'Theme', light: 'Light', dark: 'Dark', system: 'System' },
    lang:  { label: 'Language' },
    page: {
      dashboardSubAll: 'Season 2026 · All Disciplines',
      dashboardSub: 'Season 2026',
      playersSub: '{n} registered players',
      coachesSub: '{n} coaches',
      teamsSub: '{n} teams',
      tournamentsSub: '{n} tournaments',
      matchesSub: '{n} matches',
      transfersSub: '{n} transfers recorded',
      newPlayer: 'New Player', newCoach: 'New Coach', newTeam: 'New Team',
      newTournament: 'New Tournament', scheduleMatch: 'Schedule Match',
    },
    transfers: {
      hire: 'Sign', signTo: 'Sign to team', pickTeam: 'Pick a team…',
      confirmHire: 'Sign', noTeams: 'No eligible team for this agent.',
      allTypes: 'All Types', allModes: 'All Modes', searchPlaceholder: 'Search name…',
      pickFirst: 'Pick a team first.', signed: '{name} signed for {team}.', signFail: 'Failed to sign.',
    },
    dash: {
      topPlayers: 'Top Players', topTeams: 'Top Teams', topCoaches: 'Top Coaches',
      statsByMode: 'Stats by Mode', tournaments: 'Tournaments',
      recentResults: 'Recent Results', nextMatches: 'Next Matches',
      minMatches: 'Minimum 3 matches to appear.', noTeams: 'No teams yet.',
      noCoaches: 'No coaches yet.', noTournaments: 'No tournaments yet.',
      noResults: 'No results yet.', noUpcoming: 'No upcoming matches.', won: '{name} won',
      freeAgents: 'Free Agents', recentTransfers: 'Recent Transfers',
      noFreeAgents: 'No free agents right now.', noTransfers: 'No transfers recorded yet.',
      player: 'Player', coach: 'Coach', freeAgent: 'Free agent',
    },
    col: {
      nickname: 'Nickname', fullName: 'Full Name', nation: 'Nation', age: 'Age',
      mode: 'Mode', matches: 'Matches', w: 'W', l: 'L', team: 'Team',
      name: 'Name', email: 'Email', coach: 'Coach', players: 'Players',
      teamA: 'Team A', teamB: 'Team B', date: 'Date', score: 'Score',
      result: 'Result', tournament: 'Tournament', points: 'Points', winrate: 'Win %',
      game: 'Game', status: 'Status', format: 'Format', trophies: 'Trophies',
      specialization: 'Specialization', city: 'City', foundedYear: 'Founded',
    },
    ui: {
      confirm: 'Confirm', select: 'Select…', selectModeFirst: 'Select a mode first',
      selectTournamentFirst: 'Select a tournament first', back: 'Back',
      saveFailed: 'Failed to save.', deleteFailed: 'Failed to delete.',
      required: 'Please fill in all required fields.', noTeamsForMode: 'No tournaments for this mode',
      noParticipants: 'No participating teams', viewDetails: 'View details', none: 'None',
    },
    players: {
      new: 'New Player', edit: 'Edit Player',
      created: 'Player created successfully.', updated: 'Player updated.', deleted: 'Player deleted.',
      saveFail: 'Failed to save player.', deleteFail: 'Failed to delete player.',
      confirmDelete: 'Delete this player?',
      searchName: 'Search name…', searchTeam: 'Search team…',
      none: 'No players found.', type: 'Type', mainChar: 'Main Champion', mainPos: 'Position',
      accuracy: 'Accuracy', headshots: 'Headshots', kills: 'Kills', deaths: 'Deaths',
      assists: 'Assists', goals: 'Goals', saves: 'Goals Saved', shotsOnTarget: 'Shots on Target',
      ballRecoveries: 'Ball Recoveries', avgPosition: 'Avg. Position', podiums: 'Podiums',
      fastestLaps: 'Fastest Laps', dnf: 'DNFs', avgPlacement: 'Avg. Placement',
      top10: 'Top-10 Rate', dmgPerMatch: 'Damage / Match', noTeam: 'No team (free agent)',
      noTeamShort: 'No team', dob: 'Date of Birth', wins: 'Wins', losses: 'Losses',
      matches: 'Matches', achievements: 'Achievements (one per line)', kast: 'KAST%', adr: 'ADR',
      free: 'Free', ageRange: 'Age range', min: 'Min', max: 'Max', totalKills: 'Total Kills',
      freeAgents: 'Free Agents', searchPlayer: 'Search player…', allAges: 'All Ages',
    },
    coaches: {
      new: 'New Coach', edit: 'Edit Coach',
      created: 'Coach created successfully.', updated: 'Coach updated.', deleted: 'Coach deleted.',
      saveFail: 'Failed to save coach.', deleteFail: 'Failed to delete coach.',
      confirmDelete: 'Delete this coach?', searchName: 'Search name…',
      none: 'No coaches found.', noTeam: 'No team (free agent)', achievements: 'Achievements',
    },
    teams: {
      new: 'New Team', edit: 'Edit Team',
      created: 'Team created successfully.', updated: 'Team updated.', deleted: 'Team deleted.',
      saveFail: 'Failed to save team.', deleteFail: 'Failed to delete team.',
      confirmDelete: 'Delete this team?', searchTeam: 'Search team…', searchCoach: 'Search coach…',
      none: 'No teams found.', roster: 'Roster', coachHistory: 'Coach History', noCoach: 'No coach',
    },
    tour: {
      new: 'New Tournament', edit: 'Edit Tournament',
      created: 'Tournament created successfully.', updated: 'Tournament updated.', deleted: 'Tournament deleted.',
      saveFail: 'Failed to save tournament.', deleteFail: 'Failed to delete tournament.',
      confirmDelete: 'Delete this tournament?', none: 'No tournaments found.',
      nameRequired: 'Tournament name is required.',
      duplicate: 'A tournament named "{name}" already exists.',
      minTeams: '{format} requires at least {min} teams ({n} selected).',
      maxTeams: 'This format supports at most {max} teams ({n} selected).',
      dateOrder: 'End date cannot be before the start date.',
      startDate: 'Start Date', endDate: 'End Date',
      statusAuto: 'Status (automatic)', statusHint: 'derived from the dates',
      champion: 'Champion', prizePool: 'Prize Pool', standings: 'Standings',
      bracket: 'Bracket', participants: 'Participants', searchName: 'Search name…',
      allStatuses: 'All Statuses', allFormats: 'All Formats', finished: 'Finished',
    },
    mt: {
      schedule: 'Schedule Match', recordResult: 'Record Result', editResult: 'Edit Result',
      scheduled: 'Match scheduled successfully.', resultRecorded: 'Result recorded.',
      resultUpdated: 'Result updated.', deleted: 'Match deleted.',
      scheduleFail: 'Failed to schedule match.', resultFail: 'Failed to record result.',
      confirmDelete: 'Delete this match?', draw: 'Scores must differ — a match cannot end in a draw.',
      none: 'No matches found.', pending: 'Pending', played: 'Played', won: '{name} won',
      modeModality: 'Mode / Modality', searchPlaceholder: 'Search team, tournament, player or coach…',
      noResultsFor: 'No results for "{q}"', recordAction: 'Record result', editAction: 'Edit result',
      notFound: 'Match not found.',
    },
    dt: {
      playerNotFound: 'Player not found.', coachNotFound: 'Coach not found.',
      teamNotFound: 'Team not found.', tournamentNotFound: 'Tournament not found.',
      recentForm: 'Recent Form', seasonRecord: 'Season Record', teamComparison: 'Team Comparison',
      prevMeetings: 'Previous Meetings', headToHead: 'Head-to-Head', seasonAggregates: 'Season aggregates',
      fullTime: 'Full Time', headCoach: 'Head Coach', noHistory: 'No history', noCoach: 'No coach',
      totalHeadshots: 'Total Headshots', hsMatch: 'HS / Match', kda: 'KDA Ratio',
      podiumRate: 'Podium Rate', killsMatch: 'Kills / Match',
      addPlayer: 'Add player', removeFromTeam: 'Remove from team', removeCoach: 'Remove coach',
      searchFreeAgents: 'Search free agents…', searchFreeCoaches: 'Search free agent coaches…',
      playerAdded: 'Player added to team.', playerAddFail: 'Failed to add player.',
      playerRemoved: 'Player removed from team.', playerRemoveFail: 'Failed to remove player.',
      coachAssigned: 'Coach assigned.', coachAssignFail: 'Failed to assign coach.',
      coachRemoved: 'Coach removed from team.', coachRemoveFail: 'Failed to remove coach.',
      performance: 'Performance', winRate: 'Win Rate', trophies: 'Trophies', mainChampion: 'Main Champion',
      tournamentHistory: 'Tournament History', noProfile: 'No profile details yet.',
      noAchievements: 'No achievements yet', clickEdit: 'Click edit to add them.',
      profile: 'Profile', specialization: 'Specialization',
      teamInfo: 'Team Info', matchHistory: 'Match History', pastCoaches: 'Past Coaches',
      addPlayerTitle: 'Add Player', assignCoachTitle: 'Assign Coach', assignCoach: 'Assign coach',
      changeCoach: 'Change coach', noPlayers: 'No players in this team.',
      noCoachAssigned: 'No coach assigned. Click to assign.', noTournaments: 'No tournaments.',
      noFreeAgents: 'No free agents available.', noFreeCoaches: 'No free agent coaches available.',
    },
  },
  pt: {
    brand: { subtitle: 'Gestor de Liga' },
    nav: {
      dashboard: 'Painel', players: 'Jogadores', coaches: 'Treinadores',
      teams: 'Equipas', tournaments: 'Torneios', matches: 'Partidas', transfers: 'Transferências',
    },
    common: {
      search: 'Pesquisar…', mode: 'Modo', collapse: 'Recolher', expand: 'Expandir',
      viewAll: 'Ver todos', details: 'Detalhes', cancel: 'Cancelar', save: 'Guardar',
      create: 'Criar', saving: 'A guardar…', edit: 'Editar', delete: 'Eliminar',
      loading: 'A carregar', clearFilters: 'Limpar filtros', noResults: 'Sem resultados',
      teams: 'equipas', matches: 'partidas', players: 'jogadores', back: 'Voltar a {target}',
      allGames: 'Todos os Jogos', allStatus: 'Todos os Estados', allFormats: 'Todos os Formatos',
      allTeams: 'Todas as Equipas', allNations: 'Todas as Nações', allAges: 'Todas as Idades',
      allTournaments: 'Todos os Torneios', winRate: 'Taxa de Vitória', trophies: 'Troféus',
    },
    theme: { label: 'Tema', light: 'Claro', dark: 'Escuro', system: 'Sistema' },
    lang:  { label: 'Idioma' },
    page: {
      dashboardSubAll: 'Época 2026 · Todas as Disciplinas',
      dashboardSub: 'Época 2026',
      playersSub: '{n} jogadores registados',
      coachesSub: '{n} treinadores',
      teamsSub: '{n} equipas',
      tournamentsSub: '{n} torneios',
      matchesSub: '{n} partidas',
      transfersSub: '{n} transferências registadas',
      newPlayer: 'Novo Jogador', newCoach: 'Novo Treinador', newTeam: 'Nova Equipa',
      newTournament: 'Novo Torneio', scheduleMatch: 'Agendar Partida',
    },
    transfers: {
      hire: 'Contratar', signTo: 'Contratar para equipa', pickTeam: 'Escolher equipa…',
      confirmHire: 'Contratar', noTeams: 'Sem equipa elegível para este agente.',
      allTypes: 'Todos os Tipos', allModes: 'Todos os Modos', searchPlaceholder: 'Pesquisar nome…',
      pickFirst: 'Escolhe uma equipa primeiro.', signed: '{name} assinou pelo {team}.', signFail: 'Falha ao contratar.',
    },
    dash: {
      topPlayers: 'Melhores Jogadores', topTeams: 'Melhores Equipas', topCoaches: 'Melhores Treinadores',
      statsByMode: 'Estatísticas por Modo', tournaments: 'Torneios',
      recentResults: 'Resultados Recentes', nextMatches: 'Próximas Partidas',
      minMatches: 'Mínimo de 3 partidas para aparecer.', noTeams: 'Ainda não há equipas.',
      noCoaches: 'Ainda não há treinadores.', noTournaments: 'Ainda não há torneios.',
      noResults: 'Ainda não há resultados.', noUpcoming: 'Sem partidas agendadas.', won: '{name} venceu',
      freeAgents: 'Agentes Livres', recentTransfers: 'Transferências Recentes',
      noFreeAgents: 'Sem agentes livres de momento.', noTransfers: 'Ainda não há transferências.',
      player: 'Jogador', coach: 'Treinador', freeAgent: 'Agente livre',
    },
    col: {
      nickname: 'Alcunha', fullName: 'Nome Completo', nation: 'Nação', age: 'Idade',
      mode: 'Modo', matches: 'Partidas', w: 'V', l: 'D', team: 'Equipa',
      name: 'Nome', email: 'Email', coach: 'Treinador', players: 'Jogadores',
      teamA: 'Equipa A', teamB: 'Equipa B', date: 'Data', score: 'Resultado',
      result: 'Resultado', tournament: 'Torneio', points: 'Pontos', winrate: '% Vit.',
      game: 'Jogo', status: 'Estado', format: 'Formato', trophies: 'Troféus',
      specialization: 'Especialização', city: 'Cidade', foundedYear: 'Fundação',
    },
    ui: {
      confirm: 'Confirmar', select: 'Selecionar…', selectModeFirst: 'Escolhe um modo primeiro',
      selectTournamentFirst: 'Escolhe um torneio primeiro', back: 'Voltar',
      saveFailed: 'Falha ao guardar.', deleteFailed: 'Falha ao eliminar.',
      required: 'Preenche todos os campos obrigatórios.', noTeamsForMode: 'Sem torneios para este modo',
      noParticipants: 'Sem equipas participantes', viewDetails: 'Ver detalhes', none: 'Nenhum',
    },
    players: {
      new: 'Novo Jogador', edit: 'Editar Jogador',
      created: 'Jogador criado com sucesso.', updated: 'Jogador atualizado.', deleted: 'Jogador eliminado.',
      saveFail: 'Falha ao guardar o jogador.', deleteFail: 'Falha ao eliminar o jogador.',
      confirmDelete: 'Eliminar este jogador?',
      searchName: 'Pesquisar nome…', searchTeam: 'Pesquisar equipa…',
      none: 'Nenhum jogador encontrado.', type: 'Tipo', mainChar: 'Campeão Principal', mainPos: 'Posição',
      accuracy: 'Precisão', headshots: 'Headshots', kills: 'Abates', deaths: 'Mortes',
      assists: 'Assistências', goals: 'Golos', saves: 'Golos Defendidos', shotsOnTarget: 'Remates à Baliza',
      ballRecoveries: 'Recuperações', avgPosition: 'Posição Média', podiums: 'Pódios',
      fastestLaps: 'Voltas Mais Rápidas', dnf: 'Desistências', avgPlacement: 'Colocação Média',
      top10: 'Taxa Top-10', dmgPerMatch: 'Dano / Partida', noTeam: 'Sem equipa (agente livre)',
      noTeamShort: 'Sem equipa', dob: 'Data de Nascimento', wins: 'Vitórias', losses: 'Derrotas',
      matches: 'Partidas', achievements: 'Conquistas (uma por linha)', kast: 'KAST%', adr: 'ADR',
      free: 'Livre', ageRange: 'Faixa etária', min: 'Mín', max: 'Máx', totalKills: 'Abates Totais',
      freeAgents: 'Agentes Livres', searchPlayer: 'Pesquisar jogador…', allAges: 'Todas as Idades',
    },
    coaches: {
      new: 'Novo Treinador', edit: 'Editar Treinador',
      created: 'Treinador criado com sucesso.', updated: 'Treinador atualizado.', deleted: 'Treinador eliminado.',
      saveFail: 'Falha ao guardar o treinador.', deleteFail: 'Falha ao eliminar o treinador.',
      confirmDelete: 'Eliminar este treinador?', searchName: 'Pesquisar nome…',
      none: 'Nenhum treinador encontrado.', noTeam: 'Sem equipa (agente livre)', achievements: 'Conquistas',
    },
    teams: {
      new: 'Nova Equipa', edit: 'Editar Equipa',
      created: 'Equipa criada com sucesso.', updated: 'Equipa atualizada.', deleted: 'Equipa eliminada.',
      saveFail: 'Falha ao guardar a equipa.', deleteFail: 'Falha ao eliminar a equipa.',
      confirmDelete: 'Eliminar esta equipa?', searchTeam: 'Pesquisar equipa…', searchCoach: 'Pesquisar treinador…',
      none: 'Nenhuma equipa encontrada.', roster: 'Plantel', coachHistory: 'Histórico de Treinadores', noCoach: 'Sem treinador',
    },
    tour: {
      new: 'Novo Torneio', edit: 'Editar Torneio',
      created: 'Torneio criado com sucesso.', updated: 'Torneio atualizado.', deleted: 'Torneio eliminado.',
      saveFail: 'Falha ao guardar o torneio.', deleteFail: 'Falha ao eliminar o torneio.',
      confirmDelete: 'Eliminar este torneio?', none: 'Nenhum torneio encontrado.',
      nameRequired: 'O nome do torneio é obrigatório.',
      duplicate: 'Já existe um torneio com o nome "{name}".',
      minTeams: '{format} requer pelo menos {min} equipas ({n} selecionadas).',
      maxTeams: 'Este formato suporta no máximo {max} equipas ({n} selecionadas).',
      dateOrder: 'A data de fim não pode ser anterior à de início.',
      startDate: 'Data de Início', endDate: 'Data de Fim',
      statusAuto: 'Estado (automático)', statusHint: 'derivado das datas',
      champion: 'Campeão', prizePool: 'Prémios', standings: 'Classificação',
      bracket: 'Chave', participants: 'Participantes', searchName: 'Pesquisar nome…',
      allStatuses: 'Todos os Estados', allFormats: 'Todos os Formatos', finished: 'Terminadas',
    },
    mt: {
      schedule: 'Agendar Partida', recordResult: 'Registar Resultado', editResult: 'Editar Resultado',
      scheduled: 'Partida agendada com sucesso.', resultRecorded: 'Resultado registado.',
      resultUpdated: 'Resultado atualizado.', deleted: 'Partida eliminada.',
      scheduleFail: 'Falha ao agendar a partida.', resultFail: 'Falha ao registar o resultado.',
      confirmDelete: 'Eliminar esta partida?', draw: 'Os resultados têm de diferir — uma partida não pode terminar empatada.',
      none: 'Nenhuma partida encontrada.', pending: 'Pendente', played: 'Jogada', won: '{name} venceu',
      modeModality: 'Modo / Modalidade', searchPlaceholder: 'Pesquisar equipa, torneio, jogador ou treinador…',
      noResultsFor: 'Sem resultados para "{q}"', recordAction: 'Registar resultado', editAction: 'Editar resultado',
      notFound: 'Partida não encontrada.',
    },
    dt: {
      playerNotFound: 'Jogador não encontrado.', coachNotFound: 'Treinador não encontrado.',
      teamNotFound: 'Equipa não encontrada.', tournamentNotFound: 'Torneio não encontrado.',
      recentForm: 'Forma Recente', seasonRecord: 'Registo da Época', teamComparison: 'Comparação de Equipas',
      prevMeetings: 'Confrontos Anteriores', headToHead: 'Confronto Direto', seasonAggregates: 'Totais da época',
      fullTime: 'Fim do Jogo', headCoach: 'Treinador Principal', noHistory: 'Sem histórico', noCoach: 'Sem treinador',
      totalHeadshots: 'Headshots Totais', hsMatch: 'HS / Partida', kda: 'Rácio KDA',
      podiumRate: 'Taxa de Pódio', killsMatch: 'Abates / Partida',
      addPlayer: 'Adicionar jogador', removeFromTeam: 'Remover da equipa', removeCoach: 'Remover treinador',
      searchFreeAgents: 'Pesquisar agentes livres…', searchFreeCoaches: 'Pesquisar treinadores livres…',
      playerAdded: 'Jogador adicionado à equipa.', playerAddFail: 'Falha ao adicionar o jogador.',
      playerRemoved: 'Jogador removido da equipa.', playerRemoveFail: 'Falha ao remover o jogador.',
      coachAssigned: 'Treinador atribuído.', coachAssignFail: 'Falha ao atribuir o treinador.',
      coachRemoved: 'Treinador removido da equipa.', coachRemoveFail: 'Falha ao remover o treinador.',
      performance: 'Desempenho', winRate: 'Taxa de Vitória', trophies: 'Troféus', mainChampion: 'Campeão Principal',
      tournamentHistory: 'Histórico de Torneios', noProfile: 'Ainda sem detalhes de perfil.',
      noAchievements: 'Ainda sem conquistas', clickEdit: 'Clica em editar para adicionar.',
      profile: 'Perfil', specialization: 'Especialização',
      teamInfo: 'Info da Equipa', matchHistory: 'Histórico de Partidas', pastCoaches: 'Treinadores Anteriores',
      addPlayerTitle: 'Adicionar Jogador', assignCoachTitle: 'Atribuir Treinador', assignCoach: 'Atribuir treinador',
      changeCoach: 'Mudar treinador', noPlayers: 'Sem jogadores nesta equipa.',
      noCoachAssigned: 'Sem treinador atribuído. Clica para atribuir.', noTournaments: 'Sem torneios.',
      noFreeAgents: 'Sem agentes livres disponíveis.', noFreeCoaches: 'Sem treinadores livres disponíveis.',
    },
  },
}

const LanguageContext = createContext(null)

const getStored = () => {
  try { return localStorage.getItem('lang') || 'en' } catch { return 'en' }
}

function lookup(lang, key) {
  const path = key.split('.')
  let cur = DICT[lang]
  for (const p of path) { cur = cur?.[p]; if (cur == null) break }
  if (cur == null && lang !== 'en') return lookup('en', key)
  return cur ?? key
}

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(getStored)

  useEffect(() => {
    try { localStorage.setItem('lang', lang) } catch { /* ignore */ }
    document.documentElement.setAttribute('lang', lang === 'pt' ? 'pt-PT' : 'en')
  }, [lang])

  const t = useCallback((key, vars) => {
    let str = lookup(lang, key)
    if (vars && typeof str === 'string') {
      for (const [k, v] of Object.entries(vars)) str = str.replaceAll(`{${k}}`, v)
    }
    return str
  }, [lang])

  const setLang = useCallback((l) => setLangState(l), [])
  const toggleLang = useCallback(() => setLangState(l => (l === 'en' ? 'pt' : 'en')), [])

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components -- hook colocated with its provider
export function useT() {
  const ctx = useContext(LanguageContext)
  return ctx
}
