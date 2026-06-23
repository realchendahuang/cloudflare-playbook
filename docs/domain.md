---
title: 域名购买、托管与转移
outline: deep
---

<script setup>
import { Globe, ShoppingCart, Tags, Server, ArrowLeftRight, ShieldCheck, Plane } from 'lucide-vue-next'
</script>

<section class="onepage-hero">
  <p class="onepage-kicker">Domain</p>
  <h1 class="onepage-title">域名购买、托管与转移</h1>
  <p class="onepage-subtitle">比价 → 选后缀 → 改 NS 托管到 Cloudflare → 跨境转移。首年价和续费价、国内备案、域名转移这些常见坑，这里一次讲清楚。</p>
</section>

<div class="quick-grid">
  <a href="#买域名前先比价"><div class="card-icon"><ShoppingCart /></div><div class="card-body"><strong>比价</strong><span>首次价 vs 续费价的坑</span></div></a>
  <a href="#域名后缀-tld-怎么选"><div class="card-icon"><Tags /></div><div class="card-body"><strong>选后缀</strong><span>.com .ai .dev 各自定位</span></div></a>
  <a href="#买完之后托管到-cloudflare"><div class="card-icon"><Server /></div><div class="card-body"><strong>托管到 CF</strong><span>改域名服务器步骤</span></div></a>
  <a href="#国内买-vs-国外买"><div class="card-icon"><Plane /></div><div class="card-body"><strong>国内 vs 国外</strong><span>备案与实名差异</span></div></a>
  <a href="#域名转移-registrar-transfer"><div class="card-icon"><ArrowLeftRight /></div><div class="card-body"><strong>域名转移</strong><span>EPP、60 天锁</span></div></a>
  <a href="#搬不进-cloudflare-怎么办"><div class="card-icon"><ShieldCheck /></div><div class="card-body"><strong>兜底方案</strong><span>改不了 NS 怎么办</span></div></a>
</div>

## 买域名前先比价

域名是按年续费的长期资产，**注册商报的"价格"通常只是首年促销价，续费价才是你长期付的钱**。这是新手最大、最常见的坑。

### 首次价 vs 续费价：三种价格要分清

注册商定价一般长这样：

- **首年促销价（first-year promo）**：新注册第一年很便宜，甚至 1 美元、9 块人民币。常见于 .com / .net / .xyz / .icu / .top。看价格别只看这一栏。
- **续费价（renewal price）**：第二年起按正常价续费，通常是首年价的 3–10 倍。这是你真正长期成本。
- **转入价（transfer-in price）**：把域名从别家转过来时的价格，通常等于"1 年续费价 + 转移操作"。转移成功后注册期限自动延长 1 年，所以这一步等于"提前续费"。

还要注意三类隐性成本：

- **WHOIS 隐私保护**（WHOIS Privacy / Redaction）：有的注册商按年收（早年 GoDaddy 收费），现在多数免费，但有例外。务必确认。Cloudflare、Porkbun、Spaceship、Namecheap 都免费。
- **DNS 托管费**：DNS 解析本身绝大多数免费，但部分注册商把"高级 DNS"当付费功能。你最终会上 Cloudflare 托管 DNS，这一项对你不构成成本。
- **转移 / 续费锁**：自动续费默认开启，部分注册商靠这个赚"忘记取消"的钱。建议关掉自动续费，到期前手动续，避免被溢价 .ai / .io 这种高价注册商套住。
- **汇率与币种**：境外注册商以美元 / 欧元结算，加上发卡行外汇手续费，实际价格比标价贵 1%–3%。.ai 这种 $70+/年的后缀，差额要算进总成本。

**比价永远比"续费价"那一栏，别被首年价骗了。**

### 推荐的比价网站

