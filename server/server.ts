import { onClientCallback } from '@overextended/ox_lib/server'
import { oxmysql as MySQL } from '@overextended/oxmysql'

onClientCallback('sync_reports:staffOnline', (source: number, args: any) => {
  let staffOnline: number = exports.GetCurrentResourceName().getAdmins()
  return staffOnline
})

onClientCallback('sync_reports:submitReport', (source: number, data: any) => {
  MySQL.insert('INSERT into reports (playerName, reportType, reportReason) VALUES (?, ?, ?)',
    [data.playerName, data.reportType, data.reportReason], (id) => {
      // console.log(`Report ID: ${id} | Player: ${playerName} | Type: ${reportType} | Reason: ${reportReason}`)
      if (id) {
        emit('sync_reports:notifyStaff')
        return 'success'
      }
      else {
        return 'error'
      }
    }
  )
  return 'success' || 'error'
})

onClientCallback('sync_reports:fetchReports', (source: number, args: any) => {
  MySQL.query('SELECT * FROM reports', (reports) => {
    return reports
  })
})