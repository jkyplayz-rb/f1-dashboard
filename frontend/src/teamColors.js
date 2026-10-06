export const teamColors = {
  'Red Bull Racing': '#3671C6',
  'Ferrari': '#E8002D',
  'Mercedes': '#27F4D2',
  'McLaren': '#FF8000',
  'Aston Martin': '#00665F',
  'Alpine': '#FF87BC',
  'Williams': '#64C4FF',
  'RB': '#6692FF',
  'Kick Sauber': '#52E252',
  'Haas F1 Team': '#B6BABD',
  'Racing Bulls': '#6C98FF',
  'Audi': '#F50537',
  'Cadillac': '#909090',
  'AlphaTauri': '#5E8FAA',
  'Alfa Romeo': '#C92D4B',
}

export function getTeamColor(teamName) {
  return teamColors[teamName] || '#3a3a3a'
}