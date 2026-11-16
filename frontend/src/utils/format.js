export const initials = (name) => name.trim().substring(0, 2).toUpperCase();

// O orçamento é texto livre ("50 a 80", "R$ 100"...): só prefixa "R$" quando falta.
export const formatBudget = (budget) => (/r\$/i.test(budget) ? budget : `R$ ${budget}`);

// Mensagem de erro da API: "detail" ou o primeiro erro de campo.
export const errorMessage = (err, fallback) => {
  const data = err.response?.data;
  if (data?.detail) return data.detail;
  const firstFieldError = data && typeof data === 'object' ? Object.values(data)[0] : null;
  return Array.isArray(firstFieldError) ? firstFieldError[0] : fallback;
};

const capitalize = (text) => text.charAt(0).toUpperCase() + text.slice(1);

// "2026-12-24" + "20:00" -> "Quinta-feira, 24 de dezembro às 20h" (ou "Qui., 24 de dez. às 20h" no modo curto).
// A data é montada no fuso local para não "voltar um dia" como acontece com new Date('2026-12-24').
export const formatEventDate = (date, time, { short = false } = {}) => {
  if (!date) return '';
  const [year, month, day] = date.split('-').map(Number);
  const options = short
    ? { weekday: 'short', day: 'numeric', month: 'short' }
    : { weekday: 'long', day: 'numeric', month: 'long' };
  if (year !== new Date().getFullYear()) options.year = 'numeric';
  let text = capitalize(new Date(year, month - 1, day).toLocaleDateString('pt-BR', options));
  if (time) {
    const [hours, minutes] = time.split(':');
    text += ` às ${Number(hours)}h${minutes !== '00' ? minutes : ''}`;
  }
  return text;
};

export const mapsUrl = (location) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
