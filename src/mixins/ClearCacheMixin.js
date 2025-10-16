export const ClearCacheMixin = {
    data() {
        return {

        }
    },
    methods: {
        clearCache() {
            console.log(this.$vnode)
            if (this.$vnode && this.$vnode.data.keepAlive) {
                if (this.$vnode.parent && this.$vnode.parent.componentInstance && this.$vnode.parent.componentInstance.cache) {
                    const key = this.$vnode.key || this.$vnode.componentOptions.Ctor.cid + (this.$vnode.componentOptions.tag ? `::${this.$vnode.componentOptions.tag}` : '');
                    const cache = this.$vnode.parent.componentInstance.cache;
                    const keys = this.$vnode.parent.componentInstance.keys;
                    if (cache[key]) {
                        delete cache[key];
                        const index = keys.indexOf(key);
                        if (index > -1) {
                            keys.splice(index, 1);
                        }
                    }
                }
            }
        },
        getVideoCover(file) {
            return new Promise((resolve, reject) => {
                const video = document.createElement('video');
                video.setAttribute('crossOrigin', 'anonymous'); // 处理跨域
                video.setAttribute('src', URL.createObjectURL(file));
                video.setAttribute('preload', 'auto');

                video.onloadeddata = () => {
                    const canvas = document.createElement('canvas');
                    const width = video.videoWidth;
                    const height = video.videoHeight;

                    canvas.width = width;
                    canvas.height = height;

                    canvas.getContext('2d').drawImage(video, 0, 0, width, height);

                    const coverUrl = canvas.toDataURL('image/jpeg');

                    URL.revokeObjectURL(video.src);
                    resolve(coverUrl);
                };

                video.onerror = (err) => {
                    this.$message.error('视频加载失败，请重新选择！');
                    reject(err);
                };
            });
        },
    }
}