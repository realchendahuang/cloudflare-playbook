---
title: SSL/TLS
description: Cloudflare SSL/TLS 的加密模式、边缘证书、源站证书、HTTPS 重定向、HSTS、mTLS、常见错误和最佳实践。
---

最后核对日期：2026-06-17。SSL/TLS 涉及浏览器兼容、证书签发、计划权限和源站配置，具体开关以上线时的 Cloudflare Dashboard 和官方文档为准。

## 一句话判断

Cloudflare SSL/TLS 的核心不是“点一下 HTTPS”，而是把一条请求拆成两段都加密：

```text
浏览器
  │  边缘证书：Universal SSL / Advanced / Custom
  ▼
Cloudflare Edge
  │  源站证书：公开 CA / Cloudflare Origin CA
  ▼
源站服务器 / Worker / Pages / 其他 SaaS
```

普通项目默认应该追求：**边缘 HTTPS 自动托管，源站连接使用 Full (strict)，再逐步开启 HTTPS 重定向、TLS 1.3、最低 TLS 版本和 HSTS。**

## 免费与付费边界

| 能力 | Free 可用性 | 什么时候再付费 |
| --- | --- | --- |
| Universal SSL | 可用。Full setup 默认覆盖根域和一级子域名；partial/CNAME setup 下每个 proxied 子域名会获得证书。 | 需要更深层通配符、更细 CA/有效期/主机名控制时，看 Advanced Certificate Manager 或 Total TLS。 |
| SSL/TLS encryption mode | 可用。 | Strict (SSL-Only Origin Pull) 是 Enterprise-only；普通项目用 Full (strict) 即可。 |
| Origin CA certificates | 可用。 | 只有源站需要被浏览器直连时，才改用公开可信 CA。 |
| Always Use HTTPS | 可用。 | 不需要为这个单独升级，但要先确认源站 HTTPS 正常。 |
| Automatic HTTPS Rewrites | 可用。 | 适合辅助处理 mixed content，不替代内容治理。 |
| HSTS | 可用。 | 不需要为这个单独升级；开启前要确认所有子域都能稳定 HTTPS。 |
| TLS 1.3 / Minimum TLS Version | 可用。 | per-hostname 设置和自定义 cipher suites 这类细粒度控制通常需要 Advanced Certificate Manager。 |
| Authenticated Origin Pulls | 可用。 | 对源站暴露风险更敏感时启用；需要改源站 NGINX/Caddy/Apache 配置。 |
| Custom Certificates | Free/Pro 不可用，Business/Enterprise 可用。 | 需要自带证书、EV/特定 CA、证书钉扎连续性或遗留客户端兼容时再考虑。 |
| Keyless SSL | Enterprise paid add-on。 | 私钥不能离开自有环境的企业合规场景。 |

Free 计划的 Universal SSL 主要面向支持 SNI 和 ECDSA 的现代客户端；Cloudflare 文档说明 paid zones 对 Universal certificates 还支持 RSA，兼容性更宽。面向普通 Web 用户，这通常不是问题；面向老旧设备、嵌入式设备或传统企业客户端时，要单独测试。

## 加密模式

| 模式 | 浏览器到 Cloudflare | Cloudflare 到源站 | 实践判断 |
| --- | --- | --- | --- |
| Off | HTTP | HTTP | 不适合公开生产站点。 |
| Flexible | HTTPS | HTTP | 只保护用户到边缘这一段；容易和源站 HTTPS 跳转形成重定向循环。 |
| Full | HTTPS | HTTPS | 会加密到源站，但不严格校验证书有效性；临时过渡可以，长期不推荐。 |
| Full (strict) | HTTPS | HTTPS + 校验证书 | 普通项目的默认目标。源站证书可以来自公开 CA，也可以来自 Cloudflare Origin CA。 |
| Strict (SSL-Only Origin Pull) | HTTP/HTTPS 都强制到源站 HTTPS | HTTPS + 校验证书 | Enterprise-only，普通项目先不用。 |

Cloudflare 官方在 encryption modes 文档里建议尽量使用 Full 或 Full (strict)。本站的判断更直接：**新项目直接按 Full (strict) 设计，只有迁移期才短暂使用 Full。**

## 推荐配置顺序

