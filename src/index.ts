import { serve } from "./helpers";

serve((req) => {
  console.log(req);

  return new Response("Hello World");
});
