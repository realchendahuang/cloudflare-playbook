---
title: 治理、合规与学习路径
description: Data Localization、Client-side security、DMARC Management、Registrar、Support、Learning Paths 和 Use cases 的边界与落地顺序。
---

最后核对日期：2026-06-17。

这一组文档解决的不是“怎么写一个 Worker API”，而是项目进入真实运营后会遇到的治理问题：数据驻留、前端第三方脚本、邮件域名防伪、域名注册续费、官方支持、学习路径和跨产品方案。

## 一句话判断

```text
治理与学习入口
  ├─ 合规：Data Localization Suite
  ├─ 前端供应链：Client-side security
  ├─ 域名与品牌：DMARC Management / Registrar
  └─ 学习与排障：Support / Learning Paths / Use cases
```

| 需求 | 优先看 | 判断 |
| --- | --- | --- |
| 合同、监管或客户要求数据留在指定区域。 | Data Localization Suite | Enterprise-only paid add-on；普通项目不默认购买。 |
| 页面加载了广告、分析、支付、客服、营销脚本，需要监控前端供应链。 | Client-side security | Available on all plans，但 Free / Pro 只有 script monitoring；高级检测和 blocking 需要更高能力。 |
| 域名会发邮件，担心伪造发件人和品牌钓鱼。 | DMARC Management | 只要用 Cloudflare DNS 就应该配置 SPF、DKIM、DMARC。 |
| 想把域名注册、续费、DNSSEC 和 WHOIS 隐私放到 Cloudflare。 | Registrar | Available on all plans；按注册局和 ICANN 成本收费。 |
| 线上故障需要找 Cloudflare 支持。 | Support | Free 主要走社区；技术 case、chat、电话和 SLA 跟随计划。 |
| 不知道 Cloudflare 该怎么学、怎么组合。 | Learning Paths / Use cases | 官方学习路线和方案库，适合反推本站文章路线。 |

## 免费与付费边界

| 能力 | 免费边界 | 付费或计划边界 | 普通项目建议 |
| --- | --- | --- | --- |
| Data Localization Suite | 无普通免费入口。 | Enterprise-only paid add-on；覆盖 Geo Key Manager、Customer Metadata Boundary、Regional Services。 | 有明确数据驻留、GDPR、合同或行业监管要求时再评估。 |
| Client-side security | Available on all plans；Free / Pro 有 script monitoring。 | Business 起有 connection / cookie monitoring、page attribution、new resource alerts；Advanced 才有 malicious detection、code change detection、content security rules 和 Logpush jobs。 | 小站先减少第三方脚本；有支付、广告、合规或 PCI 压力时再深入。 |
| DMARC Management | Available on all plans；面向使用 Cloudflare DNS 的客户。 | 高阶邮箱安全是 Cloudflare One Email Security 另一条线。 | 域名发邮件就配置 SPF、DKIM、DMARC；不发邮件也至少设置合理 DMARC 防伪。 |
| Registrar | Available on all plans；按 registry / ICANN 成本注册和续费，WHOIS redaction 默认开启，DNSSEC 免费。 | Custom Domain Protection 是企业域名防劫持能力。 | 适合把域名、DNS、DNSSEC 放到同一处；迁移前确认 TLD 是否支持。 |
| Support | Free 可用 Community / Discord；standard case 只覆盖 billing、account、registrar。 | Paid plans 可提交技术 case；Business / Enterprise 有 chat；Enterprise 有 emergency phone；Premium / Enterprise 才有明确 SLA。 | 公开项目要准备自助排障材料；生产故障 case 要带 UTC 时间、ZoneID、Ray ID、HAR、curl、日志。 |
| Learning Paths / Use cases | 官方学习资料免费阅读。 | 资料中涉及的产品仍按各自计划计费。 | 用来规划学习路线，不要把所有 solution guide 都当成当前项目必做。 |

## Data Localization Suite

Data Localization Suite 是 Cloudflare 用来控制“在哪里检查、处理、存储数据”的合规工具集合。官方页面明确标注它是 **Enterprise-only paid add-on**。

| 子能力 | 解决什么问题 |
| --- | --- |
| Geo Key Manager | 控制私有 TLS keys 存储在哪些地理区域。 |
| Customer Metadata Boundary | 控制 traffic metadata、logs、analytics 存储在哪个区域。 |
| Regional Services | 控制哪些 Cloudflare data centers 可以解密和处理 HTTPS 流量。 |

DLS 不是“开了就所有数据都留在一个地方”。官方 compatibility 页面列了大量产品兼容差异：例如 Argo 不支持 Regional Services / Customer Metadata Boundary；Web Analytics 不支持 CMB；Workers.dev 不支持 DLS；部分日志和 analytics 在 CMB 非 US 区域会不可用，需要用 Logpush 替代。

普通项目的顺序应该是：

