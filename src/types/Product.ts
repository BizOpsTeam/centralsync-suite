
export interface IProduct {
    name: string;
    id: string;
    createdAt: Date;
    description: string | null;
    price: number;
    stock: number;
    cost: number;
    images: {
        id: string;
        createdAt: Date;
        url: string;
        productId: string;
    }[];
    category: {
        id: string;
        name: string;
        description: string;
        createdAt: Date;
    };
}


export interface ITopProductsRes {
    product: IProduct,
    totalSold: number,
    totalRevenue: number,
    timesSold: number,
}

export interface IDashBoardMetrics {
    totalRevenue: number,
    salesGrowth: number,
    activeCustomers: number,
    productsSold: number,
    topProducts: ITopProductsRes[],
    salesOverTime: {
        date: string;
        total: number;
    }[],
}

export type TCategory = {
    id: string
    name: string
    description: string
    createdAt: Date
}