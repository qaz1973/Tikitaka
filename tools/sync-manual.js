const fs = require('node:fs');
const path = require('node:path');

const repoRoot = path.resolve(path.dirname(__filename), '..');
const sourceRoot = process.argv[2] || 'D:\\2\\说明书视频文件部分';
const videoRoot = path.join(repoRoot, 'videos');

const sectionOrder = new Map([
  ['基础设置', 1],
  ['进阶', 2],
]);

const topicOrder = new Map([
  ['基础设置/设备预设', 10],
  ['基础设置/布局预设', 20],
  ['基础设置/按键功能调整', 30],
  ['基础设置/行程触发设置/单独设置', 40],
  ['基础设置/行程触发设置/批量设置', 50],
  ['基础设置/rt功能设置/单独设置', 60],
  ['基础设置/rt功能设置/批量设置', 70],
  ['基础设置/按键校准', 80],
  ['基础设置/按键校准/保存配置', 90],
  ['基础设置/rt行程校准测试', 100],
  ['基础设置/保存配置', 110],
  ['基础设置/控制器模式切换', 120],
  ['基础设置/SOCD模式切换', 130],
  ['进阶/切换用户模式', 210],
  ['进阶/定制用户布局部分导入', 220],
  ['进阶/按键通道引脚分配', 230],
  ['进阶/屏幕定义/修改通道添加按键保存', 240],
  ['进阶/添加按键', 250],
  ['进阶/灯光颜色设置/按键灯光设置/灯光设置顺序设置', 260],
  ['进阶/灯光颜色设置/按键灯光设置/按键颜色设置', 270],
  ['进阶/灯光颜色设置/氛围灯设置/添加配置或者使用预设', 280],
  ['进阶/灯光颜色设置/氛围灯设置/颜色设置', 290],
  ['进阶/自动校准', 300],
]);

const descriptions = new Map([
  ['基础设置/设备预设', '按设备型号套用基础配置。'],
  ['基础设置/布局预设', '按布局型号快速分配 GPIO 或霍尔通道。'],
  ['基础设置/按键功能调整', '选择按键后修改对应功能。'],
  ['基础设置/行程触发设置/单独设置', '单独调整一个按键的触发行程。'],
  ['基础设置/行程触发设置/批量设置', '批量应用多个按键的触发行程。'],
  ['基础设置/rt功能设置/单独设置', '单独设置 RT 下压和释放参数。'],
  ['基础设置/rt功能设置/批量设置', '批量应用 RT 参数。'],
  ['基础设置/按键校准', '按提示完成磁轴按键校准。'],
  ['基础设置/按键校准/保存配置', '校准完成后保存配置。'],
  ['基础设置/rt行程校准测试', '检查 RT、行程和按键状态是否正常。'],
  ['基础设置/保存配置', '设置完成后写入设备。'],
  ['基础设置/控制器模式切换', '切换设备输入或控制器模式。'],
  ['基础设置/SOCD模式切换', '选择 SOCD 清理模式。'],
  ['进阶/切换用户模式', '进入进阶或用户模式界面。'],
  ['进阶/定制用户布局部分导入', '导入自定义用户布局。'],
  ['进阶/按键通道引脚分配', '给按键分配 GPIO 或磁轴通道。'],
  ['进阶/灯光颜色设置/按键灯光设置/灯光设置顺序设置', '设置按键灯顺序和灯光效果。'],
  ['进阶/灯光颜色设置/氛围灯设置/添加配置或者使用预设', '添加氛围灯配置或套用预设。'],
  ['进阶/屏幕定义/修改通道添加按键保存', '在屏幕布局中修改通道、添加按键并保存。'],
  ['进阶/灯光颜色设置/氛围灯设置/颜色设置', '设置氛围灯颜色。'],
  ['进阶/灯光颜色设置/按键灯光设置/按键颜色设置', '设置按键灯颜色。'],
  ['进阶/添加按键', '在进阶布局中添加需要配置的按键。'],
  ['进阶/自动校准', '开启或关闭自动校准。'],
]);

