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
  ['进阶/添加按键', 240],
  ['进阶/屏幕定义/修改通道添加按键保存', 250],
  ['进阶/灯光颜色设置/按键灯光设置/灯光设置顺序设置', 260],
  ['进阶/灯光颜色设置/按键灯光设置/按键颜色设置', 270],
  ['进阶/灯光颜色设置/氛围灯设置/添加配置或者使用预设', 280],
  ['进阶/灯光颜色设置/氛围灯设置/颜色设置', 290],
  ['进阶/自动校准', 300],
]);

const manualDetails = new Map([
  ['基础设置/设备预设', {
    title: '设备预设',
    summary: '按设备型号套用基础配置，视频演示的是打开设备预设并选择对应型号。',
    steps: [
      '进入磁轴配置页面，打开“设备预设”。',
      '选择与你设备型号一致的预设。',
      '确认选择后套用预设。'
    ],
    verify: [
      '按键数量和实际面板一致。',
      '设备预设没有把不需要的 GPIO、LED 或外设配置写入当前设备。'
    ],
    notes: [
      '已有可用配置时先备份；第一次配置可以直接按视频套用。如需验证按钮数量或画布布局，请先切换到专业模式。'
    ],
    tags: ['设备型号', '快速套用'],
    refs: ['HallEffectConfigPage.tsx', 'www/public/presets']
  }],
  ['基础设置/布局预设', {
    title: '布局预设',
    summary: '根据实际面板布局快速生成按键位置，视频演示的是选择布局并套用。',
    steps: [
      '进入磁轴配置页面，打开“布局预设”。',
      '选择与外壳或键位排列一致的布局。',
      '套用后看画布上的按钮位置是否接近你的设备。',
      '如果只是键位功能不对，继续看“按键功能调整”。'
    ],
    verify: [
      '方向键、功能键和辅助键位置清楚可辨。',
      '布局不会覆盖你已经调整好的自定义位置。'
    ],
    notes: [
      '普通用户优先用布局预设；只有按键对应不上时，再看进阶里的通道分配。'
    ],
    tags: ['布局', '通道关系'],
    refs: ['HallEffectConfigPage.tsx', 'www/public/presets/models']
  }],
  ['基础设置/按键功能调整', {
    title: '按键功能调整',
    summary: '点击画布上的按键，修改它在手柄里的功能。',
    steps: [
      '在磁轴配置画布上选择一个按键。',
      '在右侧属性面板中选择“功能”。',
      '按需要改成方向、B1/B2、L1/R1、S1/S2、A1/A2、Fn 等动作。',
      '改完后继续看测试或保存配置。'
    ],
    verify: [
      '画布上的标签和你的目标键位一致。',
      '进入测试模式后按下按键，触发状态和显示的动作一致。'
    ],
    notes: [
      '只改按键功能时，不需要进入专业模式。'
    ],
    tags: ['按键功能', '动作映射'],
    refs: ['HallEffectConfigPage.tsx', 'proto/enums.proto']
  }],
  ['基础设置/行程触发设置/单独设置', {
    title: '单键行程触发设置',
    summary: '只调整一个磁轴按键的总行程和触发行程，视频演示的是点按键后在弹窗里修改数值。',
    steps: [
      '选择一个 HE 按键。',
      '切换到“行程”工具。',
      '在弹出的行程设置窗口里修改 Travel。',
      '再修改 Actuation。',
      '改完后关闭窗口，继续看测试或保存配置。'
    ],
    verify: [
      '轻按到目标深度时按键开始触发。',
      '完全释放后不会残留触发状态。'
    ],
    notes: [
      'Actuation 数值越小越早触发；如果误触，调大一点再测试。'
    ],
    tags: ['Travel', 'Actuation', '单键'],
    refs: ['HallEffectConfigPage.tsx', 'proto/config.proto']
  }],
  ['基础设置/行程触发设置/批量设置', {
    title: '批量行程触发设置',
    summary: '在“更多”菜单里批量填写 Travel 和 Actuation，视频演示的是普通界面也能看到的批量设置。',
    steps: [
      '打开顶部“更多”菜单。',
      '保持或切到“普通”界面。',
      '在批量设置里填写行程和触发行程。',
      '点击“批量应用行程/触发”。',
      '继续看 RT 设置、测试或保存配置。'
    ],
    verify: [
      '同组按键触发手感一致。',
      '没有把不需要调整的按键一起选中。'
    ],
    notes: [
      '批量应用会把所选按键改成同一组行程参数，适合 WASD、方向键等需要统一手感的按键。'
    ],
    tags: ['Travel', '批量'],
    refs: ['HallEffectConfigPage.tsx']
  }],
  ['基础设置/rt功能设置/单独设置', {
    title: '单键 RT 设置',
    summary: '为单个磁轴按键开启 Rapid Trigger，并设置按下和抬起灵敏度。',
    steps: [
      '选择一个 HE 按键。',
      '切换到“RT”工具。',
      '打开 Enable Rapid Trigger。',
      '设置 RT Down 和 RT Up。',
      '进入测试模式，连续轻按和释放，确认不会误触或粘连。'
    ],
    verify: [
      '按下时响应足够快。',
      '轻微抖动时不会反复误触。'
    ],
    notes: [
      'RT 数值越小越灵敏，也越依赖轴体和传感器稳定性。',
      '如果出现误触，先适当增大 RT Down 或 RT Up，再重新测试。'
    ],
    tags: ['Rapid Trigger', 'RT Down', 'RT Up'],
    refs: ['HallEffectConfigPage.tsx', 'src/webconfig.cpp']
  }],
  ['基础设置/rt功能设置/批量设置', {
    title: '批量 RT 设置',
    summary: '对多个磁轴按键统一应用 Rapid Trigger 参数。',
    steps: [
      '选择需要统一 RT 手感的多个 HE 按键。',
      '切换到“RT”工具并开启 Rapid Trigger。',
      '填写 RT Down 和 RT Up。',
      '批量应用后在测试模式中逐个按键检查。',
      '确认后保存配置。'
    ],
    verify: [
      '同组按键的触发和复位速度一致。',
      '没有把辅助键或不需要 RT 的按键一起应用。'
    ],
    notes: [
      '批量 RT 适合方向键和常用动作键，不建议在未测试前直接套到所有按键。'
    ],
    tags: ['Rapid Trigger', '批量'],
    refs: ['HallEffectConfigPage.tsx']
  }],
  ['基础设置/按键校准', {
    title: '按键校准',
    summary: '校准磁轴按键的空闲点和最大按下点，让行程、触发和 RT 判断有可靠基准。',
    steps: [
      '进入按键校准或批量校准入口。',
      '保持所有按键松开，等待空闲采样完成。',
      '按界面提示逐个按下目标按键到最大行程。',
      '等待系统记录按下点后松开。',
      '全部完成后看页面状态，再进入保存校准结果。'
    ],
    verify: [
      '空闲状态下按键不触发。',
      '完全按下时状态稳定触发。',
      '测试画面中的行程变化连续，不出现明显跳动。'
    ],
    notes: [
      '校准时不要压着其他按键。',
      '如果某个键状态异常，先重新校准该键；仍不正常时再看进阶通道分配。'
    ],
    tags: ['磁轴校准', '空闲点', '按下点'],
    refs: ['HallEffectConfigPage.tsx', 'WebApi.js', 'src/webconfig.cpp']
  }],
  ['基础设置/按键校准/保存配置', {
    title: '保存校准结果',
    summary: '校准完成后把新的磁轴参数写入设备，避免刷新或断电后丢失。',
    steps: [
      '确认所有需要校准的按键已经完成。',
      '点击保存或保存校准结果。',
      '等待保存完成提示。',
      '保存后再做一次 RT 与行程测试。'
    ],
    verify: [
      '页面提示保存成功。',
      '刷新页面或重新进入后，校准状态仍然正常。'
    ],
    notes: [
      '未保存就离开页面、刷新或重启，校准结果可能不会写入设备。'
    ],
    tags: ['保存', '校准结果'],
    refs: ['HallEffectConfigPage.tsx', 'src/webconfig.cpp']
  }],
  ['基础设置/rt行程校准测试', {
    title: 'RT 与行程测试',
    summary: '在测试状态下检查按键状态、行程读数和 Rapid Trigger 响应是否正常。',
    steps: [
      '打开测试模式。',
      '逐个按下需要检查的按键。',
      '观察触发状态、行程读数和释放响应。',
      '发现异常时返回校准、行程或 RT 设置重新调整。',
      '测试通过后保存最终配置。'
    ],
    verify: [
      '按下、保持、释放三个阶段都稳定。',
      'RT 开启的按键能随释放和再按快速响应。'
    ],
    notes: [
      '测试模式读取运行时状态，不等于已经保存；参数确认后仍要执行保存。'
    ],
    tags: ['状态测试', '行程', 'RT'],
    refs: ['HallEffectConfigPage.tsx', 'WebApi.js']
  }],
  ['基础设置/保存配置', {
    title: '保存配置到设备',
    summary: '把当前页面的设置写入设备存储。',
    steps: [
      '确认预设、按键、行程、RT、SOCD 或模式设置都已经检查完。',
      '点击保存配置。',
      '等待保存完成提示。',
      '如果页面提示需要重启，再从顶部导航选择重启方式。'
    ],
    verify: [
      '页面出现保存成功或进度完成提示。',
      '重新进入页面后关键参数仍然保留。'
    ],
    notes: [
      '保存、重启、恢复默认都会改变设备状态，请确认后再执行。',
      '重启到 Controller 模式后可能无法继续打开 Web Config，需要重新进入配置模式。'
    ],
    tags: ['写入设备', '重启前确认'],
    refs: ['Navigation.jsx', 'WebApi.js']
  }],
  ['基础设置/控制器模式切换', {
    title: '控制器模式切换',
    summary: '切换设备启动后的输入模式，例如 XInput、Switch、DInput、Keyboard、PS4/PS5、Xbox 等。',
    steps: [
      '进入设置或磁轴页顶部的输入模式入口。',
      '选择目标控制器模式。',
      '如果页面提示需要额外认证或连接手柄，按页面提示处理。',
      '保存设置。',
      '必要时重启到 Controller 模式，让系统重新识别设备。'
    ],
    verify: [
      '电脑或主机识别出的设备类型符合目标模式。',
      '按键测试工具中输入正常。'
    ],
    notes: [
      '切换模式后电脑或主机可能会重新识别设备，短暂断开是正常现象。'
    ],
    tags: ['Input Mode', '控制器模式'],
    refs: ['SettingsPage.jsx', 'HallEffectConfigPage.tsx']
  }],
  ['基础设置/SOCD模式切换', {
    title: 'SOCD 模式切换',
    summary: '设置相反方向同时输入时的清理规则。',
    steps: [
      '进入磁轴配置页或设置页。',
      '找到 SOCD 清理模式。',
      '按需要选择 Up Priority、Neutral、Last Win、First Win 或 Off。',
      '保存配置并测试左右、上下同时输入。'
    ],
    verify: [
      '同时按下相反方向时输出符合你选择的规则。',
      '目标游戏或比赛规则允许当前 SOCD 模式。'
    ],
    notes: [
      'Off/Bypass 表示不清理相反方向输入，合规性需要自行确认。',
      '部分平台或输入模式可能不支持 SOCD Off，会回到 Neutral。'
    ],
    tags: ['SOCD', '方向清理'],
    refs: ['SettingsPage.jsx', 'proto/enums.proto']
  }],
  ['进阶/切换用户模式', {
    title: '切换用户模式',
    summary: '切换普通/专业界面，显示更多布局、灯光、导入导出和高级维护工具。',
    steps: [
      '在磁轴配置页面打开“更多”或界面模式入口。',
      '选择普通模式或 Pro/专业模式。',
      '进入专业模式后再进行布局解锁、添加按键、灯光工具或自动校准表操作。',
      '完成后可切回普通模式，减少误操作。'
    ],
    verify: [
      '专业模式下可以看到解锁、添加按键、OLED 布局、LED 工具等入口。',
      '普通模式下危险或复杂入口被隐藏。'
    ],
    notes: [
      '专业模式会暴露更多会改变布局和硬件映射的功能，建议只在需要时打开。'
    ],
    tags: ['Pro 模式', '界面模式'],
    refs: ['InterfaceMode.ts', 'HallEffectConfigPage.tsx']
  }],
  ['进阶/定制用户布局部分导入', {
    title: '导入用户布局',
    summary: '导入自定义布局中的部分配置，用于复用已整理好的按键位置或配置片段。',
    steps: [
      '进入专业模式。',
      '打开导入入口，选择布局或配置文件。',
      '只导入需要的部分，避免覆盖无关设置。',
      '导入后看画布位置和按键功能是否符合预期。',
      '确认后保存。'
    ],
    verify: [
      '导入后的布局和设备实际面板一致。',
      '没有把旧设备的通道或 GPIO 配置误带入当前设备。'
    ],
    notes: [
      '跨设备导入前建议先备份当前配置；不确定时只导入布局相关内容。'
    ],
    tags: ['导入', '自定义布局'],
    refs: ['HallEffectConfigPage.tsx']
  }],
  ['进阶/按键通道引脚分配', {
    title: '按键通道与引脚分配',
    summary: '为按键分配磁轴通道或 GPIO 引脚，解决硬件线路和画布按钮之间的对应关系。',
    steps: [
      '进入专业模式并选择目标按键。',
      '在属性面板中选择该按键对应的输入来源。',
      '按视频给按键选择对应通道或引脚。',
      '分配动作功能。',
      '保存前到测试演示里按一次实体按键确认对应关系。'
    ],
    verify: [
      '按下实体按键时，画布上对应按钮被触发。',
      'GPIO 引脚没有覆盖插件或外设正在占用的引脚。'
    ],
    notes: [
      '这是专业设置；普通用户只有在按键对应不上、布局预设无法解决时再使用。'
    ],
    tags: ['HE 通道', 'GPIO', '引脚'],
    refs: ['HallEffectConfigPage.tsx', 'PinMapping.tsx']
  }],
  ['进阶/添加按键', {
    title: '添加按键',
    summary: '在专业布局中新增需要配置的按键元素。',
    steps: [
      '切换到专业模式并解锁画布。',
      '选择添加按键工具和按钮尺寸。',
      '在画布目标位置点击添加。',
      '为新按键选择输入来源。',
      '设置动作功能、行程或灯光后保存。'
    ],
    verify: [
      '新增按键位置不遮挡其他元素。',
      '新增按键已经绑定通道/引脚和功能。',
      '测试模式中可以正确触发。'
    ],
    notes: [
      '只添加画布按钮还不能直接使用，需要继续看“按键通道与引脚分配”。'
    ],
    tags: ['画布编辑', '新增按键'],
    refs: ['HallEffectConfigPage.tsx']
  }],
  ['进阶/屏幕定义/修改通道添加按键保存', {
    title: '屏幕定义与布局保存',
    summary: '修改 OLED/屏幕布局中的按钮元素，绑定通道并保存自定义显示布局。',
    steps: [
      '进入 OLED 布局或屏幕定义编辑器。',
      '解锁布局编辑。',
      '添加椭圆、方形或按钮元素。',
      '为元素选择要显示的按键或方向。',
      '检查位置、大小和显示层级。',
      '保存自定义布局，并回到显示配置中选择使用。'
    ],
    verify: [
      '屏幕预览中的按钮位置与实际设备相符。',
      '显示配置里已经选中自定义布局。',
      '设备屏幕能看到输入模式、SOCD、Profile 或输入历史等需要的状态项。'
    ],
    notes: [
      'OLED 布局保存后，还需要在显示配置中启用显示并选择对应布局。'
    ],
    tags: ['OLED', '自定义布局', '保存'],
    refs: ['DisplayLayoutEditor.tsx', 'DisplayConfig.jsx']
  }],
  ['进阶/灯光颜色设置/按键灯光设置/灯光设置顺序设置', {
    title: '按键灯光顺序设置',
    summary: '设置 RGB 按键灯在灯带链路中的顺序，影响流水、渐变和按键灯效对应关系。',
    steps: [
      '进入 LED 配置或专业模式灯光工具。',
      '按视频进入按键灯光顺序设置。',
      '按实际灯带焊接顺序排列按钮 LED。',
      '保存后观察灯效是否与实体按键顺序一致。'
    ],
    verify: [
      '第一个按钮 LED 从索引 0 开始。',
      '灯效移动方向和实际灯带顺序一致。',
      '玩家灯或外壳灯索引没有占用按钮灯区间。'
    ],
    notes: [
      '灯光顺序错了，颜色本身可能正常，但动态效果会错位。'
    ],
    tags: ['LED 顺序', 'RGB 链路'],
    refs: ['LEDConfigPage.jsx', 'CustomThemePage.jsx']
  }],
  ['进阶/灯光颜色设置/按键灯光设置/按键颜色设置', {
    title: '按键灯光颜色设置',
    summary: '为单个或多个按键设置普通状态和按下状态颜色。',
    steps: [
      '进入专业模式并选择灯光工具，或进入自定义主题页面。',
      '选择目标按键。',
      '设置 Normal Color 和 Pressed Color。',
      '需要统一颜色时可多选按键批量设置。',
      '保存并用灯光预览或实体灯检查效果。'
    ],
    verify: [
      '松开和按下时颜色符合预期。',
      '颜色没有因为灯光顺序错误映射到其他按键。'
    ],
    notes: [
      '如果按键颜色显示到别的按键上，先回到“按键灯光顺序设置”。'
    ],
    tags: ['按键灯', '颜色'],
    refs: ['LEDConfigPage.jsx', 'CustomThemePage.jsx']
  }],
  ['进阶/灯光颜色设置/氛围灯设置/添加配置或者使用预设', {
    title: '氛围灯配置或预设',
    summary: '为外壳或设备内部的 Case RGB/氛围灯添加配置，或套用已有预设。',
    steps: [
      '进入专业模式或 LED 配置的 Case RGB 区域。',
      '选择 Off、Ambient 或 Linked 等颜色类型。',
      '按视频添加氛围灯配置或套用预设。',
      '选择已有预设，或新增自定义配置。',
      '保存后观察实体氛围灯。'
    ],
    verify: [
      '氛围灯索引位于按钮灯之后，且没有和玩家灯冲突。',
      'Ambient 模式下氛围灯可以独立于按钮灯工作。'
    ],
    notes: [
      '只想快速使用时优先套用预设；需要细调颜色再看下一步。'
    ],
    tags: ['氛围灯', 'Case RGB', '预设'],
    refs: ['LEDConfigPage.jsx', 'HallEffectConfigPage.tsx']
  }],
  ['进阶/灯光颜色设置/氛围灯设置/颜色设置', {
    title: '氛围灯颜色设置',
    summary: '调整氛围灯的默认颜色或预设颜色。',
    steps: [
      '选择已经添加的氛围灯配置。',
      '打开颜色选择器。',
      '设置空闲颜色或预设颜色。',
      '保存并确认实体灯颜色。'
    ],
    verify: [
      '氛围灯颜色改变的是外壳/背景灯，不是按键灯。',
      '颜色和亮度不会影响按键识别或供电稳定性。'
    ],
    notes: [
      '如果灯光数量较多，亮度过高可能增加供电压力；异常时先降低最大亮度。'
    ],
    tags: ['氛围灯', '颜色'],
    refs: ['LEDConfigPage.jsx']
  }],
  ['进阶/自动校准', {
    title: '自动校准',
    summary: '开机或连接后预留约 3 秒初始化时间，自动读取当前磁轴空闲状态并更新校准补偿；用于多平台切换时保证输入稳定，一般保持默认开启。',
    steps: [
      '进入磁轴配置页面。',
      '找到自动校准开关。',
      '普通使用保持开启。',
      '开机、重启或连接设备后，等待约 3 秒初始化完成，再开始测试按键。',
      '这个等待用于应对 PC、主机、Switch、XInput 等多平台切换场景，让设备先稳定磁轴基线和输入识别。',
      '如果要做特殊调试、固定手感，或确认自动校准影响使用，再考虑关闭。',
      '保存配置。'
    ],
    verify: [
      '设备刚连接时如果比普通模式多等待约 3 秒，属于重新获取磁轴状态的正常现象。',
      '初始化完成后，按键静止时没有误触、断触或异常跳动。',
      '进入测试页面后，按下和松开都能稳定显示。'
    ],
    notes: [
      '目的说明：自动校准会让开机/连接初始化增加约 3 秒，用这段时间读取当前磁轴空闲点并更新补偿，主要是为了应对同一设备在 PC、主机、Switch 等平台之间切换后环境和识别状态变化，减少漂移、误触、断触或第一次连接不稳定的问题。',
      '这不是调手感的主要入口；普通用户一般保持开启即可，不需要反复开关。',
      '如果需要完全固定手感，可先完成手动校准，再按调试需要关闭自动校准。'
    ],
    tags: ['自动校准', '默认开启'],
    refs: ['HallEffectConfigPage.tsx', 'src/addons/he_trigger.cpp']
  }],
]);

