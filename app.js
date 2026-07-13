"use strict";

const REFRESH_INTERVAL_MS = 60_000;
const STATUS_LABELS = {
  completed: "已完成",
  active: "进行中",
  pending: "未开始",
  blocked: "等前置条件",
};

function byId(id) {
  return document.getElementById(id);
}

function formatUpdatedAt(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("zh-CN", {
    timeZone: "Asia/Shanghai",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

function formatRelativeTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "活动时间未知";
  const minutes = Math.max(0, Math.floor((Date.now() - date.getTime()) / 60_000));
  if (minutes < 1) return "刚刚核验";
  if (minutes < 60) return `${minutes} 分钟前核验`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} 小时前核验`;
  return `${Math.floor(hours / 24)} 天前核验`;
}

function makePill(status) {
  const pill = document.createElement("span");
  pill.className = `status-pill status-${status}`;
  pill.textContent = STATUS_LABELS[status] || status;
  return pill;
}

function renderMilestones(milestones) {
  const list = byId("milestone-list");
  list.replaceChildren();

  milestones.forEach((milestone, index) => {
    const item = document.createElement("article");
    item.className = "milestone";
    item.dataset.status = milestone.status;

    const number = document.createElement("div");
    number.className = "milestone-index";
    number.textContent = String(index + 1).padStart(2, "0");

    const copy = document.createElement("div");
    const title = document.createElement("h3");
    title.textContent = milestone.title;
    const detail = document.createElement("p");
    detail.textContent = milestone.detail;
    copy.append(title, detail);

    const state = document.createElement("div");
    state.className = "milestone-state";
    const progress = document.createElement("small");
    progress.textContent = `${milestone.progress}%`;
    state.append(makePill(milestone.status), progress);

    item.append(number, copy, state);
    list.append(item);
  });
}

function renderList(id, values) {
  const list = byId(id);
  list.replaceChildren();
  values.forEach((value) => {
    const item = document.createElement("li");
    item.textContent = value;
    list.append(item);
  });
}

function renderHistory(history) {
  const list = byId("history-list");
  list.replaceChildren();
  history.forEach((entry) => {
    const item = document.createElement("li");
    const time = document.createElement("time");
    time.dateTime = entry.at;
    time.textContent = formatUpdatedAt(entry.at);
    const detail = document.createElement("span");
    detail.textContent = entry.detail;
    item.append(time, detail);
    list.append(item);
  });
}

function renderFlowStep(id, step) {
  const card = byId(id);
  card.dataset.status = step.status;
  byId(`${id}-title`).textContent = step.title;
  byId(`${id}-detail`).textContent = step.detail;
}

function render(data) {
  document.title = `${data.version} 大节点进度`;
  byId("title").textContent = `${data.version} 大节点进度`;
  byId("version").textContent = data.version;
  byId("truth-status").textContent = data.truth.display;
  byId("updated-at").textContent = `数据更新：${formatUpdatedAt(data.updatedAt)}`;

  byId("overall-progress").textContent = `${data.summary.overallProgress}%`;
  byId("overall-progress-bar").style.width = `${data.summary.overallProgress}%`;
  byId("completed-count").textContent = `${data.summary.completed} / ${data.summary.total}`;
  byId("current-stage").textContent = data.summary.currentStage;
  byId("current-stage-detail").textContent = data.summary.currentStageDetail;
  byId("live-status").textContent = data.summary.liveStatus;
  byId("live-reason").textContent = data.summary.liveReason;

  byId("activity-age").textContent = formatRelativeTime(data.activity.observedAt);
  renderFlowStep("flow-mainline", data.activity.mainline);
  renderFlowStep("flow-supervision", data.activity.supervision);
  renderFlowStep("flow-milestone", data.activity.milestone);
  byId("last-accepted").textContent = `最近可信验收：${data.activity.lastAccepted}`;

  byId("focus-title").textContent = data.focus.title;
  byId("focus-detail").textContent = data.focus.detail;
  byId("next-gate").textContent = data.focus.nextGate;
  const focusBadge = byId("focus-badge");
  focusBadge.className = `status-pill status-${data.focus.status}`;
  focusBadge.textContent = STATUS_LABELS[data.focus.status] || data.focus.status;

  renderMilestones(data.milestones);
  renderList("requirements-list", data.requirements);
  renderHistory(data.history);
}

async function loadProgress() {
  const refresh = byId("refresh-status");
  try {
    const response = await fetch(`progress.json?t=${Date.now()}`, {
      cache: "no-store",
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    render(await response.json());
    refresh.textContent = `刷新成功：${new Date().toLocaleTimeString("zh-CN", {
      hour12: false,
    })}`;
  } catch (error) {
    refresh.textContent = `刷新失败：${error.message}`;
  }
}

loadProgress();
window.setInterval(loadProgress, REFRESH_INTERVAL_MS);
