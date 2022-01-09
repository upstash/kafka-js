import { HttpClient } from "./http.ts";
import { assertEquals } from "https://deno.land/std/testing/asserts.ts";
Deno.test({
  name: "httpClient",
  fn: async (t) => {
    await t.step("remove trailing slash from urls", () => {
      const client = new HttpClient({
        baseUrl: "https://example.com/",
      });

      assertEquals(client.baseUrl, "https://example.com");
    });
  },
});