const sourceNotes = [
  '项目功能以本地源码为准：C:\\Users\\Administrator\\ce\\wd\\ce2_4_4_heac_clean。',
  '用户给出的 build-rp2040-heac-clean 是构建输出目录，主要用于固件产物，不是说明文案的源码依据。',
  '录屏目录只作为视频素材来源：D:\\2\\说明书视频文件部分。',
];

const projectReferences = [
  ['磁轴配置主界面', 'www/src/Pages/HallEffectConfigPage.tsx'],
  ['控制器模式、SOCD、热键设置', 'www/src/Pages/SettingsPage.jsx'],
  ['GPIO 按键映射与 Profile', 'www/src/Pages/PinMapping.tsx'],
  ['LED 配置', 'www/src/Pages/LEDConfigPage.jsx'],
  ['自定义灯光主题', 'www/src/Pages/CustomThemePage.jsx'],
  ['显示屏配置', 'www/src/Pages/DisplayConfig.jsx'],
  ['OLED 布局编辑器', 'www/src/Pages/DisplayLayoutEditor.tsx'],
  ['前端 Web API', 'www/src/Services/WebApi.js'],
  ['固件 Web API', 'src/webconfig.cpp'],
  ['磁轴自动校准逻辑', 'src/addons/he_trigger.cpp'],
];