const tags = new Map([
  ['基础设置/设备预设', ['设备型号', '快速套用']],
  ['基础设置/布局预设', ['GPIO', '霍尔通道']],
  ['基础设置/按键功能调整', ['按键功能']],
  ['基础设置/行程触发设置/单独设置', ['行程', '单键']],
  ['基础设置/行程触发设置/批量设置', ['行程', '批量']],
  ['基础设置/rt功能设置/单独设置', ['RT', '单键']],
  ['基础设置/rt功能设置/批量设置', ['RT', '批量']],
  ['基础设置/按键校准', ['磁轴校准']],
  ['基础设置/按键校准/保存配置', ['保存']],
  ['基础设置/rt行程校准测试', ['状态测试']],
  ['基础设置/保存配置', ['写入设备']],
  ['基础设置/控制器模式切换', ['控制器模式']],
  ['基础设置/SOCD模式切换', ['SOCD']],
  ['进阶/切换用户模式', ['用户模式']],
  ['进阶/定制用户布局部分导入', ['用户布局']],
  ['进阶/按键通道引脚分配', ['通道', '引脚']],
  ['进阶/灯光颜色设置/按键灯光设置/灯光设置顺序设置', ['按键灯', '顺序']],
  ['进阶/灯光颜色设置/氛围灯设置/添加配置或者使用预设', ['氛围灯', '预设']],
  ['进阶/屏幕定义/修改通道添加按键保存', ['屏幕定义']],
  ['进阶/灯光颜色设置/氛围灯设置/颜色设置', ['氛围灯', '颜色']],
  ['进阶/灯光颜色设置/按键灯光设置/按键颜色设置', ['按键灯', '颜色']],
  ['进阶/添加按键', ['添加按键']],
  ['进阶/自动校准', ['自动校准']],
]);

function assertInside(parent, child) {
  const relative = path.relative(parent, child);

  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`Refusing to write outside ${parent}: ${child}`);
  }
}

function listMp4Files(root) {
  const files = [];

  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.mp4')) {
        files.push(fullPath);
      }
    }
  }

  walk(root);
  return files;
}

function toRelativeParts(filePath) {
  const relativePath = path.relative(sourceRoot, filePath);
  return relativePath.split(path.sep);
}

function toTopic(parts) {
  return parts.slice(0, -1).join('/');
}

function titleFromTopic(topic) {
  const parts = topic.split('/');
  const section = parts.shift();
  const title = parts.join(' - ').replaceAll('rt', 'RT');

  if (section === '基础设置') {
    return title;
  }

  if (section === '进阶') {
    return title;
  }

  return topic;
}

function compareEntries(a, b) {
  const aSection = sectionOrder.get(a.section) ?? 99;
  const bSection = sectionOrder.get(b.section) ?? 99;

  if (aSection !== bSection) {
    return aSection - bSection;
  }

  const aTopic = topicOrder.get(a.topic) ?? 999;
  const bTopic = topicOrder.get(b.topic) ?? 999;

  if (aTopic !== bTopic) {
    return aTopic - bTopic;
  }

  return a.relativePath.localeCompare(b.relativePath, 'zh-CN');
}

function copyVideos(entries) {
  const resolvedVideoRoot = path.resolve(videoRoot);
  assertInside(repoRoot, resolvedVideoRoot);

  fs.rmSync(resolvedVideoRoot, { recursive: true, force: true });
  fs.mkdirSync(resolvedVideoRoot, { recursive: true });

  for (const entry of entries) {
    const destination = path.join(resolvedVideoRoot, ...entry.parts);
    assertInside(resolvedVideoRoot, destination);
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.copyFileSync(entry.sourcePath, destination);
  }
}

