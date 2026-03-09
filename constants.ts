// Using the Pro model for complex reasoning and chemical formulation
export const GEMINI_MODEL = 'gemini-2.5-flash';

export const INITIAL_REQUIREMENTS = {
  targetHardness: 50,
  targetFlexibility: 50,
  targetCorrosionResistance: 50,
  targetHeatResistance: 50,
  targetWeight: 50,
  costConstraint: 'Standard' as const,
  applicationContext: '',
};

export const COLORS = {
  primary: '#6366f1', // Indigo 500
  secondary: '#10b981', // Emerald 500
  accent: '#f43f5e', // Rose 500
  background: '#1e293b', // Slate 800
  chartColors: ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981', '#06b6d4', '#3b82f6'],
};

export const TRANSLATIONS = {
  en: {
    appTitle: "AlloyGenesis AI",
    subtitle: "METALLURGY SYNTHESIS ENGINE",
    tabs: { generator: "Generator", library: "Library", market: "Market Analysis" },
    params: "Parameters",
    paramsDesc: "Define characteristics.",
    randomize: "Randomize",
    batch: {
      label: "Batch Qty",
      start: "Start Batch",
      stop: "Stop",
      progress: "Generating {current} of {total}...",
      autoSave: "Auto-saving to library",
    },
    library: {
      sortBy: "Sort by",
      sortDateNew: "Date (Newest)",
      sortDateOld: "Date (Oldest)",
      sortName: "Name (A-Z)",
      viewCompact: "Compact View",
      viewDetail: "Detail View",
    },
    sliders: {
      hardness: "Target Hardness",
      flexibility: "Target Flexibility",
      corrosion: "Corrosion Res.",
      heat: "Heat Resistance",
      weight: "Weight Pref.",
    },
    cost: "Cost Constraint",
    context: "Specific Application / Context",
    contextPlaceholder: "e.g., Turbine blades for jet engines...",
    generateBtn: "Generate Composition",
    synthesizing: "Synthesizing...",
    ready: "Ready to Synthesize",
    readyDesc: "Configure your requirements and generate your custom alloy.",
    sections: {
      composition: "Chemical Composition",
      properties: "Property Analysis",
      feasibility: "Production Feasibility",
      manufacturing: "Manufacturing Process",
      commercial: "Commercial Analysis",
      historical: "Historical & Case Studies",
      deepApps: "Advanced Application Analysis"
    },
    feasibility: {
      challenges: "Challenges",
      recommendations: "Recommendations",
      envImpact: "Environmental Impact",
      equipment: "Equipment Required",
      complexity: "Production Complexity",
    },
    manufacturing: {
      method: "Primary Method",
      steps: "Process Flow",
      equipment: "Recommended Equipment"
    },
    commercial: {
       estCost: "Base Cost (est.)",
       availability: "Availability",
       bulkPricing: "Bulk Pricing",
       moq: "MOQ",
       materialBreakdown: "Material Costs",
       processBreakdown: "Manufacturing Costs",
       expensive: "Key Cost Drivers",
       notes: "Analysis Notes"
    },
    market: {
      title: "Market Demand Analyzer",
      desc: "Describe a market need. AI will analyze internet trends to configure the generator.",
      placeholder: "e.g., I need a material for next-gen foldable smartphone hinges that is durable but extremely light...",
      analyzeBtn: "Analyze & Configure",
      analyzing: "Researching Market Data...",
    },
    deepApp: {
      title: "Market Application Deep Dive",
      desc: "Use AI to research specific, real-world product applications for this alloy.",
      btn: "Research Applications",
      loading: "Scanning Industries...",
    },
    saveRecipe: "Save Recipe",
    delete: "Delete",
    load: "Load",
    savedOn: "Saved on",
    emptyLibrary: "No saved recipes yet.",
    steps: {
      generation: [
        "Analyzing User Requirements...",
        "Optimizing Elemental Matrix...",
        "Simulating Mechanical Properties...",
        "Validating Manufacturing Feasibility...",
        "Calculating Cost & Commercial Data..."
      ],
      market: [
        "Scanning Global Market Trends...",
        "Aggregating Industrial Data...",
        "Mapping Technical Parameters...",
        "Finalizing Configuration..."
      ],
      deepApp: [
        "Analyzing Alloy Characteristics...",
        "Scanning Industry Verticals...",
        "Identifying Product Matches...",
        "Evaluating Market Potential..."
      ],
      titles: {
        gen: "Synthesizing Alloy",
        market: "Market Research",
        deep: "Application Discovery"
      }
    }
  },
  zh: {
    appTitle: "合金创世纪 AI",
    subtitle: "冶金合成引擎",
    tabs: { generator: "生成器", library: "配方库", market: "市场需求分析" },
    params: "参数设置",
    paramsDesc: "定义您需要的合金特性。",
    randomize: "随机参数",
    batch: {
      label: "批量数量",
      start: "开始批量生成",
      stop: "停止生成",
      progress: "正在生成第 {current} / {total} 个...",
      autoSave: "已自动保存到配方库",
    },
    library: {
      sortBy: "排序方式",
      sortDateNew: "日期 (最新)",
      sortDateOld: "日期 (最早)",
      sortName: "名称 (A-Z)",
      viewCompact: "紧凑视图",
      viewDetail: "详情视图",
    },
    sliders: {
      hardness: "目标硬度",
      flexibility: "目标韧性/延展性",
      corrosion: "耐腐蚀性",
      heat: "耐热性",
      weight: "重量偏好",
    },
    cost: "成本限制",
    context: "具体应用场景 / 上下文",
    contextPlaceholder: "例如：喷气发动机涡轮叶片，深海潜水器外壳...",
    generateBtn: "生成配方",
    synthesizing: "正在合成...",
    ready: "准备合成",
    readyDesc: "配置您的需求，让 AI 为您设计定制合金。",
    sections: {
      composition: "化学成分",
      properties: "性能分析",
      feasibility: "量产可行性",
      manufacturing: "制备工艺流程",
      commercial: "商业分析",
      historical: "历史数据与案例",
      deepApps: "深度应用分析"
    },
    feasibility: {
      challenges: "生产挑战",
      recommendations: "改进建议",
      envImpact: "环境影响",
      equipment: "所需设备",
      complexity: "生产复杂度",
    },
    manufacturing: {
      method: "主要工艺方法",
      steps: "工艺步骤",
      equipment: "推荐设备"
    },
    commercial: {
       estCost: "预估基础成本",
       availability: "市场供应",
       bulkPricing: "批量采购预估",
       moq: "起订量",
       materialBreakdown: "材料成本构成",
       processBreakdown: "制造费用构成",
       expensive: "主要成本驱动",
       notes: "分析备注"
    },
    market: {
      title: "市场需求分析器",
      desc: "描述市场需求，AI 将分析互联网趋势并为您自动配置生成器参数。",
      placeholder: "例如：我需要一种用于下一代折叠屏手机铰链的材料，耐用但极轻...",
      analyzeBtn: "分析并配置",
      analyzing: "正在研究市场数据...",
    },
    deepApp: {
      title: "市场应用深度挖掘",
      desc: "利用 AI 搜索该合金在现实世界中的具体潜在产品应用。",
      btn: "挖掘应用场景",
      loading: "正在扫描行业数据...",
    },
    saveRecipe: "保存配方",
    delete: "删除",
    load: "加载",
    savedOn: "保存于",
    emptyLibrary: "暂无保存的配方。",
    steps: {
      generation: [
        "正在分析用户需求...",
        "正在优化元素配比矩阵...",
        "正在模拟机械性能...",
        "正在验证量产可行性...",
        "正在计算商业成本数据..."
      ],
      market: [
        "正在扫描全球市场趋势...",
        "正在聚合行业数据...",
        "正在映射技术参数...",
        "正在完成最终配置..."
      ],
      deepApp: [
        "正在分析合金特性...",
        "正在扫描垂直行业...",
        "正在识别产品匹配度...",
        "正在评估市场潜力..."
      ],
      titles: {
        gen: "正在合成合金",
        market: "正在进行市场调研",
        deep: "正在挖掘应用场景"
      }
    }
  }
};