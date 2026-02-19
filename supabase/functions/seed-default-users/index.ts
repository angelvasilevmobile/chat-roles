import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const results: string[] = [];

    // Create admin account
    const { data: adminData, error: adminError } = await supabase.auth.admin.createUser({
      email: "admin@example.com",
      password: "admin123",
      email_confirm: true,
      user_metadata: { username: "Admin" },
    });

    if (adminError) {
      if (adminError.message?.includes("already been registered")) {
        results.push("Admin account already exists");
      } else {
        results.push(`Admin error: ${adminError.message}`);
      }
    } else if (adminData.user) {
      // Set admin role
      await supabase
        .from("user_roles")
        .update({ role: "admin" })
        .eq("user_id", adminData.user.id);
      results.push("Admin account created (admin@example.com / admin123)");
    }

    // Create user account
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email: "user@example.com",
      password: "user123",
      email_confirm: true,
      user_metadata: { username: "User" },
    });

    if (userError) {
      if (userError.message?.includes("already been registered")) {
        results.push("User account already exists");
      } else {
        results.push(`User error: ${userError.message}`);
      }
    } else {
      results.push("User account created (user@example.com / user123)");
    }

    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
