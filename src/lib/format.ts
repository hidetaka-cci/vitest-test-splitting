export function capitalize(text: string): string {
  if (text.length === 0) {
    return text
  }
  return text[0].toUpperCase() + text.slice(1)
}

export function slugify(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, '-')
}
