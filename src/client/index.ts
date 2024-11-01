import { Vector3 } from '@nativewrappers/fivem';
import { cache, inputDialog, registerContext, showContext, triggerServerCallback } from '@overextended/ox_lib/client';

interface ReportData {
  targetCoords: Vector3
  reportId: number
  player: number
  target: number
}

const reportOptions = (data: ReportData) => {
  const tPos: Vector3 = data.targetCoords
  registerContext({
    id: `sync_reports:options_${data.reportId}`,
    title: `Report: ${data.reportId}`,
    options: [
      {
        title: 'Go To Player',
        icon: 'user',
        onSelect: () => {
          SetEntityCoords(cache.ped, tPos.x, tPos.y, tPos.z, false, false, false, false)
        },
      },
      {
        title: 'Resolve Report',
        icon: 'check',
        onSelect: () => {
          emitNet('sync_reports:resolveReport', data.reportId)
        }
      },
      {
        title: 'Open Player In txAdmin',
        icon: 'https://raw.githubusercontent.com/tabarra/txAdmin/refs/heads/master/panel/public/favicon_online.svg',
        onSelect: () => {
          ExecuteCommand(`tx ${data.player}`)
        }
      },
      {
        title: 'Open Target In txAdmin',
        icon: 'https://raw.githubusercontent.com/tabarra/txAdmin/refs/heads/master/panel/public/favicon_online.svg',
        onSelect: () => {
          ExecuteCommand(`tx ${data.target || data.player}`)
        }
      },
    ]
  })
  showContext(`sync_reports:options_${data.reportId}`)
}

const fetchActive = async () => {
  const activeOptions: object[] = []
  const response = await triggerServerCallback('sync_reports:fetchActive', 0)
  if (!response) {
    activeOptions[1] = {
      title: 'No Active Reports',
      description: 'Any active reports have been actioned or resolved. Keep doing a good job.',
      icon: 'hammer',
      disabled: true
    }
    return
  }
  for (const report of response as any[]) {
    activeOptions.push({
      title: `[${report.reportId}] ${report.playerName}`,
      description: `${report.report}`,
      icon: 'hammer',
      onSelect: reportOptions,
      args: report
    })
    registerContext({
      id: 'sync_reports:active',
      title: 'Active Reports',
      menu: 'sync_reports:main',
      options: activeOptions as any[]
    })
    showContext('sync_reports:active')
  }
}

const fetchHistory = async () => {
  const historyOptions: object[] = []
  const response = await triggerServerCallback('sync_reports:fetchHistory', 0)
  if (!response) {
    historyOptions[1] = {
      title: 'No Past Reports To Display',
      icon: 'clock-rotate-left',
      disabled: true
    }
    return
  }
  for (const report of response as any[]) {
    historyOptions.push({
      title: `[${report.reportId}] ${report.playerName}`,
      description: `${report.report}`,
      icon: 'hammer',
      disabled: true
    })
    registerContext({
      id: 'sync_reports:history',
      title: 'Report History',
      menu: 'sync_reports:main',
      options: historyOptions as any[]
    })
    showContext('sync_reports:history')
  }
}

registerContext({
  id: 'sync_reports:main',
  title: 'Reports',
  options: [
    {
      title: 'Active Reports',
      icon: 'circle-exclamation',
      onSelect: fetchActive
    },
    {
      title: 'Report History',
      icon: 'clock-rotate-left',
      onSelect: fetchHistory
    }
  ]
})

const openMenu = () => {
  showContext('sync_reports:main')
}

onNet('sync_reports:openMenu', openMenu)

RegisterCommand('report', async () => {
  const reportData: Array<any> = await inputDialog('Report Issue', [
    //@ts-expect-error
    { type: 'textarea', label: 'Report', description: 'Please provide a detailed description of what you want to report.', required: true },
    { type: 'number', label: 'Target Player ID', description: 'If you are reporting another player, please provide their ID.', required: false }
  ], { allowCancel: true })
  emitNet('sync_reports:addReport', reportData[0], reportData[1])
}, false)