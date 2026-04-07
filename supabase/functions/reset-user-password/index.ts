import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function generatePassword(length = 10): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => chars[b % chars.length]).join("");
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const anonClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const {
      data: { user: caller },
      error: userError,
    } = await anonClient.auth.getUser();
    if (userError || !caller) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { target_user_id } = body;

    if (!target_user_id) {
      return new Response(
        JSON.stringify({ error: "target_user_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check caller roles
    const { data: callerRoles } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", caller.id);

    const roles = (callerRoles || []).map((r: any) => r.role);
    const isAdmin = roles.includes("admin");
    const isManager = roles.includes("manager");

    if (!isAdmin && !isManager) {
      return new Response(
        JSON.stringify({ error: "Only admins and managers can reset passwords" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // If manager, verify they can manage this user:
    // - Target must be a tenant created by this manager, OR
    // - Target must be a tenant on a property the manager is assigned to
    if (!isAdmin) {
      // Check if target is a tenant created by this manager
      const { data: createdTenant } = await adminClient
        .from("tenants")
        .select("id")
        .eq("user_id", target_user_id)
        .eq("created_by", caller.id)
        .maybeSingle();

      if (!createdTenant) {
        // Check if target tenant has a lease on manager's assigned property
        const { data: staffProps } = await adminClient
          .from("property_staff")
          .select("property_id")
          .eq("user_id", caller.id);

        const propertyIds = (staffProps || []).map((s: any) => s.property_id);

        if (propertyIds.length === 0) {
          return new Response(
            JSON.stringify({ error: "You can only reset passwords for your own tenants" }),
            { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Find tenant record for target user
        const { data: targetTenant } = await adminClient
          .from("tenants")
          .select("id")
          .eq("user_id", target_user_id)
          .maybeSingle();

        if (!targetTenant) {
          return new Response(
            JSON.stringify({ error: "You can only reset passwords for your own tenants" }),
            { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Check if tenant has lease on one of manager's properties
        const { data: lease } = await adminClient
          .from("leases")
          .select("id")
          .eq("tenant_id", targetTenant.id)
          .in("property_id", propertyIds)
          .limit(1)
          .maybeSingle();

        if (!lease) {
          return new Response(
            JSON.stringify({ error: "You can only reset passwords for tenants on your assigned properties" }),
            { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }
    }

    // Generate new password and update
    const newPassword = generatePassword(10);

    const { error: updateError } = await adminClient.auth.admin.updateUserById(
      target_user_id,
      { password: newPassword }
    );

    if (updateError) {
      return new Response(
        JSON.stringify({ error: updateError.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Set must_change_password flag
    await adminClient
      .from("profiles")
      .update({ must_change_password: true })
      .eq("user_id", target_user_id);

    return new Response(
      JSON.stringify({ temporary_password: newPassword }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("reset-user-password error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
