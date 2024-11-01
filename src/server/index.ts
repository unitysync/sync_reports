import { onClientCallback, addCommand } from '@overextended/ox_lib/server';
import { oxmysql as MySQL } from '@overextended/oxmysql';

const isAdmin = (src: number | string): boolean => {
  return IsPlayerAceAllowed(src.toString(), 'command.reports');
};

onClientCallback('sync_reports:fetchActive', async (src: number) => {
  if (!isAdmin(src)) return false;
  const reports = await MySQL.query('SELECT * FROM reports WHERE active = 1');
  return reports;
});

onClientCallback('sync_reports:fetchHistory', async (src: number) => {
  if (!isAdmin(src)) return false;
  const reports = await MySQL.query('SELECT * FROM reports WHERE active = 0');
  return reports;
});

onNet('sync_reports:resolveReport', async (reportId: number) => {
  if (!isAdmin(source)) return;
  await MySQL.update('UPDATE reports SET active = 0 WHERE reportId = ?', [reportId]);
});

onNet('sync_reports:addReport', async (report: string, target?: number) => {
  if (!report) return;
  if (!target) target = source;
  await MySQL.insert('INSERT INTO reports (target, playerName, player, report, active) VALUES (?, ?, ?, ?, 1)', [
    target,
    GetPlayerName(source.toString()),
    source,
    report,
  ]);
  const players = getPlayers().filter((p) => isAdmin(p));
  for (const player of players) {
    if (isAdmin(player)) {
      emitNet('ox_lib:notify', player, {
        title: 'New Report',
        description: 'A new report has been added. Check /reports to see more details.',
        icon: 'shield-halved',
      });
    }
  }
});

addCommand('reports', async (source, args, raw) => {
  emitNet('sync_reports:openMenu', source);
}, {
  help: 'View active reports',
  restricted: true,
})