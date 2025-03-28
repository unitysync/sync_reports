import { inputDialog, registerContext, showContext, triggerServerCallback } from '@overextended/ox_lib/client';

interface ReportData {
  reportId: number;
  player: number;
  target: number;
  playerName: string;
  report: string;
}

interface ContextOption {
  title: string;
  description?: string;
  icon?: string;
  onSelect?: (data: ReportData) => void;
  args?: ReportData;
  disabled?: boolean;
}

const reportOptions = (data: ReportData) => {
  registerContext({
    id: `sync_reports:options_${data.reportId}`,
    title: `Report: ${data.reportId}`,
    menu: 'sync_reports:main',
    options: [
      {
        title: 'Resolve Report',
        icon: 'check',
        onSelect: () => {
          emitNet('sync_reports:resolveReport', data.reportId);
        },
      },
      {
        title: 'Open Player In txAdmin',
        icon: 'https://raw.githubusercontent.com/tabarra/txAdmin/refs/heads/master/panel/public/favicon_online.svg',
        onSelect: () => {
          ExecuteCommand(`tx ${data.player}`);
        },
      },
      {
        title: 'Open Target In txAdmin',
        icon: 'https://raw.githubusercontent.com/tabarra/txAdmin/refs/heads/master/panel/public/favicon_online.svg',
        onSelect: () => {
          ExecuteCommand(`tx ${data.target || data.player}`);
        },
      },
    ],
  });
  showContext(`sync_reports:options_${data.reportId}`);
};

const fetchActive = async () => {
  const activeOptions: ContextOption[] = [];
  const response: ReportData[] = (await triggerServerCallback('sync_reports:fetchActive', 0)) as ReportData[];
  if (response[0] === null) {
    activeOptions.push({
      title: 'No Active Reports',
      description: 'Any active reports have been actioned or resolved. Keep doing a good job.',
      icon: 'hammer',
      disabled: true,
    });
  } else {
    response.map((report: ReportData) => {
      activeOptions.push({
        title: `[${report.reportId}] ${report.playerName}`,
        description: `${report.report}`,
        icon: 'hammer',
        onSelect: reportOptions,
        args: report,
      });
    });
  }

  registerContext({
    id: 'sync_reports:active',
    title: 'Active Reports',
    menu: 'sync_reports:main',
    options: activeOptions,
  });
  showContext('sync_reports:active');
};

const fetchHistory = async () => {
  const historyOptions: ContextOption[] = [];
  const response: ReportData[] = (await triggerServerCallback('sync_reports:fetchHistory', 0)) as ReportData[];
  if (response[0] === null) {
    historyOptions.push({
      title: 'No Past Reports To Display',
      icon: 'clock-rotate-left',
      disabled: true,
    });
  } else {
    response.map((report: ReportData) => {
      historyOptions.push({
        title: `[${report.reportId}] ${report.playerName}`,
        description: `${report.report}`,
        icon: 'hammer',
        disabled: true,
      });
    });
  }
  registerContext({
    id: 'sync_reports:history',
    title: 'Report History',
    menu: 'sync_reports:main',
    options: historyOptions,
  });
  showContext('sync_reports:history');
};

registerContext({
  id: 'sync_reports:main',
  title: 'Reports',
  options: [
    {
      title: 'Active Reports',
      icon: 'circle-exclamation',
      onSelect: fetchActive,
    },
    {
      title: 'Report History',
      icon: 'clock-rotate-left',
      onSelect: fetchHistory,
    },
  ],
});

const openMenu = () => {
  showContext('sync_reports:main');
};

onNet('sync_reports:openMenu', openMenu);

RegisterCommand(
  'report',
  async () => {
    const reportData: [string, number] = (await inputDialog(
      'Report Issue',
      [
        {
          type: 'textarea',
          label: 'Report',
          description: 'Please provide a detailed description of what you want to report.',
          required: true,
        },
        {
          type: 'number',
          label: 'Target Player ID',
          description: 'If you are reporting another player, please provide their ID.',
          required: false,
        },
      ],
      { allowCancel: true }
    )) as [string, number];
    if (!reportData) return;
    emitNet('sync_reports:addReport', reportData[0], reportData[1]);
  },
  false
);
