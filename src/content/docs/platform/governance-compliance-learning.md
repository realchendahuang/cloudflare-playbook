---
title: 治理、合规与学习路径
description: Data Localization、Client-side security、DMARC、Registrar、Support、Learning Paths 和 Use cases 的取舍。
---

最后核对日期：2026-06-18。

这一页不是教你写代码，而是帮你判断项目进入真实运营后哪些治理能力值得看：数据驻留、前端第三方脚本、邮件域名防伪、域名注册续费、官方支持和官方学习路线。

## 一句话判断

| 需求 | 看什么 | 普通项目判断 |
| --- | --- | --- |
| 客户、合同或监管要求数据留在指定区域。 | Data Localization Suite | Enterprise-only paid add-on；没有明确合规要求不要先买。 |
| 页面加载广告、分析、支付、客服等第三方脚本。 | Client-side security | Free / Pro 有 script monitoring；高级检测和 blocking 不是免费层能力。 |
| 域名会发邮件，担心伪造发件人。 | DMARC Management | 只要域名用于邮件，就应该配置 SPF、DKIM、DMARC。 |
| 想把域名注册、续费、DNSSEC 放到 Cloudflare。 | Registrar | Available on all plans，但注册和续费仍按 registry / ICANN 成本付费。 |
| 线上故障需要 Cloudflare 支持。 | Support | Free 主要走社区；技术 case、chat、电话和 SLA 跟随计划。 |
| 不知道 Cloudflare 应该怎么学、怎么组合。 | Learning Paths / Use cases | 用来规划路线，不是当前项目的采购清单。 |

## 免费与付费边界

| 能力 | 免费边界 | 付费或计划边界 |
| --- | --- | --- |
| Data Localization Suite | 无普通免费入口。 | Enterprise-only paid add-on，覆盖 Geo Key Manager、Customer Metadata Boundary、Regional Services。 |
| Client-side security | Available on all plans；Free / Pro 有 script monitoring。 | Business 起有 connection / cookie monitoring 等能力；Advanced 才有恶意检测、代码变更检测、content security rules 和 Logpush jobs。 |
| DMARC Management | Available on all plans，并面向使用 Cloudflare DNS 的客户。 | 更高阶邮箱安全属于 Cloudflare One Email Security 等其他产品线。 |
| Registrar | Available on all plans；WHOIS redaction 默认开启，DNSSEC 免费。 | 域名注册和续费按 registry / ICANN 成本；Custom Domain Protection 属于企业域名保护。 |
| Support | Free 推荐 Community / Discord；standard case 只覆盖 billing、account、registrar。 | Pro 起可提交 support case；Business / Enterprise 有 chat；Enterprise 有 emergency phone；Premium / Enterprise 才有明确 SLA。 |
| Learning Paths / Use cases | 官方资料免费阅读。 | 资料里涉及的产品仍按各自 pricing / limits 计费。 |

## 推荐顺序

| 顺序 | 动作 | 为什么 |
| --- | --- | --- |
| 1 | 域名先补 SPF、DKIM、DMARC。 | 邮件伪造和品牌钓鱼是低成本高风险项。 |
| 2 | 第三方脚本先做盘点。 | 能删脚本就先删脚本，再考虑 Client-side security 高级能力。 |
| 3 | 生产域名要有续费和权限治理。 | Registrar 集中管理很方便，但账号权限和付款方式要可靠。 |
| 4 | 生产排障资料要提前准备。 | Support 不替你 debug 业务代码；提交 case 时要有时间、Ray ID、URL、日志和复现信息。 |
| 5 | 合规需求明确后再看 DLS。 | DLS 不是“所有数据自动驻留”，必须逐产品看 compatibility。 |
| 6 | 用 Learning Paths / Use cases 做路线，不做堆料。 | 官方方案常包含多个产品，普通项目不需要一次全上。 |

## 产品边界