1. 先确认法规、合同、客户安全审查里到底要求什么数据留在哪。
2. 再按产品逐项查 compatibility，不要只看总览。
3. 最后评估性能影响、日志可用性和支持路径。

## Client-side security

Client-side security 监控访客浏览器里加载的 scripts、connections 和 cookies。它解决的是第三方脚本和前端供应链风险，例如广告脚本、统计脚本、支付表单、客服组件被篡改后直接在浏览器里窃取用户数据。

| 能力 | 计划边界 |
| --- | --- |
| Script monitoring | Free / Pro / Business / Enterprise / Advanced 都有。 |
| Connection monitoring、cookie monitoring、page attribution | Business 起。 |
| New resource alerts、new domain alerts | Business 起。 |
| Malicious script detection、code change detection、malicious connection detection | Advanced。 |
| Content security rules positive blocking | Advanced，5 条。 |
| Logpush jobs | Advanced，4 个。 |

它和 Zaraz 的边界也要分清：Zaraz 是第三方脚本和标签管理，Client-side security 是监控、检测、告警和内容安全规则。脚本越多，越应该先做脚本盘点，再决定是否需要高级检测。

## DMARC Management

DMARC Management 帮你看哪些来源在代表你的域名发邮件，以及这些邮件是否通过 SPF、DKIM、DMARC。官方说明它 available on all plans，并且可用于使用 Cloudflare DNS 的客户。

| 记录 | 作用 |
| --- | --- |
| SPF | 声明哪些 IP 或域名可以代表你的域名发送邮件。 |
| DKIM | 用加密签名证明邮件来自授权域名，并且内容未被篡改。 |
| DMARC | 把 SPF / DKIM 的结果组合起来，并告诉收件方失败时如何处理。 |

普通项目最容易犯的错是只配置 MX，不配置 SPF / DKIM / DMARC。只要域名用于登录邮件、通知邮件、产品邮件或品牌展示，就应该把邮件安全记录当成 DNS 基础设施的一部分。

## Registrar

Cloudflare Registrar 用来注册、转入、续费和管理域名。官方标注 available on all plans，并强调 Cloudflare 只收 registry / ICANN 成本，不加价。

| 能力 | 判断 |
| --- | --- |
| Register / renew domains | 按注册局成本收费，默认自动续费。 |
| DNSSEC | Registrar 提供一键 DNSSEC，Cloudflare DNS 用户也可免费使用 DNSSEC。 |
| WHOIS redaction | 默认开启，保护注册人隐私。 |
| Supported TLDs | 不是所有后缀都支持，注册或转入前必须查 supported TLDs。 |
| Custom Domain Protection | 企业域名防劫持能力，不是普通 Registrar 默认项。 |

把域名放到 Cloudflare Registrar 的好处是 DNS、DNSSEC、续费和安全设置更集中；风险是迁移、转出、账号权限和付款方式都要更谨慎。开源项目尤其要避免域名只绑在个人账号且没有备份管理员。

## Support

Support 文档很适合写进生产排障流程。Cloudflare Support 不会替你改配置、不会提供敏感账号信息、不会 debug 你的业务代码，也不会处理和当前账号无关的域名。

| 计划 | 支持入口 |
| --- | --- |
| Free | 推荐 Community / Discord；standard case 仅 billing、account、registrar。 |
| Pro | Community / Discord / support case；无 chat。 |
| Business | Community / Discord / support case / live chat。 |
| Enterprise | Community / Discord / support case / live chat / emergency phone。 |

提交 case 前至少准备这些材料：

- UTC 时间。
- Zone name / Zone ID。
- 影响范围和复现步骤。
- 实际结果和期望结果。
- 示例 URL、Ray ID、错误信息。
- HAR、截图、origin logs、curl、dig/nslookup、MTR/traceroute。
- 生产影响和优先级。

Free 和 pay-as-you-go 没有 SLA；Premium / Enterprise 才有官方列出的响应时间。普通项目不要把“出了问题让 Cloudflare 立刻处理”当成架构兜底，真正的兜底仍是缓存、降级、日志、备份和明确的排障手册。

## Learning Paths 与 Use cases

Learning Paths 是官方引导式课程，覆盖账户安全、DNS 迁移、应用安全、Zero Trust、China Network、Magic Transit、Durable Objects、SASE、Email Security、surge readiness 等主题。Use cases 是跨产品方案库，按应用安全、性能、公司安全、Web apps、API、SaaS、AI、媒体、电商等场景组织。

本站可以把它们当作两种资料：

| 官方资料 | 本站怎么用 |
| --- | --- |
| Learning Paths | 反推“读者应该先学什么、后学什么”。 |
| Use cases | 反推“一个真实场景需要哪些 Cloudflare 产品组合”。 |
| Solution guides | 检查 Free / Pro / Business 能不能完成某个目标。 |
| Surge readiness | 补充活动峰值、DDoS、缓存、日志和支持流程。 |