const externalReferences = [
  ['GP2040-CE Web Configurator', 'https://gp2040-ce.info/web-configurator/'],
  ['GP2040-CE Settings', 'https://gp2040-ce.info/web-configurator/menu-pages/settings/'],
  ['GP2040-CE GPIO Pin Mapping', 'https://gp2040-ce.info/web-configurator/menu-pages/gpio-pin-mapping/'],
  ['GP2040-CE Hall-Effect Trigger', 'https://gp2040-ce.info/add-ons/hall-effect-trigger/'],
  ['GP2040-CE LED Configuration', 'https://gp2040-ce.info/web-configurator/menu-pages/led-configuration/'],
  ['GP2040-CE Display Configuration', 'https://gp2040-ce.info/web-configurator/menu-pages/display-configuration/'],
  ['OpenStickCommunity GP2040-CE GitHub', 'https://github.com/OpenStickCommunity/GP2040-CE'],
];

const relatedTopics = new Map([
  ['基础设置/设备预设', [
    '进阶/切换用户模式',
    '基础设置/布局预设',
    '基础设置/按键功能调整',
    '基础设置/保存配置',
  ]],
  ['基础设置/布局预设', [
    '基础设置/按键功能调整',
    '基础设置/行程触发设置/单独设置',
    '基础设置/保存配置',
  ]],
  ['基础设置/按键功能调整', [
    '基础设置/rt行程校准测试',
    '基础设置/保存配置',
  ]],
  ['基础设置/行程触发设置/单独设置', [
    '基础设置/行程触发设置/批量设置',
    '基础设置/rt功能设置/单独设置',
    '基础设置/rt行程校准测试',
  ]],
  ['基础设置/行程触发设置/批量设置', [
    '基础设置/rt功能设置/批量设置',
    '基础设置/rt行程校准测试',
    '基础设置/保存配置',
  ]],
  ['基础设置/rt功能设置/单独设置', [
    '基础设置/rt功能设置/批量设置',
    '基础设置/rt行程校准测试',
    '基础设置/保存配置',
  ]],
  ['基础设置/rt功能设置/批量设置', [
    '基础设置/rt行程校准测试',
    '基础设置/保存配置',
  ]],
  ['基础设置/按键校准', [
    '基础设置/按键校准/保存配置',
    '基础设置/rt行程校准测试',
  ]],
  ['基础设置/按键校准/保存配置', [
    '基础设置/rt行程校准测试',
    '基础设置/保存配置',
  ]],
  ['基础设置/rt行程校准测试', [
    '基础设置/行程触发设置/单独设置',
    '基础设置/rt功能设置/单独设置',
    '基础设置/保存配置',
  ]],
  ['基础设置/保存配置', [
    '基础设置/控制器模式切换',
    '基础设置/SOCD模式切换',
  ]],
  ['基础设置/控制器模式切换', [
    '基础设置/保存配置',
  ]],
  ['基础设置/SOCD模式切换', [
    '基础设置/rt行程校准测试',
    '基础设置/保存配置',
  ]],
  ['进阶/切换用户模式', [
    '进阶/定制用户布局部分导入',
    '进阶/添加按键',
  ]],
  ['进阶/定制用户布局部分导入', [
    '进阶/按键通道引脚分配',
    '进阶/添加按键',
    '基础设置/保存配置',
  ]],
  ['进阶/按键通道引脚分配', [
    '进阶/添加按键',
    '基础设置/rt行程校准测试',
    '基础设置/保存配置',
  ]],
  ['进阶/添加按键', [
    '进阶/按键通道引脚分配',
    '进阶/屏幕定义/修改通道添加按键保存',
    '基础设置/保存配置',
  ]],
  ['进阶/屏幕定义/修改通道添加按键保存', [
    '基础设置/保存配置',
  ]],
  ['进阶/灯光颜色设置/按键灯光设置/灯光设置顺序设置', [
    '进阶/灯光颜色设置/按键灯光设置/按键颜色设置',
    '基础设置/保存配置',
  ]],
  ['进阶/灯光颜色设置/按键灯光设置/按键颜色设置', [
    '进阶/灯光颜色设置/氛围灯设置/添加配置或者使用预设',
    '基础设置/保存配置',
  ]],
  ['进阶/灯光颜色设置/氛围灯设置/添加配置或者使用预设', [
    '进阶/灯光颜色设置/氛围灯设置/颜色设置',
    '基础设置/保存配置',
  ]],
  ['进阶/灯光颜色设置/氛围灯设置/颜色设置', [
    '基础设置/保存配置',
  ]],
  ['进阶/自动校准', [
    '基础设置/按键校准',
    '基础设置/rt行程校准测试',
    '基础设置/保存配置',
  ]],
]);

