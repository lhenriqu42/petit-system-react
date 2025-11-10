// import { Environment } from '../../environment';
import { Environment } from '../../environment';
import { Api } from './axios-config';

const Autorization = () => {
    return {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('APP_ACCESS_TOKEN')}`
        }
    }
}

export interface IResponseData {
    day: Date;
    first_id: number;
    total_card_value: number;
    total_registered_value: number;
    total_invoicing: number;
}

export interface IFincash {
    id: number,

    opener: string
    value: number,
    finalValue?: number | null,
    obs?: string | null,
    totalValue?: number | null,
    cardValue?: number | null,
    invoicing?: number | null,
    profit?: number | null,
    diferenceLastFincash?: number | null,

    break?: number | null,

    created_at: Date,
    finalDate?: Date | null,


    isFinished: boolean,

    updated_at: Date,
    deleted_at?: Date,

}

interface ISaleComplete {
    sale_id: number,
    obs: string,
    products: {
        code: string,
        name: string,
        prod_price: number,
        sector: number,
        quantity: number,
        solded_price: number,
        price_total_per_product: number,
    }[],
    pricetotal_all_products: number,
    created_at: string,
    updated_at: string
}


export interface IComplete {
    fincash: IFincash,
    sales: ISaleComplete[]
}

type TFincashTotalCount = {
    data: TFincashComplete;
    totalCount: number;
}

type TFincashGetAll = {
    data: IFincash[];
    totalCount: number;
}

type TFincashComplete = {
    data: IComplete;
    totalFincashValue: number;
}

type TDataTotalCount = {
    data: IResponse[];
    totalCount: number;
}

export interface IResponse {
    prod_id: number,
    prod_code: number,
    prod_name: string,
    prod_price: number,
    prod_sector: number,
    quantity: number,
    solded_price: number,
    total_value: number
}

export enum EColumnsOrderBy {
    prod_id = 'prod_id',
    quantity = 'quantity',
    prod_code = 'prod_code',
    prod_name = 'prod_name',
    prod_price = 'prod_price',
    prod_sector = 'prod_sector',
    total_value = 'total_value',
    solded_price = 'solded_price',
}

export interface OrderByObj {
    column: keyof typeof EColumnsOrderBy;
    order: 'asc' | 'desc',
    sectors: number[],
    group_id?: number,
}

export interface IFincashUpdate {
    opener: string,
    value: number,
    finalValue: number,
    cardValue: number,
    obs?: string,
}


const create = async (dados: Omit<IFincash, 'id' | 'created_at' | 'updated_at' | 'isFinished'>): Promise<number | Error> => {
    try {
        const { data } = await Api.post<IFincash>('/fincash', dados, Autorization());

        if (data) {
            return data.id;
        }

        return new Error('Erro ao criar o registro.');
    } catch (error) {
        console.error(error);
        return new Error((error as { message: string }).message || 'Erro ao criar o registro.');
    }
};

const getById = async (id: number): Promise<IFincash | Error> => {
    try {
        const { data } = await Api.get(`/fincash/${id}`, Autorization());

        if (data) {
            return data;
        }

        return new Error('Erro ao consultar o registro.');
    } catch (error) {
        console.error(error);
        return new Error((error as { message: string }).message || 'Erro ao consultar o registro.');
    }
};

const getTotalByFincash = async (id: number): Promise<number | Error> => {
    try {

        const { data } = await Api.get(`/total-value/fincash/${id}`, Autorization());
        if (data || data == 0) {
            return data;
        }

        return new Error('Erro ao consultar o registro.');
    } catch (error) {
        console.error(error);
        return new Error((error as { message: string }).message || 'Erro ao consultar o registro.');
    }
};

const getOpenFincash = async (): Promise<IFincash | Error> => {
    try {
        const { data } = await Api.get<IFincash>('/fincash/verify', Autorization());

        if (data) {
            return data;
        }

        return new Error('Erro ao achar o registro.');
    } catch (error) {
        console.error(error);
        return new Error((error as { message: string }).message || 'Erro ao achar o registro.');
    }
};

const finish = async (id: number, value: number): Promise<void | Error> => {
    try {
        await Api.put(`/fincash/finish/${id}`, { finalValue: value }, Autorization());
    } catch (error) {
        console.error(error);
        return new Error((error as { message: string }).message || 'Erro desconhecido!');
    }
}

const getLastFincash = async (): Promise<IFincash | Error> => {
    try {
        const { data } = await Api.get('/fincash/last', Autorization());

        if (data) {
            return data;
        }

        return new Error('Erro ao achar o registro.');
    } catch (error) {
        console.error(error);
        return new Error((error as { message: string }).message || 'Erro desconhecido!');
    }
}

const getAll = async (page = 1, filter = '', limit = Environment.LIMITE_DE_LINHAS): Promise<TFincashGetAll | Error> => {
    try {
        const urlRelativa = `/fincash?page=${page}&limit=${limit}&filter=${filter}`;
        const { data, headers } = await Api.get(urlRelativa, Autorization());
        if (data) {
            return {
                data,
                totalCount: Number(headers['x-total-count'] || Environment.LIMITE_DE_LINHAS),
            };
        }

        return new Error('Erro ao listar os registros.');
    } catch (error) {
        console.error(error);
        return new Error((error as { message: string }).message || 'Erro ao listar os registros.');
    }
};

const getDetailedData = async (fincash_id: number): Promise<TFincashTotalCount | Error> => {
    try {
        const urlRelativa = `/sale/complete/${fincash_id}?limit=9999999`;
        const { data, headers } = await Api.get(urlRelativa, Autorization());
        if (data) {
            return {
                data,
                totalCount: Number(headers['x-total-count'] || Environment.LIMITE_DE_LINHAS),
            };
        }

        return new Error('Erro ao listar os registros.');
    } catch (error) {
        console.error(error);
        return new Error((error as { message: string }).message || 'Erro ao listar os registros.');
    }
};

const registerCardValue = async (cardValue: number, fincash_id: number): Promise<number | Error> => {
    try {
        return await Api.post(`/fincash/addcard/${fincash_id}`, { cardValue }, Autorization());
    } catch (error) {
        console.error(error);
        return new Error((error as { message: string }).message || 'Erro ao criar o registro.');
    }
};

const updateObsById = async (id: number, obs: string): Promise<void | Error> => {
    try {
        await Api.put(`/fincash/obs/${id}`, { obs }, Autorization());
        console.log()
    } catch (error) {
        console.error(error);
        return new Error((error as { message: string }).message || 'Erro ao atualizar o registro.');
    }
};

const getSaleDataByFincash = async (id: number, orderBy: OrderByObj, page: number, limit: number, filter = ''): Promise<TDataTotalCount | Error> => {
    try {
        const urlRelativa = `/fincash/data/${id}?page=${page}&limit=${limit}&filter=${filter}`;
        const { data, headers } = await Api.post(urlRelativa, orderBy, Autorization());
        if (data) {
            return {
                data,
                totalCount: Number(headers['x-total-count'] || Environment.LIMITE_DE_LINHAS),
            };
        }
        return new Error('Erro ao achar o registro.');
    } catch (error) {
        console.error(error);
        return new Error((error as { message: string }).message || 'Erro ao procurar registro.');
    }
};

const getDataByDate = async (start: Date, end: Date): Promise<IResponseData[] | Error> => {
    try {
        const urlRelativa = `/data?start=${start.toISOString()}&end=${end.toISOString()}`;
        const { data } = await Api.get(urlRelativa, Autorization());
        if (data) {
            return data;
        }
        return new Error('Erro ao achar o registro.');
    } catch (error) {
        console.error(error);
        return new Error((error as { message: string }).message || 'Erro ao procurar registro.');
    }
};

const updateById = async (id: number, dados: IFincashUpdate): Promise<void | Error> => {
    try {
        await Api.put(`/fincash/${id}`, dados, Autorization());
    } catch (error) {
        console.error(error);
        return new Error((error as { message: string }).message || 'Erro ao atualizar o registro.');
    }
};

// const getCurrentMonth = async (): Promise<IResponseData[] | Error> => {
//     try {
//         const urlRelativa = `/data/month/current`;
//         const { data } = await Api.get(urlRelativa, Autorization());
//         if (data) {
//             return data;
//         }
//         return new Error('Erro ao achar o registro.');
//     } catch (error) {
//         console.error(error);
//         return new Error((error as { message: string }).message || 'Erro ao procurar registro.');
//     }
// };


// const deleteById = async (id: number): Promise<void | Error> => {
//     try {
//         await Api.delete(`/product/${id}`, Autorization());
//     } catch (error) {
//         console.error(error);
//         return new Error((error as { message: string }).message || 'Erro ao apagar o registro.');
//     }
// };

const reOpenFincash = async (funcash_id: number): Promise<void> => {
	try {
		await Api.put<IFincash>(`/fincash/reopen/${funcash_id}`, {}, Autorization());
	} catch (error) {
		console.error(error);
		throw new Error((error as { message: string }).message || 'Erro ao reabrir o caixa.');
	}
};


export const FincashService = {
    finish,
    create,
    getAll,
    getById,
    updateById,
    updateObsById,
    getOpenFincash,
    getLastFincash,
    getDetailedData,
    getDataByDate,
    getTotalByFincash,
    registerCardValue,
    getSaleDataByFincash,
    //     updateById,
    //     deleteById,
	reOpenFincash,
};