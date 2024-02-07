import { App, type HttpRequest, type HttpResponse } from "uWebSockets.js";

export function createRequest(
  res: HttpResponse,
  req: HttpRequest
): Request | Promise<Request> {
  const url = `${
    req.getHeader("x-forwarded-proto") === "https" ? "https" : "http"
  }://${req.getHeader("host")}${req.getUrl()}`;

  const method = req.getCaseSensitiveMethod();

  const headers: Record<string, string> = {};

  req.forEach((k, v) => (headers[k] = v));

  if (method !== "GET" && method !== "HEAD") {
    return new Promise((resolve, reject) => {
      res.onAborted(reject);

      res.onData((body) =>
        resolve(
          new Request(url, {
            method,
            headers,
            body,
          })
        )
      );
    });
  }

  return new Request(url, {
    method,
    headers,
  });
}

export async function serve(
  cb: (req: Request) => Response | Promise<Response>
) {
  App()
    .any("*", async (res, req) => {
      const response = await cb(await createRequest(res, req));

      res.writeStatus(response.status.toString());

      response.headers.forEach((val, key) => res.writeHeader(key, val));

      res.end(await response.text());
    })
    .listen(3000, () => {});
}
