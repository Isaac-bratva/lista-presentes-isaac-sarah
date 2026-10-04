import type { Settings } from "@/db/schema";
import { ALL_150_GIFTS, type SeedGiftItem } from "./all-gifts-data";
import { allowsManyBuyers } from "./purchase-mode";

export const DEFAULT_SETTINGS: Omit<Settings, "updatedAt"> = {
  id: 1,
  coupleTitle: "Isaac & Sarah",
  weddingDate: "21 de março de 2027",
  weddingTime: "15h30 chegada · 16h início da cerimônia",
  weddingVenue:
    "Espaço Ravena Garden · Av. Ver. Belarmino Pereira de Carvalho, 1313 · Mairiporã",
  heroMessage:
    "Ter você com a gente no dia 21 de março já é o presente que mais importa. Mas, se quiser nos presentear também, reunimos aqui algumas ideias — umas bem sérias, outras nem tanto.",
  listTitle: "Nossa lista de presentes",
  listSubtitle:
    "Escolha um presente, pague por PIX ou cartão de crédito e deixe um recadinho para Isaac & Sarah. O carinho chega direto até nós.",
  pixKey: "44454516812",
  pixKeyType: "chave",
  pixName: "Isaac & Sarah",
  pixCity: "MAIRIPORA",
  pixNote:
    "Depois do PIX, a gente recebe a notificação e o presente fica registrado com o seu nome e recado.",
  creditCardUrl: "",
  goalCents: 3_000_000,
  footerNote:
    "Isaac & Sarah · 21 de março de 2027 · Espaço Ravena Garden",
};

export type SeedGift = SeedGiftItem;

export const DEFAULT_GIFTS: SeedGift[] = ALL_150_GIFTS.map((gift) => ({
  ...gift,
  allowMultiple: allowsManyBuyers(gift.title),
}));
