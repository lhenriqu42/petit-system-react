import { Environment } from '../../environment';
import { Api } from './axios-config';

const Autorization = () => {
    return {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('APP_ACCESS_TOKEN')}`
        }
    }
}
export interface IPayment {
    id: number,
    supplier_id: number,
    code: string,
    expiration: Date,
    value: number,
    desc?: string,
    created_at: Date,
    updated_at: Date,
}

export interface IPaymentResponse extends IPayment {
    name: string,
    paid?: Date,
}

interface IPaymentTotalCount {
    data: IPaymentResponse[],
    totalCount: number,
}

type TColumnsOrderBy = 'expiration' | 'created_at';

export interface OrderByPayment {
    column: TColumnsOrderBy;
    order: 'asc' | 'desc';
    supplier_id?: number;
    show?: {
        PAID?: boolean,
        EXPIRED?: boolean,
    };
}

const getAll = async (page = 1, limit = Environment.LIMITE_DE_LINHAS, orderBy: OrderByPayment): Promise<IPaymentTotalCount | Error> => {
    try {
        const urlRelativa = `/payment/get?page=${page}&limit=${limit}`;
        const { data, headers } = await Api.post(urlRelativa, orderBy, Autorization());
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


const create = async (dados: { code: string, supplier_id: number, desc?: string }): Promise<number | Error> => {
    try {
        const { data } = await Api.post<IPayment>('/payment', dados, Autorization());

        if (data) {
            return data.id;
        }

        return new Error('Erro ao criar o registro.');
    } catch (error) {
        console.error(error);
        return new Error((error as { message: string }).message || 'Erro ao criar o registro.');
    }
};

const deleteById = async (id: number) => {
    try {
        await Api.delete(`/payment/${id}`, Autorization());
    } catch (error) {
        console.error(error);
        return new Error((error as { message: string }).message || 'Erro ao apagar o registro.');
    }
}

const markWithPaid = async (id: number) => {
    try {
        await Api.put(`/payment/paid/${id}`, Autorization());
    } catch (error) {
        console.error(error);
        return new Error((error as { message: string }).message || 'Erro ao pagar o registro.');
    }
}

const unmarkWithPaid = async (id: number) => {
    try {
        await Api.put(`/payment/back/${id}`, Autorization());
    } catch (error) {
        console.error(error);
        return new Error((error as { message: string }).message || 'Erro ao pagar o registro.');
    }
}

const getById = async (id: number): Promise<IPaymentResponse | Error> => {
    try {
        const { data } = await Api.get(`/payment/${id}`, Autorization());

        if (data) {
            return data;
        }

        return new Error('Erro ao consultar o registro.');
    } catch (error) {
        console.error(error);
        return new Error((error as { message: string }).message || 'Erro ao consultar o registro.');
    }
};

const getTotalByDate = async (start: Date, end: Date): Promise<number | Error> => {
    try {
        const { data } = await Api.get(`/payment/total?start=${start.toISOString()}&end=${end.toISOString()}`, Autorization());
        if (data == null) return 0;
        if (data) {
            return data;
        }

        return new Error('Erro ao consultar o registro.');
    } catch (error) {
        console.error(error);
        return new Error((error as { message: string }).message || 'Erro ao consultar o registro.');
    }
};

export const PaymentService = {
    getAll,
    create,
    getById,
    deleteById,
    markWithPaid,
    getTotalByDate,
    unmarkWithPaid,
};