| 顺序 | 操作 | 验证方式 |
| --- | --- | --- |
| 1 | DNS 记录先确认是 Proxied。 | `dig example.com` 看到 Cloudflare 代理 IP，Dashboard 显示橙云。 |
| 2 | 等 Universal SSL 证书 Active。 | Edge Certificates 页面显示证书覆盖目标主机名。 |
| 3 | 源站安装公开 CA 证书或 Cloudflare Origin CA 证书。 | 直连源站 443 能完成 TLS 握手。 |
| 4 | SSL/TLS mode 切到 Full (strict)。 | 浏览器访问 HTTPS 正常，Cloudflare 没有 525 / 526。 |
| 5 | 开启 Always Use HTTPS。 | `http://` 自动跳到 `https://`。 |
| 6 | 开启 TLS 1.3，Minimum TLS Version 设为 TLS 1.2 或更高。 | 用 SSL Labs、`curl` 或监控确认主要客户端正常。 |
| 7 | 最后再评估 HSTS。 | 所有子域和回滚路径确认后，再逐步提高 max-age。 |

不要一开始就把 HSTS preload、includeSubDomains、长 max-age 全开。HSTS 是浏览器侧承诺，配置错了比普通跳转更难回滚。

## Edge 证书

Edge 证书服务浏览器到 Cloudflare 这一段。

Universal SSL 的价值在于省心：Cloudflare 自动签发、续期和部署证书。Full setup 下，它覆盖根域和一级子域名，例如 `example.com` 和 `www.example.com`；如果要覆盖 `api.staging.example.com` 这种更深层级，通常要 Advanced Certificate Manager、Total TLS，或显式配置对应证书。

普通项目常见选择：

| 场景 | 建议 |
| --- | --- |
| 文档站、博客、官网 | Universal SSL 足够。 |
| 多级子域较多 | 先整理域名结构，再评估 Total TLS / Advanced certificates。 |
| 需要固定 CA、有效期或验证方式 | Advanced Certificate Manager。 |
| 需要上传自有证书 | Business/Enterprise 的 Custom Certificates。 |
| 遗留客户端很多 | 测试 SNI、ECDSA/RSA 和最低 TLS 版本。 |

## Origin 证书

Origin 证书服务 Cloudflare 到源站这一段。

Cloudflare Origin CA 证书适合只被 Cloudflare 代理访问的源站。它能让 Full (strict) 校验证书，但它不是浏览器公开信任的证书：如果你暂停 Cloudflare、把记录改成 DNS-only，或让用户直接访问源站域名，浏览器会看到不受信任证书错误。

源站证书选择：

| 源站类型 | 建议 |
| --- | --- |
| 自己的 VPS / NGINX / Caddy | Cloudflare Origin CA 或 Let's Encrypt 都可以；只走 Cloudflare 时 Origin CA 很省心。 |
| 需要源站被浏览器直连 | 用公开可信 CA，例如 Let's Encrypt。 |
| 第三方 SaaS 源站 | 按 SaaS 文档要求配置证书和 CNAME；不要假设能用 Origin CA。 |
| Workers / Pages 自定义域名 | 通常由 Cloudflare 管理边缘证书，不需要自己维护源站证书。 |

Origin CA 支持最多 200 个 SAN，通配符只覆盖一层。官方还说明目前不会为 Origin CA 证书发送到期提醒，所以长期证书也要进入自己的证书台账。

## HTTPS 重定向与 HSTS

Always Use HTTPS 会把访问者的 `http://` 请求重定向到 `https://`。它很有用，但要和源站重定向保持一致。

常见顺序：

1. 先确认 Full (strict) 正常。
2. 再开启 Always Use HTTPS。
3. 再处理页面里的 HTTP 资源；必要时开启 Automatic HTTPS Rewrites。
4. 最后评估 HSTS。

容易出事的组合：

| 配置 | 结果 |
| --- | --- |
| Flexible + 源站把 HTTP 跳 HTTPS | Cloudflare 到源站仍走 HTTP，源站继续跳 HTTPS，形成循环。 |
| Full (strict) + 源站把 HTTPS 跳 HTTP | 边缘和源站互相拉扯，形成循环。 |
| HSTS + SSL/TLS mode 设为 Off | 浏览器强制 HTTPS，但 Cloudflare 又不提供 HTTPS 入口。 |

## Authenticated Origin Pulls

Authenticated Origin Pulls 是源站到 Cloudflare 之间的 mTLS 防线：Cloudflare 访问源站时出示客户端证书，源站只接受能通过证书校验的请求。

它适合这类场景：

| 场景 | 是否值得上 |
| --- | --- |
| 源站 IP 有暴露风险 | 值得。 |
| 登录、支付、后台 API 直接跑在源站 | 值得。 |
| 纯 Workers Static Assets / Pages 静态站 | 通常不需要。 |
| 源站配置能力很弱 | 先用防火墙只允许 Cloudflare IP，再评估 mTLS。 |

注意：Authenticated Origin Pulls 不适用于 Off 或 Flexible 模式；它叠加在 Full / Full (strict) 之上。

## 常见错误

