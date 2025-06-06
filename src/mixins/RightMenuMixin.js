export const RightMenuMixin = {
    data() {
        return {
            menuStyle: {
                position: 'fixed',
                top: '0',
                left: '0',
                border: '1px solid #eee',
                'border-radius': '10px',
                'background-color': '#fff',
                'z-index': 9999
            },
            rightMenuVisible: false,
            selectedItem: {}
        }
    },
    methods: {
        handleContextMenu(item, e) {
            e.preventDefault();
            this.rightMenuVisible = true;
            this.selectedItem = item
            this.selectedId = item.id
            this.downloadFilePath = item.video_path || ''
            this.downloadFileName = item.filename || ''
            this.menuStyle.left = e.clientX + 'px'
            this.menuStyle.top = e.clientY + 'px'
            document.body.addEventListener("click", this.bodyClick);
        },
        bodyClick() {
            this.rightMenuVisible = false;
            this.selectedItem = {}
            document.body.removeEventListener("click", this.bodyClick);
        },
    }
}