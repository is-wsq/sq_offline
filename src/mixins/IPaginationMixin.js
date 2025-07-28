export const IPaginationMixin = {
    data() {
        return {
            iPagination: {
                currentPage: 1,
                pageSize: 10,
                pageSizes: [10, 20, 50, 100],
                pagerCount: 5,
                total: 30000,
            }
        }
    },
    methods: {

    }
}