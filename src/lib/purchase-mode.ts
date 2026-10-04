const UNIQUE_HINTS = [
  "1º lugar",
  "1o lugar",
  "certificado de melhor",
  "título de parente",
  "titulo de parente",
  "mba do noivo",
  "vale esquecer o aniversário",
  "vale roubar o topo",
  "mira com precisão",
  "levar alguém que não foi convidado",
];

const REPEATABLE_HINTS = [
  "pix",
  "cota",
  "vale",
  "vaquinha",
  "ajuda",
  "taxa",
  "compra de",
  "caso sinta",
  "mostrar que é rico",
  "mostrar que e rico",
  "meu marido",
  "voto",
  "maracujina",
  "coca",
  "relaxante",
  "calmantes",
  "apoio psicológico",
  "apoio psicologico",
  "plano vitalício",
  "plano vitalicio",
  "direito de repetir",
  "licença",
  "licenca",
  "selo",
  "aviãozinho",
  "aviaozinho",
  "passagem",
  "netflix",
  "ifood",
  "mensalidade",
  "jantar",
  "diária",
  "diaria",
  "ajudinha",
  "curso",
];

export function allowsManyBuyers(title: string): boolean {
  const normalized = title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  if (UNIQUE_HINTS.some((hint) => normalized.includes(hint.normalize("NFD").replace(/[\u0300-\u036f]/g, "")))) {
    return false;
  }

  return REPEATABLE_HINTS.some((hint) =>
    normalized.includes(hint.normalize("NFD").replace(/[\u0300-\u036f]/g, "")),
  );
}