最重要的取舍是：官方 use case 会把多个产品组合到一起，但普通项目不需要一次全买。先用免费或低成本能力完成 80% 的防护和部署，再为明确瓶颈升级。

## 本站当前选择

| 能力 | 当前处理 |
| --- | --- |
| Data Localization Suite | 不启用；本站没有企业数据驻留合同。 |
| Client-side security | 暂不启用高级能力；当前站点保持少脚本，并用成熟组件。 |
| DMARC Management | 域名邮件安全应纳入 DNS 基础清单。 |
| Registrar | 可作为域名集中管理选项，但不是文档站运行依赖。 |
| Support | 生产排障手册里保留 Support case 信息清单。 |
| Learning Paths / Use cases | 作为后续文章路线和案例路线的官方对照。 |

## 常见误区

| 误区 | 更好的判断 |
| --- | --- |
| Data Localization Suite 等于所有 Cloudflare 数据都留在 EU。 | DLS 是三个能力的组合，每个产品兼容性不同，要逐项查表。 |
| Client-side security 免费版能拦恶意脚本。 | Free / Pro 只有 script monitoring；blocking 和高级检测看 Advanced。 |
| 配了 MX 就等于邮件域名安全。 | SPF、DKIM、DMARC 缺一不可；DMARC reports 才能帮你看真实发信来源。 |
| Registrar 免费注册域名。 | Registrar available on all plans，但域名注册和续费仍按 registry / ICANN 成本付费。 |
| Free plan 可以随时提交技术支持 case。 | Free technical support 主要走社区；standard case 只覆盖 billing、account、registrar。 |
| 官方 Use cases 里的产品组合都必须照做。 | Use cases 是方案参考，不是最低可用架构。 |

## GitHub 开源参考

| 仓库 | 值得参考的点 |
| --- | --- |
| [cloudflare/cloudflare-docs Data Localization source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/data-localization) | 官方 DLS 文档源文件，适合追踪 Regional Services、CMB、Geo Key Manager、compatibility 和 limitations。 |
| [cloudflare/cloudflare-docs Client-side security source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/client-side-security) | 官方 Client-side security 文档源文件，适合追踪 script monitoring、alerts、content security rules 和 PCI DSS。 |
| [cloudflare/cloudflare-docs DMARC Management source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/dmarc-management) | 官方 DMARC Management 文档源文件，适合追踪 SPF、DKIM、DMARC、reports 和 DNS lookup limits。 |
| [cloudflare/cloudflare-docs Registrar source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/registrar) | 官方 Registrar 文档源文件，适合追踪 supported TLDs、domain transfer、DNSSEC、renewal 和 WHOIS redaction。 |
| [cloudflare/cloudflare-docs Support source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/support) | 官方 Support 文档源文件，适合追踪 support plan、case 信息清单、状态页和错误码排障。 |
| [cloudflare/cloudflare-docs Learning Paths source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/learning-paths) | 官方 Learning Paths 源文件，适合反推本站学习路线。 |
| [cloudflare/cloudflare-docs Use cases source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/use-cases) | 官方 Use cases 源文件，适合反推跨产品方案和案例分类。 |
| [cloudflare/terraform-provider-cloudflare](https://github.com/cloudflare/terraform-provider-cloudflare) | 适合把 DNS、Registrar 相关配置、规则、Access 和安全资源纳入 IaC 管理。 |
| [cloudflare/cf-terraforming](https://github.com/cloudflare/cf-terraforming) | 适合把已有 Cloudflare 配置导出成 Terraform，降低治理漂移。 |
| [freestylefly/CodexGuide](https://github.com/freestylefly/CodexGuide) | 原始参考仓库，适合继续对照教程站如何组织学习路径和资料索引。 |

## 事实来源

- [Data Localization Suite](https://developers.cloudflare.com/data-localization/)
- [Data Localization Suite product compatibility](https://developers.cloudflare.com/data-localization/compatibility/)
- [Data Localization Suite limitations](https://developers.cloudflare.com/data-localization/limitations/)
- [Client-side security](https://developers.cloudflare.com/client-side-security/)
- [Client-side security best practices](https://developers.cloudflare.com/client-side-security/best-practices/deploy-rules-in-production/)
- [DMARC Management](https://developers.cloudflare.com/dmarc-management/)
- [DMARC Management security records](https://developers.cloudflare.com/dmarc-management/security-records/)
- [Cloudflare Registrar](https://developers.cloudflare.com/registrar/)
- [Registrar supported TLDs](https://developers.cloudflare.com/registrar/top-level-domains/)
- [Contacting Cloudflare Support](https://developers.cloudflare.com/support/contacting-cloudflare-support/)
- [Cloudflare Status](https://developers.cloudflare.com/support/cloudflare-status/)
- [Learning Paths](https://developers.cloudflare.com/learning-paths/llms.txt)
- [Use cases](https://developers.cloudflare.com/use-cases/)
