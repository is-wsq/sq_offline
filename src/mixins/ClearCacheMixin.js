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
        }
    }
}