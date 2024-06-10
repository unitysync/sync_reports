fx_version 'cerulean'
name 'Report System'
author 'unitysync'
game 'gta5'

server_scripts {
    'dist/server/**/*.js',
    'api/esx.lua'
}
client_script 'dist/client/**/*.js'

server_exports {
    'getAdmins',
    'isAdmin'
}