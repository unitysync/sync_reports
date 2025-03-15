import { onClientCallback, addCommand } from '@overextended/ox_lib/server';
import { oxmysql as MySQL } from '@overextended/oxmysql';

const playerCooldowns: boolean[] = [];

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
  if (playerCooldowns[source]) {
    emitNet('ox_lib:notify', source, {
      title: 'Error',
      description: 'You must wait before submitting another report.',
      icon: 'shield-halved',
    });
    return;
  }

  playerCooldowns[source] = true;

  await MySQL.insert('INSERT INTO reports (target, playerName, player, report, active) VALUES (?, ?, ?, ?, 1)', [
    target,
    GetPlayerName(source.toString()),
    source,
    report,
  ]);

  setTimeout(
    () => {
      playerCooldowns[source] = null;
    },
    GetConvarInt('reports:cooldown', 30000)
  );

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

addCommand(
  'reports',
  // biome-ignore lint: ox_lib needs an async function to be passed but we don't need to await anything here
  async (source) => {
    emitNet('sync_reports:openMenu', source);
  },
  {
    help: 'View active reports',
    restricted: true,
  }
);
