type PaymentRequest = {
  presente_id?: string | null;
  presente_nome?: string;
  presente_valor?: number | string | null;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  const accessToken = Deno.env.get("MERCADO_PAGO_ACCESS_TOKEN");
  const baseUrl = Deno.env.get("MERCADO_PAGO_BASE_URL") || "https://api.mercadopago.com";
  const siteUrl = Deno.env.get("SITE_URL") || "https://mari-lucas.vercel.app";
  const notificationUrl = Deno.env.get("MERCADO_PAGO_WEBHOOK_URL");

  if (!accessToken) {
    return json({ error: "MERCADO_PAGO_ACCESS_TOKEN secret is not configured" }, 500);
  }

  const payload = (await req.json().catch(() => ({}))) as PaymentRequest;
  const value = Number(payload.presente_valor || 0);

  if (!Number.isFinite(value) || value < 5) {
    return json({ error: "Informe um valor de pelo menos R$ 5,00" }, 400);
  }

  const name = payload.presente_nome?.trim() || "Presente Mari e Lucas";
  const reference = payload.presente_id || crypto.randomUUID();
  const returnUrl = `${siteUrl}/?pagamento=mercado-pago#presentes`;

  const preferenceBody = {
    items: [
      {
        id: reference,
        title: name,
        description: `Presente de casamento - ${name}`,
        quantity: 1,
        currency_id: "BRL",
        unit_price: Number(value.toFixed(2)),
      },
    ],
    external_reference: reference,
    back_urls: {
      success: returnUrl,
      failure: returnUrl,
      pending: returnUrl,
    },
    auto_return: "approved",
    payment_methods: {
      installments: 3,
      excluded_payment_types: [
        { id: "ticket" },
        { id: "atm" },
        { id: "bank_transfer" },
        { id: "debit_card" },
        { id: "prepaid_card" },
      ],
    },
    statement_descriptor: "MARI E LUCAS",
    metadata: {
      presente_id: payload.presente_id || null,
      presente_nome: name,
    },
    ...(notificationUrl ? { notification_url: notificationUrl } : {}),
  };

  const mercadoPagoRes = await fetch(`${baseUrl}/checkout/preferences`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(preferenceBody),
  });

  const data = await mercadoPagoRes.json().catch(() => ({}));

  if (!mercadoPagoRes.ok) {
    return json(
      {
        error:
          data.message ||
          data.error ||
          data.cause?.[0]?.description ||
          "Erro ao criar checkout no Mercado Pago",
        details: data,
      },
      mercadoPagoRes.status,
    );
  }

  return json({
    id: data.id,
    url: data.init_point,
    init_point: data.init_point,
    sandbox_init_point: data.sandbox_init_point,
  });
});