const relatedLinkLabels = new Map([
  ['基础设置/设备预设=>进阶/切换用户模式', '如需验证先切专业模式'],
  ['基础设置/设备预设=>基础设置/布局预设', '按键位置不对'],
  ['基础设置/设备预设=>基础设置/按键功能调整', '按键功能不对'],
  ['基础设置/设备预设=>基础设置/保存配置', '已经可以用了'],
  ['基础设置/布局预设=>基础设置/按键功能调整', '键位功能不对'],
  ['基础设置/布局预设=>基础设置/行程触发设置/单独设置', '想调手感'],
  ['基础设置/布局预设=>基础设置/保存配置', '布局已经合适'],
  ['基础设置/按键功能调整=>基础设置/rt行程校准测试', '确认按键是否生效'],
  ['基础设置/按键功能调整=>基础设置/保存配置', '功能已经改好'],
  ['基础设置/行程触发设置/单独设置=>基础设置/行程触发设置/批量设置', '多个键一起调'],
  ['基础设置/行程触发设置/单独设置=>基础设置/rt功能设置/单独设置', '继续调 RT'],
  ['基础设置/行程触发设置/单独设置=>基础设置/rt行程校准测试', '确认触发位置'],
  ['基础设置/行程触发设置/批量设置=>基础设置/rt功能设置/批量设置', '批量调 RT'],
  ['基础设置/行程触发设置/批量设置=>基础设置/rt行程校准测试', '确认手感'],
  ['基础设置/行程触发设置/批量设置=>基础设置/保存配置', '参数已经合适'],
  ['基础设置/rt功能设置/单独设置=>基础设置/rt功能设置/批量设置', '多个键一起调 RT'],
  ['基础设置/rt功能设置/单独设置=>基础设置/rt行程校准测试', '确认 RT 是否正常'],
  ['基础设置/rt功能设置/单独设置=>基础设置/保存配置', 'RT 已经合适'],
  ['基础设置/rt功能设置/批量设置=>基础设置/rt行程校准测试', '确认批量设置效果'],
  ['基础设置/rt功能设置/批量设置=>基础设置/保存配置', 'RT 已经合适'],
  ['基础设置/按键校准=>基础设置/按键校准/保存配置', '校准后别丢失'],
  ['基础设置/按键校准=>基础设置/rt行程校准测试', '校准后测试'],
  ['基础设置/按键校准/保存配置=>基础设置/rt行程校准测试', '确认校准效果'],
  ['基础设置/按键校准/保存配置=>基础设置/保存配置', '写入最终配置'],
  ['基础设置/rt行程校准测试=>基础设置/行程触发设置/单独设置', '太早或太晚触发'],
  ['基础设置/rt行程校准测试=>基础设置/rt功能设置/单独设置', 'RT 不跟手'],
  ['基础设置/rt行程校准测试=>基础设置/保存配置', '测试正常'],
  ['基础设置/保存配置=>基础设置/控制器模式切换', '要换输入模式'],
  ['基础设置/保存配置=>基础设置/SOCD模式切换', '要改方向规则'],
  ['基础设置/控制器模式切换=>基础设置/保存配置', '模式选好了'],
  ['基础设置/SOCD模式切换=>基础设置/rt行程校准测试', '确认方向输入'],
  ['基础设置/SOCD模式切换=>基础设置/保存配置', '规则选好了'],
  ['进阶/切换用户模式=>进阶/定制用户布局部分导入', '要导入布局'],
  ['进阶/切换用户模式=>进阶/添加按键', '要新增按键'],
  ['进阶/定制用户布局部分导入=>进阶/按键通道引脚分配', '实体键对不上'],
  ['进阶/定制用户布局部分导入=>进阶/添加按键', '缺少按键'],
  ['进阶/定制用户布局部分导入=>基础设置/保存配置', '导入完成'],
  ['进阶/按键通道引脚分配=>进阶/添加按键', '还要加新键'],
  ['进阶/按键通道引脚分配=>基础设置/rt行程校准测试', '确认实体键对应'],
  ['进阶/按键通道引脚分配=>基础设置/保存配置', '对应关系正常'],
  ['进阶/添加按键=>进阶/按键通道引脚分配', '新增键不能用'],
  ['进阶/添加按键=>进阶/屏幕定义/修改通道添加按键保存', '继续改屏幕显示'],
  ['进阶/添加按键=>基础设置/保存配置', '新增完成'],
  ['进阶/屏幕定义/修改通道添加按键保存=>基础设置/保存配置', '屏幕布局完成'],
  ['进阶/灯光颜色设置/按键灯光设置/灯光设置顺序设置=>进阶/灯光颜色设置/按键灯光设置/按键颜色设置', '顺序对了再改颜色'],
  ['进阶/灯光颜色设置/按键灯光设置/灯光设置顺序设置=>基础设置/保存配置', '灯位已经正确'],
  ['进阶/灯光颜色设置/按键灯光设置/按键颜色设置=>进阶/灯光颜色设置/氛围灯设置/添加配置或者使用预设', '继续设置氛围灯'],
  ['进阶/灯光颜色设置/按键灯光设置/按键颜色设置=>基础设置/保存配置', '颜色已经合适'],
  ['进阶/灯光颜色设置/氛围灯设置/添加配置或者使用预设=>进阶/灯光颜色设置/氛围灯设置/颜色设置', '改氛围灯颜色'],
  ['进阶/灯光颜色设置/氛围灯设置/添加配置或者使用预设=>基础设置/保存配置', '氛围灯已经合适'],
  ['进阶/灯光颜色设置/氛围灯设置/颜色设置=>基础设置/保存配置', '颜色已经合适'],
  ['进阶/自动校准=>基础设置/按键校准', '先做手动校准'],
  ['进阶/自动校准=>基础设置/rt行程校准测试', '确认自动校准后状态'],
  ['进阶/自动校准=>基础设置/保存配置', '开关已经设好'],
]);

