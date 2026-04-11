import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip,
  Legend
);

const FONT_FAMILY = "'IBM Plex Mono', monospace";
const BODY_FONT = "'Manrope', sans-serif";

const COLORS = {
  moss: "#182a21",
  mossLight: "#2e4036",
  mossAlpha: "rgba(24, 42, 33, 0.15)",
  clay: "#a53c19",
  clayLight: "#ff7e55",
  clayAlpha: "rgba(165, 60, 25, 0.15)",
  cream: "#fbf9f2",
  outline: "#737874",
  outlineVariant: "#c3c8c2",
  surfaceHigh: "#eae8e1",
};

export function getRateChartConfig(data) {
  const labels = data.map((d) => d.date);
  const bokValues = data.map((d) => d.bok);
  const fedValues = data.map((d) => d.fed);

  return {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "한국 기준금리 (BOK)",
          data: bokValues,
          borderColor: COLORS.moss,
          backgroundColor: COLORS.mossAlpha,
          borderWidth: 2.5,
          pointRadius: 0,
          pointHoverRadius: 6,
          pointHoverBackgroundColor: COLORS.moss,
          pointHoverBorderColor: COLORS.cream,
          pointHoverBorderWidth: 3,
          tension: 0.3,
          fill: false,
        },
        {
          label: "미국 기준금리 (FED)",
          data: fedValues,
          borderColor: COLORS.clay,
          backgroundColor: COLORS.clayAlpha,
          borderWidth: 2.5,
          pointRadius: 0,
          pointHoverRadius: 6,
          pointHoverBackgroundColor: COLORS.clay,
          pointHoverBorderColor: COLORS.cream,
          pointHoverBorderWidth: 3,
          tension: 0.3,
          fill: false,
        },
      ],
    },
    options: getBaseOptions("기준금리 비교 (%)", "%"),
  };
}

export function getSpreadChartConfig(data) {
  const labels = data.map((d) => d.date);
  const spreadValues = data.map((d) => d.spread);

  return {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "금리 스프레드 (BOK - FED)",
          data: spreadValues,
          borderColor: COLORS.clay,
          backgroundColor: (ctx) => {
            const canvas = ctx.chart.ctx;
            const gradient = canvas.createLinearGradient(0, 0, 0, ctx.chart.height);
            gradient.addColorStop(0, "rgba(165, 60, 25, 0.25)");
            gradient.addColorStop(1, "rgba(165, 60, 25, 0.02)");
            return gradient;
          },
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: COLORS.clay,
          tension: 0.3,
          fill: true,
        },
      ],
    },
    options: {
      ...getBaseOptions("금리 스프레드 (%p)", "%p"),
      plugins: {
        ...getBaseOptions("금리 스프레드 (%p)", "%p").plugins,
        legend: { display: false },
      },
    },
  };
}

export function getExchangeChartConfig(data) {
  const labels = data.map((d) => d.date);
  const values = data.map((d) => d.value);

  return {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "USD/KRW 환율",
          data: values,
          borderColor: COLORS.moss,
          backgroundColor: (ctx) => {
            const canvas = ctx.chart.ctx;
            const gradient = canvas.createLinearGradient(0, 0, 0, ctx.chart.height);
            gradient.addColorStop(0, "rgba(24, 42, 33, 0.2)");
            gradient.addColorStop(1, "rgba(24, 42, 33, 0.02)");
            return gradient;
          },
          borderWidth: 2.5,
          pointRadius: 0,
          pointHoverRadius: 6,
          pointHoverBackgroundColor: COLORS.moss,
          pointHoverBorderColor: COLORS.cream,
          pointHoverBorderWidth: 3,
          tension: 0.3,
          fill: true,
        },
      ],
    },
    options: {
      ...getBaseOptions("USD/KRW 환율", "원"),
      plugins: {
        ...getBaseOptions("USD/KRW 환율", "원").plugins,
        legend: { display: false },
      },
    },
  };
}

function getBaseOptions(titleText, unit) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index",
      intersect: false,
    },
    plugins: {
      title: {
        display: false,
      },
      legend: {
        position: "top",
        align: "start",
        labels: {
          font: { family: FONT_FAMILY, size: 11, weight: "500" },
          color: COLORS.outline,
          usePointStyle: true,
          pointStyle: "circle",
          padding: 20,
          boxWidth: 8,
          boxHeight: 8,
        },
      },
      tooltip: {
        backgroundColor: COLORS.moss,
        titleFont: { family: FONT_FAMILY, size: 11 },
        bodyFont: { family: BODY_FONT, size: 13 },
        cornerRadius: 12,
        padding: 14,
        displayColors: true,
        boxWidth: 8,
        boxHeight: 8,
        usePointStyle: true,
        callbacks: {
          label: (ctx) => ` ${ctx.dataset.label}: ${ctx.parsed.y?.toFixed(2)}${unit}`,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: { family: FONT_FAMILY, size: 10 },
          color: COLORS.outlineVariant,
          maxRotation: 0,
          maxTicksLimit: 12,
        },
        border: { display: false },
      },
      y: {
        grid: {
          color: "rgba(195, 200, 194, 0.25)",
          drawBorder: false,
        },
        ticks: {
          font: { family: FONT_FAMILY, size: 10 },
          color: COLORS.outlineVariant,
          padding: 8,
          callback: (value) => `${value}`,
        },
        border: { display: false },
      },
    },
    elements: {
      line: {
        capBezierPoints: true,
      },
    },
  };
}
