const Utils = {
    getVideoEmbedUrl: function(url) {
        if (!url) return null;
        if (url.includes('drive.google.com')) {
            const id = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
            return id ? `https://drive.google.com/file/d/${id[1]}/preview` : url;
        }
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            const id = url.match(/(?:v=|\/|embed\/|watch\?v=|&v=|shorts\/)([a-zA-Z0-9_-]{11})/);
            return id ? `https://www.youtube-nocookie.com/embed/${id[1]}?rel=0&modestbranding=1` : url;
        }
        return url;
    },
    getImageSrc: function(url) {
        if (url && url.includes('drive.google.com')) {
            const id = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
            return id ? `https://drive.google.com/thumbnail?id=${id[1]}&sz=w1600` : url;
        }
        return url;
    },
    simpleHash: function(s) {
        let h = 0;
        for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i) | 0;
        return h.toString();
    }
};