const issueGuide = [
  ['第一次配置', '基础设置/设备预设'],
  ['按键位置不对', '基础设置/布局预设'],
  ['按键功能不对', '基础设置/按键功能调整'],
  ['按了实体键，画面不是这个键', '进阶/按键通道引脚分配'],
  ['一个键太灵敏或不触发', '基础设置/行程触发设置/单独设置'],
  ['多个键一起调手感', '基础设置/行程触发设置/批量设置'],
  ['RT 不跟手', '基础设置/rt功能设置/单独设置'],
  ['校准后怕丢失', '基础设置/按键校准/保存配置'],
  ['最后确认有没有成功', '基础设置/rt行程校准测试'],
  ['灯亮到别的按键上', '进阶/灯光颜色设置/按键灯光设置/灯光设置顺序设置'],
  ['颜色不对', '进阶/灯光颜色设置/按键灯光设置/按键颜色设置'],
  ['加了新按键但不能用', '进阶/按键通道引脚分配'],
];

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
  return path.relative(sourceRoot, filePath).split(path.sep);
}

function toTopic(parts) {
  return parts.slice(0, -1).join('/');
}

function titleFromTopic(topic) {
  const detail = manualDetails.get(topic);
  if (detail) return detail.title;

  const parts = topic.split('/');
  parts.shift();
  return parts.join(' - ').replaceAll('rt', 'RT');
}

