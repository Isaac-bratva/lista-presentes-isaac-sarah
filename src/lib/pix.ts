/**
 * Gerador de payload PIX (BR Code / EMV QR Code) "copia e cola".
 * Implementação própria, sem dependências externas, seguindo o
 * padrão do Banco Central (QR Code estático com valor).
 */

function crc16(payload: string): string {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let bit = 0; bit < 8; bit++) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

function tlv(id: string, value: string): string {
  return `${id}${String(value.length).padStart(2, "0")}${value}`;
}

function clean(text: string, maxLength: number): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9 .,\-_@]/g, "")
    .trim()
    .slice(0, maxLength)
    .toUpperCase();
}

function cleanTxid(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9]/g, "")
    .slice(0, 25)
    .toUpperCase();
}

export type PixInput = {
  key: string;
  name: string;
  city: string;
  amountCents?: number | null;
  txid?: string | null;
};

export function buildPixPayload({
  key,
  name,
  city,
  amountCents,
  txid,
}: PixInput): string {
  const merchantAccount = tlv("00", "br.gov.bcb.pix") + tlv("01", key);

  let payload = "";
  payload += tlv("00", "01");
  payload += tlv("01", "11"); // QR estático, reutilizável
  payload += tlv("26", merchantAccount);
  payload += tlv("52", "0000");
  payload += tlv("53", "986");
  if (amountCents && amountCents > 0) {
    payload += tlv("54", (amountCents / 100).toFixed(2));
  }
  payload += tlv("58", "BR");
  payload += tlv("59", clean(name, 25) || "NOIVOS");
  payload += tlv("60", clean(city, 15) || "BRASIL");
  payload += tlv("62", tlv("05", cleanTxid(txid ?? "***") || "***"));
  payload += "6304";

  return payload + crc16(payload);
}

export const PIX_KEY_LABELS: Record<string, string> = {
  cpf: "CPF",
  cnpj: "CNPJ",
  telefone: "Celular",
  email: "E-mail",
  aleatoria: "Chave aleatória",
};

export function pixKeyLabel(type: string): string {
  return PIX_KEY_LABELS[type] ?? "Chave PIX";
}