| 工具 | 地址 | 用法 |
| --- | --- | --- |
| **Domcomp** | [domcomp.com](https://www.domcomp.com/) | 老牌域名比价站，按后缀列出主流注册商的首年价 + 续费价 + 转入价，一眼看清坑 |
| **TLD-List** | [tld-list.com](https://tld-list.com/) | 按后缀比较全球注册商价格，覆盖大量冷门 TLD，标了续费价和免费 WHOIS |
| **DomainTyper** | [domaintyper.com](https://domaintyper.com/) | 边输边查可用性，同时侧栏列出多家注册商价格，适合快速试名 |
| **Instant Domain Search** | [instantdomainsearch.com](https://instantdomainsearch.com/) | 实时可用性查询，速度快，可对比价格区间 |
| **IANA TLD 报告** | [iana.org/domains/root/db](https://www.iana.org/domains/root/db) | 查某个后缀的权威注册局（registry）和注册规则，搞不清归谁管时来这看 |
| **Cloudflare Registrar 价格页** | [developers.cloudflare.com/registrar](https://developers.cloudflare.com/registrar/) | Cloudflare 自己列出支持后缀的"成本价"，作为续费价基准线最直观 |

实务做法：**Domcomp / TLD-List 查首年+续费价 → IANA 查注册局规则 → Cloudflare Registrar 页核对成本基准线**。

### 推荐注册商

| 注册商 | 特点 | 适合 |
| --- | --- | --- |
| **Cloudflare Registrar** | 续费成本价（批零价 + 0 加价），不赚续费差价；支持的 TLD 有限 | 长期持有的核心域名，能转进来就转进来 |
| **Spaceship**（推荐） | Namecheap 旗下新品牌，首年促销多、续费价低、WHOIS 隐私免费、支持后缀广 | 新注册、不想折腾 Cloudflare 不支持的后缀 |
| **Porkbun** | 价格低、界面清爽、WHOIS 隐私免费、支持 .ai / .io 等 | .ai / .io 这类 Cloudflare 不一定支持的后缀 |
| **Namecheap** | 老牌低价，稳定可靠 | 通用注册 |
| **阿里云 / 腾讯云**（国内） | 必须实名，价格中等，支持 .cn / .com.cn / .中国 | 需要备案的国内业务 |
| **GoDaddy** | 名气大但续费贵、 upsell 多 | 不推荐 |

个人项目优先级建议：**Cloudflare Registrar 续费成本最低 → Spaceship / Porkbun 注册覆盖面广 → 国内备案场景转阿里云/腾讯云。**

---

## 域名后缀（TLD）怎么选

后缀不仅是外观，它会带来不同的**价格结构、注册规则、备案要求、安全和声誉影响**。常用后缀的实务定位：

| 后缀 | 注册局 / 管辖 | 典型价格（首年 / 续费，美元） | 适合 | 注意 |
| --- | --- | --- | --- | --- |
| **.com** | Verisign（美国） | $10 / $10 | 通用、商业、所有项目首选 | 最稳、流动性最好、二手市场大；买不到理想名字时考虑买二手 |
| **.net** | Verisign | $12 / $13 | 技术类、社区 | 是 .com 的退而求其次，别当首选 |
| **.org** | PIR | $10 / $11 | 非营利、开源项目 | 商业用途可能被质疑，不要乱用 |
| **.io** | 英国印度洋领地注册局 | $30 / $35 | 技术创业、SaaS、工具 | 续费偏贵；2024 年查戈斯群岛主权移交后，英国政府与毛里求斯已达成保留 .io 注册局的协议，**短期不受影响**，注册局续签中，长期持有需关注政策 |
| **.ai** | Anguilla 注册局 | $70 起 / $70 起，**最少买 2 年** | AI 产品、AI 创业公司 | 价格高、最低注册期 2 年规则各家执行略有差异；声誉好但贵 |
| **.app** / **.dev** / **.page** / **.day** / **.ing** 等 Google 注册局后缀 | Google | $12–$20 | 开发者、产品落地页 | **强制 HTTPS**（HSTS preload），没配 HTTPS 证书前页面打不开 |
| **.xyz** | Genesis / Generation X | $1 / $11 | 实验、临时项目、个人玩具 | 首年极便宜但**垃圾邮件/钓鱼声誉差**，做正经产品慎用 |
| **.co** | Colombia 注册局 | $20 / $25 | 创业、短域名替代 .com | "company" 联想，但续费比 .com 贵 |
| **.me** | Montenegro | $5/$20 | 个人主页、简历 | 首年促销多，续费价跳得明显 |
| **.sh** | St. Helena | $50 / $50 | shell / 命令行工具项目 | 贵但情怀满分，看个人偏好 |
| **.tech** | Radix | $5 / $45 | 技术博客、公司 | 首年极低、续费暴涨，典型坑 |
| **.cn** / **.com.cn** / **.中国** | CNNIC（中国） | ¥30 / ¥35 起 | 国内业务、备案 | **必须实名认证**；要在国内服务器上跑必须备案；境外注册商购买 .cn 也需 CNNIC 实名 |
| **.top** / **.icu** / **.live** / **.fun** 等 | 各国 | $1 / $5–$30 | 临时/实验 | 首年极便宜，SEO 与邮件声誉普遍差，谨慎做主品牌 |

几个实务判断：

- **能 .com 就 .com**：用户记得住、邮箱不进垃圾箱、二手转卖容易。理想名字被占时去二手市场（aftermarket）买，常用平台：Dan.com、Sedo、Afternic、Namesilo aftermarket。
- **AI / 技术创业走 .ai 或 .dev**：品牌识别度强，但 .ai 价格高、最少 2 年起，预算有限就先用 .com + 子路径。
- **.dev / .app / .page 这类 Google 后缀强制 HTTPS**：没部署好证书就配 NS 到 Cloudflare，站点会直接打不开。提前确认 Cloudflare 已出 Universal SSL。
- **避坑**：后缀首年价越低、续费价跳得越猛的，越是"续费套利"型注册商套路。看 Domcomp 续费价那一列。
- **续费日历提醒**：境外高价后缀（.ai / .io / .tech 等）建议**关掉自动续费**，用日历提醒在到期前 1 个月手动续；避免某天发现被按原价扣了 $80 还退不回来。
- **.cn / .中国 走国内**：涉及实名和备案，下一节国内 vs 国外专门讲。

---

## 买完之后托管到 Cloudflare

域名买在哪不重要，**DNS 解析托管在哪才决定 CDN、SSL、WAF 这些功能能不能用**。把域名托管到 Cloudflare，意思是把"权威域名服务器（Authoritative Nameservers）"改成 Cloudflare 分配给你的那一对，之后所有 DNS 查询都由 Cloudflare 回答。

### 为什么要托管到 Cloudflare

- 免费 CDN、免费 Universal SSL、免费基础 WAF/DDoS 防护、免费 DNS 解析。
- DNS 托管本身不收费，**你也不必在 Cloudflare Registrar 买域名**，别的注册商买的域名一样可以托管过来。
- 后续绑 Workers、Pages、R2 自定义域名、Email Routing，都要求域名先托管在 Cloudflare。

### 在 Cloudflare 买域名 vs 别处买但托管到 CF

很多人把这两件事混在一起。其实它们是两个独立动作：

| 你在哪买域名 | 是否能托管到 CF DNS | 续费由谁收 | 适合 |
| --- | --- | --- | --- |
| **Cloudflare Registrar** | 自动托管（无需改 NS） | CF，按 ICANN 批零成本价，最便宜 | CF 支持的后缀 + 长期持有的核心域 |
| **Spaceship / Porkbun / Namecheap 等** | 需改 NS 到 CF（三步流程） | 原注册商 | CF 不支持的后缀（.ai / .io / .sh 等），或想保留多家注册商 |
| **阿里云 / 腾讯云** | 需改 NS 到 CF（需实名 + 短信验证） | 原注册商 | 国内备案场景 |

记住：**DNS 托管 ≠ 域名买卖**。CF Registrar 支持的后缀能省续费差价，不支持的就在别处买、DNS 照样托管到 CF。

### 整体流程（三步）

1. 在 Cloudflare 控制台 **Add a site**，填入你的根域名（`example.com`），选择 Free 计划。
2. Cloudflare 会扫描你当前 DNS 并自动导入解析记录，然后给你分配两个 NS，例如 `sofia.ns.cloudflare.com` / `tom.ns.cloudflare.com`。
3. 回到**注册商后台**，把那两条老 NS 删掉、换成 Cloudflare 的两条，保存。等 5 分钟到 48 小时全球生效，Cloudflare 控制台会显示 "Active"。

### 改域名服务器（NS）具体步骤

按注册商分别说一下，每家后台 UI 不同但路径类似：

**Cloudflare Registrar**：买的就在 Cloudflare，添加站点时会自动设好，无需手动改。

**Spaceship**：My Account → 域名列表 → 选中域名 → **Nameservers** → Custom nameservers → 填入 Cloudflare 给的两条 → 保存。

**Porkbun**：Domain Management → 选中域名 → **Edit Nameservers** → 选 Custom → 填两条 → Save。

**Namecheap**：Domain List → Manage → **Nameservers** → Custom DNS → 填入 → Save（绿色勾）。

**阿里云**：域名控制台 → 域名管理 → DNS 修改 → 把默认的 `dns*.hichina.com` 改成 Cloudflare 两条 → 提交，需短信验证码确认。

**腾讯云**：域名管理 → 选中域名 → DNS 服务器 → 修改 → 填入 → 保存，需短信验证。

### 国内注册商改 NS 的注意点

- 部分注册商要求**实名认证通过后**才能改 NS，没实名的域名修改会被拦下。先去把实名搞完。
- 修改 NS 需要**短信验证码确认**，且变更后通常不能再频繁修改（防滥用），错改一两次可能锁几小时。
- `.cn` 域名改 NS 到 Cloudflare 是否合规：DNS 托管本身合规没问题，但**网站要面向国内正式运营还要备案**，备案时填的接入服务商和 NS 解析的提供商不是一回事，不影响备案本身；但**服务器在国内**会被接入商拦截。境外服务器 + Cloudflare NS 是常态。
- NS 修改全球生效最长 48 小时，但国内递归 DNS 缓存可能更长，耐心等。用 [dnschecker.org](https://dnschecker.org/) 看全球传播情况。

### 灰云 vs 橙云（托管后的第一个选择）

DNS 记录配好之后，Cloudflare 后台每条记录旁边有个云图标：

- **橙云（Proxied）**：流量走 Cloudflare 全球网络，享受 CDN/WAF/SSL/DDoS。国内访问质量"看运气"。
- **灰云（DNS only）**：只走 Cloudflare DNS，直接指向你的源站 IP（可以是国内服务器或国内 CDN）。

国内源站或国内 CDN 指向场景就设灰云；海外加速、Workers/Pages 自定义域名场景必须橙云。一条一条切换即可，不是全局开关。详见主手册 [国内访问 → 橙云 vs 灰云](/#橙云-vs-灰云)。

### DNSSEC：托管后建议立刻开

DNSSEC 给 DNS 解析加密码签名，防止解析被中间人篡改、域名被劫持。Cloudflare 全程免费。

开法：

1. Cloudflare 控制台 → 你的域名 → **DNS** → **Settings** → **DNSSEC** → **Enable DNSSEC**。
2. CF 自动生成 DS 记录，弹窗里给你 key tag / algorithm / digest type / digest。
3. 把这些参数填回**注册商后台的 DNSSEC 配置页**（多数注册商叫 "DS records" 或 "DNSSEC"）。
4. 等待全球传播（最长 48 小时），用 [dnschecker.org](https://dnschecker.org/) 查 `DS` 记录是否已全球可见。

开完后所有权威解析都带有 RRSIG 签名，递归解析器（如 1.1.1.1、8.8.8.8）会自动校验。**这一步是免费的"域名防伪"，强烈建议开**。注意：开 DNSSEC 期间不要再去改 NS，否则可能进入"签名失败"状态导致解析异常。

---

## 国内买 vs 国外买

很多开发者在这件事上纠结，直接上对比表：

| 维度 | 国内注册商（阿里云 / 腾讯云 / 华为云 / 西部数码） | 国外注册商（Cloudflare / Spaceship / Porkbun / Namecheap） |
| --- | --- | --- |
| 实名认证 | **强制**，注册后必须实名（个人身份证或企业证件）才能解析 | 不需要 |
| ICP 备案 | **可在境内注册商做备案**（工信部批复的注册服务单位） | **不能备案**：Namecheap / Cloudflare / Porkbun / Spaceship / Name.com / GoDaddy 等多数不在工信部批复名单里 |
| 服务器在国内的合规 | 备案后可正常解析 80/443 | 服务器在国内但没备案 → 被接入商拦截 |
| 服务器在境外 | 无需备案 | 无需备案，访问看线路 |
| `.cn` / `.com.cn` / `.中国` | 直接买，实名后可解析 | 可买但多数仍要 CNNIC 实名（部分注册商不卖 .cn） |
| 支付 | 支付宝 / 微信 / 银联 | 信用卡 / PayPal，少数支持支付宝（Namecheap 支持） |
| 价格 | 中等，常有新人活动 | 首年促销多、续费大多更便宜 |
| WHOIS 隐私 | 部分收费，部分默认不公开（.cn 强制不公开） | 主流注册商免费 |
| 续费稳定性 | 监管下稳定，但价格回升 | 视注册局和汇率而定 |
| 客服 | 中文 / 工单 / 电话 | 英文 / 工单 / 部分有中文（Namecheap 无） |
| 域名转移出去 | 实名通过即可拿 EPP 码转出 | 拿 EPP 码即可转出 |
| 适合 | 国内正式经营、需要备案、企业业务 | 海外为主、个人项目、不打算备案 |

### 结论

- **你要在国内服务器上跑网站并对公众开放**：必须备案 → **只能在工信部批复的境内注册商处买域名**（阿里云 / 腾讯云 / 华为云 / 西部数码）。境外域名要备案，得先把域名**转入**境内注册商。
- **你服务器在境外（含 Cloudflare）**：不需要备案，**强烈建议直接在境外买**：Cloudflare Registrar 续费成本价、Spaceship / Porkbun 价格低+WHOIS 隐私免费，体验和成本都更优。
- **域名本身会不会因为"没备案"被墙**：不会。被墙是内容问题，不是域名备案问题。境外服务器 + 未备案域名 + Cloudflare 代理是大量个人项目、文档站、开源项目的常态。
- **企业面向大陆正式运营**：绕不开备案，这是法律问题，详见主手册 [国内访问 → 备案这件事](/#备案这件事)。

---

## 域名转移（Registrar Transfer）

域名转移 = 把域名从一个注册商换到另一个注册商。常见动机：续费太贵、要备案（境外转境内）、想统一在 Cloudflare 拿成本价续费。

### 转移基本流程（5 步）

1. **解锁域名**：当前注册商后台找 "Transfer lock" / "Registrar lock" 关掉。
2. **拿 EPP Auth Code**（也叫 Authorization Code / 转移密码）：后台可自助获取，部分需工单。
3. **在新注册商发起转移**：输入域名 + EPP 码 + 付款（转移费通常 = 1 年续费价）。转移成功后注册期**自动延长 1 年**。
4. **确认转移**：发起后旧注册商会发邮件问是否同意（默认 5 天到期自动同意），CC 联系人邮箱里有链接可主动确认加速。
5. **等待 5–7 天**：转移完成，DNS 不受影响（NS 不会因转移而改变，除非你手动改）。

### 注意事项

- **60 天锁**：注册后 60 天内、刚改过注册人信息 60 天内、刚转移进来 60 天内，都不能再次转移。这是 ICANN 规则，所有注册商统一。
- **续费宽限期**：域名过期后还有 0–45 天 "Renewal Grace Period"，期间可续费不解锁转移；超过进入 "Redemption Period"（赎回期，价格 $80+ 才能救回来），更超过就进入待删除，需要重新抢注。别拖到过期再转移。
- **特殊 TLD 转移规则不同**：
  - `.uk` / `.co.uk` 用 **IPS Tag** 而非 EPP 码，改 IPS Tag 到新注册商即可。
  - `.ca` 加拿大注册局有特别规则。
  - `.eu` 不能跨注册局转，只能在 EURid 体系内。
  - `.cn` 在境外注册商之间转移受 CNNIC 实名规则限制，部分不允许。
- **转入 Cloudflare Registrar**：转移成功后**续费按 Cloudflare 成本价**，长期持有"刚需"型域名建议转进来。但 Cloudflare Registrar **不支持所有 TLD**，转移前查支持列表（[支持的后缀清单](https://developers.cloudflare.com/registrar/)）。不支持的后缀（如部分 .ai、.sh）只能留在原注册商续费。

### 国内 ↔ 境外互转的注意事项

- **境外 → 国内**（要备案）：常见操作。境外的 Namecheap / Cloudflare 域名拿 EPP 码，在新注册商（阿里云/腾讯云）发起转入，转入后域名在境内注册商名下，可走备案。转入会被要求实名认证。
- **国内 → 境外**（不要备案、省钱、统一管理）：拿 EPP 码发起转移。但**国内注册商可能以"实名审核未通过/正在备案"等理由限制转移**，极端情况要走工单。建议在域名到期前留出 1–2 个月缓冲。
- **转移期间 DNS 不中断**：NS 记录不会因为注册商变更而自动改，继续用原 Cloudflare NS。但要确保新注册商不会偷偷改回默认 NS（个别会），转移完成后第一时间核对 NS 仍是 Cloudflare 的两条。

### 域名转移 vs 域名过户：两件不同的事

新手最容易混的两个概念：

| | 域名转移（Registrar Transfer） | 域名过户（Ownership Transfer） |
| --- | --- | --- |
| 做什么 | 换注册商 | 换持有人（owner） |
| 标志 | EPP Auth Code + 新注册商发起 | 改注册人信息 / 内部 push / 账户间转移 |
| 影响续费 | 影响，转移成功后按新注册商价续费 | 不影响，仍是原注册商 |
| 影响 DNS | 不影响（NS 不变） | 不影响 |
| ICANN 60 天锁 | 改注册人信息后 60 天内**禁止转移注册商**（部分注册商可豁免） | 过户后 60 天内**不能再改注册人信息**（部分注册商可豁免） |
| 常见场景 | 续费太贵、想统一在 CF、要备案 | 域名卖给别人、转给公司主体 |

**转移 = 换店续费；过户 = 换主人**。先把所有权稳住（过户），再决定是否换注册商（转移），两个动作不要同时进行，以免同时踩两个 60 天锁。

---

## 搬不进 Cloudflare 怎么办

两种情况导致域名没法走标准 NS 托管：

### 1. 注册商不允许改 NS（少见但有）

少数国内注册商的 `.cn` 域名或特殊后缀，强制使用其默认 NS，或改 NS 流程极麻烦。应对：

- **转出到允许改 NS 的注册商**（阿里云允许、Spaceship 允许），转完再改 NS。
- 实在改不了 → 用 **CNAME 接入**：保留原 NS，但把 `www` / 业务子域 CNAME 到 Cloudflare 给的 hostname（部分子域功能如 Workers 自定义域名支持 CNAME 接入，但根域 `@` 仍需 NS 接入）。CNAME 接入属于 Cloudflare 进阶能力（部分功能受限），优先还是想办法改 NS。

### 2. Cloudflare Registrar 不支持该后缀

不影响 DNS 托管：**你在任何注册商买的域名，都能托管到 Cloudflare DNS**。Registrar 支不支持只影响"能不能在 Cloudflare 直接续费"。Cloudflare 不支持的 .ai / .sh / .io 等后缀，**在原注册商续费、DNS 照样托管到 Cloudflare**，这是很多人日常的做法。

### 兜底方案

DNS 托管 ≠ 域名买卖。两个动作可以拆开：**注册商买便宜的地方买（比续费价）、DNS 永远托管到 Cloudflare**。能做到这一步，无论后缀贵贱、备案与否、国内国外，都能找到合理路径。

---

## 官方资源

| 资源 | 用法 |
| --- | --- |
| [Cloudflare Registrar 文档](https://developers.cloudflare.com/registrar/) | 查 Cloudflare Registrar 支持的后缀、转入流程、限制 |
| [Cloudflare DNS 文档](https://developers.cloudflare.com/dns/) | 查 DNS 记录类型、NS 配置、解析排查 |
| [Cloudflare 域名转移指南](https://developers.cloudflare.com/registrar/get-started/transfer-to-cloudflare/) | 把域名转入 Cloudflare Registrar 的官方步骤 |
| [Domcomp](https://www.domcomp.com/) | 域名比价（首年 / 续费 / 转入） |
| [TLD-List](https://tld-list.com/) | 后缀价格与免费 WHOIS 对照 |
| [IANA Root Zone Database](https://www.iana.org/domains/root/db) | 查每个 TLD 的注册局和规则 |
| [ICANN Lookup](https://lookup.icann.org/) | 查域名注册商、注册期、到期日等公共信息 |