function compareEntries(a, b) {
  const aSection = sectionOrder.get(a.section) ?? 99;
  const bSection = sectionOrder.get(b.section) ?? 99;
  if (aSection !== bSection) return aSection - bSection;

  const aTopic = topicOrder.get(a.topic) ?? 999;
  const bTopic = topicOrder.get(b.topic) ?? 999;
  if (aTopic !== bTopic) return aTopic - bTopic;

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

function renderList(items, ordered = false) {
  if (!items || items.length === 0) return '';
  const tag = ordered ? 'ol' : 'ul';
  return `<${tag}>${items.map((item) => `<li>${htmlEscape(item)}</li>`).join('')}</${tag}>`;
}

function renderTags(tags) {
  return (tags || [])
    .map((tag, index) => `<span class="tag${index % 2 === 1 ? ' alt' : ''}">${htmlEscape(tag)}</span>`)
    .join('');
}

function renderRelatedLinks(entry, entryByTopic) {
  const topics = relatedTopics.get(entry.topic) || [];
  const links = topics
    .map((topic) => entryByTopic.get(topic))
    .filter(Boolean)
    .map((target) => {
      const label = relatedLinkLabels.get(`${entry.topic}=>${target.topic}`) || '继续看';
      return `<a class="related-link" href="#${target.id}"><span class="related-reason">${htmlEscape(label)}</span><span class="related-target">${htmlEscape(target.title)}</span></a>`;
    })
    .join('');

  if (!links) {
    return '';
  }

  return `<div class="related-row">${links}</div>`;
}

function renderIssueGuide(entries) {
  const entryByTopic = new Map(entries.map((entry) => [entry.topic, entry]));
  const links = issueGuide
    .map(([label, topic]) => {
      const target = entryByTopic.get(topic);
      if (!target) return '';
      return `<a class="issue-link" href="#${target.id}"><span>${htmlEscape(label)}</span><strong>${htmlEscape(target.title)}</strong></a>`;
    })
    .join('');

  return `
      <section class="guide-section" id="guide">
        <div class="section-head">
          <h2>按问题找演示</h2>
          <p>不知道下一步点哪里时，先按你遇到的问题跳到对应视频。</p>
        </div>
        <div class="issue-grid">
          ${links}
        </div>
      </section>`;
}

function renderStep(entry, entryByTopic) {
  const detail = entry.detail;
  const notes = detail.notes || [];

  return `
          <article class="step" id="${entry.id}">
            <video muted loop playsinline preload="metadata">
              <source src="${pathToUrl(entry.parts)}" type="video/mp4">
            </video>
            <div class="step-body">
              <div class="step-summary">
                <h3>${htmlEscape(entry.title)}</h3>
                <p>${htmlEscape(detail.summary)}</p>
                <div class="tag-row">${renderTags(detail.tags)}</div>
              </div>
              <div class="detail-grid">
                <div class="detail-block">
                  <h4>视频里做什么</h4>
                  ${renderList(detail.steps, true)}
                </div>
                <div class="detail-block">
                  <h4>用哪个演示继续</h4>
                  ${renderRelatedLinks(entry, entryByTopic)}
                </div>
              </div>
              ${notes.length ? `<p class="step-hint">${htmlEscape(notes[0])}</p>` : ''}
            </div>
          </article>`;
}

function renderSteps(entries, allEntries = entries) {
  const entryByTopic = new Map(allEntries.map((entry) => [entry.topic, entry]));
  return entries.map((entry) => renderStep(entry, entryByTopic)).join('\n');
}

function renderSection(section, entries, allEntries) {
  const id = section === '基础设置' ? 'basic' : 'advanced';
  const title = section === '进阶' ? '进阶设置' : section;
  const description = section === '基础设置'
    ? '从预设、键位、行程、RT、校准、测试到保存，按真实配置顺序整理。'
    : '专业模式、布局导入、通道/引脚、OLED、灯光和自动校准等高级流程。';

  return `
      <section id="${id}">
        <div class="section-head">
          <h2>${title}</h2>
          <p>${description}</p>
        </div>
        <div class="steps">
${renderSteps(entries, allEntries)}
        </div>
      </section>`;
}

function renderReferenceList(items, link = false) {
  return items.map(([label, value]) => {
    if (link) {
      return `<li><a href="${htmlEscape(value)}" target="_blank" rel="noreferrer">${htmlEscape(label)}</a></li>`;
    }
    return `<li><span>${htmlEscape(label)}</span><code>${htmlEscape(value)}</code></li>`;
  }).join('');
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
      --bg: #f3f6f8;
      --panel: #ffffff;
      --ink: #1f2933;
      --muted: #667085;
      --line: #d8dee7;
      --accent: #0f8b8d;
      --accent-soft: #e2f5f4;
      --accent-2: #d97904;
      --warning-bg: #fff7e8;
      --warning-line: #f2c98b;
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
      line-height: 1.58;
      letter-spacing: 0;
    }

    a {
      color: inherit;
      text-decoration: none;
    }

    code {
      font-family: "Cascadia Mono", Consolas, monospace;
      font-size: 12px;
      color: #415466;
      word-break: break-word;
    }

    .site-header {
      border-bottom: 1px solid var(--line);
      background: var(--panel);
    }

    .header-inner,
    .layout,
    .footer {
      width: min(1380px, calc(100% - 32px));
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

    .intro,
    .source-note {
      max-width: 980px;
      margin: 10px 0 0;
      color: var(--muted);
      font-size: 15px;
    }

    .notice {
      max-width: 980px;
      margin: 12px 0 0;
      padding: 9px 11px;
      border: 1px solid var(--warning-line);
      border-radius: 8px;
      background: var(--warning-bg);
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
      grid-template-columns: 260px minmax(0, 1fr);
      gap: 24px;
      margin-top: 22px;
      margin-bottom: 52px;
      align-items: start;
    }

    .side-nav {
      position: sticky;
      top: 18px;
      max-height: calc(100vh - 36px);
      overflow-y: auto;
      overscroll-behavior: contain;
      scrollbar-gutter: stable;
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

    section,
    .guide-section,
    .reference-section {
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
      gap: 26px;
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

    .step-body {
      padding: 14px 16px 16px;
    }

    .step-summary h3 {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0 0 8px;
      font-size: 17px;
      line-height: 1.35;
      letter-spacing: 0;
    }

    .step-summary h3::before {
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

    .step-summary p {
      margin: 0;
      color: var(--ink);
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

    .detail-grid {
      display: grid;
      grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
      gap: 14px 22px;
      margin-top: 14px;
      padding-top: 14px;
      border-top: 1px solid var(--line);
    }

    .detail-block h4 {
      margin: 0 0 6px;
      color: #344054;
      font-size: 13px;
      line-height: 1.3;
    }

    .detail-block ol,
    .detail-block ul {
      margin: 0;
      padding-left: 19px;
      color: var(--muted);
      font-size: 13px;
    }

    .detail-block li + li {
      margin-top: 3px;
    }

    .related-row {
      display: grid;
      grid-template-columns: 1fr;
      gap: 8px;
    }

    .related-link {
      display: grid;
      gap: 2px;
      align-items: start;
      min-height: 28px;
      padding: 7px 10px;
      border: 1px solid #b8d9d8;
      border-radius: 7px;
      background: var(--accent-soft);
      color: var(--ink);
    }

    .related-link:hover,
    .related-link:focus-visible {
      border-color: var(--accent);
      background: #d4efee;
      outline: none;
    }

    .related-reason {
      color: #087174;
      font-size: 13px;
      font-weight: 800;
    }

    .related-target {
      color: var(--muted);
      font-size: 12px;
    }

    .step-hint {
      margin: 12px 0 0;
      padding: 8px 10px;
      border-left: 3px solid #f2c98b;
      background: #fffaf1;
      color: #6f4b15;
      font-size: 13px;
    }

    .issue-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 10px;
      padding: 18px 22px 20px;
    }

    .issue-link {
      display: grid;
      gap: 4px;
      min-height: 70px;
      align-content: center;
      padding: 10px 12px;
      border: 1px solid var(--line);
      border-radius: 8px;
      background: #fbfcfe;
    }

    .issue-link:hover,
    .issue-link:focus-visible {
      border-color: var(--accent);
      background: var(--accent-soft);
      outline: none;
    }

    .issue-link span {
      color: var(--ink);
      font-size: 14px;
      font-weight: 800;
    }

    .issue-link strong {
      color: var(--muted);
      font-size: 12px;
      font-weight: 700;
    }

    .reference-body {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
      gap: 18px 30px;
      padding: 18px 22px 20px;
    }

    .reference-body h3 {
      margin: 0 0 8px;
      font-size: 15px;
      line-height: 1.3;
    }

    .reference-body ul {
      margin: 0;
      padding-left: 18px;
      color: var(--muted);
      font-size: 13px;
    }

    .reference-body li + li {
      margin-top: 5px;
    }

    .reference-body li span {
      display: block;
      color: var(--ink);
      font-weight: 700;
    }

    .reference-body a {
      color: #0f6f8d;
      text-decoration: underline;
      text-underline-offset: 3px;
    }

    .footer {
      margin-top: 0;
      margin-bottom: 34px;
      color: var(--muted);
      font-size: 13px;
      text-align: center;
    }

    @media (max-width: 960px) {
      .layout {
        display: block;
        margin-top: 18px;
      }

      .side-nav {
        position: static;
        max-height: none;
        overflow: visible;
        margin-bottom: 18px;
      }

      .detail-grid,
      .issue-grid,
      .reference-body {
        grid-template-columns: 1fr;
      }

      h1 {
        font-size: 29px;
      }
    }

    @media (max-width: 520px) {
      .header-inner,
      .layout,
      .footer {
        width: min(100% - 22px, 1180px);
      }

      .section-head,
      .steps,
      .issue-grid,
      .reference-body {
        padding-left: 14px;
        padding-right: 14px;
      }

      .step-body {
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
      <p class="intro">每个步骤都对应一个录屏演示。先看视频，再按“用哪个演示继续”跳到下一步；不知道问题属于哪里时，先用“按问题找演示”。视频静音自动播放，滚动到对应步骤时只播放当前视频，播放速度固定为 0.5 倍。</p>
      <p class="notice">注意：保存配置、重启、恢复默认、切换输入模式等操作会写入或改变设备状态。执行前请确认当前参数无误，必要时先备份。</p>
      <nav class="quick-links" aria-label="快速导航">
        <a href="#guide">按问题找演示</a>
        <a href="#basic">基础设置</a>
        <a href="#advanced">进阶设置</a>
        <a href="#references">参考资料</a>
      </nav>
    </div>
  </header>

  <main class="layout">
    <aside class="side-nav" aria-label="目录">
      <h2>目录</h2>
      <a href="#guide">按问题找演示</a>
      <a href="#basic">基础设置</a>
${basic.map((entry) => `      <a class="minor" href="#${entry.id}">${htmlEscape(entry.title)}</a>`).join('\n')}
      <a href="#advanced">进阶设置</a>
${advanced.map((entry) => `      <a class="minor" href="#${entry.id}">${htmlEscape(entry.title)}</a>`).join('\n')}
      <a href="#references">参考资料</a>
    </aside>

    <div class="content">
${renderIssueGuide(entries)}
${renderSection('基础设置', basic, entries)}
${renderSection('进阶', advanced, entries)}
      <section class="reference-section" id="references">
        <div class="section-head">
          <h2>参考资料</h2>
          <p>文案以本项目源码和录屏为准，通用术语和风险提示参考 GP2040-CE 官方资料与 OpenStickCommunity 项目。</p>
        </div>
        <div class="reference-body">
          <div>
            <h3>本项目源码依据</h3>
            <ul>${renderReferenceList(projectReferences)}</ul>
          </div>
          <div>
            <h3>外部资料</h3>
            <ul>${renderReferenceList(externalReferences, true)}</ul>
          </div>
        </div>
      </section>
    </div>
  </main>

  <footer class="footer">Tikitaka 使用说明 · 视频来自说明书视频文件部分 · 共 ${entries.length} 个步骤</footer>

  <script>
    const DEMO_PLAYBACK_RATE = 0.5;
    const demoVideos = Array.from(document.querySelectorAll("video"));
    let currentActiveVideo = null;

    function enforceDemoPlaybackRate(video) {
      video.defaultPlaybackRate = DEMO_PLAYBACK_RATE;
      if (Math.abs(video.playbackRate - DEMO_PLAYBACK_RATE) > 0.01) {
        video.playbackRate = DEMO_PLAYBACK_RATE;
      }
    }

    function prepareDemoVideo(video) {
      video.muted = true;
      video.defaultMuted = true;
      video.autoplay = false;
      video.loop = true;
      video.playsInline = true;
      enforceDemoPlaybackRate(video);
      video.setAttribute("muted", "");
      video.setAttribute("loop", "");
      video.setAttribute("playsinline", "");
      video.removeAttribute("controls");
    }

    function setStepActive(video, isActive) {
      const step = video.closest(".step");
      if (step) step.classList.toggle("is-active", isActive);
    }

    function pauseDemoVideo(video) {
      video.pause();
      setStepActive(video, false);
    }

    function playDemoVideo(video, shouldRestart) {
      if (document.hidden) return;
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
        enforceDemoPlaybackRate(video);
      });
      video.addEventListener("ratechange", () => {
        enforceDemoPlaybackRate(video);
      });
    });

    function getVideoScore(video) {
      const rect = video.getBoundingClientRect();
      const visibleHeight = Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
      if (visibleHeight <= 0) return 0;

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
          if (video !== nextActiveVideo) pauseDemoVideo(video);
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
      if (updateQueued) return;
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
  const lines = entries.map((entry, index) => {
    const detail = entry.detail;
    return `${index + 1}. ${entry.section} / ${entry.title} - ${detail.summary}`;
  });

  return `# Tikitaka 使用说明

这是 Tikitaka 配置工具的中文说明网站。页面由 \`tools/sync-manual.js\` 根据录屏目录自动同步生成，并为每个录屏补充普通用户可直接点击的下一步索引。站内视频保持原始 MP4 不动，在网页层统一播放速度。

## 在线说明网站

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

## 视频展示规则

- 源视频不重编码，保留在原录屏目录。
- 页面滚动到某个步骤时，只自动播放当前步骤视频。
- 视频静音、无控制条、循环播放，站内固定按 0.5 倍播放。

## 当前步骤

${lines.join('\n')}

## 主要依据

- 本项目源码：\`C:\\Users\\Administrator\\ce\\wd\\ce2_4_4_heac_clean\`
- 录屏素材：\`D:\\2\\说明书视频文件部分\`
- GP2040-CE Web Configurator: https://gp2040-ce.info/web-configurator/
- OpenStickCommunity GP2040-CE: https://github.com/OpenStickCommunity/GP2040-CE
`;
}

function makeEntries() {
  if (!fs.existsSync(sourceRoot)) {
    throw new Error(`Source directory does not exist: ${sourceRoot}`);
  }

  const entries = listMp4Files(sourceRoot)
    .map((sourcePath) => {
      const parts = toRelativeParts(sourcePath);
      const topic = toTopic(parts);
      const section = parts[0];
      const detail = manualDetails.get(topic);
      const stats = fs.statSync(sourcePath);

      return {
        sourcePath,
        parts,
        relativePath: parts.join('/'),
        section,
        topic,
        detail: detail || {
          title: titleFromTopic(topic),
          summary: '按录屏流程完成设置。',
          steps: ['打开对应功能。', '按视频流程完成设置。', '检查效果并保存。'],
          verify: ['确认设置生效。'],
          notes: ['该步骤还没有补全文案，请更新 tools/sync-manual.js。'],
          tags: ['待补全'],
          refs: [],
        },
        title: titleFromTopic(topic),
        id: `step-${String(topicOrder.get(topic) || 999).padStart(3, '0')}`,
        size: stats.size,
        mtimeMs: stats.mtimeMs,
      };
    })
    .sort(compareEntries);

  const missing = entries.filter((entry) => !manualDetails.has(entry.topic));
  if (missing.length > 0) {
    console.warn('Missing manual details for:');
    missing.forEach((entry) => console.warn(`- ${entry.topic}`));
  }

  return entries;
}

const entries = makeEntries();
copyVideos(entries);

fs.writeFileSync(path.join(repoRoot, 'index.html'), renderIndex(entries), 'utf8');
fs.writeFileSync(path.join(repoRoot, 'README.md'), renderReadme(entries), 'utf8');

console.log(`Synced ${entries.length} video steps from ${sourceRoot}`);
