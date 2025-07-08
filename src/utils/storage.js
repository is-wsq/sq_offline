export const LocalStorage = {
    get(key) {
        const value = localStorage.getItem(key)
        try {
            return JSON.parse(value)
        } catch (error) {
            return value
        }
    },

    set(key, value) {
        localStorage.setItem(key, JSON.stringify(value))
    },

    remove(key) {
        localStorage.removeItem(key)
    },

    clear() {
        localStorage.clear()
    }
}