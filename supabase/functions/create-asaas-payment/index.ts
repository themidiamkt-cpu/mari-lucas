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

  const apiKey = Deno.env.get("ASAAS_API_KEY");
  const baseUrl = Deno.env.get("ASAAS_BASE_URL") || "https://api.asaas.com/v3";

  if (!apiKey) {
    return json({ error: "ASAAS_API_KEY secret is not configured" }, 500);
  }

  const payload = (await req.json().catch(() => ({}))) as PaymentRequest;
  const value = Number(payload.presente_valor || 0);

  if (!Number.isFinite(value) || value <= 0) {
    return json({ error: "Valor do presente inválido" }, 400);
  }

  const name = payload.presente_nome?.trim() || "Presente Mari e Lucas";

  const asaasRes = await fetch(`${baseUrl}/paymentLinks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      access_token: apiKey,
    },
    body: JSON.stringify({
      name,
      description: `Presente de casamento - ${name}`,
      value,
      billingType: "UNDEFINED",
      chargeType: "DETACHED",
      dueDateLimitDays: 30,
      maxInstallmentCount: 6,
      externalReference: payload.presente_id || undefined,
    }),
  });

  const data = await asaasRes.json().catch(() => ({}));

  if (!asaasRes.ok) {
    return json(
      {
        error: data.errors?.[0]?.description || data.message || "Erro ao criar link no Asaas",
        details: data,
      },
      asaasRes.status,
    );
  }

  return json({
    id: data.id,
    url: data.url,
    paymentLinkUrl: data.url,
  });
});
