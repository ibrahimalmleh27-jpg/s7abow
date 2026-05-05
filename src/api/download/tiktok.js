const axios = require('axios');

module.exports = function(app) {
    
    async function tiktokDownload(url) {
        try {
            const params = new URLSearchParams();
            params.append('url', url);
            params.append('hd', '1');

            const response = await axios.post('https://tikwm.com/api/', params, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36',
                    'Cookie': 'current_language=en'
                },
                timeout: 30000
            });

            if (!response.data || response.data.code !== 0) {
                throw new Error('No se pudo obtener el video de TikTok');
            }

            return response.data.data;

        } catch (error) {
            throw new Error(`Error al descargar TikTok: ${error.message}`);
        }
    }

    app.get('/download/tiktok', async (req, res) => {
        const { url } = req.query;

        if (!url) {
            return res.status(400).json({
                status: false,
                creator: 'DVWILKER',
                error: 'URL parameter is required',
                message: 'Please provide a TikTok URL: ?url=TIKTOK_URL',
                usage: {
                    example: '/download/tiktok?url=https://www.tiktok.com/@usuario/video/123456789'
                }
            });
        }

        try {
            const result = await tiktokDownload(url);

            const responseData = {
                status: true,
                creator: 'DVWILKER',
                result: {
                    id: result.id,
                    title: result.title,
                    duration: result.duration,
                    author: {
                        username: result.author.unique_id,
                        nickname: result.author.nickname,
                        avatar: result.author.avatar
                    },
                    video: {
                        no_watermark: result.play,
                        with_watermark: result.wmplay,
                        cover: result.cover,
                        dynamic_cover: result.dynamic_cover
                    },
                    music: {
                        id: result.music.id,
                        title: result.music.title,
                        author: result.music.author,
                        duration: result.music.duration,
                        url: result.music.play_url
                    },
                    statistics: {
                        views: result.play_count,
                        likes: result.digg_count,
                        comments: result.comment_count,
                        shares: result.share_count
                    },
                    download_url: `/download/tiktok?url=${encodeURIComponent(url)}&download=true`
                }
            };

            if (req.query.download === 'true' && result.play) {
                return res.redirect(result.play);
            }

            res.status(200).json(responseData);

        } catch (error) {
            console.error('TikTok error:', error.message);
            res.status(500).json({
                status: false,
                creator: 'DVWILKER',
                error: error.message || 'Error al descargar el video de TikTok'
            });
        }
    });
};