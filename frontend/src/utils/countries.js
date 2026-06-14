// Shared nationality → ISO 3166-1 code map (used for flag-icons + flag emoji).
// Centralised so the pages don't each redefine an incomplete copy.
// UK home nations use flag-icons subdivision codes (gb-eng, gb-sct, gb-wls).
export const COUNTRY_CODE = {
  'Argentina': 'AR', 'Australia': 'AU', 'Bangladesh': 'BD', 'Brazil': 'BR',
  'Canada': 'CA', 'China': 'CN', 'Colombia': 'CO', 'Croatia': 'HR',
  'Czech Republic': 'CZ', 'Denmark': 'DK', 'Egypt': 'EG', 'England': 'GB-ENG',
  'Finland': 'FI', 'France': 'FR', 'Germany': 'DE', 'Ghana': 'GH',
  'India': 'IN', 'Ireland': 'IE', 'Italy': 'IT', 'Japan': 'JP',
  'Lebanon': 'LB', 'Mexico': 'MX', 'Morocco': 'MA', 'Netherlands': 'NL',
  'Nigeria': 'NG', 'Norway': 'NO', 'Pakistan': 'PK', 'Portugal': 'PT',
  'Russia': 'RU', 'Scotland': 'GB-SCT', 'Senegal': 'SN', 'South Korea': 'KR',
  'Spain': 'ES', 'Sweden': 'SE', 'Switzerland': 'CH', 'Taiwan': 'TW',
  'Ukraine': 'UA', 'United Arab Emirates': 'AE', 'United Kingdom': 'GB',
  'USA': 'US', 'Wales': 'GB-WLS',
}

// Regional-indicator flag emoji for a nationality. Returns '' for unknown
// countries and for subdivision codes (e.g. GB-ENG) that have no emoji.
export function flagEmoji(nationality) {
  const code = COUNTRY_CODE[nationality]
  if (!code || code.length !== 2) return ''
  return code.toUpperCase().split('')
    .map(c => String.fromCodePoint(0x1F1E6 + c.charCodeAt(0) - 65))
    .join('')
}
