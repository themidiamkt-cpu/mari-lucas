// ============================================================
//  config.js — Configurações do site Mari & Lucas
//  ⚠️  EDITE ESTE ARQUIVO antes de publicar o site
// ============================================================

const CONFIG = {
  // ── Supabase ──────────────────────────────────────────────
  // Encontre em: https://supabase.com → seu projeto → Settings → API
  SUPABASE_URL: "https://fmquwsvcaqdterwoajly.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtcXV3c3ZjYXFkdGVyd29hamx5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzODA4OTgsImV4cCI6MjA5Mzk1Njg5OH0.83ESyqDOfCtDeaKfuOW9cHfFT2u5nx8jVnqr49AOIi4",
  //  Exemplo: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSJ..."

  // ── Pix ───────────────────────────────────────────────────
  // Cole a chave Pix real dos noivos (CPF, e-mail, telefone ou aleatória)
  PIX_KEY: "19995928751",
  PIX_NOME: "Mari e Lucas",
  //  Exemplo: PIX_KEY: "marilucas@email.com"

  // ── Asaas ─────────────────────────────────────────────────
  // Cole aqui um link de pagamento do Asaas quando estiver pronto.
  // Para integração por API, use um backend/n8n. Não coloque token privado do Asaas neste arquivo.
  ASAAS_PAYMENT_URL: "",
  ASAAS_ENABLED: false,

  // ── n8n Webhook ───────────────────────────────────────────
  // Cole a URL do webhook criado no n8n (Production URL)
  N8N_WEBHOOK_URL: "https://automacao2.themidiamarketing.com.br/webhook/mari-lucas",
  //  Exemplo: "https://n8n.seuservidor.com/webhook/casamento-pix"

  // ── Casamento ─────────────────────────────────────────────
  WEDDING_DATE: "2026-10-25T15:30:00",
  VENUE_CEREMONY: "Espaço Ibiacê",
  VENUE_CEREMONY_ADDRESS: "Estr. Sousas - Pedreira - Souzas, Campinas - SP, 13104-901",
  VENUE_RECEPTION: "Espaço Ibiacê",
  VENUE_RECEPTION_ADDRESS: "Estr. Sousas - Pedreira - Souzas, Campinas - SP, 13104-901",

  // ── Admin ─────────────────────────────────────────────────
  // ⚠️ Troque esta senha antes de publicar!
  ADMIN_PASSWORD: "marilucas@2026",
};
