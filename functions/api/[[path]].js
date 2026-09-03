const WORKER_URL = "https://kakigoori-api.s50261011.workers.dev";

export async function onRequest(context) {
  const { request, params } = context;

  // [[path]] の値を取得
  let path = params.path || "";

  // 配列になっている場合にも対応
  if (Array.isArray(path)) {
    path = path.join("/");
  }

  // Worker側のAPI URLを作る
  const target = new URL(`${WORKER_URL}/api/${path}`);

  // ?xxx=xxx などのクエリも引き継ぐ
  const originalUrl = new URL(request.url);
  target.search = originalUrl.search;

  // 元のリクエストヘッダーをコピー
  const headers = new Headers(request.headers);

  const init = {
    method: request.method,
    headers: headers
  };

  // GET / HEAD 以外はボディもそのまま転送
  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = request.body;
  }

  // Workerへ転送
  const response = await fetch(target.toString(), init);

  // Workerのレスポンスをそのまま返す
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers
  });
}
