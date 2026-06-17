---
title: DNS
description: Cloudflare DNS 的定位、免费边界、记录管理、代理状态、TTL、DNSSEC、CNAME flattening、迁移和开源参考。
---

最后核对日期：2026-06-17。

DNS 是 Cloudflare 的入口层。域名先由 Cloudflare 管起来，后面的 CDN、SSL/TLS、DDoS、WAF、Cache Rules、Workers 路由、Pages 自定义域名才有稳定的基础。

对普通项目来说，Cloudflare DNS 最重要的不是“能解析域名”，而是把三个问题拆清楚：

1. 这个 hostname 只是解析，还是要走 Cloudflare 代理。
2. 这个记录是给网站、API、邮件、验证、对象存储还是第三方 SaaS 用。
3. 这次改 DNS 会不会暴露源站、断邮件、影响证书验证或让回滚变慢。

## 一句话判断

| 场景 | 是否优先接 Cloudflare DNS | 判断 |
| --- | --- | --- |
| 文档站、官网、博客、SaaS 官网 | 是 | 接入后才能自然使用 CDN、SSL/TLS、DDoS、WAF 和缓存。 |
| Workers / Pages 自定义域名 | 是 | Cloudflare 自己的部署链路和 DNS / Custom Domain 配合最顺。 |
| 有源站服务器 | 是 | Web 流量用 Proxied 隐藏源站 IP，并接入安全和缓存能力。 |
| 邮件域名 | 是，但记录 DNS-only | MX、SPF、DKIM、DMARC 要准确，不能走 HTTP 代理。 |
| 第三方验证 CNAME / TXT | 是，但通常 DNS-only | 验证服务需要看到真实 CNAME/TXT 时不要代理。 |
| 非 HTTP 服务 | 视情况 | Cloudflare DNS 可解析，但普通 HTTP proxy 不代理 SMTP、SSH、数据库等流量。 |
| 已有企业 DNS 架构 | 先评估 | Business/Enterprise 才能更自然使用 partial setup、secondary DNS 和 zone transfers。 |

## 运行模型

```text
用户访问 app.example.com
  │
  ▼
递归 DNS Resolver
  │
  ▼
Cloudflare Authoritative DNS
  │
  ├─ DNS-only
  │    └─ 返回真实记录值，例如源站 IP、MX、TXT、CNAME
  │
  └─ Proxied
       └─ 返回 Cloudflare Anycast IP
            │
            └─ HTTP/HTTPS 请求进入 Cloudflare 代理层
                 ├─ SSL/TLS
                 ├─ DDoS / WAF
                 ├─ Cache / Rules
                 └─ Origin / Workers / Pages
```

DNS-only 和 Proxied 是两种完全不同的路径。DNS-only 只是解析；Proxied 会让 HTTP/HTTPS 流量经过 Cloudflare 网络，才能使用 WAF、缓存、重定向规则、DDoS 防护等能力。

## 免费与付费边界

Cloudflare 官方 FAQ 说明，Free、Pro、Business 不对 DNS query 收费，也不限制 DNS queries；Enterprise 会把 monthly DNS queries 作为报价输入之一。真正容易碰到的是记录数量、comments、tags 和高级 zone setup。

| 能力 | Free | Pro / Business | Enterprise | 实践判断 |
| --- | ---: | ---: | ---: | --- |
| DNS queries | 不收费，不限制 | 不收费，不限制 | 作为报价输入 | 普通项目不用担心 DNS 查询费。 |
| DNS records / zone | 2024-09-01 前创建的 zone 为 1,000；之后创建的 zone 为 200 | 3,500 | 3,500，可申请提高 | 新 Free zone 要特别注意 200 条记录上限。 |
| Record comments | 支持，100 字符 | 支持，500 字符 | 支持，500 字符 | 用来写记录归属和用途。 |
| Record tags | 不支持 | 支持，最多 20 个 | 支持，最多 20 个 | 多团队、多环境时再用。 |
| Full setup | 支持 | 支持 | 支持 | Free / Pro 推荐默认方案。 |
| Partial CNAME setup | 不支持 | Business 支持 | 支持 | 保留外部主 DNS，只代理部分子域。 |
| Secondary DNS / zone transfers | 不支持 | 不支持 | 支持 | 企业多 DNS 提高可用性时看。 |
| DNSSEC | 支持 | 支持 | 支持 | 迁移时先关旧 DNSSEC，接入后再开。 |