| 错误 | 常见原因 | 处理 |
| --- | --- | --- |
| `ERR_TOO_MANY_REDIRECTS` | Flexible 和源站 HTTPS 跳转冲突，或 HSTS / redirect rules 冲突。 | 改为 Full (strict)，删除冲突的源站跳转或规则。 |
| 525 SSL handshake failed | Cloudflare 和源站 TLS 握手失败。 | 查源站 443、SNI、证书链、TLS 版本和防火墙。 |
| 526 invalid SSL certificate | Full (strict) 下源站证书无效、过期、域名不匹配或链不完整。 | 换有效证书，或安装 Cloudflare Origin CA。 |
| 证书 Pending Validation | DNS/DCV 不满足，CAA 限制，或 partial setup 需要手工验证。 | 检查 DNS、CAA、DCV token 和证书状态。 |
| Mixed content | HTTPS 页面引用 HTTP 图片、脚本或 iframe。 | 改内容源，必要时开启 Automatic HTTPS Rewrites。 |

## 验证命令

```bash
# 确认 HTTP 是否跳转到 HTTPS。
curl -I http://example.com

# 确认 HTTPS 响应和边缘证书是否正常。
curl -I https://example.com

# 检查源站 TLS 握手；origin.example.com 换成真实源站地址。
openssl s_client -connect origin.example.com:443 -servername example.com
```

```bash
# 使用 Cloudflare API 设置 zone 级 SSL/TLS 模式，value 常见取值为 strict/full/flexible/off。
curl --request PATCH "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/settings/ssl" \
  --header "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  --header "Content-Type: application/json" \
  --data '{"value":"strict"}'
```

## GitHub 开源参考

| 仓库 | 可以学什么 |
| --- | --- |
| [cloudflare/cloudflare-docs SSL/TLS source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/ssl) | 官方 SSL/TLS 文档源文件，适合追踪 encryption modes、certificates、HSTS、mTLS 的文档变更。 |
| [cloudflare/sslconfig](https://github.com/cloudflare/sslconfig) | Cloudflare 公开的 Internet-facing SSL cipher 配置历史。 |
| [cloudflare/cfssl](https://github.com/cloudflare/cfssl) | Cloudflare 的 PKI/TLS 工具箱，适合理解证书签发、验证和 bundle。 |
| [cloudflare/certmgr](https://github.com/cloudflare/certmgr) | 基于 CFSSL 的证书管理工具，适合看证书自动续期和服务 reload 思路。 |
| [cloudflare/gokeyless](https://github.com/cloudflare/gokeyless) | Keyless SSL 的 Go 实现，适合企业场景理解私钥不出自有环境的模型。 |
| [cloudflare/terraform-provider-cloudflare](https://github.com/cloudflare/terraform-provider-cloudflare) | 把 zone settings、certificate packs、rulesets 等配置纳入 IaC。 |
| [freestylefly/CodexGuide](https://github.com/freestylefly/CodexGuide) | 本站早期学习的原始参考仓库之一，适合对照教程站的信息架构。 |

## 官方资料

- [SSL/TLS Overview](https://developers.cloudflare.com/ssl/)
- [SSL/TLS concepts](https://developers.cloudflare.com/ssl/concepts/)
- [Encryption modes](https://developers.cloudflare.com/ssl/origin-configuration/ssl-modes/)
- [Full (strict)](https://developers.cloudflare.com/ssl/origin-configuration/ssl-modes/full-strict/)
- [Universal SSL](https://developers.cloudflare.com/ssl/edge-certificates/universal-ssl/)
- [Origin CA](https://developers.cloudflare.com/ssl/origin-configuration/origin-ca/)
- [Authenticated Origin Pulls](https://developers.cloudflare.com/ssl/origin-configuration/authenticated-origin-pull/)
- [Always Use HTTPS](https://developers.cloudflare.com/ssl/edge-certificates/additional-options/always-use-https/)
- [Automatic HTTPS Rewrites](https://developers.cloudflare.com/ssl/edge-certificates/additional-options/automatic-https-rewrites/)
- [HSTS](https://developers.cloudflare.com/ssl/edge-certificates/additional-options/http-strict-transport-security/)
- [TLS 1.3](https://developers.cloudflare.com/ssl/edge-certificates/additional-options/tls-13/)
- [Minimum TLS Version](https://developers.cloudflare.com/ssl/edge-certificates/additional-options/minimum-tls/)
- [SSL/TLS features and plans](https://developers.cloudflare.com/ssl/reference/all-features/)
- [Browser compatibility](https://developers.cloudflare.com/ssl/reference/browser-compatibility/)
- [ERR_TOO_MANY_REDIRECTS](https://developers.cloudflare.com/ssl/troubleshooting/too-many-redirects/)