| 产品 | 解决什么 | 不解决什么 |
| --- | --- | --- |
| Data Localization Suite | 控制密钥、metadata、logs、HTTPS 处理区域。 | 不保证所有 Cloudflare 产品都兼容；也不替代合同和法律审查。 |
| Client-side security | 监控浏览器里加载的 scripts、connections、cookies。 | 不替代 Zaraz、CSP 设计、脚本治理和供应商管理。 |
| DMARC Management | 看哪些来源在代表你的域名发邮件，以及 SPF / DKIM / DMARC 是否通过。 | 不替代邮件发送平台、退订、投诉和投递声誉治理。 |
| Registrar | 域名注册、转入、续费、DNSSEC、WHOIS 隐私。 | 不保证所有 TLD 都支持，也不替代账号权限和域名资产管理。 |
| Support | 支持账单、账号、产品故障和计划对应的技术支持。 | 不替你改配置、不提供敏感信息、不 debug 业务代码。 |
| Learning Paths / Use cases | 官方课程和跨产品方案入口。 | 不是最低成本架构，也不是付费购买建议。 |

## 常见误区

| 误区 | 更好的判断 |
| --- | --- |
| Data Localization Suite 等于所有数据都留在 EU。 | 它是多个能力的组合，每个产品兼容性不同，要逐项查表。 |
| Client-side security 免费版能拦恶意脚本。 | Free / Pro 主要是 script monitoring；blocking 和高级检测看 Advanced。 |
| 配了 MX 就等于邮件域名安全。 | SPF、DKIM、DMARC 才是发信域名的基础防伪。 |
| Registrar 免费注册域名。 | Registrar 可在所有计划使用，但域名注册和续费仍要付注册局成本。 |
| Free plan 可以随时提交技术支持 case。 | Free technical support 主要走社区；standard case 只覆盖有限范围。 |
| Use cases 里的产品组合都要照做。 | Use cases 是方案参考，先用免费或低成本能力完成 80%。 |

## GitHub 开源参考

| 仓库 | 适合看什么 |
| --- | --- |
| [cloudflare/cloudflare-docs Data Localization source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/data-localization) | Regional Services、CMB、Geo Key Manager、compatibility 和 limitations。 |
| [cloudflare/cloudflare-docs Client-side security source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/client-side-security) | script monitoring、alerts、content security rules 和 PCI DSS。 |
| [cloudflare/cloudflare-docs DMARC Management source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/dmarc-management) | SPF、DKIM、DMARC、reports 和 DNS lookup limits。 |
| [cloudflare/cloudflare-docs Registrar source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/registrar) | supported TLDs、domain transfer、DNSSEC、renewal 和 WHOIS redaction。 |
| [cloudflare/cloudflare-docs Support source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/support) | support plan、case 信息清单、状态页和错误码排障。 |
| [cloudflare/cloudflare-docs Learning Paths source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/learning-paths) | 官方课程结构和学习顺序。 |
| [cloudflare/cloudflare-docs Use cases source](https://github.com/cloudflare/cloudflare-docs/tree/production/src/content/docs/use-cases) | 跨产品方案和案例分类。 |

## 事实来源

- [Data Localization Suite](https://developers.cloudflare.com/data-localization/)
- [Data Localization Suite product compatibility](https://developers.cloudflare.com/data-localization/compatibility/)
- [Data Localization Suite limitations](https://developers.cloudflare.com/data-localization/limitations/)
- [Client-side security](https://developers.cloudflare.com/client-side-security/)
- [DMARC Management](https://developers.cloudflare.com/dmarc-management/)
- [DMARC Management security records](https://developers.cloudflare.com/dmarc-management/security-records/)
- [Cloudflare Registrar](https://developers.cloudflare.com/registrar/)
- [Registrar supported TLDs](https://developers.cloudflare.com/registrar/top-level-domains/)
- [Contacting Cloudflare Support](https://developers.cloudflare.com/support/contacting-cloudflare-support/)
- [Cloudflare Status](https://developers.cloudflare.com/support/cloudflare-status/)
- [Learning Paths](https://developers.cloudflare.com/learning-paths/llms.txt)
- [Use cases](https://developers.cloudflare.com/use-cases/)
