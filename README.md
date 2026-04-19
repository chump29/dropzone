# ![DropZoneBot](./utils/images/dropzonebot.webp) DropZoneBot

> - DropZoneBot for Discord

---

![Biome](https://img.shields.io/badge/Biome-^2.4.12-informational?style=plastic&logo=biome) &nbsp;
![Bun](https://img.shields.io/badge/Bun-~1.3.12-informational?style=plastic&logo=bun) &nbsp;
![discord.js](https://img.shields.io/badge/discord.js-^14.26.3-informational?style=plastic&logo=discord.js) &nbsp;
![Drizzle](https://img.shields.io/badge/Drizzle-^1.0.0--beta.9-informational?style=plastic&logo=drizzle) &nbsp;
![SQLite](https://img.shields.io/badge/SQLite-3.49.2-informational?style=plastic&logo=sqlite)

![CodeQL](https://github.com/chump29/dropzonebot/workflows/CodeQL/badge.svg) &nbsp;
![License](https://img.shields.io/github/license/chump29/dropzonebot?style=plastic&color=blueviolet&label=License&logo=gplv3)

---

### Discord <!-- markdownlint-disable-line MD001 -->

#### ⚙️ Role Permissions:

|     Permission     |
|:------------------:|
|    ViewChannel     |
|    SendMessages    |
|     EmbedLinks     |
|    AddReactions    |
|   ManageMessages   |
| ReadMessageHistory |

#### / Commands

|     📋 Task      |   🔧 Command    | ⚙️ Permission |
|:----------------:|:---------------:|:-------------:|
|    Drop Loot     |     `/drop`     | Administrator |
|       Info       |     `/info`     | SendMessages  |
|   Leaderboard    | `/leaderboard`  | SendMessages  |
|       Ping       |     `/ping`     | SendMessages  |
|    Reload DB     |    `/reload`    | Administrator |
|   Reset Score    |    `/reset`     | Administrator |
| Reset User Score | `/reset [user]` | Administrator |
|   Start Timer    |    `/start`     | Administrator |
|      Status      |    `/status`    | Administrator |
|    Stop Timer    |     `/stop`     | Administrator |

---

### 🛠️ Environment Management

#### NPM ([Bun](https://github.com/oven-sh/bun "Bun") toolkit):

| 📋 Task |  🔧 Command   |
|:-------:|:-------------:|
| Upgrade | `bun upgrade` |

### 📦 Dependency Management

#### Installation & Removal:

|        📋 Task         |            🔧 Command (Full)             |           🔧 Command (Short)           |
|:----------------------:|:----------------------------------------:|:--------------------------------------:|
|      Install DEV       |              `bun install`               |                `bun i`                 |
|      Install PROD      |        `bun install --production`        |               `bun i -p`               |
|     Add dependency     |      `bun add [package][@version]`       |      `bun a [package][@version]`       |
|   Add devDependency    | `bun add --save-dev [package][@version]` |     `bun a -d [package][@version]`     |
| Add optionalDependency | `bun add --optional [package][@version]` | `bun a --optional [package][@version]` |
|   Add peerDependency   |   `bun add --peer [package][@version]`   |   `bun a --peer [package][version]`    |
|       Add Global       |  `bun add --global [package][@version]`  |     `bun a -g [package][@version]`     |
|   Remove Dependency    |          `bun remove [package]`          |           `bun r [package]`            |

#### Maintenance & Quality:

|     📋 Task     |   🔧 Command (Full)    | 🔧 Command (Short)  |
|:---------------:|:----------------------:|:-------------------:|
|  Check Updates  |     `bun outdated`     |       &mdash;       |
|   Update All    |      `bun update`      |       &mdash;       |
| Update Specific | `bun update [package]` |       &mdash;       |
| Security Audit  |      `bun audit`       |       &mdash;       |
|   Run Script    |   `bun run [script]`   |   `bun [script]`    |
|      List       |       `bun list`       |       &mdash;       |
|   List Extra    |    `bun list --all`    |       &mdash;       |
|    Hierarchy    | `bun pm why [package]` | `bun why [package]` |

### 🧪 Development

#### Scripts:

|    📋 Task     |  🔧 Command (Full)   | 🔧 Command (Short) |
|:--------------:|:--------------------:|:------------------:|
| Lint All (DEV) |    `bun run lint`    |     `bun lint`     |
| Lint All (CI)  |  `bun run lint:ci`   |   `bun lint:ci`    |
|   Lint Biome   | `bun run lint:biome` |  `bun lint:biome`  |
|    Lint ENV    |  `bun run lint:env`  |   `bun lint:env`   |
|   Build DEV    |    `bun run dev`     |     `bun dev`      |
|   Build PROD   |    `bun run prod`    |     `bun prod`     |
|  Generate DB   |     `bun run db`     |      `bun db`      |

#### Docker Deployment:

|  📜 Script  |  🔧 Command   |
|:-----------:|:-------------:|
|    Full     | `./build.sh`  |
| Docker Only | `./docker.sh` |

#### Environment Variables:

|  📝 Description   | 𝕏 Variable  |  {...} Value   |
|:-----------------:|:-----------:|:--------------:|
|  Autostart timer  |  AUTOSTART  | **true**/false |
|      DB Name      |   DB_NAME   | dropzonebot.db |
|      DB Path      |   DB_PATH   |     ./db/      |
|    Loot Emoji     |    EMOJI    |       💰       |
|       Debug       |  IS_DEBUG   | true/**false** |
| Logo Server Port  |  LOGO_PORT  |      8001      |
|  Run Logo Server  | LOGO_SERVER | **true**/false |
|     Logo URL      |  LOGO_URL   |   [logo url]   |
|   Maximum Time    |  MAX_TIME   |       3h       |
|   Minimum Time    |  MIN_TIME   |       1h       |
|     Bot Name      |    NAME     |  DropZoneBot   |
| Rate Limiter (ms) |    RATE     |      1000      |
|   Loot Timeout    |   TIMEOUT   |       1m       |

---

### 🛰️ Git & CI/CD

- **Pre-Commit:** Staged files are automatically linted
- **Github Actions:** Lints, builds, and pushes multi-architecture images to repository
  - latest
    - amd64
    - arm64
