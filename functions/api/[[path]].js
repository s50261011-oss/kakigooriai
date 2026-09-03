const WORKER_URL = "https://kakigoori-api.s50261011.workers.dev";

export async function onRequest(context) {
  const { request, params } = context;

  let path = params.path || "";

  if (Array.isArray(path)) {
    path = path.join("/");
  }

  const target = new URL(`${WORKER_URL}/api/${path}`);

  const originalUrl = new URL(request.url);
  target.search = originalUrl.search;

  const headers = new Headers(request.headers);

  // ブラウザから送られてきたCookieをWorkerへ渡す
  const cookie = request.headers.get("Cookie");

  if (cookie) {
    headers.set("Cookie", cookie);
  }

  const init = {
    method: request.method,
    headers: headers
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = request.body;
  }

  const response = await fetch(target.toString(), init);

  // WorkerのレスポンスをPages側へ返す
  const responseHeaders = new Headers(response.headers);

  // WorkerからのSet-Cookieをそのままブラウザへ渡す
  const setCookie = response.headers.get("Set-Cookie");

  if (setCookie) {
    responseHeaders.set("Set-Cookie", setCookie);
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders
  });
}
