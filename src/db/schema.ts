import {
  boolean,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const gifts = pgTable("gifts", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  amountCents: integer("amount_cents").notNull().default(0),
  imageUrl: text("image_url"),
  emoji: text("emoji"),
  category: text("category").notNull().default("geral"),
  memeBadge: text("meme_badge").notNull().default("MEME"),
  memeCaption: text("meme_caption").notNull().default(""),
  isFlexible: boolean("is_flexible").notNull().default(false),
  allowMultiple: boolean("allow_multiple").notNull().default(true),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const contributions = pgTable("contributions", {
  id: serial("id").primaryKey(),
  giftId: integer("gift_id").references(() => gifts.id, {
    onDelete: "set null",
  }),
  giftSlug: text("gift_slug").notNull().default(""),
  giftTitle: text("gift_title").notNull(),
  amountCents: integer("amount_cents").notNull(),
  guestName: text("guest_name").notNull().default(""),
  message: text("message").notNull().default(""),
  paymentMethod: text("payment_method").notNull().default("pix"),
  isPublic: boolean("is_public").notNull().default(true),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  confirmedAt: timestamp("confirmed_at", { withTimezone: true }),
});

export const settings = pgTable("settings", {
  id: integer("id").primaryKey(),
  coupleTitle: text("couple_title").notNull().default("Isaac & Sarah"),
  weddingDate: text("wedding_date")
    .notNull()
    .default("21 de março de 2027"),
  weddingTime: text("wedding_time")
    .notNull()
    .default("15h30 chegada · 16h início da cerimônia"),
  weddingVenue: text("wedding_venue")
    .notNull()
    .default(
      "Espaço Ravena Garden · Av. Ver. Belarmino Pereira de Carvalho, 1313 · Mairiporã",
    ),
  heroMessage: text("hero_message").notNull().default(
    "Escolhemos alguns presentes para celebrar este novo capítulo com a gente — dos mais úteis aos mais divertidos. Fique à vontade para escolher o seu.",
  ),
  listTitle: text("list_title").notNull().default("Nossa lista de presentes"),
  listSubtitle: text("list_subtitle").notNull().default(
    "Escolha um presente, pague por PIX e deixe um recadinho para Isaac & Sarah. O carinho chega direto até nós.",
  ),
  pixKey: text("pix_key").notNull().default("44454516812"),
  pixKeyType: text("pix_type").notNull().default("chave"),
  pixName: text("pix_name").notNull().default("Isaac & Sarah"),
  pixCity: text("pix_city").notNull().default("MAIRIPORA"),
  pixNote: text("pix_note").notNull().default(
    "Depois do PIX, a gente recebe a notificação e o presente fica registrado com o seu nome e recado.",
  ),
  creditCardUrl: text("credit_card_url").notNull().default(""),
  goalCents: integer("goal_cents").notNull().default(3000000),
  footerNote: text("footer_note").notNull().default(
    "Isaac & Sarah · 21 de março de 2027 · Espaço Ravena Garden",
  ),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Gift = typeof gifts.$inferSelect;
export type Contribution = typeof contributions.$inferSelect;
export type Settings = typeof settings.$inferSelect;
