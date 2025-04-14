import { create, web_deal } from 'fpng-sign-serve';

const emoji = "🚷";
const domain = "noidentity.dev";
const backup = Deno.env.get("CL_NID_BACKUP");
const site = {};
site.page = Deno.readTextFileSync("assets/page.html");
site.css = Deno.readTextFileSync("assets/style.css");
create(site,domain,backup,emoji);
Deno.serve({
  port: 3052,
  hostname: "0.0.0.0",
  handler: (req) => web_deal(req,domain),
});