## Setup 怎么选

| 模式 | 适合谁 | 判断 |
| --- | --- | --- |
| Full setup | 个人、开源项目、小团队、Free / Pro 用户 | 最常见。把 authoritative nameservers 切到 Cloudflare。 |
| Partial CNAME setup | 已有企业 DNS，又只想让部分子域走 Cloudflare | Business / Enterprise 才适合。 |
| Secondary DNS / zone transfers | 对 DNS 可用性和多提供商冗余有要求的企业 | Enterprise 能力，普通项目先不碰。 |
| Subdomain setup | 子域要独立团队、独立账号或独立配置 | 常见于 `docs.example.com`、`app.example.com` 由不同团队管理。 |

普通项目默认走 Full setup：添加域名，核对记录，去注册商把 nameservers 改成 Cloudflare 分配的两个 nameserver，等待 zone 变成 Active。

## 记录怎么设计

| 记录 | 常见用途 | Proxy status | 注意 |
| --- | --- | --- | --- |
| `A` / `AAAA` | 指向 IPv4 / IPv6 源站 | Web 流量通常 Proxied | 多个 A/AAAA 可做简单 round-robin，但不是健康检查。 |
| `CNAME` | 指向另一个 hostname | Web 流量通常 Proxied，验证通常 DNS-only | 同名不能再有 A/AAAA/CNAME。 |
| `TXT` | SPF、DKIM、DMARC、域名验证 | DNS-only | 不要把验证记录写错环境。 |
| `MX` | 邮件收信 | DNS-only | MX 不能代理；邮件专用 `mail` 主机也应 DNS-only。 |
| `CAA` | 限制哪些 CA 可签发证书 | DNS-only | 上 HTTPS 前确认不会挡住 Cloudflare 证书签发。 |
| `SRV` | 服务发现 | DNS-only | 常见于游戏、语音、IM 或内部服务。 |
| `NS` | 子域委派 | DNS-only | 委派子域前确认父子 zone 边界。 |

一个普通项目的起步记录可以这样想：

```text
example.com
  ├─ A / CNAME     -> Web 入口，Proxied
  ├─ www CNAME     -> Web 入口，Proxied 或重定向
  ├─ api CNAME     -> API 入口，Proxied
  ├─ mail / MX     -> 邮件入口，DNS-only
  ├─ SPF / DKIM    -> 邮件验证，DNS-only
  ├─ _dmarc TXT    -> 邮件策略，DNS-only
  └─ vendor CNAME  -> 第三方验证，通常 DNS-only
```

## Proxy status

Cloudflare 官方建议：所有服务 HTTP/HTTPS Web 流量的 A、AAAA、CNAME 记录都应该 Proxied；邮件、域名验证、非 HTTP 服务和部分 SaaS/CDN CNAME 应该 DNS-only。

| 选择 | 发生什么 | 适合 |
| --- | --- | --- |
| Proxied | DNS 返回 Cloudflare Anycast IP，HTTP/HTTPS 请求走 Cloudflare。 | 网站、API、前端应用、公开文档站。 |
| DNS-only | DNS 返回真实记录值，流量不经过 Cloudflare HTTP proxy。 | 邮件、TXT 验证、SSH、数据库、第三方 CDN 验证。 |

Proxied 后，源站看到的来源 IP 会变成 Cloudflare IP。应用如果需要真实访客 IP，应读取 `CF-Connecting-IP` 或 `X-Forwarded-For`，并只信任来自 Cloudflare 的请求头。

## TTL 和传播

TTL 决定递归解析器缓存记录多久。Cloudflare 的关键规则：

| 记录类型 | TTL 行为 | 实践判断 |
| --- | --- | --- |
| Proxied A/AAAA/CNAME | TTL 固定 Auto，当前为 300 秒，不能编辑。 | 代理记录天然适合较快切换。 |
| DNS-only 记录 | 非 Enterprise 可选 60 秒到 1 天；Enterprise 可低到 30 秒。 | 迁移前先把 TTL 调低，稳定后再调回。 |
| Nameserver TTL | 独立于普通记录 TTL。 | 更换 nameserver 前后要给全球递归缓存留时间。 |

TTL 不是“立刻生效”的按钮。浏览器、本地系统、递归 DNS 和运营商都可能缓存结果。生产迁移要按小时级别准备，而不是按秒赌运气。

