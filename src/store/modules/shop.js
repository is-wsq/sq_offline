import { LocalStorage } from '@/utils/storage'
import { v4 as uuidv4 } from 'uuid'

// Self-healing function to ensure all shops have a valid ID
const ensureShopIds = (shops) => {
    if (!Array.isArray(shops)) return [];
    return shops.map(shop => {
        // If a shop exists but has no ID (or a falsy ID), assign a new one.
        if (shop && !shop.id) {
            return { ...shop, id: uuidv4() };
        }
        return shop;
    });
};

const initialShops = LocalStorage.get('shops') || []
const migratedShops = ensureShopIds(initialShops)

// If any shop was fixed, update localStorage with the corrected data.
if (JSON.stringify(initialShops) !== JSON.stringify(migratedShops)) {
    LocalStorage.set('shops', migratedShops)
}

const state = {
    shops: migratedShops
}

const mutations = {
    SET_SHOPS: (state, shops) => {
        state.shops = shops
        LocalStorage.set('shops', shops)
    },
    ADD_SHOP: (state, shop) => {
        state.shops.push(shop)
        LocalStorage.set('shops', state.shops)
    },
    UPDATE_SHOP: (state, updatedShop) => {
        const index = state.shops.findIndex(s => s.id === updatedShop.id)
        if (index !== -1) {
            state.shops.splice(index, 1, updatedShop)
            LocalStorage.set('shops', state.shops)
        }
    },
    DELETE_SHOP: (state, shopId) => {
        state.shops = state.shops.filter(s => s.id !== shopId)
        LocalStorage.set('shops', state.shops)
    }
}

const actions = {
    addShop({ commit }, shop) {
        commit('ADD_SHOP', shop)
    },
    updateShop({ commit }, shop) {
        commit('UPDATE_SHOP', shop)
    },
    deleteShop({ commit }, shopId) {
        commit('DELETE_SHOP', shopId)
    }
}

const getters = {
    shops: state => state.shops
}

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
}