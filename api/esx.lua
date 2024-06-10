local ESX = exports.es_extended:getSharedObject()

exports('getAdmins', function()
    local admins = #ESX.GetExtendedPlayers('group', 'admin')
    return admins
end)

---@param source number
exports('isAdmin', function(source)
    local xPlayer = ESX.GetPlayerFromId(source)
    return xPlayer.getGroup() == 'admin'
end)

AddEventHandler('sync_reports:notifyAdmins', function()
    local admins = ESX.GetExtendedPlayers('group', 'admin')
    for _, admin in ipairs(admins) do
        TriggerClientEvent('ox_lib:notify', admin.source, {
            title = 'New Report',
            message = 'A new report has been submitted. Please check /reports to view.',
            type = 'inform',
        })
    end
end)