## DNSSEC

DNSSEC 给 DNS 增加签名验证，防止请求被导向伪造域名。Cloudflare 支持 DNSSEC，但迁移时顺序很重要：

```text
迁入 Cloudflare 前
  ├─ 在原注册商 / 原 DNS 提供商关闭旧 DNSSEC
  ├─ 把 nameservers 切到 Cloudflare
  └─ 等 zone 变成 Active

迁入 Cloudflare 后
  ├─ 在 Cloudflare 启用 DNSSEC
  ├─ 复制 DS record 到注册商
  └─ 用 dig / DNSViz 验证
```

如果没有先关旧 DNSSEC 就直接改 nameservers，解析可能失败。Cloudflare Registrar 或部分 TLD 可能自动处理 DS record，但普通项目仍要知道 DS record 在注册商侧生效。

## CNAME flattening

传统 DNS 不允许 zone apex 使用 CNAME，但 Cloudflare 的 CNAME flattening 可以让 `example.com` 指向一个 CNAME 目标，并在回答 DNS 查询时返回最终 IP。Cloudflare Pages 根域名能工作也依赖这个能力。

| 场景 | 判断 |
| --- | --- |
| 根域名指向 Pages / SaaS / 平台域名 | CNAME flattening 很有用。 |
| 第三方要求看到原始 CNAME 做验证 | 不要对这类记录开启会改变返回结果的设置。 |
| CNAME 指向另一个 Cloudflare 账号 | 可能遇到 CNAME Cross-User Banned。 |

## Wildcard 记录

Wildcard DNS 记录适合让大量未知子域指向同一资源，例如 `*.example.com`。

| 规则 | 实践判断 |
| --- | --- |
| `*` 只在最左侧 label 作为通配符。 | `subdomain.*.example.com` 不会按预期通配。 |
| 精确记录优先于 wildcard。 | 有 `api.example.com` 时，它会覆盖 `*.example.com`。 |
| Wildcard 可 Proxied 或 DNS-only。 | Web 多租户可代理，验证和非 HTTP 不要代理。 |
| Pages wildcard custom domains 不支持。 | 多租户站点更适合 [平台化与多租户](/platform/platforms-saas/) 里的 Workers for Platforms / SaaS 方案。 |

## 迁移清单

迁移 DNS 最怕“扫到一半就改 nameservers”。更稳的顺序是：

1. 导出现有 DNS zone file。
2. 在 Cloudflare 添加域名，让 quick scan 先扫一遍。
3. 手动核对 apex、`www`、邮件、验证、API、后台、CDN、对象存储域名。
4. 对将要切换的关键记录降低 TTL。
5. 关闭旧 DNSSEC。
6. 修改注册商 nameservers。
7. 等 Cloudflare zone 变成 Active。
8. 验证网站、API、邮件收发、证书签发和第三方验证。
9. 重新启用 DNSSEC。
10. 删除旧 provider 里不再使用的敏感记录，避免源站泄漏。

## API 与 IaC

个人项目可以先用 Dashboard，但生产域名建议至少把关键记录导出到仓库，或者用 Terraform 管理。最低限度，也要保留记录变更说明。

```bash
# 读取 DNS 记录列表，用于迁移前后对账。
curl "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" \
	--header "Authorization: Bearer $CLOUDFLARE_API_TOKEN"

# 创建一个 Web 入口记录；proxied=true 表示 HTTP/HTTPS 流量进入 Cloudflare 代理层。
curl "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" \
	--request POST \
	--header "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
	--json '{
		"type": "CNAME",
		"name": "app",
		"content": "example.pages.dev",
		"proxied": true,
		"ttl": 1,
		"comment": "生产应用入口"
	}'
```

Terraform 的写法大概是：

```hcl
resource "cloudflare_dns_record" "app" {
  zone_id = var.cloudflare_zone_id

  # app.example.com 是公开 Web 入口，所以开启代理。
  name    = "app"
  type    = "CNAME"
  content = "example.pages.dev"
  proxied = true

  # ttl = 1 表示 Auto；代理记录会由 Cloudflare 控制 TTL。
  ttl     = 1
  comment = "生产应用入口"
}
```

## 验证命令