function htmlEscape(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function pathToUrl(parts) {
  return ['videos', ...parts].map((part) => encodeURIComponent(part)).join('/');
}

function renderTags(topic) {
  return (tags.get(topic) || [])
    .map((tag, index) => `<span class="tag${index % 2 === 1 ? ' alt' : ''}">${htmlEscape(tag)}</span>`)
    .join('');
}

function renderSteps(entries) {
  return entries.map((entry) => `
          <article class="step" id="${entry.id}">
            <div>
              <h3>${htmlEscape(entry.title)}</h3>
              <p>${htmlEscape(entry.description)}</p>
              <div class="tag-row">${renderTags(entry.topic)}</div>
            </div>
            <video muted loop playsinline preload="metadata">
              <source src="${pathToUrl(entry.parts)}" type="video/mp4">
            </video>
          </article>`).join('\n');
}

function renderSection(section, entries) {
  const id = section === '基础设置' ? 'basic' : 'advanced';
  const title = section === '进阶' ? '进阶设置' : section;
  const description = section === '基础设置'
    ? '常用设置按实际操作顺序排列，重复的保存动作只保留必要提示。'
    : '进阶功能按界面入口和配置流程排列，文字只做视频索引。';

  return `
      <section id="${id}">
        <div class="section-head">
          <h2>${title}</h2>
          <p>${description}</p>
        </div>
        <div class="steps">
${renderSteps(entries)}
        </div>
      </section>`;
}

function renderIndex(entries) {
  const basic = entries.filter((entry) => entry.section === '基础设置');
  const advanced = entries.filter((entry) => entry.section === '进阶');

  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Tikitaka 使用说明</title>
  <style>
    :root {
      color-scheme: light;
      --bg: #f4f6f8;
      --panel: #ffffff;
      --ink: #1f2933;
      --muted: #667085;
      --line: #d7dde5;
      --accent: #0f8b8d;
      --accent-soft: #e2f5f4;
      --accent-2: #d97904;
      --shadow: 0 8px 24px rgba(31, 41, 51, 0.06);
    }

    * {
      box-sizing: border-box;
    }

    html {
      scroll-behavior: smooth;
    }

    body {
      margin: 0;
      background: var(--bg);
      color: var(--ink);
      font-family: "Microsoft YaHei", "PingFang SC", "Segoe UI", Arial, sans-serif;
      font-size: 15px;
      line-height: 1.55;
      letter-spacing: 0;
    }

    a {
      color: inherit;
      text-decoration: none;
    }

    .site-header {
      border-bottom: 1px solid var(--line);
      background: var(--panel);
    }

    .header-inner,
    .layout,
    .footer {
      width: min(1320px, calc(100% - 32px));
      margin-left: auto;
      margin-right: auto;
    }

    .header-inner {
      padding: 22px 0 20px;
    }

    .eyebrow {
      margin: 0 0 8px;
      color: var(--accent);
      font-size: 13px;
      font-weight: 700;
    }

    h1 {
      margin: 0;
      font-size: 30px;
      line-height: 1.2;
      font-weight: 800;
      letter-spacing: 0;
    }

    .intro {
      max-width: 830px;
      margin: 10px 0 0;
      color: var(--muted);
      font-size: 15px;
    }

    .notice {
      max-width: 830px;
      margin: 10px 0 0;
      padding: 8px 10px;
      border: 1px solid #f2c98b;
      border-radius: 8px;
      background: #fff7e8;
      color: #8a5a12;
      font-size: 13px;
      font-weight: 700;
    }

    .quick-links {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 16px;
    }

    .quick-links a,
    .side-nav a {
      border: 1px solid var(--line);
      border-radius: 8px;
      background: #fbfcfe;
    }

    .quick-links a {
      display: inline-flex;
      align-items: center;
      min-height: 32px;
      padding: 5px 11px;
      color: var(--ink);
      font-size: 13px;
      font-weight: 700;
    }

    .quick-links a:hover,
    .quick-links a:focus-visible,
    .side-nav a:hover,
    .side-nav a:focus-visible {
      border-color: var(--accent);
      background: var(--accent-soft);
      outline: none;
    }

    .layout {
      display: grid;
      grid-template-columns: 220px minmax(0, 1fr);
      gap: 24px;
      margin-top: 22px;
      margin-bottom: 52px;
      align-items: start;
    }

    .side-nav {
      position: sticky;
      top: 18px;
      padding: 12px;
      border: 1px solid var(--line);
      border-radius: 8px;
      background: var(--panel);
      box-shadow: var(--shadow);
    }

    .side-nav h2 {
      margin: 0 0 10px;
      font-size: 14px;
      line-height: 1.3;
    }

    .side-nav a {
      display: block;
      margin-bottom: 7px;
      padding: 7px 8px;
      color: var(--muted);
      font-size: 13px;
    }

    .side-nav .minor {
      padding-left: 18px;
      border-color: transparent;
      background: transparent;
    }

    .content {
      display: grid;
      gap: 20px;
      min-width: 0;
      counter-reset: step;
    }

    section {
      scroll-margin-top: 16px;
      border: 1px solid var(--line);
      border-radius: 8px;
      background: var(--panel);
      box-shadow: var(--shadow);
    }

    .section-head {
      padding: 18px 22px 15px;
      border-bottom: 1px solid var(--line);
    }

    h2 {
      margin: 0;
      font-size: 21px;
      line-height: 1.3;
      letter-spacing: 0;
    }

    .section-head p {
      margin: 8px 0 0;
      color: var(--muted);
      font-size: 14px;
    }

    .steps {
      display: grid;
      gap: 24px;
      padding: 20px 22px 24px;
    }

    .step {
      display: grid;
      grid-template-columns: 1fr;
      gap: 0;
      align-items: start;
      border: 1px solid var(--line);
      border-radius: 8px;
      background: #fbfcfe;
      counter-increment: step;
      overflow: hidden;
      transition: border-color 160ms ease, box-shadow 160ms ease;
    }

    .step.is-active {
      border-color: #72c7c6;
      box-shadow: 0 0 0 3px rgba(15, 139, 141, 0.12);
    }

    .step > div {
      order: 2;
      padding: 13px 16px 15px;
    }

    .step > video {
      order: 1;
    }

    .step h3 {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0 0 8px;
      font-size: 16px;
      line-height: 1.35;
      letter-spacing: 0;
    }

    .step h3::before {
      content: counter(step, decimal-leading-zero);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 32px;
      height: 23px;
      padding: 0 6px;
      border: 1px solid #b8d9d8;
      border-radius: 6px;
      background: var(--accent-soft);
      color: var(--accent);
      font-size: 12px;
      font-weight: 800;
      line-height: 1;
    }

    .step p {
      margin: 0;
      color: var(--muted);
      font-size: 14px;
    }

    .tag-row {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 10px;
    }

    .tag {
      display: inline-flex;
      align-items: center;
      min-height: 24px;
      padding: 2px 8px;
      border-radius: 6px;
      background: var(--accent-soft);
      color: #087174;
      font-size: 12px;
      font-weight: 700;
    }

    .tag.alt {
      background: #fff0dc;
      color: var(--accent-2);
    }

    video {
      width: 100%;
      aspect-ratio: 16 / 9;
      display: block;
      border: 0;
      border-bottom: 1px solid var(--line);
      border-radius: 0;
      background: #0b1118;
      object-fit: contain;
    }

    .footer {
      margin-top: 0;
      margin-bottom: 34px;
      color: var(--muted);
      font-size: 13px;
      text-align: center;
    }

    @media (max-width: 860px) {
      .layout {
        display: block;
        margin-top: 18px;
      }

      .side-nav {
        position: static;
        margin-bottom: 18px;
      }

      h1 {
        font-size: 29px;
      }

      h2 {
        font-size: 22px;
      }
    }

    @media (max-width: 520px) {
      .header-inner,
      .layout,
      .footer {
        width: min(100% - 22px, 1180px);
      }

      .section-head,
      .steps {
        padding-left: 14px;
        padding-right: 14px;
      }

      .step {
        border-radius: 8px;
      }

      .step > div {
        padding: 12px 13px 14px;
      }

      h1 {
        font-size: 26px;
      }
    }
  </style>
</head>
<body>
  <header class="site-header">
    <div class="header-inner">
      <p class="eyebrow">Tikitaka 配置工具</p>
      <h1>Tikitaka 使用说明</h1>
      <p class="intro">说明内容由录屏目录自动排序生成，并对照项目界面保留必要步骤。页面以视频为主，文字只做短提示，重复的“保存”说明合并到相关步骤。</p>
      <p class="notice">注意：保存配置、重启、重置等操作会写入或改变设备状态，请确认设置无误后再执行。</p>
      <nav class="quick-links" aria-label="快速导航">
        <a href="#basic">基础设置</a>
        <a href="#advanced">进阶设置</a>
      </nav>
    </div>
  </header>

  <main class="layout">
    <aside class="side-nav" aria-label="目录">
      <h2>目录</h2>
      <a href="#basic">基础设置</a>
${basic.map((entry) => `      <a class="minor" href="#${entry.id}">${htmlEscape(entry.title)}</a>`).join('\n')}
      <a href="#advanced">进阶设置</a>
${advanced.map((entry) => `      <a class="minor" href="#${entry.id}">${htmlEscape(entry.title)}</a>`).join('\n')}
    </aside>

    <div class="content">
${renderSection('基础设置', basic)}
${renderSection('进阶', advanced)}
    </div>
  </main>

  <footer class="footer">Tikitaka 使用说明 · 视频来自说明书视频文件部分 · 共 ${entries.length} 个步骤</footer>

  <script>
    const demoVideos = Array.from(document.querySelectorAll("video"));
    let currentActiveVideo = null;

    function prepareDemoVideo(video) {
      video.muted = true;
      video.defaultMuted = true;
      video.autoplay = false;
      video.loop = true;
      video.playsInline = true;
      video.playbackRate = 0.5;
      video.setAttribute("muted", "");
      video.setAttribute("loop", "");
      video.setAttribute("playsinline", "");
      video.removeAttribute("controls");
    }

    function setStepActive(video, isActive) {
      const step = video.closest(".step");

      if (step) {
        step.classList.toggle("is-active", isActive);
      }
    }

    function pauseDemoVideo(video) {
      video.pause();
      setStepActive(video, false);
    }

    function playDemoVideo(video, shouldRestart) {
      if (document.hidden) {
        return;
      }

      prepareDemoVideo(video);

      if (shouldRestart) {
        try {
          video.currentTime = 0;
        } catch (error) {}
      }

      setStepActive(video, true);
      video.play().catch(() => {});
    }

    demoVideos.forEach((video) => {
      prepareDemoVideo(video);
      video.addEventListener("loadedmetadata", () => {
        video.playbackRate = 0.5;
      });
      video.addEventListener("ratechange", () => {
        if (video.playbackRate !== 0.5) {
          video.playbackRate = 0.5;
        }
      });
    });

    function getVideoScore(video) {
      const rect = video.getBoundingClientRect();
      const visibleHeight = Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);

      if (visibleHeight <= 0) {
        return 0;
      }

      const visibleRatio = visibleHeight / Math.max(rect.height, 1);
      const centerDistance = Math.abs((rect.top + rect.height / 2) - window.innerHeight / 2);
      const centerBonus = 1 - Math.min(centerDistance / Math.max(window.innerHeight / 2, 1), 1);

      return visibleRatio + centerBonus * 0.25;
    }

    function updateActiveVideo() {
      let nextActiveVideo = null;
      let bestScore = 0;

      demoVideos.forEach((video) => {
        const score = getVideoScore(video);

        if (score > bestScore) {
          nextActiveVideo = video;
          bestScore = score;
        }
      });

      if (bestScore < 0.42) {
        demoVideos.forEach(pauseDemoVideo);
        currentActiveVideo = null;
        return;
      }

      if (currentActiveVideo !== nextActiveVideo) {
        demoVideos.forEach((video) => {
          if (video !== nextActiveVideo) {
            pauseDemoVideo(video);
          }
        });

        currentActiveVideo = nextActiveVideo;
        playDemoVideo(nextActiveVideo, true);
        return;
      }

      demoVideos.forEach((video) => {
        if (video === currentActiveVideo) {
          playDemoVideo(video, false);
        } else {
          pauseDemoVideo(video);
        }
      });
    }

    let updateQueued = false;

    function queueVideoUpdate() {
      if (updateQueued) {
        return;
      }

      updateQueued = true;
      requestAnimationFrame(() => {
        updateQueued = false;
        updateActiveVideo();
      });
    }

    window.addEventListener("scroll", queueVideoUpdate, { passive: true });
    window.addEventListener("resize", queueVideoUpdate);
    window.addEventListener("load", queueVideoUpdate);
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        demoVideos.forEach(pauseDemoVideo);
      } else {
        queueVideoUpdate();
      }
    });
    queueVideoUpdate();
  </script>
