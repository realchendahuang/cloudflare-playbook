interface Env {
  ASSETS: {
    fetch(request: Request): Promise<Response>;
  };
}

const OLD_HOST = 'cloudflare-playbook.chendahuang.top';
const NEW_BASE_PATH = '/playbook/cloudflare';

export default {
  // 旧子域只做 301 跳转，并保留原路径与 query，方便旧链接迁到新 canonical 路径。
  fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.hostname === 'chendahuang.com' && url.pathname === NEW_BASE_PATH) {
      url.pathname = `${NEW_BASE_PATH}/`;

      return Promise.resolve(Response.redirect(url.toString(), 301));
    }

    if (url.hostname === OLD_HOST) {
      url.hostname = 'chendahuang.com';
      url.pathname = `${NEW_BASE_PATH}${url.pathname === '/' ? '/' : url.pathname}`;

      return Promise.resolve(Response.redirect(url.toString(), 301));
    }

    return env.ASSETS.fetch(request);
  }
};