```bash
# 查看当前权威 nameservers 是否已经切到 Cloudflare。
dig NS example.com +short

# 验证 apex 记录。Proxied 记录通常会返回 Cloudflare IP。
dig A example.com +short

# 验证 CNAME 是否被第三方服务看见，适合排查域名验证失败。
dig CNAME verify.example.com +short

# 验证 MX 记录，邮件相关记录必须保持 DNS-only。
dig MX example.com +short

# 验证 DNSSEC 链路，返回 ad 标记通常表示验证成功。
dig example.com DNSKEY +dnssec
```

## 不要这样用

| 误区 | 更好的做法 |
| --- | --- |
| 所有记录都开 Proxied。 | 只有 HTTP/HTTPS 的 A、AAAA、CNAME 开代理；邮件和验证保持 DNS-only。 |
| 迁移前不导出旧 DNS。 | 先导出 zone file，再核对 quick scan 结果。 |
| 直接切 nameservers，不管 DNSSEC。 | 迁移前关闭旧 DNSSEC，Cloudflare Active 后再重新启用。 |
| 把源站 IP 写进公开文档或旧记录。 | 源站 IP 当成敏感信息管理，公开入口走 Cloudflare。 |
| 用 wildcard 覆盖所有环境。 | 生产、预览、后台、验证域名分清楚，精确记录优先。 |
| 用 DNS round-robin 当高可用。 | 真正需要健康检查和故障切换时看 [Load Balancing](/platform/traffic-routing/)。 |
| 修改 DNS 后立刻判断失败。 | 按 TTL、本地缓存和递归缓存留传播时间。 |

## GitHub 开源参考

| 仓库 | 适合看什么 |
| --- | --- |
| [cloudflare/cloudflare-docs DNS source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/dns) | 官方 DNS 文档源文件，适合追踪 limits、proxy status、DNSSEC 和 troubleshooting。 |
| [cloudflare/terraform-provider-cloudflare](https://github.com/cloudflare/terraform-provider-cloudflare) | Cloudflare Terraform Provider，适合把 DNS 记录、zone 设置和 ruleset 变成 IaC。 |
| [cloudflare/terraform-provider-cloudflare dns_record docs](https://github.com/cloudflare/terraform-provider-cloudflare/blob/main/docs/resources/dns_record.md) | `cloudflare_dns_record` 字段、TTL、proxied、comment 等资源定义。 |
| [favonia/cloudflare-ddns](https://github.com/favonia/cloudflare-ddns) | 功能完整的 Cloudflare DDNS updater，适合看动态 IP 更新和 API token 权限。 |
| [timothymiller/cloudflare-ddns](https://github.com/timothymiller/cloudflare-ddns) | Rust 写的轻量 DDNS 客户端，适合自托管场景。 |
| [willswire/unifi-ddns](https://github.com/willswire/unifi-ddns) | 用 Cloudflare Worker 给 UniFi 设备做 DDNS，适合看 Worker + DNS API 组合。 |
| [cloudposse/terraform-cloudflare-zone](https://github.com/cloudposse/terraform-cloudflare-zone) | Terraform 管理 Cloudflare zone、DNS records、规则和 Argo 的模块参考。 |

## 事实来源

- [Cloudflare DNS FAQ](https://developers.cloudflare.com/dns/faq/)
- [DNS features and plans](https://developers.cloudflare.com/dns/reference/all-features/)
- [DNS setups](https://developers.cloudflare.com/dns/zone-setups/)
- [Full setup](https://developers.cloudflare.com/dns/zone-setups/full-setup/setup/)
- [Manage DNS records](https://developers.cloudflare.com/dns/manage-dns-records/how-to/create-dns-records/)
- [Proxy status](https://developers.cloudflare.com/dns/proxy-status/)
- [Proxy status use cases](https://developers.cloudflare.com/dns/proxy-status/use-cases/)
- [Proxying limitations](https://developers.cloudflare.com/dns/proxy-status/limitations/)
- [Time to Live](https://developers.cloudflare.com/dns/manage-dns-records/reference/ttl/)
- [DNSSEC](https://developers.cloudflare.com/dns/dnssec/)
- [CNAME flattening](https://developers.cloudflare.com/dns/cname-flattening/)
- [Wildcard DNS records](https://developers.cloudflare.com/dns/manage-dns-records/reference/wildcard-dns-records/)
- [Records with the same name](https://developers.cloudflare.com/dns/manage-dns-records/troubleshooting/records-with-same-name/)
- [Import and export records](https://developers.cloudflare.com/dns/manage-dns-records/how-to/import-and-export/)
