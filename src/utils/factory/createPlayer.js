const logger = require('../../services/logger');
const { Player, onBeforeCreateStream } = require('discord-player');
const { stream } = require('yt-stream');

exports.createPlayer = async (client) => {
    try {
        logger.info('Creating discord-player player...');

        const player = new Player(client, {
            useLegacyFFmpeg: false,
            ytdlOptions: {
                quality: 'highestaudio',
                highWaterMark: 1 << 25,
                requestOptions: {
                    headers: {
                        cookie: process.env.YT_COOKIE || ''
                    }
                }
            }
        });

        onBeforeCreateStream(async (track) => {
            if (track.source === 'youtube') {
                return (
                    await stream(track.url, {
                        type: 'audio',
                        quality: 'high',
                        highWaterMark: 1 << 25,
                        cookie: process.env.YT_COOKIE || ''
                    })
                ).stream;
            }

            return null;
        });

        await player.extractors.loadDefault();
        logger.debug(`discord-player loaded dependencies:\n${player.scanDeps()}`);

        return player;
    } catch (error) {
        logger.error('Failed to create discord-player player', error);
        throw error;
    }
};
