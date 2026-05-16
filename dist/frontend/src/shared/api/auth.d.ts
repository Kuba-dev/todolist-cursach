export declare const authApi: {
    register: (data: any) => Promise<import("axios").AxiosResponse<any, any, {}>>;
    login: (data: any) => Promise<import("axios").AxiosResponse<any, any, {}>>;
    logout: () => Promise<import("axios").AxiosResponse<any, any, {}>>;
    refresh: () => Promise<import("axios").AxiosResponse<any, any, {}>>;
};
