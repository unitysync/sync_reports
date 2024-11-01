name 'sync_report'
author 'unitysync'
version '1.0.0'
repository 'https://github.com/overextended/fivem-typescript-boilerplate.git'
fx_version 'cerulean'
game 'gta5'

dependencies {
	'/server:7290',
	'/onesync',
}

client_scripts {
	'dist/client.js',
}

server_scripts {
	'dist/server.js',
}
