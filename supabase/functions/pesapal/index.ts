import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PESAPAL_BASE = Deno.env.get("PESAPAL_ENV") === "sandbox"
  ? "https://cybqa.pesapal.com/pesapalv3"
  : "https://pay.pesapal.com/v3";

async function getAccessToken(): Promise<string> {
  const res = await fetch(`${PESAPAL_BASE}/api/Auth/RequestToken`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      consumer_key: Deno.env.get("PESAPAL_CONSUMER_KEY"),
      consumer_secret: Deno.env.get("PESAPAL_CONSUMER_SECRET"),
    }),
  });
  if (!res.ok) throw new Error(`Pesapal auth failed: ${res.status}`);
  const data = await res.json();
  return data.token;
}

async function registerIPN(token: string, ipnUrl: string): Promise<string> {
  const res = await fetch(`${PESAPAL_BASE}/api/URLSetup/RegisterIPN`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      url: ipnUrl,
      ipn_notification_type: "GET",
    }),
  });
  if (!res.ok) throw new Error(`IPN registration failed: ${res.status}`);
  const data = await res.json();
  return data.ipn_id;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    // ── IPN Callback (Pesapal notifies us of payment status) ──
    if (action === "ipn") {
      const orderTrackingId = url.searchParams.get("OrderTrackingId");
      const orderMerchantReference = url.searchParams.get("OrderMerchantReference");
      const notificationType = url.searchParams.get("OrderNotificationType");

      if (!orderTrackingId || !orderMerchantReference) {
        return new Response(JSON.stringify({ error: "Missing IPN params" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Get transaction status from Pesapal
      const token = await getAccessToken();
      const statusRes = await fetch(
        `${PESAPAL_BASE}/api/Transactions/GetTransactionStatus?orderTrackingId=${orderTrackingId}`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const statusData = await statusRes.json();

      // Map Pesapal status to our status
      let paymentStatus: string;
      if (statusData.payment_status_description === "Completed") {
        paymentStatus = "completed";
      } else if (statusData.payment_status_description === "Failed") {
        paymentStatus = "failed";
      } else {
        paymentStatus = "pending";
      }

      // Update payment in database
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );

      await supabase
        .from("payments")
        .update({
          status: paymentStatus,
          reference: `PESAPAL-${orderTrackingId}`,
        })
        .eq("id", orderMerchantReference);

      return new Response(JSON.stringify({ status: "ok" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Submit Order (create a payment request) ──
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token_str = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token_str);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = claimsData.claims.sub as string;

    const body = await req.json();
    const { amount, currency, description, payment_id, callback_url } = body;

    if (!amount || !payment_id || !callback_url) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: amount, payment_id, callback_url" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get Pesapal access token
    const pesapalToken = await getAccessToken();

    // Get the edge function URL for IPN
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const ipnUrl = `${supabaseUrl}/functions/v1/pesapal?action=ipn`;

    // Register IPN URL
    const ipnId = await registerIPN(pesapalToken, ipnUrl);

    // Get user email for Pesapal
    const { data: userData } = await supabase.auth.getUser();
    const userEmail = userData?.user?.email || "";

    // Submit order to Pesapal
    const orderRes = await fetch(
      `${PESAPAL_BASE}/api/Transactions/SubmitOrderRequest`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${pesapalToken}`,
        },
        body: JSON.stringify({
          id: payment_id,
          currency: currency || "UGX",
          amount: Number(amount),
          description: description || "RentFlow Payment",
          callback_url: callback_url,
          redirect_mode: "",
          notification_id: ipnId,
          billing_address: {
            email_address: userEmail,
            phone_number: "",
            country_code: "UG",
            first_name: "",
            middle_name: "",
            last_name: "",
            line_1: "",
            line_2: "",
            city: "",
            state: "",
            postal_code: "",
            zip_code: "",
          },
        }),
      }
    );

    if (!orderRes.ok) {
      const errText = await orderRes.text();
      console.error("Pesapal order error:", errText);
      return new Response(
        JSON.stringify({ error: "Failed to create Pesapal order" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const orderData = await orderRes.json();

    return new Response(
      JSON.stringify({
        redirect_url: orderData.redirect_url,
        order_tracking_id: orderData.order_tracking_id,
        merchant_reference: orderData.merchant_reference,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Pesapal function error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
