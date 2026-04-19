import type { Language, MmiProject } from "@/mmi/types";

export const dictionaries = {
  en: {
    appTitle: "M Mérnöki Iroda Kft.",
    appSubtitle: "International references",
    language: "Language",
    presentationMode: "Presentation mode",
    filters: "Filters",
    country: "Country",
    category: "Category",
    allCountries: "All countries",
    allCategories: "All categories",
    yearFrom: "From",
    yearTo: "To",
    keyword: "Keyword",
    keywordPlaceholder: "Search project, client, location",
    legend: "Legend",
    projects: "projects",
    project: "project",
    selectedCountry: "Selected country",
    selectPrompt: "Select a marker to view references.",
    workType: "Work type",
    year: "Year",
    location: "Location",
    investor: "Investor",
    client: "Client",
    contractor: "Contractor",
    projectManager: "Project management",
    source: "Original source",
    images: "Images",
    noImages: "No local images available",
    filtered: "Filtered",
    total: "Total",
    reset: "Reset",
    previousImage: "Previous",
    nextImage: "Next",
  },
  zh: {
    appTitle: "M Mérnöki Iroda Kft.",
    appSubtitle: "国际项目业绩",
    language: "语言",
    presentationMode: "演示模式",
    filters: "筛选",
    country: "国家",
    category: "类别",
    allCountries: "全部国家",
    allCategories: "全部类别",
    yearFrom: "起始年份",
    yearTo: "结束年份",
    keyword: "关键词",
    keywordPlaceholder: "搜索项目、客户、地点",
    legend: "图例",
    projects: "个项目",
    project: "个项目",
    selectedCountry: "选定国家",
    selectPrompt: "请选择地图标记查看项目。",
    workType: "工作内容",
    year: "年份",
    location: "地点",
    investor: "投资方",
    client: "客户",
    contractor: "承包商",
    projectManager: "项目管理",
    source: "原始来源",
    images: "图片",
    noImages: "暂无本地图片",
    filtered: "筛选结果",
    total: "总数",
    reset: "重置",
    previousImage: "上一张",
    nextImage: "下一张",
  },
} as const;

export type Dictionary = (typeof dictionaries)[Language];

export function getProjectTitle(project: MmiProject, language: Language): string {
  if (language === "zh") {
    return project.title_zh ?? project.title_en ?? project.title_hu ?? project.title;
  }

  return project.title_en ?? project.title_hu ?? project.title;
}

export function getProjectDescription(
  project: MmiProject,
  language: Language,
): string | null {
  if (language === "zh") {
    return project.description_zh ?? project.description_en ?? project.description_hu;
  }

  return project.description_en ?? project.description_hu;
}
