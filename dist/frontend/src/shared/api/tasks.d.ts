export declare const tasksApi: {
    getAll: () => Promise<import("axios").AxiosResponse<any, any, {}>>;
    create: (data: any) => Promise<import("axios").AxiosResponse<any, any, {}>>;
    update: (id: number, data: any) => Promise<import("axios").AxiosResponse<any, any, {}>>;
    remove: (id: number) => Promise<import("axios").AxiosResponse<any, any, {}>>;
};