</body>
</html>
`;
}

function renderReadme(entries) {
  const lines = entries.map((entry, index) => `${index + 1}. ${entry.section} / ${entry.title} - ${entry.description}`);

  return `# Tikitaka 使用说明

这是 Tikitaka 配置工具的中文说明网站。说明页面由 \`tools/sync-manual.js\` 根据录屏目录自动同步生成。

## 在线说明网站

GitHub Pages 地址：

\`\`\`text
https://qaz1973.github.io/Tikitaka/
\`\`\`

## 同步录屏

默认录屏来源：

\`\`\`text
D:\\2\\说明书视频文件部分
\`\`\`

重新同步：

\`\`\`powershell
node tools/sync-manual.js
\`\`\`

也可以指定其他来源目录：

\`\`\`powershell
node tools/sync-manual.js "D:\\2\\说明书视频文件部分"
\`\`\`

## 当前步骤

${lines.join('\n')}
`;
}

function makeEntries() {
  if (!fs.existsSync(sourceRoot)) {
    throw new Error(`Source directory does not exist: ${sourceRoot}`);
  }

  return listMp4Files(sourceRoot)
    .map((sourcePath) => {
      const parts = toRelativeParts(sourcePath);
      const topic = toTopic(parts);
      const section = parts[0];
      const stats = fs.statSync(sourcePath);

      return {
        sourcePath,
        parts,
        relativePath: parts.join('/'),
        section,
        topic,
        title: titleFromTopic(topic),
        description: descriptions.get(topic) || '按录屏流程完成设置。',
        id: `step-${String(topicOrder.get(topic) || 999).padStart(3, '0')}`,
        size: stats.size,
        mtimeMs: stats.mtimeMs,
      };
    })
    .sort(compareEntries);
}

const entries = makeEntries();
copyVideos(entries);

fs.writeFileSync(path.join(repoRoot, 'index.html'), renderIndex(entries), 'utf8');
fs.writeFileSync(path.join(repoRoot, 'README.md'), renderReadme(entries), 'utf8');

console.log(`Synced ${entries.length} video steps from ${sourceRoot}`);
