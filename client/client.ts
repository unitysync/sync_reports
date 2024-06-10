import { notify, inputDialog, registerContext, showContext, triggerServerCallback } from '@overextended/ox_lib/client'
const playerName: string = GetPlayerName(PlayerPedId())
const helpDialog: any = {
  1: { label: 'Type', description: 'Select Report Type for your report', type: 'select', options: ['Report a Player', 'General Assistance'], required: true },
  2: { label: 'Reason', description: 'Provide a detailed description of the report reason.', type: 'textarea', required: true },
  4: { label: 'Name', description: 'Your Current Name', type: 'input', placeholder: playerName, disabled: true },
  6: { label: 'Confirm Report', type: 'checkbox', required: true, },
}

RegisterCommand('help', () => {
  let staffOnline: any = triggerServerCallback('sync_reports:staffOnline', null)
  if (staffOnline === 0) {
    notify({
      title: 'Server Assistance',
      description: 'There are currently no staff online. It may be a while before your report is actioned.',
      type: 'inform'
    })
  }
  let input: any = inputDialog('Help Menu', helpDialog, {})
  if (!input) return
  let data: object = {
    playerName: playerName,
    reportType: input[1],
    reportReason: input[2],
  }
  let response: any = triggerServerCallback('sync_reports:submitReport', null, data)
  if (response === 'success') {
    notify({ title: 'Server Assistance', description: 'Report Submitted Successfully.', type: 'success' })
  }
  else if (response === 'error') {
    notify({
      title: 'Server Assistance',
      description: 'An error occurred while submitting your report.',
      type: 'error'
    })
  }
}, false)


RegisterCommand('reports', () => {
  let reportContext: object[] = [
    {
      title: 'No Reports Found',
      description: 'There are currently no reports to display. Please check back later.',
    }
  ]
  // @ts-expect-error
  let reports: string[] = triggerServerCallback('sync_reports:fetchReports', null)
  if (reports) {
    reports.forEach((report: any) => {
      reportContext[report] = {
        title: `Report ID: ${report.id}`,
        description: `Player: ${report.playerName} | Type: ${report.reportType} | Reason: ${report.reportReason}`,
      }
    })
  }
}, false)

